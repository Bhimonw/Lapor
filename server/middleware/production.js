const compression = require('compression');
const { securityMiddleware } = require('../middlewares/security');

// Production optimizations
const productionMiddleware = (app) => {
  if (process.env.NODE_ENV === 'production') {
    // Enable compression
    app.use(compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
      level: 6,
      threshold: 1024,
    }));

    // Apply security middleware
    securityMiddleware.forEach(middleware => {
      app.use(middleware);
    });

    // Trust proxy (for Railway, Heroku, etc.)
    app.set('trust proxy', 1);

    // Disable x-powered-by header
    app.disable('x-powered-by');

    // Set secure headers
    app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      next();
    });

    // Cache static assets
    app.use('/uploads', (req, res, next) => {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
      next();
    });

    app.use('/static', (req, res, next) => {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
      next();
    });
  }
};

module.exports = productionMiddleware;