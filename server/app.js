const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import middleware
const { generalLimiter, authLimiter } = require('./middlewares/security');
const productionMiddleware = require('./middleware/production');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Create Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://lapor-production.up.railway.app',
        process.env.CLIENT_URL,
        process.env.RAILWAY_STATIC_URL
      ].filter(Boolean)
    : [
        process.env.CLIENT_URL || 'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000'
      ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));

// Apply production optimizations and security
productionMiddleware(app);

// Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from React build (production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'LAPOR API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

// Catch-all handler for React SPA (production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
      return res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
      });
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
} else {
  // 404 handler for development
  app.use(notFound);
}

// Global error handler
app.use(errorHandler);

module.exports = app;