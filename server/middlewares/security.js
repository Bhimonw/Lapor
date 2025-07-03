const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Rate limiting
const createRateLimit = (windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests') => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General rate limit
const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again later.'
);

// Strict rate limit for auth routes
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 requests per windowMs
  'Too many authentication attempts, please try again later.'
);

// Upload rate limit
const uploadLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // limit each IP to 10 uploads per hour
  'Too many file uploads, please try again later.'
);

// Security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", 'https://api.mapbox.com'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// Data sanitization against NoSQL query injection
const mongoSanitization = mongoSanitize();

// Data sanitization against XSS
const xssProtection = xss();

// Prevent parameter pollution
const parameterPollution = hpp({
  whitelist: ['sort', 'fields', 'page', 'limit', 'status', 'search']
});

// Request size limiter
const requestSizeLimiter = (req, res, next) => {
  const contentLength = parseInt(req.get('Content-Length'));
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength && contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      message: 'Request entity too large'
    });
  }
  
  next();
};

// Security middleware collection
const securityMiddleware = [
  securityHeaders,
  mongoSanitization,
  xssProtection,
  parameterPollution,
  requestSizeLimiter
];

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  securityMiddleware,
  securityHeaders,
  mongoSanitization,
  xssProtection,
  parameterPollution,
  requestSizeLimiter
};