// server/services/scheduler/YouTubeSchedulerService.js

import { BaseSchedulerService } from './BaseSchedulerService.js';
import youtubeService from '../platforms/youtubeService.js';
import logger from '../../utils/logger.js';
import AppError from '../../utils/errors/AppError.js';

class YouTubeSchedulerService extends BaseSchedulerService {
  constructor() {
    super(youtubeService);
  }

  /**
   * Override to add YouTube-specific scheduling validation
   */
  async scheduleVideo(userId, videoData, scheduledTime) {
    // Validate minimum scheduling time (YouTube requires at least 15 minutes in advance)
    const minScheduleTime = new Date();
    minScheduleTime.setMinutes(minScheduleTime.getMinutes() + 15);

    if (new Date(scheduledTime) < minScheduleTime) {
      throw new AppError('YouTube videos must be scheduled at least 15 minutes in advance', 400);
    }

    // Validate that video exists and is owned by user
    try {
      const account = await this.platformService.getConnectedAccount(userId);
      if (!account) {
        throw new AppError('No connected YouTube account found', 404);
      }

      await this.validateVideo(account.accessToken, videoData.videoId);
    } catch (error) {
      logger.error('Error validating YouTube video', {
        error: error.message,
        videoId: videoData.videoId,
        userId
      });
      throw new AppError('Unable to verify video ownership', 400);
    }

    return super.scheduleVideo(userId, videoData, scheduledTime);
  }

  /**
   * Implement YouTube-specific video publishing
   */
  async publishVideo(accessToken, schedule) {
    try {
      logger.info('Publishing scheduled YouTube video', {
        videoId: schedule.videoData.videoId,
        scheduleId: schedule._id
      });

      // Update video visibility and scheduling
      const result = await this.platformService.youtube.videos.update({
        auth: this.getAuth(accessToken),
        part: ['status'],
        requestBody: {
          id: schedule.videoData.videoId,
          status: {
            privacyStatus: schedule.videoData.privacy || 'private',
            publishAt: schedule.scheduledTime.toISOString()
          }
        }
      });

      if (!result.data) {
        throw new Error('Failed to update video status');
      }

      return {
        id: result.data.id,
        url: `https://youtube.com/watch?v=${result.data.id}`
      };
    } catch (error) {
      logger.error('Error publishing YouTube video', {
        error: error.message,
        scheduleId: schedule._id,
        videoId: schedule.videoData.videoId
      });
      throw error;
    }
  }

  /**
   * Add YouTube-specific metadata
   */
  getPlatformSpecificMetadata(videoData) {
    return {
      categoryId: videoData.categoryId || '22', // Default to 'People & Blogs'
      madeForKids: Boolean(videoData.madeForKids),
      defaultLanguage: videoData.language || 'en',
      ...(videoData.playlistId && { playlistId: videoData.playlistId })
    };
  }

  /**
   * Validate video exists and is owned by user
   */
  async validateVideo(accessToken, videoId) {
    try {
      const response = await this.platformService.youtube.videos.list({
        auth: this.getAuth(accessToken),
        part: ['snippet', 'status'],
        id: [videoId]
      });

      if (!response.data.items?.length) {
        throw new Error('Video not found');
      }

      // Additional validations can be added here
      // e.g., check if video is in valid state for scheduling

      return true;
    } catch (error) {
      logger.error('Error validating YouTube video', {
        error: error.message,
        videoId
      });
      throw new Error('Failed to validate video');
    }
  }

  /**
   * Helper to get YouTube auth object
   */
  getAuth(accessToken) {
    this.platformService.oauth2Client.setCredentials({ access_token: accessToken });
    return this.platformService.oauth2Client;
  }
}

export default new YouTubeSchedulerService();