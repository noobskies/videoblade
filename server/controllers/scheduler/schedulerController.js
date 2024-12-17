// controllers/scheduler/schedulerController.js
import schedulerService from '../../services/scheduler/schedulerService.js';
import AppError from '../../utils/errors/AppError.js';
import logger from '../../utils/logger.js';

export const schedulerController = {
  async createScheduledPost(req, res) {
    try {
      const { userId } = req.auth;
      const post = await schedulerService.createPost(userId, req.body);
      
      res.status(201).json(post);
    } catch (error) {
      logger.error('Error creating scheduled post', { error: error.message });
      throw new AppError(error.message, error.statusCode || 500);
    }
  },

  async getScheduledPosts(req, res) {
    try {
      const { userId } = req.auth;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new AppError('Start date and end date are required', 400);
      }

      const schedules = await schedulerService.getSchedulesByDateRange(
        userId,
        new Date(startDate),
        new Date(endDate)
      );

      res.json(schedules);
    } catch (error) {
      logger.error('Error fetching scheduled posts', { error: error.message });
      throw new AppError(error.message, error.statusCode || 500);
    }
  },

  async updateSchedule(req, res) {
    try {
      const { userId } = req.auth;
      const { scheduleId } = req.params;
      
      const schedule = await schedulerService.updateSchedule(
        scheduleId,
        userId,
        req.body
      );

      res.json(schedule);
    } catch (error) {
      logger.error('Error updating schedule', { error: error.message });
      throw new AppError(error.message, error.statusCode || 500);
    }
  },

  async cancelSchedule(req, res) {
    try {
      const { userId } = req.auth;
      const { scheduleId } = req.params;
      
      const schedule = await schedulerService.cancelSchedule(scheduleId, userId);
      res.json(schedule);
    } catch (error) {
      logger.error('Error cancelling schedule', { error: error.message });
      throw new AppError(error.message, error.statusCode || 500);
    }
  }
};

export default schedulerController;