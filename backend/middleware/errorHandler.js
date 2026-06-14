const { HTTP_STATUS } = require('../config/constants');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const notFound = (req, res, next) => {
  const error = new AppError(`Route not found: ${req.originalUrl}`, HTTP_STATUS.NOT_FOUND);
  next(error);
};

const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `${field} already exists.`;
  }

  if (err.name === 'CastError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (err.code === 'EBADCSRFTOKEN') {
    statusCode = HTTP_STATUS.FORBIDDEN;
    message = 'Invalid or missing CSRF token. Please refresh the page.';
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = {
  AppError,
  notFound,
  errorHandler,
};
