// server/middleware/errorHandler.js
import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    logger.error('Error:', {
      error: {
        message: err.message,
        stack: err.stack,
        statusCode: err.statusCode
      },
      path: req.path,
      method: req.method
    });

    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Production error response
    logger.error('Error:', {
      error: {
        message: err.message,
        statusCode: err.statusCode
      },
      path: req.path,
      method: req.method
    });

    // Only send operational errors to client
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      // Programming or unknown errors
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
      });
    }
  }
};