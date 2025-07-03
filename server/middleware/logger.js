/**
 * Advanced Logging Middleware
 * Provides structured logging with different levels and formats
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    return log;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'lapor-server',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    
    // Combined logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    
    // Access logs
    new winston.transports.File({
      filename: path.join(logsDir, 'access.log'),
      level: 'http',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    
    // Security logs
    new winston.transports.File({
      filename: path.join(logsDir, 'security.log'),
      level: 'warn',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ],
  
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      maxsize: 5242880,
      maxFiles: 3
    })
  ],
  
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      maxsize: 5242880,
      maxFiles: 3
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
}

// Custom log levels for HTTP requests
winston.addColors({
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  http: 'magenta',
  debug: 'white'
});

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, url, ip, headers } = req;
  const userAgent = headers['user-agent'] || 'Unknown';
  const referer = headers.referer || 'Direct';
  const requestId = req.id || Math.random().toString(36).substr(2, 9);
  
  // Add request ID to request object
  req.requestId = requestId;
  
  // Log request start
  logger.http('Request started', {
    requestId,
    method,
    url,
    ip,
    userAgent,
    referer,
    timestamp: new Date().toISOString()
  });
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const contentLength = res.get('content-length') || 0;
    
    // Log response
    const logLevel = statusCode >= 400 ? 'warn' : 'http';
    logger.log(logLevel, 'Request completed', {
      requestId,
      method,
      url,
      ip,
      statusCode,
      duration,
      contentLength,
      userAgent,
      referer
    });
    
    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        requestId,
        method,
        url,
        duration,
        ip
      });
    }
    
    // Log errors
    if (statusCode >= 400) {
      logger.warn('HTTP error response', {
        requestId,
        method,
        url,
        statusCode,
        ip,
        userAgent
      });
    }
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Security event logger
const logSecurityEvent = (event, details = {}) => {
  logger.warn('Security event', {
    event,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Database operation logger
const logDatabaseOperation = (operation, collection, details = {}) => {
  logger.info('Database operation', {
    operation,
    collection,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Authentication logger
const logAuthEvent = (event, userId, details = {}) => {
  const logLevel = event.includes('failed') || event.includes('error') ? 'warn' : 'info';
  logger.log(logLevel, 'Authentication event', {
    event,
    userId,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// File operation logger
const logFileOperation = (operation, filename, details = {}) => {
  logger.info('File operation', {
    operation,
    filename,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Error logger with context
const logError = (error, context = {}) => {
  logger.error('Application error', {
    message: error.message,
    stack: error.stack,
    ...context,
    timestamp: new Date().toISOString()
  });
};

// Performance logger
const logPerformance = (operation, duration, details = {}) => {
  const logLevel = duration > 1000 ? 'warn' : 'info';
  logger.log(logLevel, 'Performance metric', {
    operation,
    duration,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Business logic logger
const logBusinessEvent = (event, details = {}) => {
  logger.info('Business event', {
    event,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// Cleanup old logs (run daily)
const cleanupLogs = () => {
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  const now = Date.now();
  
  fs.readdir(logsDir, (err, files) => {
    if (err) {
      logger.error('Error reading logs directory', { error: err.message });
      return;
    }
    
    files.forEach(file => {
      const filePath = path.join(logsDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlink(filePath, (err) => {
            if (err) {
              logger.error('Error deleting old log file', { file, error: err.message });
            } else {
              logger.info('Deleted old log file', { file });
            }
          });
        }
      });
    });
  });
};

// Schedule log cleanup (run once a day)
setInterval(cleanupLogs, 24 * 60 * 60 * 1000);

// Export logger and utilities
module.exports = {
  logger,
  requestLogger,
  logSecurityEvent,
  logDatabaseOperation,
  logAuthEvent,
  logFileOperation,
  logError,
  logPerformance,
  logBusinessEvent,
  cleanupLogs
};