// server/services/scheduler/BaseSchedulerService.js

import Schedule from '../../models/Schedule.js';
import AppError from '../../utils/errors/AppError.js';
import logger from '../../utils/logger.js';

export class BaseSchedulerService {
  constructor(platformService) {
    this.platformService = platformService;
    this.platform = platformService.platform;
  }

  /**
   * Schedule a video for future publishing
   */
  async scheduleVideo(userId, videoData, scheduledTime) {
    try {
      // Validate scheduled time
      if (new Date(scheduledTime) <= new Date()) {
        throw new AppError('Scheduled time must be in the future', 400);
      }

      // Get connected account
      const account = await this.platformService.getConnectedAccount(userId);
      if (!account) {
        throw new AppError(`No connected ${this.platform} account found`, 404);
      }

      // Create schedule record
      const schedule = await Schedule.create({
        userId,
        platform: this.platform,
        socialAccountId: account._id,
        scheduledTime,
        status: 'pending',
        videoData: this.sanitizeVideoData(videoData),
        metadata: this.getPlatformSpecificMetadata(videoData)
      });

      logger.info(`Video scheduled for ${this.platform}`, {
        userId,
        scheduleId: schedule._id,
        scheduledTime
      });

      return schedule;
    } catch (error) {
      logger.error(`Error scheduling ${this.platform} video`, {
        error: error.message,
        stack: error.stack
      });
      throw this.formatError(error);
    }
  }

  /**
   * Cancel a scheduled video
   */
  async cancelScheduledVideo(userId, scheduleId) {
    try {
      const schedule = await Schedule.findOne({
        _id: scheduleId,
        userId,
        platform: this.platform
      });

      if (!schedule) {
        throw new AppError('Scheduled video not found', 404);
      }

      if (schedule.status !== 'pending') {
        throw new AppError('Only pending schedules can be cancelled', 400);
      }

      schedule.status = 'cancelled';
      schedule.cancelledAt = new Date();
      await schedule.save();

      return schedule;
    } catch (error) {
      logger.error(`Error cancelling ${this.platform} schedule`, {
        error: error.message
      });
      throw this.formatError(error);
    }
  }

  /**
   * Get all scheduled videos for a user
   */
  async getScheduledVideos(userId, filters = {}) {
    try {
      const query = {
        userId,
        platform: this.platform,
        ...filters
      };

      const schedules = await Schedule.find(query)
        .sort({ scheduledTime: 1 })
        .lean();

      return schedules;
    } catch (error) {
      logger.error(`Error getting ${this.platform} schedules`, {
        error: error.message
      });
      throw this.formatError(error);
    }
  }

  /**
   * Process scheduled video at publishing time
   */
  async processScheduledVideo(schedule) {
    try {
      // Update status to processing
      schedule.status = 'processing';
      schedule.processingStartedAt = new Date();
      await schedule.save();

      // Get fresh access token
      const account = await this.platformService.getConnectedAccount(schedule.userId);
      if (!account) {
        throw new AppError(`No connected ${this.platform} account found`, 404);
      }

      // Call platform-specific publishing logic
      const result = await this.publishVideo(account.accessToken, schedule);

      // Update schedule with success
      schedule.status = 'completed';
      schedule.completedAt = new Date();
      schedule.publishedVideoId = result.id;
      schedule.publishedVideoUrl = result.url;
      await schedule.save();

      logger.info(`Successfully published scheduled ${this.platform} video`, {
        scheduleId: schedule._id,
        videoId: result.id
      });

      return schedule;
    } catch (error) {
      logger.error(`Error processing ${this.platform} schedule`, {
        error: error.message,
        scheduleId: schedule._id
      });

      // Update schedule with error
      schedule.status = 'failed';
      schedule.error = error.message;
      schedule.failedAt = new Date();
      await schedule.save();

      throw this.formatError(error);
    }
  }

  /**
   * Clean video data for storage
   * @protected
   */
  sanitizeVideoData(videoData) {
    return {
      title: videoData.title,
      description: videoData.description,
      privacy: videoData.privacy || 'private',
      videoId: videoData.videoId,
      videoUrl: videoData.videoUrl,
      tags: Array.isArray(videoData.tags) ? videoData.tags : []
    };
  }

  /**
   * Get platform-specific metadata
   * @protected
   */
  getPlatformSpecificMetadata(videoData) {
    return {};
  }

  /**
   * Platform-specific video publishing
   * Must be implemented by platform services
   * @protected
   */
  async publishVideo(accessToken, schedule) {
    throw new Error('publishVideo must be implemented by platform service');
  }

  /**
   * Format error for consistent handling
   * @protected
   */
  formatError(error) {
    if (error instanceof AppError) {
      return error;
    }
    return new AppError(
      error.message || `Failed to process ${this.platform} schedule`,
      error.statusCode || 500
    );
  }
}