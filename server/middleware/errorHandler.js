// server/middleware/errorHandler.js

import logger from '../utils/logger.js';
import AppError from '../utils/errors/AppError.js';

const handleYouTubeError = (err) => {
  // Handle video upload limit
  if (err.message?.includes('exceeded the number of videos')) {
    return {
      statusCode: 429,
      message: 'You have reached your YouTube upload limit for today. Please try again tomorrow.'
    };
  }

  // Handle quota errors
  if (err.message?.includes('quota')) {
    return {
      statusCode: 429,
      message: 'API quota exceeded. Please try again later.'
    };
  }

  // Handle authentication errors
  if (err.message?.includes('invalid_grant') || err.message?.includes('invalid_credentials')) {
    return {
      statusCode: 401,
      message: 'Your YouTube session has expired. Please reconnect your account.'
    };
  }

  // Handle permission errors
  if (err.code === 403 || err.message?.includes('permission')) {
    return {
      statusCode: 403,
      message: 'You do not have permission to perform this action on YouTube.'
    };
  }

  return null;
};

export const errorHandler = (err, req, res, next) => {
  // Log all errors
  logger.error('Error handler caught:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.auth?.userId
  });

  // Handle AppErrors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  // Handle YouTube-specific errors
  const youtubeError = handleYouTubeError(err);
  if (youtubeError) {
    return res.status(youtubeError.statusCode).json({
      success: false,
      error: youtubeError.message
    });
  }

  // Handle other known errors
  if (err.statusCode && err.message) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  // Default error response
  const statusCode = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message
  });
};

// Process-level error handlers
const handleFatalError = (error, type = 'Uncaught Exception') => {
  logger.error(`${type}:`, {
    error: error.message,
    stack: error.stack
  });

  // Give logger time to write
  setTimeout(() => {
    process.exit(1);
  }, 1000);
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  handleFatalError(error, 'Uncaught Exception');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  handleFatalError(error, 'Unhandled Rejection');
});