// services/scheduler/schedulerService.js
import Post from '../../models/Post.js';
import Schedule from '../../models/Schedule.js';
import AppError from '../../utils/errors/AppError.js';
import logger from '../../utils/logger.js';

class SchedulerService {
  async createPost(userId, postData) {
    try {
      // Create the post
      const post = await Post.create({
        userId,
        title: postData.title,
        description: postData.description,
        mediaType: postData.mediaType,
        platforms: postData.platforms.map(platform => ({
          platform,
          status: 'pending'
        })),
        tags: postData.tags
      });

      // If there's a scheduled time, create the schedule
      if (postData.scheduledFor) {
        await Schedule.create({
          userId,
          post: post._id,
          scheduledFor: new Date(postData.scheduledFor),
          timezone: postData.timezone || 'UTC'
        });
      }

      logger.info('Post created', { postId: post._id, userId });
      return post;
    } catch (error) {
      logger.error('Error creating post', { error: error.message, userId });
      throw new AppError('Failed to create post', 500);
    }
  }

  async getScheduledPosts(userId, startDate, endDate) {
    try {
      const schedules = await Schedule.find({
        userId,
        scheduledFor: {
          $gte: startDate,
          $lte: endDate
        },
        status: 'pending'
      })
      .populate('post')
      .sort({ scheduledFor: 1 });

      return schedules;
    } catch (error) {
      logger.error('Error fetching scheduled posts', { error: error.message, userId });
      throw new AppError('Failed to fetch scheduled posts', 500);
    }
  }

  async updateSchedule(scheduleId, userId, updateData) {
    try {
      const schedule = await Schedule.findOne({ _id: scheduleId, userId });
      
      if (!schedule) {
        throw new AppError('Schedule not found', 404);
      }

      // Don't allow updating if already published
      if (schedule.status === 'published') {
        throw new AppError('Cannot update published schedule', 400);
      }

      Object.assign(schedule, updateData);
      await schedule.save();

      return schedule;
    } catch (error) {
      logger.error('Error updating schedule', { error: error.message, scheduleId });
      throw error;
    }
  }

  async cancelSchedule(scheduleId, userId) {
    try {
      const schedule = await Schedule.findOne({ _id: scheduleId, userId });
      
      if (!schedule) {
        throw new AppError('Schedule not found', 404);
      }

      if (schedule.status === 'published') {
        throw new AppError('Cannot cancel published schedule', 400);
      }

      schedule.status = 'cancelled';
      await schedule.save();

      return schedule;
    } catch (error) {
      logger.error('Error cancelling schedule', { error: error.message, scheduleId });
      throw error;
    }
  }

  async getSchedulesByDateRange(userId, startDate, endDate) {
    try {
      // Group schedules by date
      const schedules = await Schedule.aggregate([
        {
          $match: {
            userId,
            scheduledFor: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        },
        {
          $lookup: {
            from: 'posts',
            localField: 'post',
            foreignField: '_id',
            as: 'post'
          }
        },
        {
          $unwind: '$post'
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$scheduledFor'
              }
            },
            posts: {
              $push: {
                id: '$_id',
                time: {
                  $dateToString: {
                    format: '%H:%M',
                    date: '$scheduledFor'
                  }
                },
                title: '$post.title',
                platforms: '$post.platforms',
                status: '$status'
              }
            }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      return schedules;
    } catch (error) {
      logger.error('Error fetching schedules by date range', { 
        error: error.message, 
        userId 
      });
      throw new AppError('Failed to fetch schedules', 500);
    }
  }
}

export default new SchedulerService();