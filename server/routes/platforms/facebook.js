import express from 'express';
import { facebookController } from '../../controllers/platforms/facebookController.js';
import { requireAuth } from '../../middleware/auth.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get Facebook OAuth URL
router.get('/auth-url', facebookController.getAuthUrl);

// Handle OAuth callback
router.get('/callback', facebookController.handleCallback);

// Get connected account info
router.get('/account', facebookController.getConnectedAccount);

// Get videos
router.get('/videos', facebookController.getVideos);

// Upload video
router.post('/upload', 
  requireAuth, 
  upload.single('video'), 
  facebookController.uploadVideo
);

export default router;