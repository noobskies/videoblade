import dotenv from 'dotenv';
// Load env vars first
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';

// Connect to MongoDB
connectDB().then(() => {
  logger.info('MongoDB connected successfully');
}).catch((error) => {
  logger.error('MongoDB connection error', { error: error.message });
  process.exit(1);
});

const app = express();

// Regular routes middleware
app.use(cors());

// Handle raw body for webhooks
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/webhooks/clerk')) {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Mount all routes under /api
app.use('/api', routes);

// Error handler must be last
app.use(errorHandler);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { 
    error: error.message,
    stack: error.stack 
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection', { 
    error: error.message,
    stack: error.stack 
  });
  process.exit(1);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`, { port: PORT });
});