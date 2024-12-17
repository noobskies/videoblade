import { google } from 'googleapis';
import { youtubeConfig } from '../../config/platforms/youtube.js';
import logger from '../../utils/logger.js';
import SocialAccount from '../../models/SocialAccount.js';

class YouTubeService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      youtubeConfig.clientId,
      youtubeConfig.clientSecret,
      youtubeConfig.redirectUri
    );

    this.youtube = google.youtube('v3');
  }

  getAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: youtubeConfig.scopes,
      include_granted_scopes: true,
    });
  }

  async getTokens(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      logger.error('Error getting YouTube tokens', { error: error.message });
      throw error;
    }
  }

  async getUserChannel(accessToken) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      
      const response = await this.youtube.channels.list({
        auth: this.oauth2Client,
        part: 'snippet',
        mine: true
      });

      if (!response.data.items?.length) {
        throw new Error('No channel found for user');
      }

      return response.data.items[0];
    } catch (error) {
      logger.error('Error getting YouTube channel', { error: error.message });
      throw error;
    }
  }

  async getChannelVideos(accessToken, maxResults = 10) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      
      const response = await this.youtube.search.list({
        auth: this.oauth2Client,
        part: ['snippet'],
        forMine: true,
        type: 'video',
        maxResults: maxResults,
        order: 'date'
      });

      if (!response.data.items?.length) {
        return [];
      }

      const videoIds = response.data.items.map(item => item.id.videoId);
      
      const statsResponse = await this.youtube.videos.list({
        auth: this.oauth2Client,
        part: ['statistics', 'snippet', 'player'],
        id: videoIds
      });

      // Get channel info for author image
      const channelResponse = await this.youtube.channels.list({
        auth: this.oauth2Client,
        part: ['snippet'],
        mine: true
      });

      if (!channelResponse.data.items?.length) {
        throw new Error('No channel found for user');
      }

      const channelInfo = channelResponse.data.items[0];
      const authorImage = channelInfo.snippet.thumbnails.default.url;

      const videos = statsResponse.data.items.map(video => ({
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        publishedAt: video.snippet.publishedAt,
        thumbnail: video.snippet.thumbnails.medium.url,
        authorImage: authorImage,
        tags: video.snippet.tags || [],
        embedHtml: video.player.embedHtml,
        youtubeUrl: `https://youtube.com/watch?v=${video.id}`,
        statistics: {
          views: video.statistics.viewCount,
          likes: video.statistics.likeCount,
          comments: video.statistics.commentCount
        }
      }));

      return videos;
    } catch (error) {
      logger.error('Error fetching YouTube videos', { error: error.message });
      throw error;
    }
  }

  async storeUserAccount(userId, tokens, channelData) {
    try {
      logger.debug('Storing YouTube account', { 
        userId,
        channelId: channelData.id,
        hasRefreshToken: !!tokens.refresh_token
      });

      const account = await SocialAccount.findOneAndUpdate(
        { 
          userId,
          platform: 'youtube'
        },
        {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          platformUserId: channelData.id,
          platformUsername: channelData.snippet.title,
          expiresAt: new Date(tokens.expiry_date),
          lastTokenRefresh: new Date(),
          isActive: true
        },
        { upsert: true, new: true }
      );

      return account;
    } catch (error) {
      logger.error('Error storing YouTube account', { error: error.message });
      throw error;
    }
  }

  async refreshTokenIfNeeded(socialAccount) {
    try {
      if (!socialAccount?.refreshToken) {
        logger.error('No refresh token found', { accountId: socialAccount?._id });
        throw new Error('No refresh token available');
      }

      const now = Date.now();
      const expiryDate = socialAccount.expiresAt?.getTime();

      // If token is not expired and we have an access token, return it
      if (expiryDate && now < expiryDate && socialAccount.accessToken) {
        return socialAccount.accessToken;
      }

      logger.debug('Refreshing token', { 
        accountId: socialAccount._id,
        lastRefresh: socialAccount.lastTokenRefresh
      });

      // Refresh the token
      this.oauth2Client.setCredentials({
        refresh_token: socialAccount.refreshToken
      });

      const { tokens } = await this.oauth2Client.refreshAccessToken();
      
      // Update the stored tokens
      const updatedAccount = await SocialAccount.findByIdAndUpdate(
        socialAccount._id,
        {
          accessToken: tokens.access_token,
          expiresAt: new Date(tokens.expiry_date),
          lastTokenRefresh: new Date()
        },
        { new: true }
      );

      if (!updatedAccount) {
        throw new Error('Failed to update account tokens');
      }

      return tokens.access_token;
    } catch (error) {
      logger.error('Error refreshing YouTube token', { 
        error: error.message,
        accountId: socialAccount?._id 
      });
      throw error;
    }
  }
}

export default new YouTubeService();