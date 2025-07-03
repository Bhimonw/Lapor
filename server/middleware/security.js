/**
 * Security Middleware
 * Implements various security measures including rate limiting, CORS, helmet, etc.
 */

const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const { incrementFailedLogins } = require('./metrics');

// Rate limiting configurations
const createRateLimit = (windowMs, max, message, skipSuccessfulRequests = false) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// General rate limiting
const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again later.'
);

// Strict rate limiting for auth endpoints
const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 requests per windowMs
  'Too many authentication attempts, please try again later.',
  true // skip successful requests
);

// Rate limiting for file uploads
const uploadLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  20, // limit each IP to 20 uploads per hour
  'Too many file uploads, please try again later.'
);

// Rate limiting for report creation
const reportLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  10, // limit each IP to 10 reports per hour
  'Too many reports submitted, please try again later.'
);

// Slow down middleware for repeated requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: 500, // begin adding 500ms of delay per request above 50
  maxDelayMs: 20000, // maximum delay of 20 seconds
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5173',
      'https://lapor-app.vercel.app', // Add your production domain
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ]
};

// Helmet configuration for security headers
const helmetConfig = {
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
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
};

// Compression configuration
const compressionConfig = {
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024,
  level: 6
};

// MongoDB injection prevention
const mongoSanitizeConfig = {
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Potential MongoDB injection attempt detected: ${key}`);
  }
};

// HPP (HTTP Parameter Pollution) protection
const hppConfig = {
  whitelist: ['tags', 'categories'] // Allow arrays for these parameters
};

// Custom security middleware
const securityHeaders = (req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(), camera=()');
  
  next();
};

// IP whitelist middleware (for admin endpoints)
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    
    if (allowedIPs.length === 0 || allowedIPs.includes(clientIP)) {
      next();
    } else {
      console.warn(`Unauthorized IP access attempt: ${clientIP}`);
      res.status(403).json({ error: 'Access denied from this IP address' });
    }
  };
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, url, ip } = req;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    console.log(`${method} ${url} ${statusCode} ${duration}ms - ${ip} - ${userAgent}`);
    
    // Log suspicious activity
    if (statusCode === 401 || statusCode === 403) {
      console.warn(`Suspicious activity: ${method} ${url} ${statusCode} - ${ip}`);
      incrementFailedLogins('unauthorized_access');
    }
  });
  
  next();
};

// Error handling middleware for security
const securityErrorHandler = (err, req, res, next) => {
  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    console.error('Security error:', err);
    
    if (err.message === 'Not allowed by CORS') {
      return res.status(403).json({ error: 'CORS policy violation' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
  
  next(err);
};

// Apply all security middleware
const applySecurity = (app) => {
  // Trust proxy (important for rate limiting behind reverse proxy)
  app.set('trust proxy', 1);
  
  // Compression
  app.use(compression(compressionConfig));
  
  // Security headers
  app.use(helmet(helmetConfig));
  app.use(securityHeaders);
  
  // CORS
  app.use(cors(corsOptions));
  
  // Request logging
  app.use(requestLogger);
  
  // Rate limiting
  app.use(speedLimiter);
  app.use(generalLimiter);
  
  // Data sanitization
  app.use(mongoSanitize(mongoSanitizeConfig));
  app.use(xss());
  app.use(hpp(hppConfig));
  
  // Security error handler
  app.use(securityErrorHandler);
};

module.exports = {
  applySecurity,
  generalLimiter,
  authLimiter,
  uploadLimiter,
  reportLimiter,
  speedLimiter,
  corsOptions,
  helmetConfig,
  ipWhitelist,
  requestLogger,
  securityErrorHandler
};