const { createAdminAccount, createDemoAccount } = require('../seeds/userSeeder');

// Middleware untuk memastikan akun default ada
const ensureDefaultAccounts = async (req, res, next) => {
  try {
    // Hanya jalankan di environment tertentu atau jika AUTO_SEED enabled
    if (process.env.NODE_ENV === 'development' || process.env.AUTO_SEED === 'true') {
      await createAdminAccount();
      await createDemoAccount();
    }
    next();
  } catch (error) {
    console.error('Error ensuring default accounts:', error.message);
    next(); // Lanjutkan meskipun ada error
  }
};

// Fungsi untuk seeding saat startup server
const seedOnStartup = async () => {
  try {
    if (process.env.SEED_ON_STARTUP === 'true') {
      console.log('🌱 Running startup seeding...');
      await createAdminAccount();
      await createDemoAccount();
      console.log('✅ Startup seeding completed');
    }
  } catch (error) {
    console.error('❌ Startup seeding failed:', error.message);
    // Jangan throw error agar server tetap bisa start
  }
};

module.exports = {
  ensureDefaultAccounts,
  seedOnStartup
};