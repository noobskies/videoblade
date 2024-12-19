// server/services/platforms/youtubeService.js

import { google } from 'googleapis';
import { BasePlatformService } from './BasePlatformService.js';
import { youtubeConfig } from '../../config/platforms/youtube.js';
import logger from '../../utils/logger.js';
import AppError from '../../utils/errors/AppError.js';
import SocialAccount from '../../models/SocialAccount.js';

class YouTubeService extends BasePlatformService {
  constructor() {
    super('youtube', youtubeConfig);
  }

  /**
   * Initialize YouTube API client
   */
  initializeClient() {
    this.oauth2Client = new google.auth.OAuth2(
      this.config.clientId,
      this.config.clientSecret,
      this.config.redirectUri
    );
    this.youtube = google.youtube('v3');
  }

  /**
   * Get upload URL for resumable upload
   */
  async getUploadUrl(accessToken, metadata) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });

      // Step 1: Create the initial video resource
      const resource = {
        snippet: {
          title: metadata.title,
          description: metadata.description || '',
          tags: metadata.tags || [],
          categoryId: metadata.categoryId || '22',
          defaultLanguage: metadata.language || 'en'
        },
        status: {
          privacyStatus: 'private',
          selfDeclaredMadeForKids: Boolean(metadata.madeForKids)
        }
      };

      // Step 2: Get the resumable upload URL
      const response = await this.youtube.videos.insert({
        auth: this.oauth2Client,
        part: 'snippet,status',
        requestBody: resource,
        media: {
          mimeType: 'video/*'
        }
      }, {
        // This ensures we get a resumable upload URL
        uploadType: 'resumable'
      });

      // The location header contains the resumable upload URL
      const resumableUrl = response.headers?.location;
      
      if (!resumableUrl) {
        throw new Error('Failed to get upload URL from YouTube');
      }

      return {
        uploadUrl: resumableUrl,
        videoId: response.data.id || null // Video ID will be assigned after actual upload
      };
    } catch (error) {
      logger.error('Error getting YouTube upload URL', {
        error: error.message,
        stack: error.stack,
        metadata: JSON.stringify(metadata)
      });
      
      // Check for specific YouTube API errors
      if (error.message?.includes('quota')) {
        throw new AppError('YouTube quota exceeded. Try again later.', 429);
      }

      if (error.message?.includes('exceeded the number of videos')) {
        throw new AppError(
          'You have reached your YouTube upload limit for today. Please try again tomorrow.',
          429
        );
      }

      if (error.message?.includes('invalid_grant')) {
        throw new AppError('Authorization expired. Please reconnect your YouTube account.', 401);
      }

      if (error.message?.includes('invalid argument')) {
        throw new AppError('Invalid video details provided. Please check your input.', 400);
      }

      // Check for other common YouTube API errors
      if (error.code === 403) {
        throw new AppError('You do not have permission to upload videos to this channel.', 403);
      }

      if (error.code === 401) {
        throw new AppError('Your YouTube session has expired. Please reconnect your account.', 401);
      }
      
      throw new AppError(
        'Failed to initialize YouTube upload. Please try again later.',
        error.code === 401 ? 401 : 500
      );
    }
  }

  /**
   * Generate YouTube authorization URL
   */
  generateAuthUrl({ scopes }) {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true,
      prompt: 'consent'
    });
  }

  /**
   * Refresh token if needed
   */
  async refreshTokenIfNeeded(account) {
    try {
      if (!this.shouldRefreshToken(account)) {
        return account.accessToken;
      }

      logger.debug('Refreshing YouTube access token', {
        userId: account.userId,
        platformUserId: account.platformUserId
      });

      this.oauth2Client.setCredentials({
        refresh_token: account.refreshToken
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      // Update account with new tokens
      await SocialAccount.findByIdAndUpdate(account._id, {
        accessToken: credentials.access_token,
        expiresAt: new Date(credentials.expiry_date),
        lastTokenRefresh: new Date()
      });

      return credentials.access_token;
    } catch (error) {
      logger.error('Error refreshing YouTube token', {
        error: error.message,
        userId: account.userId
      });

      if (error.message?.includes('invalid_grant')) {
        throw new AppError('YouTube account needs to be reconnected', 401);
      }

      throw this.formatError(error, 'Failed to refresh access token');
    }
  }

  /**
   * Get user's YouTube channel data
   */
  async getUserData(accessToken) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      
      const response = await this.youtube.channels.list({
        auth: this.oauth2Client,
        part: ['snippet', 'statistics', 'contentDetails'],
        mine: true
      });

      if (!response.data.items?.length) {
        throw new Error('No channel found for user');
      }

      const channel = response.data.items[0];
      return {
        id: channel.id,
        username: channel.snippet.title,
        description: channel.snippet.description,
        customUrl: channel.snippet.customUrl,
        country: channel.snippet.country,
        publishedAt: channel.snippet.publishedAt,
        thumbnails: channel.snippet.thumbnails,
        statistics: channel.statistics
      };
    } catch (error) {
      logger.error('Error getting YouTube channel', { error: error.message });
      throw this.formatError(error, 'Failed to get channel data');
    }
  }

  /**
   * Get channel videos
   */
  async getChannelVideos(accessToken, maxResults = 10, pageToken = null) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      
      // First get the video IDs
      const searchResponse = await this.youtube.search.list({
        auth: this.oauth2Client,
        part: ['id'],
        forMine: true,
        maxResults,
        order: 'date',
        type: 'video',
        pageToken
      });

      if (!searchResponse.data.items?.length) {
        return {
          items: [],
          pageInfo: searchResponse.data.pageInfo,
          nextPageToken: searchResponse.data.nextPageToken,
          prevPageToken: searchResponse.data.prevPageToken
        };
      }

      // Get detailed video information
      const videoIds = searchResponse.data.items.map(item => item.id.videoId);
      const videosResponse = await this.youtube.videos.list({
        auth: this.oauth2Client,
        part: ['snippet', 'statistics', 'status', 'player', 'contentDetails'],
        id: videoIds
      });

      const videos = videosResponse.data.items.map(video => ({
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        publishedAt: video.snippet.publishedAt,
        thumbnails: {
          default: video.snippet.thumbnails.default?.url,
          medium: video.snippet.thumbnails.medium?.url,
          high: video.snippet.thumbnails.high?.url,
          maxres: video.snippet.thumbnails.maxres?.url
        },
        status: {
          privacyStatus: video.status.privacyStatus,
          embeddable: video.status.embeddable,
          madeForKids: video.status.madeForKids,
          publishAt: video.status.publishAt
        },
        statistics: {
          viewCount: parseInt(video.statistics.viewCount, 10) || 0,
          likeCount: parseInt(video.statistics.likeCount, 10) || 0,
          commentCount: parseInt(video.statistics.commentCount, 10) || 0
        },
        duration: video.contentDetails.duration,
        categoryId: video.snippet.categoryId,
        tags: video.snippet.tags || [],
        url: `https://youtube.com/watch?v=${video.id}`,
        embedHtml: video.player?.embedHtml
      }));

      return {
        items: videos,
        pageInfo: searchResponse.data.pageInfo,
        nextPageToken: searchResponse.data.nextPageToken,
        prevPageToken: searchResponse.data.prevPageToken
      };
    } catch (error) {
      logger.error('Error getting YouTube videos', { 
        error: error.message,
        stack: error.stack 
      });
      throw this.formatError(error, 'Failed to fetch videos');
    }
  }

  /**
   * Get video analytics
   */
  async getVideoAnalytics(accessToken, videoId, metrics = ['views'], days = 28) {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const response = await this.youtube.analytics.reports.query({
        auth: this.oauth2Client,
        ids: 'channel==MINE',
        startDate: startDate.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        metrics: metrics.join(','),
        dimensions: 'day',
        filters: `video==${videoId}`
      });

      return {
        timeRange: `${days} days`,
        data: response.data.rows || [],
        columnHeaders: response.data.columnHeaders
      };
    } catch (error) {
      logger.error('Error getting YouTube analytics', { error: error.message });
      throw this.formatError(error, 'Failed to fetch analytics data');
    }
  }
}

export default new YouTubeService();