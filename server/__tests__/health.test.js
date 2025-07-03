const request = require('supertest');
const express = require('express');

// Mock app for testing
const app = express();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

describe('Health Check Endpoint', () => {
  test('GET /health should return 200 status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('environment');
  });

  test('Health response should have correct structure', async () => {
    const response = await request(app)
      .get('/health');

    expect(typeof response.body.status).toBe('string');
    expect(typeof response.body.timestamp).toBe('string');
    expect(typeof response.body.uptime).toBe('number');
    expect(typeof response.body.environment).toBe('string');
  });

  test('Health timestamp should be valid ISO string', async () => {
    const response = await request(app)
      .get('/health');

    const timestamp = new Date(response.body.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.getTime()).not.toBeNaN();
  });
});