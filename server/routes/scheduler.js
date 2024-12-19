// routes/scheduler.js
import { Router } from 'express';
import youtubeSchedulerController from '../controllers/scheduler/YouTubeSchedulerController.js';
import { requireAuth } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = Router();

// YouTube scheduling routes
router.post(
  '/youtube',
  requireAuth,
  youtubeSchedulerController.scheduleVideo
);

router.get(
  '/youtube',
  requireAuth,
  youtubeSchedulerController.getSchedules
);

router.delete(
  '/youtube/:scheduleId',
  requireAuth,
  youtubeSchedulerController.cancelSchedule
);

// Log registered routes
logger.info('Registered YouTube scheduler routes');

// Error handler for scheduler routes
router.use((err, req, res, next) => {
  logger.error('Scheduler route error', { 
    error: err.message,
    path: req.path,
    method: req.method 
  });
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'An error occurred processing the schedule'
  });
});

export default router;