// server/routes/platforms/youtube.js
import { Router } from 'express';
import youtubeController from '../../controllers/platforms/youtubeController.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

// OAuth routes
router.get('/auth-url', youtubeController.getAuthUrl);  // Changed from /auth to /auth-url
router.get('/callback', youtubeController.handleCallback);

// Protected routes
router.use(requireAuth);

// Account management
router.get('/account', youtubeController.getConnectedAccount);
router.delete('/account', youtubeController.disconnectAccount);

// Video management
router.post('/videos/upload-url', youtubeController.getUploadUrl);
router.get('/videos', youtubeController.getVideos);

// Analytics
router.get('/videos/:videoId/analytics', youtubeController.getAnalytics);

export default router;