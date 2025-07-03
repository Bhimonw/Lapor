#!/usr/bin/env node

/**
 * LAPOR Project Setup Script
 * Automates the installation and configuration of development tools and dependencies
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

// Check if command exists
const commandExists = (command) => {
  try {
    execSync(`where ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

// Check prerequisites
const checkPrerequisites = () => {
  logStep('1', 'Checking prerequisites...');
  
  const requirements = [
    { name: 'Node.js', command: 'node', version: '--version' },
    { name: 'npm', command: 'npm', version: '--version' },
    { name: 'Git', command: 'git', version: '--version' }
  ];
  
  let allGood = true;
  
  requirements.forEach(req => {
    if (commandExists(req.command)) {
      const version = execSync(`${req.command} ${req.version}`, { encoding: 'utf8' }).trim();
      logSuccess(`${req.name} is installed: ${version}`);
    } else {
      logError(`${req.name} is not installed or not in PATH`);
      allGood = false;
    }
  });
  
  if (!allGood) {
    logError('Please install missing prerequisites before continuing.');
    process.exit(1);
  }
  
  logSuccess('All prerequisites are met!');
};

// Install dependencies
const installDependencies = () => {
  logStep('2', 'Installing dependencies...');
  
  // Install root dependencies
  logInfo('Installing root dependencies...');
  const rootInstall = execCommand('npm install');
  if (!rootInstall.success) {
    logError('Failed to install root dependencies');
    process.exit(1);
  }
  
  // Install server dependencies
  logInfo('Installing server dependencies...');
  const serverInstall = execCommand('npm install', { cwd: 'server' });
  if (!serverInstall.success) {
    logError('Failed to install server dependencies');
    process.exit(1);
  }
  
  // Install client dependencies
  logInfo('Installing client dependencies...');
  const clientInstall = execCommand('npm install', { cwd: 'client' });
  if (!clientInstall.success) {
    logError('Failed to install client dependencies');
    process.exit(1);
  }
  
  logSuccess('All dependencies installed successfully!');
};

// Setup Git hooks
const setupGitHooks = () => {
  logStep('3', 'Setting up Git hooks...');
  
  const huskySetup = execCommand('npx husky install');
  if (!huskySetup.success) {
    logError('Failed to setup Husky');
    return;
  }
  
  // Add pre-commit hook
  const preCommitHook = execCommand('npx husky add .husky/pre-commit "npx lint-staged"');
  if (!preCommitHook.success) {
    logWarning('Failed to add pre-commit hook');
  }
  
  // Add commit-msg hook
  const commitMsgHook = execCommand('npx husky add .husky/commit-msg "npx commitlint --edit $1"');
  if (!commitMsgHook.success) {
    logWarning('Failed to add commit-msg hook');
  }
  
  logSuccess('Git hooks configured successfully!');
};

// Create necessary directories
const createDirectories = () => {
  logStep('4', 'Creating necessary directories...');
  
  const directories = [
    'logs',
    'server/uploads',
    'server/__tests__',
    'client/src/__tests__',
    'docs',
    'scripts',
    'monitoring/grafana/dashboards',
    'monitoring/grafana/provisioning/datasources',
    'monitoring/grafana/provisioning/dashboards'
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logInfo(`Created directory: ${dir}`);
    } else {
      logInfo(`Directory already exists: ${dir}`);
    }
  });
  
  // Create .gitkeep files for empty directories
  const emptyDirs = ['logs', 'server/uploads'];
  emptyDirs.forEach(dir => {
    const gitkeepPath = path.join(dir, '.gitkeep');
    if (!fs.existsSync(gitkeepPath)) {
      fs.writeFileSync(gitkeepPath, '');
      logInfo(`Created .gitkeep in ${dir}`);
    }
  });
  
  logSuccess('All directories created successfully!');
};

// Setup environment files
const setupEnvironment = () => {
  logStep('5', 'Setting up environment files...');
  
  // Check if .env exists
  if (!fs.existsSync('.env')) {
    if (fs.existsSync('.env.example')) {
      fs.copyFileSync('.env.example', '.env');
      logInfo('Created .env from .env.example');
      logWarning('Please update .env with your actual configuration values');
    } else {
      logWarning('.env.example not found. Please create .env manually');
    }
  } else {
    logInfo('.env already exists');
  }
  
  // Check server .env
  if (!fs.existsSync('server/.env')) {
    if (fs.existsSync('server/.env.example')) {
      fs.copyFileSync('server/.env.example', 'server/.env');
      logInfo('Created server/.env from server/.env.example');
    }
  }
  
  // Check client .env
  if (!fs.existsSync('client/.env')) {
    if (fs.existsSync('client/.env.example')) {
      fs.copyFileSync('client/.env.example', 'client/.env');
      logInfo('Created client/.env from client/.env.example');
    }
  }
  
  logSuccess('Environment files setup completed!');
};

// Run linting and formatting
const runCodeQuality = () => {
  logStep('6', 'Running code quality checks...');
  
  // Run ESLint
  logInfo('Running ESLint...');
  const lintResult = execCommand('npm run lint', { stdio: 'pipe' });
  if (!lintResult.success) {
    logWarning('ESLint found issues. Run "npm run lint:fix" to auto-fix some issues.');
  } else {
    logSuccess('ESLint passed!');
  }
  
  // Run Prettier
  logInfo('Running Prettier...');
  const formatResult = execCommand('npm run format:check', { stdio: 'pipe' });
  if (!formatResult.success) {
    logWarning('Prettier found formatting issues. Run "npm run format" to fix them.');
  } else {
    logSuccess('Prettier check passed!');
  }
};

// Run tests
const runTests = () => {
  logStep('7', 'Running tests...');
  
  const testResult = execCommand('npm test', { stdio: 'pipe' });
  if (!testResult.success) {
    logWarning('Some tests failed. Please check the test output.');
  } else {
    logSuccess('All tests passed!');
  }
};

// Setup database (optional)
const setupDatabase = async () => {
  logStep('8', 'Database setup (optional)...');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('Do you want to seed the database with sample data? (y/N): ', (answer) => {
      rl.close();
      
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        logInfo('Seeding database...');
        const seedResult = execCommand('node server/seeders/index.js seed');
        if (seedResult.success) {
          logSuccess('Database seeded successfully!');
        } else {
          logWarning('Database seeding failed. Make sure MongoDB is running.');
        }
      } else {
        logInfo('Skipping database seeding.');
      }
      
      resolve();
    });
  });
};

// Generate project documentation
const generateDocs = () => {
  logStep('9', 'Generating documentation...');
  
  // Create basic docs structure
  const docsStructure = {
    'docs/API.md': '# API Documentation\n\nAPI documentation will be generated here.\n',
    'docs/DEPLOYMENT.md': '# Deployment Guide\n\nDeployment instructions will be documented here.\n',
    'docs/DEVELOPMENT.md': '# Development Guide\n\nDevelopment setup and guidelines.\n'
  };
  
  Object.entries(docsStructure).forEach(([file, content]) => {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, content);
      logInfo(`Created ${file}`);
    }
  });
  
  logSuccess('Documentation structure created!');
};

// Main setup function
const main = async () => {
  log('\n🚀 LAPOR Project Setup Script', 'bright');
  log('=====================================\n', 'bright');
  
  try {
    checkPrerequisites();
    installDependencies();
    setupGitHooks();
    createDirectories();
    setupEnvironment();
    runCodeQuality();
    runTests();
    await setupDatabase();
    generateDocs();
    
    log('\n🎉 Setup completed successfully!', 'green');
    log('=====================================', 'bright');
    log('\nNext steps:', 'cyan');
    log('1. Update .env files with your configuration');
    log('2. Start MongoDB if using local database');
    log('3. Run "npm run dev" to start development servers');
    log('4. Visit http://localhost:5173 for the client');
    log('5. Visit http://localhost:3000 for the server');
    log('\nFor more information, check the README.md file.\n');
    
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    process.exit(1);
  }
};

// Handle CLI arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
LAPOR Project Setup Script

Usage: node scripts/setup.js [options]

Options:
  --help, -h     Show this help message
  --skip-tests   Skip running tests during setup
  --skip-db      Skip database setup

This script will:
1. Check prerequisites (Node.js, npm, Git)
2. Install all dependencies
3. Setup Git hooks with Husky
4. Create necessary directories
5. Setup environment files
6. Run code quality checks
7. Run tests (unless --skip-tests)
8. Setup database (unless --skip-db)
9. Generate documentation structure
`);
    process.exit(0);
  }
  
  main();
}

module.exports = {
  checkPrerequisites,
  installDependencies,
  setupGitHooks,
  createDirectories,
  setupEnvironment,
  runCodeQuality,
  runTests,
  setupDatabase,
  generateDocs
};