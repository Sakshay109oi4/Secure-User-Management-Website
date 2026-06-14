const rateLimit = require('express-rate-limit');

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000;
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100;
const authMaxRequests = parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 10;

const generalLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  skip: (req) => req.path.startsWith('/api/health'),
});

const authLimiter = rateLimit({
  windowMs,
  max: authMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
};
