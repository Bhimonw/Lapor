#!/usr/bin/env node

/**
 * Deployment Test Script
 * Tests critical functionality before deployment
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const tests = [
  {
    name: 'Environment Variables',
    test: () => {
      const required = ['MONGO_URI', 'JWT_SECRET'];
      const missing = required.filter(env => !process.env[env]);
      if (missing.length > 0) {
        throw new Error(`Missing environment variables: ${missing.join(', ')}`);
      }
      return 'All required environment variables are set';
    }
  },
  {
    name: 'Frontend Build',
    test: () => {
      const buildPath = path.join(__dirname, 'server', 'public', 'index.html');
      if (!fs.existsSync(buildPath)) {
        throw new Error('Frontend build not found. Run npm run build first.');
      }
      return 'Frontend build exists';
    }
  },
  {
    name: 'Upload Directory',
    test: () => {
      const uploadPath = path.join(__dirname, 'server', 'uploads');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      return 'Upload directory ready';
    }
  },
  {
    name: 'Dependencies',
    test: () => {
      const packagePath = path.join(__dirname, 'server', 'package.json');
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const required = ['express', 'mongoose', 'jsonwebtoken', 'bcryptjs'];
      const missing = required.filter(dep => !pkg.dependencies[dep]);
      if (missing.length > 0) {
        throw new Error(`Missing dependencies: ${missing.join(', ')}`);
      }
      return 'All required dependencies are installed';
    }
  },
  {
    name: 'JWT Secret Strength',
    test: () => {
      const secret = process.env.JWT_SECRET;
      if (!secret || secret.length < 32) {
        throw new Error('JWT_SECRET should be at least 32 characters long');
      }
      if (secret === 'your_super_secret_jwt_key_here_change_in_production') {
        throw new Error('Please change the default JWT_SECRET');
      }
      return 'JWT secret is strong';
    }
  }
];

async function runTests() {
  console.log('🧪 Running deployment tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.test();
      console.log(`✅ ${test.name}: ${result}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    console.log('\n⚠️  Please fix the failing tests before deployment.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed! Ready for deployment.');
    process.exit(0);
  }
}

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});