// server/utils/errors/auth-errors.js
import AppError from './AppError.js';

export class AuthError extends AppError {
  constructor(message, statusCode = 401) {
    super(message, statusCode);
  }
}

export class WebhookError extends AppError {
  constructor(message, statusCode = 400) {
    super(message, statusCode);
  }
}