const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if demo users already exist
    const existingAdmin = await User.findOne({ username: 'admin' });
    const existingUser = await User.findOne({ username: 'user' });

    // Create demo admin if doesn't exist
    if (!existingAdmin) {
      const adminUser = new User({
        name: 'Demo Admin',
        username: 'admin',
        email: 'admin@demo.com',
        password: 'Admin123',
        role: 'admin'
      });
      await adminUser.save();
      console.log('✅ Demo Admin created successfully');
    } else {
      console.log('ℹ️  Demo Admin already exists');
    }

    // Create demo user if doesn't exist
    if (!existingUser) {
      const demoUser = new User({
        name: 'Demo User',
        username: 'user',
        email: 'user@demo.com',
        password: 'User123',
        role: 'user'
      });
      await demoUser.save();
      console.log('✅ Demo User created successfully');
    } else {
      console.log('ℹ️  Demo User already exists');
    }

    console.log('\n🎉 Seeding completed!');
    console.log('\nDemo Accounts:');
    console.log('Admin - Username: admin, Password: Admin123');
    console.log('User  - Username: user, Password: User123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();