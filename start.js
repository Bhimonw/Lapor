#!/usr/bin/env node

/**
 * Production start script for LAPOR application
 * This script ensures proper initialization in production environment
 */

const path = require('path');
const fs = require('fs');

// Set production environment if not already set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Ensure required directories exist
const requiredDirs = [
  path.join(__dirname, 'server', 'public'),
  path.join(__dirname, 'server', 'uploads'),
  path.join(__dirname, 'server', 'uploads', 'reports')
];

requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Check if frontend build exists
const publicDir = path.join(__dirname, 'server', 'public');
const indexPath = path.join(publicDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.log('Frontend build not found. Building...');
  const { execSync } = require('child_process');
  
  try {
    // Build frontend
    execSync('npm run build:win || npm run build', { 
      cwd: __dirname,
      stdio: 'inherit' 
    });
    console.log('Frontend build completed.');
  } catch (error) {
    console.error('Failed to build frontend:', error.message);
    console.log('Continuing without frontend build...');
  }
}

// Start the server
console.log('Starting LAPOR server...');
require('./server/server.js');