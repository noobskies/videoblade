// server/routes/platforms/youtube.js
import express from 'express';
import { youtubeController } from '../../controllers/platforms/youtubeController.js';
import { requireAuth } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get YouTube OAuth URL
router.get('/auth-url', youtubeController.getAuthUrl);

// Handle OAuth callback
router.get('/callback', youtubeController.handleCallback);

// Get connected account info
router.get('/account', youtubeController.getConnectedAccount);

// Get videos
router.get('/videos', youtubeController.getVideos);

export default router;