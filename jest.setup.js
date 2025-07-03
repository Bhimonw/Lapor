// Jest setup file

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MONGO_URI = 'mongodb://localhost:27017/lapor-test';
process.env.PORT = '3001';

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific console methods
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Mock fetch for client-side tests
global.fetch = require('jest-fetch-mock');

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  // Add common test utilities here
  createMockUser: () => ({
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user'
  }),
  
  createMockReport: () => ({
    _id: '507f1f77bcf86cd799439012',
    title: 'Test Report',
    description: 'Test Description',
    location: 'Test Location',
    status: 'pending'
  })
};