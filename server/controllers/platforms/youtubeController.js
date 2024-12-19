// server/controllers/platforms/youtubeController.js

import { BasePlatformController } from './BasePlatformController.js';
import youtubeService from '../../services/platforms/youtubeService.js';
import AppError from '../../utils/errors/AppError.js';
import logger from '../../utils/logger.js';

class YouTubeController extends BasePlatformController {
  constructor() {
    super(youtubeService, 'youtube');
    
    // Bind methods
    this.getUploadUrl = this.getUploadUrl.bind(this);
    this.getVideos = this.getVideos.bind(this);
    this.getAnalytics = this.getAnalytics.bind(this);
  }

  /**
   * Get list of uploaded videos
   */
  async getVideos(req, res, next) {
    try {
      const { userId } = req.auth;
      const { maxResults = 10, pageToken } = req.query;

      const account = await this.platformService.getConnectedAccount(userId);
      
      if (!account) {
        throw new AppError('No connected YouTube account found', 404);
      }

      const videos = await this.platformService.getChannelVideos(
        account.accessToken,
        maxResults,
        pageToken
      );

      res.json({
        success: true,
        channel: {
          name: account.platformUsername,
          id: account.platformUserId
        },
        videos: videos.items,
        pageInfo: videos.pageInfo,
        nextPageToken: videos.nextPageToken
      });
    } catch (error) {
      logger.error('Error getting YouTube videos', {
        error: error.message,
        stack: error.stack
      });
      next(error);
    }
  }

  /**
   * Get video analytics
   */
  async getAnalytics(req, res, next) {
    try {
      const { userId } = req.auth;
      const { videoId } = req.params;
      const { metrics = ['views', 'likes', 'comments'], days = 28 } = req.query;

      const account = await this.platformService.getConnectedAccount(userId);
      
      if (!account) {
        throw new AppError('No connected YouTube account found', 404);
      }

      const analytics = await this.platformService.getVideoAnalytics(
        account.accessToken,
        videoId,
        metrics,
        days
      );

      res.json({
        success: true,
        videoId,
        analytics
      });
    } catch (error) {
      logger.error('Error getting YouTube analytics', {
        error: error.message,
        stack: error.stack
      });
      next(error);
    }
  }

  /**
   * Get pre-signed upload URL from YouTube
   */
  async getUploadUrl(req, res, next) {
    try {
      const { userId } = req.auth;
      const { title, description } = req.body;

      if (!title) {
        throw new AppError('Title is required', 400);
      }

      const account = await this.platformService.getConnectedAccount(userId);
      
      if (!account) {
        throw new AppError('No connected YouTube account found', 404);
      }

      // Get upload URL from YouTube
      const uploadData = await this.platformService.getUploadUrl(
        account.accessToken,
        {
          title,
          description,
          ...this.getPlatformSpecificMetadata(req.body)
        }
      );

      res.json({
        success: true,
        uploadUrl: uploadData.uploadUrl,
        videoId: uploadData.videoId
      });
    } catch (error) {
      logger.error('Error getting YouTube upload URL', {
        error: error.message,
        stack: error.stack,
        userId: req.auth?.userId,
        body: JSON.stringify(req.body)
      });
      next(error);
    }
  }

  /**
   * Override to add YouTube-specific metadata
   */
  getPlatformSpecificMetadata(body) {
    return {
      categoryId: body.categoryId || '22', // Default to 'People & Blogs'
      madeForKids: body.madeForKids === 'true',
      language: body.language || 'en',
      ...(body.playlistId && { playlistId: body.playlistId })
    };
  }
}

export default new YouTubeController();