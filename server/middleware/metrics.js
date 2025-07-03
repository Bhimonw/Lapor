/**
 * Metrics Middleware for Prometheus
 * Collects application metrics for monitoring
 */

const promClient = require('prom-client');

// Create a Registry which registers the metrics
const register = new promClient.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'lapor-server',
  version: process.env.npm_package_version || '1.0.0'
});

// Enable the collection of default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register]
});

const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register]
});

const databaseConnections = new promClient.Gauge({
  name: 'database_connections',
  help: 'Number of database connections',
  labelNames: ['state'],
  registers: [register]
});

// Application-specific metrics
const reportsTotal = new promClient.Counter({
  name: 'lapor_reports_total',
  help: 'Total number of reports created',
  labelNames: ['status', 'category'],
  registers: [register]
});

const failedReportsTotal = new promClient.Counter({
  name: 'lapor_failed_reports_total',
  help: 'Total number of failed report submissions',
  labelNames: ['reason'],
  registers: [register]
});

const userLoginsTotal = new promClient.Counter({
  name: 'lapor_user_logins_total',
  help: 'Total number of user logins',
  labelNames: ['status', 'role'],
  registers: [register]
});

const failedLoginsTotal = new promClient.Counter({
  name: 'lapor_failed_logins_total',
  help: 'Total number of failed login attempts',
  labelNames: ['reason'],
  registers: [register]
});

const fileUploadsTotal = new promClient.Counter({
  name: 'lapor_file_uploads_total',
  help: 'Total number of file uploads',
  labelNames: ['status', 'type'],
  registers: [register]
});

const fileUploadErrors = new promClient.Counter({
  name: 'lapor_file_upload_errors_total',
  help: 'Total number of file upload errors',
  labelNames: ['error_type'],
  registers: [register]
});

const activeUsers = new promClient.Gauge({
  name: 'lapor_active_users',
  help: 'Number of currently active users',
  labelNames: ['role'],
  registers: [register]
});

const reportProcessingTime = new promClient.Histogram({
  name: 'lapor_report_processing_seconds',
  help: 'Time taken to process reports',
  labelNames: ['category', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [register]
});

// Middleware function
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Increment active connections
  activeConnections.inc();
  
  // Override res.end to capture metrics
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    const method = req.method;
    const statusCode = res.statusCode.toString();
    
    // Record metrics
    httpRequestsTotal.inc({ method, route, status_code: statusCode });
    httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
    
    // Decrement active connections
    activeConnections.dec();
    
    // Call original end function
    originalEnd.apply(this, args);
  };
  
  next();
};

// Helper functions for application metrics
const incrementReports = (status = 'success', category = 'general') => {
  reportsTotal.inc({ status, category });
};

const incrementFailedReports = (reason = 'unknown') => {
  failedReportsTotal.inc({ reason });
};

const incrementUserLogins = (status = 'success', role = 'user') => {
  userLoginsTotal.inc({ status, role });
};

const incrementFailedLogins = (reason = 'invalid_credentials') => {
  failedLoginsTotal.inc({ reason });
};

const incrementFileUploads = (status = 'success', type = 'image') => {
  fileUploadsTotal.inc({ status, type });
};

const incrementFileUploadErrors = (errorType = 'unknown') => {
  fileUploadErrors.inc({ error_type: errorType });
};

const setActiveUsers = (count, role = 'user') => {
  activeUsers.set({ role }, count);
};

const observeReportProcessingTime = (duration, category = 'general', status = 'success') => {
  reportProcessingTime.observe({ category, status }, duration);
};

const updateDatabaseConnections = (active, idle) => {
  databaseConnections.set({ state: 'active' }, active);
  databaseConnections.set({ state: 'idle' }, idle);
};

// Metrics endpoint handler
const getMetrics = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    console.error('Error generating metrics:', error);
    res.status(500).end('Error generating metrics');
  }
};

// Health check with metrics
const healthCheck = (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.json(healthData);
};

module.exports = {
  metricsMiddleware,
  getMetrics,
  healthCheck,
  register,
  // Metric helper functions
  incrementReports,
  incrementFailedReports,
  incrementUserLogins,
  incrementFailedLogins,
  incrementFileUploads,
  incrementFileUploadErrors,
  setActiveUsers,
  observeReportProcessingTime,
  updateDatabaseConnections
};