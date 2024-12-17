import express from 'express';
import youtubeRoutes from './platforms/youtube.js';
import facebookRoutes from './platforms/facebook.js';
import clerkWebhooks from './auth/clerk-webhooks.js';
import schedulerRoutes from './scheduler.js';

const router = express.Router();

// Platform routes
router.use('/platforms/youtube', youtubeRoutes);
router.use('/platforms/facebook', facebookRoutes);

router.use('/scheduler', schedulerRoutes);

// Webhook routes
router.use('/webhooks', clerkWebhooks);

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default router;