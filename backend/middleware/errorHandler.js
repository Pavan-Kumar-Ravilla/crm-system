class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400, 'INVALID_ID');
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
  return new AppError(message, 400, 'DUPLICATE_FIELD');
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400, 'VALIDATION_ERROR');
};

const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again!', 401, 'INVALID_TOKEN');
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired! Please log in again.', 401, 'TOKEN_EXPIRED');
};

const sendErrorDev = (err, res) => {
  console.error('Error details:', {
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    code: err.code
  });

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    code: err.code,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      code: err.code,
      timestamp: new Date().toISOString()
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥:', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
      code: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error details in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error in request:', {
      method: req.method,
      url: req.url,
      body: req.body,
      params: req.params,
      query: req.query,
      headers: req.headers,
      user: req.user?.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific MongoDB errors
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const notFound = (req, res, next) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(error);
};

const handleValidationErrors = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => {
      return {
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      };
    });

    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: errorMessages,
      timestamp: new Date().toISOString()
    });
  }

  next();
};

const handleRateLimit = (req, res) => {
  res.status(429).json({
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString(),
    retryAfter: Math.round(req.rateLimit.resetTime / 1000)
  });
};

const handleCorsError = (err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      status: 'error',
      message: 'CORS policy violation. Origin not allowed.',
      code: 'CORS_ERROR',
      timestamp: new Date().toISOString()
    });
  }
  next(err);
};

module.exports = {
  AppError,
  errorHandler,
  asyncHandler,
  notFound,
  handleValidationErrors,
  handleRateLimit,
  handleCorsError
};