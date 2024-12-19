// controllers/scheduler/YouTubeSchedulerController.js

import { BaseSchedulerController } from './BaseSchedulerController.js';
import youtubeSchedulerService from '../../services/scheduler/YouTubeSchedulerService.js';
import logger from '../../utils/logger.js';

class YouTubeSchedulerController extends BaseSchedulerController {
  constructor() {
    super(youtubeSchedulerService);
  }

  /**
   * Override to parse YouTube-specific video data
   */
  parseVideoData(req) {
    const baseData = super.parseVideoData(req);
    
    return {
      ...baseData,
      categoryId: req.body.categoryId || '22', // Default to 'People & Blogs'
      madeForKids: req.body.madeForKids === 'true',
      language: req.body.language || 'en',
      ...(req.body.playlistId && { playlistId: req.body.playlistId })
    };
  }

  /**
   * Override to include YouTube-specific response data
   */
  formatScheduleResponse(schedule) {
    const baseResponse = super.formatScheduleResponse(schedule);
    
    return {
      ...baseResponse,
      metadata: {
        categoryId: schedule.metadata.categoryId,
        madeForKids: schedule.metadata.madeForKids,
        language: schedule.metadata.defaultLanguage,
        ...(schedule.metadata.playlistId && {
          playlistId: schedule.metadata.playlistId
        })
      }
    };
  }

  /**
   * Override to add YouTube-specific filters
   */
  parseFilters(query) {
    const filters = super.parseFilters(query);
    
    if (query.categoryId) {
      filters['metadata.categoryId'] = query.categoryId;
    }
    
    if (query.playlistId) {
      filters['metadata.playlistId'] = query.playlistId;
    }

    return filters;
  }
}

export default new YouTubeSchedulerController();