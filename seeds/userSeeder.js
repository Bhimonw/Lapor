const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/database');

// Fungsi untuk membuat akun admin
async function createAdminAccount() {
  try {
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
      
      const admin = new User({
        name: process.env.ADMIN_NAME || 'Administrator',
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        createdAt: new Date()
      });
      
      await admin.save();
      console.log('✅ Admin account created successfully');
    } else {
      console.log('ℹ️ Admin account already exists');
    }
  } catch (error) {
    console.error('❌ Error creating admin account:', error.message);
  }
}

// Fungsi untuk membuat akun demo
async function createDemoAccount() {
  try {
    const demoExists = await User.findOne({ email: process.env.DEMO_EMAIL });
    
    if (!demoExists) {
      const hashedPassword = await bcrypt.hash(process.env.DEMO_PASSWORD, 12);
      
      const demo = new User({
        name: process.env.DEMO_NAME || 'Demo User',
        email: process.env.DEMO_EMAIL,
        password: hashedPassword,
        role: 'user',
        isVerified: true,
        createdAt: new Date()
      });
      
      await demo.save();
      console.log('✅ Demo account created successfully');
    } else {
      console.log('ℹ️ Demo account already exists');
    }
  } catch (error) {
    console.error('❌ Error creating demo account:', error.message);
  }
}

// Fungsi utama seeding
async function seedUsers() {
  try {
    console.log('🌱 Starting user seeding...');
    
    await createAdminAccount();
    await createDemoAccount();
    
    console.log('🎉 User seeding completed!');
  } catch (error) {
    console.error('💥 Seeding failed:', error.message);
    throw error;
  }
}

// Export fungsi untuk digunakan di tempat lain
module.exports = {
  seedUsers,
  createAdminAccount,
  createDemoAccount
};

// Jalankan seeding jika file dipanggil langsung
if (require.main === module) {
  connectDB().then(() => {
    return seedUsers();
  }).then(() => {
    console.log('Seeding completed successfully');
    process.exit(0);
  }).catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
}