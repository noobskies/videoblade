// routes/platforms/basePlatformRoutes.js
import express from 'express';
import multer from 'multer';
import { requireAuth } from '../../middleware/auth.js';

const upload = multer({ storage: multer.memoryStorage() });

export const createPlatformRouter = (controller, options = {}) => {
  const router = express.Router();
  
  // Apply authentication middleware to all routes
  router.use(requireAuth);

  // Common routes for all platforms
  router.get('/auth-url', controller.getAuthUrl);
  router.get('/callback', controller.handleCallback);
  router.get('/account', controller.getConnectedAccount);
  router.post('/disconnect', controller.disconnectAccount);
  router.post('/refresh-token', controller.refreshToken);
  
  // Video upload route (if platform supports it)
  if (!options.disableUpload) {
    router.post('/upload',
      upload.single('video'),
      controller.uploadVideo
    );
  }

  return router;
};