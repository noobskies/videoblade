// server/index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/database.js';
import clerkWebhooks from './routes/auth/clerk-webhooks.js';
import { errorHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';

dotenv.config();

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
app.use(express.json());

// Webhook route - needs raw body
app.use('/api/webhooks', (req, res, next) => {
  if (req.originalUrl.startsWith('/api/webhooks/clerk')) {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Routes
app.use('/api/webhooks', clerkWebhooks);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

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