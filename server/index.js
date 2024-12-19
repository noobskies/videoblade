// server/index.js
import dotenv from 'dotenv';
// Load env vars first
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';
import expressListEndpoints from 'express-list-endpoints';

// Connect to MongoDB with improved error handling
const initializeDatabase = async () => {
  try {
    await connectDB();
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error', { 
      error: error.message,
      stack: error.stack 
    });
    process.exit(1);
  }
};

const initializeServer = async () => {
  await initializeDatabase();

  const app = express();

  // Middleware
  app.use(cors());

  // Handle raw body for webhooks, JSON for everything else
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api/webhooks/clerk')) {
      next();
    } else {
      express.json()(req, res, next);
    }
  });

  // Mount routes under /api
  app.use('/api', routes);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  // Start server
  const PORT = process.env.PORT || 3001;
  
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`, { 
      port: PORT,
      environment: process.env.NODE_ENV || 'development'
    });

    // Log all registered routes in development
    if (process.env.NODE_ENV !== 'production') {
      const endpoints = expressListEndpoints(app);
      logger.debug('Registered Routes:', { 
        routes: endpoints.map(endpoint => ({
          path: endpoint.path,
          methods: endpoint.methods
        }))
      });
    }
  });

  return app;
};

// Global error handling
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', {
    error: error.message,
    stack: error.stack
  });
  // Give logger time to write
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', {
    error: error.message,
    stack: error.stack
  });
  // Give logger time to write
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Starting graceful shutdown...');
  // Add cleanup logic here if needed
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Starting graceful shutdown...');
  // Add cleanup logic here if needed
  process.exit(0);
});

// Initialize server
initializeServer().catch(error => {
  logger.error('Failed to initialize server:', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});