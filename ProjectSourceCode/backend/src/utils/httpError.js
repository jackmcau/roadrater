import { sendError } from './response.js';

/**
 * HTTP Error factory for consistent error responses
 */
export class HttpError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'HttpError';
  }
}

/**
 * Create a 400 Bad Request error
 */
export const badRequest = (message, details = null) => {
  return new HttpError(400, message, details);
};

/**
 * Create a 404 Not Found error
 */
export const notFound = (message = 'Resource not found') => {
  return new HttpError(404, message);
};

/**
 * Create a 500 Internal Server Error
 */
export const internalError = (message = 'Internal server error', details = null) => {
  return new HttpError(500, message, details);
};

/**
 * Error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err);
  
  // Handle HttpError instances
  if (err instanceof HttpError) {
    return sendError(res, err.message, err.statusCode, err.details);
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return sendError(res, 'Validation Error', 400, err.errors);
  }
  
  // Default to 500 Internal Server Error
  sendError(res, 'An unexpected error occurred', 500, err.message);
};

export default {
  HttpError,
  badRequest,
  notFound,
  internalError,
  errorHandler
};
