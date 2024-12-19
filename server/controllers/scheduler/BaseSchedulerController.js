// controllers/scheduler/BaseSchedulerController.js

import AppError from '../../utils/errors/AppError.js';
import logger from '../../utils/logger.js';
export class BaseSchedulerController {
  constructor(schedulerService) {
    this.schedulerService = schedulerService;
    this.platform = schedulerService.platform;

    // Bind methods
    this.scheduleVideo = this.scheduleVideo.bind(this);
    this.cancelSchedule = this.cancelSchedule.bind(this);
    this.getSchedules = this.getSchedules.bind(this);
  }

  /**
   * Schedule a video upload
   */
  async scheduleVideo(req, res) {
    try {
      const { userId } = req.auth;
      const { scheduledTime } = req.body;

      if (!scheduledTime) {
        throw new AppError('Scheduled time is required', 400);
      }

      // Combine file data with metadata
      const videoData = this.parseVideoData(req);

      const schedule = await this.schedulerService.scheduleVideo(
        userId,
        videoData,
        scheduledTime
      );

      res.json({
        success: true,
        schedule: this.formatScheduleResponse(schedule)
      });
    } catch (error) {
      logger.error(`Error scheduling ${this.platform} video`, {
        error: error.message,
        stack: error.stack
      });
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  /**
   * Cancel a scheduled video
   */
  async cancelSchedule(req, res) {
    try {
      const { userId } = req.auth;
      const { scheduleId } = req.params;

      const schedule = await this.schedulerService.cancelScheduledVideo(
        userId,
        scheduleId
      );

      res.json({
        success: true,
        schedule: {
          id: schedule._id,
          status: schedule.status,
          cancelledAt: schedule.cancelledAt
        }
      });
    } catch (error) {
      logger.error(`Error cancelling ${this.platform} schedule`, {
        error: error.message
      });
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  /**
   * Get user's scheduled videos
   */
  async getSchedules(req, res) {
    try {
      const { userId } = req.auth;
      const filters = this.parseFilters(req.query);

      const schedules = await this.schedulerService.getScheduledVideos(
        userId,
        filters
      );

      res.json({
        success: true,
        schedules: schedules.map(schedule => this.formatScheduleResponse(schedule))
      });
    } catch (error) {
      logger.error(`Error getting ${this.platform} schedules`, {
        error: error.message
      });
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  /**
   * Parse video data from request
   * @protected
   */
  parseVideoData(req) {
    return {
      title: req.body.title,
      description: req.body.description,
      privacy: req.body.privacy || 'private',
      videoId: req.body.videoId, // Platform's video ID
      videoUrl: req.body.videoUrl, // Platform's video URL
      tags: req.body.tags ? JSON.parse(req.body.tags) : []
    };
  }

  /**
   * Parse filter parameters
   * @protected
   */
  parseFilters(query) {
    const filters = {};
    if (query.status) {
      filters.status = query.status;
    }
    return filters;
  }

  /**
   * Format schedule response
   * @protected
   */
  formatScheduleResponse(schedule) {
    return {
      id: schedule._id,
      platform: schedule.platform,
      scheduledTime: schedule.scheduledTime,
      status: schedule.status,
      videoData: {
        title: schedule.videoData.title,
        description: schedule.videoData.description,
        privacy: schedule.videoData.privacy
      },
      createdAt: schedule.createdAt,
      ...(schedule.publishedVideoId && {
        publishedVideoId: schedule.publishedVideoId,
        publishedVideoUrl: schedule.publishedVideoUrl
      })
    };
  }

  /**
   * Helper to wrap async route handlers with error handling
   * @protected
   */
  wrapAsync(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}