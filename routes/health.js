const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    const demoExists = await User.findOne({ email: process.env.DEMO_EMAIL });
    
    res.json({
      status: 'healthy',
      database: 'connected',
      accounts: {
        admin: adminExists ? 'exists' : 'missing',
        demo: demoExists ? 'exists' : 'missing'
      },
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint untuk trigger manual seeding
router.post('/seed', async (req, res) => {
  try {
    const { seedUsers } = require('../seeds/userSeeder');
    await seedUsers();
    
    res.json({
      status: 'success',
      message: 'Manual seeding completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Manual seeding failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;