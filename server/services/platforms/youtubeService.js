import { google } from 'googleapis';
import { youtubeConfig } from '../../config/platforms/youtube.js';
import logger from '../../utils/logger.js';
import SocialAccount from '../../models/SocialAccount.js';
import AppError from '../../utils/errors/AppError.js';
import { Readable } from 'stream';

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
      // Reset OAuth2 client to ensure clean state
      this.oauth2Client = new google.auth.OAuth2(
        youtubeConfig.clientId,
        youtubeConfig.clientSecret,
        youtubeConfig.redirectUri
      );
  
      logger.debug('Exchanging auth code for tokens', { 
        codeLength: code?.length 
      });
  
      const { tokens } = await this.oauth2Client.getToken(code);
  
      if (!tokens?.access_token || !tokens?.refresh_token) {
        throw new AppError('Invalid token response from YouTube', 401);
      }
  
      logger.debug('Successfully obtained tokens', {
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        expiryDate: tokens.expiry_date
      });
  
      return tokens;
    } catch (error) {
      logger.error('Error getting YouTube tokens', { 
        error: error.message,
        code: error.code
      });
  
      if (error.message?.includes('invalid_grant')) {
        throw new AppError('Invalid or expired authorization code', 401);
      }
  
      throw new AppError(
        'Failed to exchange authorization code for tokens',
        error.code === 401 ? 401 : 500
      );
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

  // Inside your YouTubeService class
  async uploadVideo(accessToken, videoBuffer, metadata) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });

      logger.info('Starting YouTube upload', { 
        title: metadata.title,
        privacy: metadata.privacy 
      });

      // Convert buffer to readable stream
      const mediaStream = new Readable();
      mediaStream._read = () => {}; // Required for Readable streams
      mediaStream.push(videoBuffer);
      mediaStream.push(null);

      const res = await this.youtube.videos.insert({
        auth: this.oauth2Client,
        part: 'snippet,status',
        requestBody: {
          snippet: {
            title: metadata.title,
            description: metadata.description,
            tags: metadata.tags
          },
          status: {
            privacyStatus: metadata.privacy
          }
        },
        media: {
          body: mediaStream
        }
      });

      logger.info('YouTube upload completed', { 
        videoId: res.data.id 
      });

      return res.data;
    } catch (error) {
      logger.error('Error uploading to YouTube', { 
        error: error.message,
        stack: error.stack 
      });
      throw new AppError(
        error.message || 'Failed to upload video to YouTube',
        error.code === 401 ? 401 : 500
      );
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

// youtubeService.js - refreshTokenIfNeeded method update

async refreshTokenIfNeeded(socialAccount) {
  try {
    // Validate input
    if (!socialAccount) {
      throw new AppError('Social account is required', 400);
    }

    if (!socialAccount.refreshToken) {
      logger.error('No refresh token found', { accountId: socialAccount._id });
      throw new AppError('No refresh token available', 401);
    }

    const now = Date.now();
    const expiryDate = socialAccount.expiresAt?.getTime();

    // If token is not expired and we have an access token, return it
    if (expiryDate && now < expiryDate && socialAccount.accessToken) {
      logger.debug('Using existing token', { 
        accountId: socialAccount._id,
        expiresAt: new Date(expiryDate)
      });
      return socialAccount.accessToken;
    }

    logger.debug('Refreshing token', { 
      accountId: socialAccount._id,
      lastRefresh: socialAccount.lastTokenRefresh
    });

    // Reset OAuth2 client to ensure clean state
    this.oauth2Client = new google.auth.OAuth2(
      youtubeConfig.clientId,
      youtubeConfig.clientSecret,
      youtubeConfig.redirectUri
    );

    // Set refresh token and attempt refresh
    this.oauth2Client.setCredentials({
      refresh_token: socialAccount.refreshToken
    });

    const { tokens } = await this.oauth2Client.refreshAccessToken();
    
    if (!tokens?.access_token) {
      throw new AppError('Failed to obtain new access token', 401);
    }

    // Update the stored tokens
    const updatedAccount = await SocialAccount.findByIdAndUpdate(
      socialAccount._id,
      {
        $set: {
          accessToken: tokens.access_token,
          expiresAt: new Date(tokens.expiry_date),
          lastTokenRefresh: new Date(),
          // Store new refresh token if provided
          ...(tokens.refresh_token && { refreshToken: tokens.refresh_token })
        }
      },
      { new: true }
    );

    if (!updatedAccount) {
      throw new AppError('Failed to update account tokens', 500);
    }

    logger.debug('Token refresh successful', {
      accountId: socialAccount._id,
      expiresAt: tokens.expiry_date
    });

    return tokens.access_token;
  } catch (error) {
    logger.error('Error refreshing YouTube token', { 
      error: error.message,
      stack: error.stack,
      accountId: socialAccount?._id 
    });

    // If token refresh fails, mark account as inactive
    if (socialAccount?._id) {
      try {
        await SocialAccount.findByIdAndUpdate(socialAccount._id, {
          $set: { isActive: false }
        });
        logger.info('Marked YouTube account as inactive', { 
          accountId: socialAccount._id 
        });
      } catch (updateError) {
        logger.error('Failed to mark account as inactive', { 
          error: updateError.message 
        });
      }
    }

    throw new AppError(
      'Failed to refresh access token',
      error.statusCode || 401
    );
  }
}
}

export default new YouTubeService();