/**
 * PM2 Ecosystem Configuration
 * Production process management configuration for LAPOR application
 */

module.exports = {
  apps: [
    {
      // Main application
      name: 'lapor-server',
      script: 'server/server.js',
      cwd: './',
      instances: process.env.PM2_INSTANCES || 'max',
      exec_mode: 'cluster',
      
      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        MONGODB_URI: 'mongodb://localhost:27017/lapor-dev',
        JWT_SECRET: 'dev-secret-key',
        CLIENT_URL: 'http://localhost:5173'
      },
      
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
        MONGODB_URI: process.env.MONGODB_URI,
        JWT_SECRET: process.env.JWT_SECRET,
        CLIENT_URL: process.env.CLIENT_URL || 'https://lapor-app.vercel.app'
      },
      
      env_staging: {
        NODE_ENV: 'staging',
        PORT: process.env.PORT || 3001,
        MONGODB_URI: process.env.MONGODB_URI_STAGING,
        JWT_SECRET: process.env.JWT_SECRET,
        CLIENT_URL: process.env.CLIENT_URL_STAGING
      },
      
      // Process management
      watch: false,
      ignore_watch: [
        'node_modules',
        'logs',
        'uploads',
        '.git',
        '*.log'
      ],
      
      // Resource limits
      max_memory_restart: '500M',
      min_uptime: '10s',
      max_restarts: 10,
      
      // Logging
      log_file: './logs/pm2-combined.log',
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // Advanced options
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,
      
      // Health monitoring
      health_check_grace_period: 3000,
      
      // Cluster options
      instance_var: 'INSTANCE_ID',
      
      // Auto restart conditions
      autorestart: true,
      restart_delay: 4000,
      
      // Source map support
      source_map_support: true,
      
      // Node.js options
      node_args: [
        '--max-old-space-size=512',
        '--optimize-for-size'
      ],
      
      // Process monitoring
      pmx: true,
      
      // Custom startup script
      post_update: [
        'npm install',
        'npm run build'
      ]
    },
    
    {
      // Background job processor (if needed)
      name: 'lapor-worker',
      script: 'server/workers/index.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      
      env: {
        NODE_ENV: 'development',
        WORKER_TYPE: 'background'
      },
      
      env_production: {
        NODE_ENV: 'production',
        WORKER_TYPE: 'background',
        MONGODB_URI: process.env.MONGODB_URI,
        JWT_SECRET: process.env.JWT_SECRET
      },
      
      // Worker-specific settings
      watch: false,
      autorestart: true,
      max_memory_restart: '200M',
      min_uptime: '10s',
      max_restarts: 5,
      
      // Logging
      log_file: './logs/worker-combined.log',
      out_file: './logs/worker-out.log',
      error_file: './logs/worker-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Cron restart (restart daily at 3 AM)
      cron_restart: '0 3 * * *',
      
      // Only start if worker file exists
      ignore_watch: ['*'],
      watch: false
    },
    
    {
      // Metrics collector
      name: 'lapor-metrics',
      script: 'server/monitoring/metrics-collector.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      
      env: {
        NODE_ENV: 'development',
        METRICS_PORT: 9090
      },
      
      env_production: {
        NODE_ENV: 'production',
        METRICS_PORT: process.env.METRICS_PORT || 9090,
        MONGODB_URI: process.env.MONGODB_URI
      },
      
      // Metrics-specific settings
      watch: false,
      autorestart: true,
      max_memory_restart: '100M',
      min_uptime: '5s',
      max_restarts: 3,
      
      // Logging
      log_file: './logs/metrics-combined.log',
      out_file: './logs/metrics-out.log',
      error_file: './logs/metrics-error.log'
    }
  ],
  
  // Deployment configuration
  deploy: {
    production: {
      user: process.env.DEPLOY_USER || 'deploy',
      host: process.env.DEPLOY_HOST || 'your-server.com',
      ref: 'origin/main',
      repo: process.env.DEPLOY_REPO || 'git@github.com:yourusername/lapor.git',
      path: process.env.DEPLOY_PATH || '/var/www/lapor',
      
      // Pre-deploy commands
      'pre-deploy-local': [
        'echo "Starting deployment to production..."',
        'git add .',
        'git commit -m "Deploy to production" || true'
      ].join(' && '),
      
      // Post-receive commands
      'post-deploy': [
        'npm install --production',
        'npm run build',
        'pm2 reload ecosystem.config.js --env production',
        'pm2 save'
      ].join(' && '),
      
      // Pre-setup commands
      'pre-setup': [
        'apt update',
        'apt install git nodejs npm -y',
        'npm install -g pm2'
      ].join(' && '),
      
      // Post-setup commands
      'post-setup': [
        'pm2 install pm2-logrotate',
        'pm2 set pm2-logrotate:max_size 10M',
        'pm2 set pm2-logrotate:retain 30',
        'pm2 startup',
        'pm2 save'
      ].join(' && '),
      
      // Environment variables for deployment
      env: {
        NODE_ENV: 'production'
      }
    },
    
    staging: {
      user: process.env.STAGING_USER || 'deploy',
      host: process.env.STAGING_HOST || 'staging-server.com',
      ref: 'origin/develop',
      repo: process.env.DEPLOY_REPO || 'git@github.com:yourusername/lapor.git',
      path: process.env.STAGING_PATH || '/var/www/lapor-staging',
      
      'post-deploy': [
        'npm install',
        'npm run build',
        'pm2 reload ecosystem.config.js --env staging',
        'pm2 save'
      ].join(' && '),
      
      env: {
        NODE_ENV: 'staging'
      }
    }
  }
};

// Helper function to validate configuration
function validateConfig() {
  const requiredEnvVars = {
    production: ['MONGODB_URI', 'JWT_SECRET'],
    staging: ['MONGODB_URI_STAGING', 'JWT_SECRET']
  };
  
  Object.entries(requiredEnvVars).forEach(([env, vars]) => {
    vars.forEach(varName => {
      if (!process.env[varName] && env === process.env.NODE_ENV) {
        console.warn(`Warning: ${varName} environment variable is not set for ${env} environment`);
      }
    });
  });
}

// Validate configuration when loaded
if (require.main !== module) {
  validateConfig();
}

// CLI interface for configuration management
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'validate':
      validateConfig();
      console.log('Configuration validation completed');
      break;
      
    case 'show':
      console.log('PM2 Ecosystem Configuration:');
      console.log(JSON.stringify(module.exports, null, 2));
      break;
      
    case 'start':
      console.log('Starting applications with PM2...');
      require('child_process').execSync('pm2 start ecosystem.config.js', { stdio: 'inherit' });
      break;
      
    case 'stop':
      console.log('Stopping applications...');
      require('child_process').execSync('pm2 stop ecosystem.config.js', { stdio: 'inherit' });
      break;
      
    case 'restart':
      console.log('Restarting applications...');
      require('child_process').execSync('pm2 restart ecosystem.config.js', { stdio: 'inherit' });
      break;
      
    case 'reload':
      console.log('Reloading applications (zero-downtime)...');
      require('child_process').execSync('pm2 reload ecosystem.config.js', { stdio: 'inherit' });
      break;
      
    case 'logs':
      console.log('Showing logs...');
      require('child_process').execSync('pm2 logs', { stdio: 'inherit' });
      break;
      
    case 'status':
      console.log('Showing status...');
      require('child_process').execSync('pm2 status', { stdio: 'inherit' });
      break;
      
    case 'monit':
      console.log('Opening monitoring interface...');
      require('child_process').execSync('pm2 monit', { stdio: 'inherit' });
      break;
      
    default:
      console.log(`
PM2 Ecosystem Configuration Manager

Usage: node ecosystem.config.js [command]

Commands:
  validate  - Validate configuration
  show      - Show configuration
  start     - Start all applications
  stop      - Stop all applications
  restart   - Restart all applications
  reload    - Reload applications (zero-downtime)
  logs      - Show application logs
  status    - Show application status
  monit     - Open monitoring interface

Direct PM2 commands:
  pm2 start ecosystem.config.js --env production
  pm2 deploy ecosystem.config.js production setup
  pm2 deploy ecosystem.config.js production
`);
  }
}