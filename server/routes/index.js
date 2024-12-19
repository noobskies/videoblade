// routes/index.js
import express from 'express';
import youtubeRoutes from './platforms/youtube.js';
import facebookRoutes from './platforms/facebook.js';
import schedulerRoutes from './scheduler.js';
import clerkWebhooks from './auth/clerk-webhooks.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Platform routes with error logging
const addPlatformRoutes = (path, routes) => {
  router.use(path, routes);
  logger.info(`Registered routes for ${path}`);
};

// Register core platform routes
addPlatformRoutes('/platforms/youtube', youtubeRoutes);
addPlatformRoutes('/platforms/facebook', facebookRoutes);

// Register scheduler routes
router.use('/scheduler', schedulerRoutes);
logger.info('Registered scheduler routes');

// Webhook routes
router.use('/webhooks/clerk', clerkWebhooks);
logger.info('Registered webhook routes');

// Health check route with expanded service status
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '1.0.0',
    services: {
      api: 'healthy',
      database: 'connected',
      schedulers: {
        youtube: 'active',
        facebook: 'active'
      }
    }
  });
});

// Global error handler for unhandled routes
router.use((req, res) => {
  logger.warn('Unhandled route accessed', { 
    path: req.path, 
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.path
  });
});

// Global error handler
router.use((err, req, res, next) => {
  logger.error('Global router error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'An unexpected error occurred'
  });
});

export default router;