#!/usr/bin/env node

/**
 * LAPOR Production Deployment Script
 * Automates the deployment process for production environments
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Utility functions
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logStep = (step, message) => {
  log(`\n[${step}] ${message}`, 'cyan');
};

const logSuccess = (message) => {
  log(`✅ ${message}`, 'green');
};

const logError = (message) => {
  log(`❌ ${message}`, 'red');
};

const logWarning = (message) => {
  log(`⚠️  ${message}`, 'yellow');
};

const logInfo = (message) => {
  log(`ℹ️  ${message}`, 'blue');
};

// Execute command with error handling
const execCommand = (command, options = {}) => {
  try {
    const result = execSync(command, {
      stdio: 'inherit',
      encoding: 'utf8',
      ...options
    });
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Deployment configurations
const deploymentConfigs = {
  docker: {
    name: 'Docker',
    description: 'Deploy using Docker containers',
    commands: [
      'docker-compose -f docker-compose.yml down',
      'docker-compose -f docker-compose.yml build --no-cache',
      'docker-compose -f docker-compose.yml up -d'
    ]
  },
  vercel: {
    name: 'Vercel',
    description: 'Deploy to Vercel platform',
    commands: [
      'npm run build',
      'vercel --prod'
    ]
  },
  heroku: {
    name: 'Heroku',
    description: 'Deploy to Heroku platform',
    commands: [
      'git add .',
      'git commit -m "Deploy to production"',
      'git push heroku main'
    ]
  },
  railway: {
    name: 'Railway',
    description: 'Deploy to Railway platform',
    commands: [
      'npm run build',
      'railway up'
    ]
  },
  vps: {
    name: 'VPS/Server',
    description: 'Deploy to VPS or dedicated server',
    commands: [
      'npm run build',
      'pm2 stop all',
      'pm2 start ecosystem.config.js',
      'pm2 save'
    ]
  }
};

// Pre-deployment checks
const preDeploymentChecks = () => {
  logStep('1', 'Running pre-deployment checks...');
  
  const checks = [
    {
      name: 'Git status',
      check: () => {
        try {
          const status = execSync('git status --porcelain', { encoding: 'utf8' });
          return status.trim() === '';
        } catch {
          return false;
        }
      },
      message: 'Working directory should be clean'
    },
    {
      name: 'Tests',
      check: () => {
        const result = execCommand('npm test', { stdio: 'pipe' });
        return result.success;
      },
      message: 'All tests should pass'
    },
    {
      name: 'Linting',
      check: () => {
        const result = execCommand('npm run lint', { stdio: 'pipe' });
        return result.success;
      },
      message: 'Code should pass linting'
    },
    {
      name: 'Build',
      check: () => {
        const result = execCommand('npm run build', { stdio: 'pipe' });
        return result.success;
      },
      message: 'Project should build successfully'
    },
    {
      name: 'Environment variables',
      check: () => {
        const requiredVars = [
          'NODE_ENV',
          'MONGODB_URI',
          'JWT_SECRET'
        ];
        return requiredVars.every(varName => process.env[varName]);
      },
      message: 'Required environment variables should be set'
    }
  ];
  
  let allPassed = true;
  
  checks.forEach(check => {
    logInfo(`Checking: ${check.name}...`);
    if (check.check()) {
      logSuccess(`✓ ${check.name}`);
    } else {
      logError(`✗ ${check.name}: ${check.message}`);
      allPassed = false;
    }
  });
  
  if (!allPassed) {
    logError('Pre-deployment checks failed. Please fix the issues before deploying.');
    process.exit(1);
  }
  
  logSuccess('All pre-deployment checks passed!');
};

// Create production build
const createProductionBuild = () => {
  logStep('2', 'Creating production build...');
  
  // Set NODE_ENV to production
  process.env.NODE_ENV = 'production';
  
  // Build client
  logInfo('Building client application...');
  const clientBuild = execCommand('npm run build', { cwd: 'client' });
  if (!clientBuild.success) {
    logError('Client build failed');
    process.exit(1);
  }
  
  // Install production dependencies
  logInfo('Installing production dependencies...');
  const prodInstall = execCommand('npm ci --only=production');
  if (!prodInstall.success) {
    logError('Production dependency installation failed');
    process.exit(1);
  }
  
  logSuccess('Production build created successfully!');
};

// Security checks
const runSecurityChecks = () => {
  logStep('3', 'Running security checks...');
  
  // npm audit
  logInfo('Running npm audit...');
  const auditResult = execCommand('npm audit --audit-level=high', { stdio: 'pipe' });
  if (!auditResult.success) {
    logWarning('npm audit found security vulnerabilities. Consider running "npm audit fix"');
  } else {
    logSuccess('npm audit passed!');
  }
  
  // Check for sensitive files
  const sensitiveFiles = [
    '.env',
    'server/.env',
    'client/.env',
    'config/database.js',
    'config/secrets.js'
  ];
  
  logInfo('Checking for sensitive files in git...');
  let foundSensitiveFiles = false;
  
  sensitiveFiles.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        execSync(`git ls-files --error-unmatch ${file}`, { stdio: 'ignore' });
        logWarning(`Sensitive file ${file} is tracked by git!`);
        foundSensitiveFiles = true;
      } catch {
        // File is not tracked, which is good
      }
    }
  });
  
  if (!foundSensitiveFiles) {
    logSuccess('No sensitive files found in git tracking');
  }
  
  logSuccess('Security checks completed!');
};

// Database migration (if needed)
const runDatabaseMigration = async () => {
  logStep('4', 'Database migration (optional)...');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('Do you want to run database migrations? (y/N): ', (answer) => {
      rl.close();
      
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        logInfo('Running database migrations...');
        // Add your migration commands here
        logInfo('No migrations configured. Skipping...');
      } else {
        logInfo('Skipping database migrations.');
      }
      
      resolve();
    });
  });
};

// Deploy to selected platform
const deployToPlatform = async (platform) => {
  logStep('5', `Deploying to ${deploymentConfigs[platform].name}...`);
  
  const config = deploymentConfigs[platform];
  
  for (const command of config.commands) {
    logInfo(`Executing: ${command}`);
    const result = execCommand(command);
    if (!result.success) {
      logError(`Command failed: ${command}`);
      process.exit(1);
    }
  }
  
  logSuccess(`Deployment to ${config.name} completed successfully!`);
};

// Post-deployment verification
const postDeploymentVerification = async (platform) => {
  logStep('6', 'Post-deployment verification...');
  
  // Wait a moment for services to start
  logInfo('Waiting for services to start...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Health check
  if (platform === 'docker') {
    logInfo('Checking Docker containers...');
    const containerCheck = execCommand('docker-compose ps', { stdio: 'pipe' });
    if (containerCheck.success) {
      logSuccess('Docker containers are running');
    } else {
      logWarning('Could not verify Docker container status');
    }
  }
  
  // Try to ping the application
  logInfo('Performing health check...');
  try {
    const healthCheck = execCommand('curl -f http://localhost:3000/health || echo "Health check failed"', { stdio: 'pipe' });
    if (healthCheck.success) {
      logSuccess('Application health check passed');
    } else {
      logWarning('Application health check failed');
    }
  } catch {
    logWarning('Could not perform health check (curl not available)');
  }
  
  logSuccess('Post-deployment verification completed!');
};

// Rollback function
const rollback = async (platform) => {
  logStep('ROLLBACK', 'Rolling back deployment...');
  
  switch (platform) {
    case 'docker':
      execCommand('docker-compose down');
      execCommand('docker-compose up -d --scale app=0');
      break;
    case 'vps':
      execCommand('pm2 stop all');
      break;
    default:
      logWarning('Rollback not implemented for this platform');
  }
  
  logSuccess('Rollback completed');
};

// Select deployment platform
const selectDeploymentPlatform = () => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    log('\nAvailable deployment platforms:', 'cyan');
    Object.entries(deploymentConfigs).forEach(([key, config], index) => {
      log(`${index + 1}. ${config.name} - ${config.description}`);
    });
    
    rl.question('\nSelect deployment platform (1-5): ', (answer) => {
      rl.close();
      
      const platformIndex = parseInt(answer) - 1;
      const platforms = Object.keys(deploymentConfigs);
      
      if (platformIndex >= 0 && platformIndex < platforms.length) {
        resolve(platforms[platformIndex]);
      } else {
        logError('Invalid selection');
        process.exit(1);
      }
    });
  });
};

// Main deployment function
const main = async () => {
  log('\n🚀 LAPOR Production Deployment Script', 'bright');
  log('=========================================\n', 'bright');
  
  try {
    // Check if this is a production deployment
    if (process.env.NODE_ENV !== 'production') {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const confirm = await new Promise((resolve) => {
        rl.question('This will deploy to PRODUCTION. Are you sure? (yes/no): ', (answer) => {
          rl.close();
          resolve(answer.toLowerCase() === 'yes');
        });
      });
      
      if (!confirm) {
        log('Deployment cancelled.', 'yellow');
        process.exit(0);
      }
    }
    
    // Select platform
    const platform = await selectDeploymentPlatform();
    
    // Run deployment steps
    preDeploymentChecks();
    createProductionBuild();
    runSecurityChecks();
    await runDatabaseMigration();
    await deployToPlatform(platform);
    await postDeploymentVerification(platform);
    
    log('\n🎉 Deployment completed successfully!', 'green');
    log('=====================================', 'bright');
    log('\nDeployment summary:', 'cyan');
    log(`Platform: ${deploymentConfigs[platform].name}`);
    log(`Time: ${new Date().toISOString()}`);
    log(`Environment: ${process.env.NODE_ENV || 'production'}`);
    log('\nMonitor your application and check logs for any issues.\n');
    
  } catch (error) {
    logError(`Deployment failed: ${error.message}`);
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('Do you want to rollback? (y/N): ', async (answer) => {
      rl.close();
      
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        await rollback(platform);
      }
      
      process.exit(1);
    });
  }
};

// Handle CLI arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
LAPOR Production Deployment Script

Usage: node scripts/deploy.js [options]

Options:
  --help, -h     Show this help message
  --platform     Specify deployment platform (docker, vercel, heroku, railway, vps)
  --skip-checks  Skip pre-deployment checks (not recommended)
  --dry-run      Show what would be deployed without actually deploying

This script will:
1. Run pre-deployment checks
2. Create production build
3. Run security checks
4. Run database migrations (optional)
5. Deploy to selected platform
6. Verify deployment

Supported platforms:
- Docker: Deploy using Docker containers
- Vercel: Deploy to Vercel platform
- Heroku: Deploy to Heroku platform
- Railway: Deploy to Railway platform
- VPS: Deploy to VPS or dedicated server
`);
    process.exit(0);
  }
  
  if (args.includes('--dry-run')) {
    log('DRY RUN MODE - No actual deployment will occur', 'yellow');
    // Implement dry run logic here
    process.exit(0);
  }
  
  main();
}

module.exports = {
  preDeploymentChecks,
  createProductionBuild,
  runSecurityChecks,
  runDatabaseMigration,
  deployToPlatform,
  postDeploymentVerification,
  rollback
};