// server/routes/scheduler.js
import express from 'express';
import { schedulerController } from '../controllers/scheduler/schedulerController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// Create a new scheduled post
router.post('/', schedulerController.createScheduledPost);

// Get scheduled posts for a date range
router.get('/', schedulerController.getScheduledPosts);

// Update a schedule
router.patch('/:scheduleId', schedulerController.updateSchedule);

// Cancel a schedule
router.delete('/:scheduleId', schedulerController.cancelSchedule);

export default router;