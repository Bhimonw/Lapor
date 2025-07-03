/**
 * Database Seeder
 * Seeds the database with initial data for development and testing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Report = require('../models/Report');
const { logger } = require('../middleware/logger');

// Sample users data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@lapor.com',
    password: 'admin123',
    role: 'admin',
    isVerified: true,
    profile: {
      phone: '+62812345678',
      address: 'Jakarta, Indonesia',
      dateOfBirth: new Date('1990-01-01')
    }
  },
  {
    name: 'Demo User',
    email: 'demo@lapor.com',
    password: 'demo123',
    role: 'user',
    isVerified: true,
    profile: {
      phone: '+62812345679',
      address: 'Bandung, Indonesia',
      dateOfBirth: new Date('1995-05-15')
    }
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user',
    isVerified: true,
    profile: {
      phone: '+62812345680',
      address: 'Surabaya, Indonesia',
      dateOfBirth: new Date('1988-12-10')
    }
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'user',
    isVerified: false,
    profile: {
      phone: '+62812345681',
      address: 'Medan, Indonesia',
      dateOfBirth: new Date('1992-08-22')
    }
  },
  {
    name: 'Moderator User',
    email: 'moderator@lapor.com',
    password: 'mod123',
    role: 'moderator',
    isVerified: true,
    profile: {
      phone: '+62812345682',
      address: 'Yogyakarta, Indonesia',
      dateOfBirth: new Date('1985-03-18')
    }
  }
];

// Sample reports data
const sampleReports = [
  {
    title: 'Jalan Rusak di Jl. Sudirman',
    description: 'Terdapat lubang besar di jalan yang membahayakan pengendara. Lubang tersebut sudah ada sejak 2 minggu yang lalu dan semakin membesar.',
    category: 'Infrastruktur',
    location: {
      address: 'Jl. Sudirman No. 123, Jakarta Pusat',
      coordinates: {
        latitude: -6.2088,
        longitude: 106.8456
      }
    },
    status: 'pending',
    priority: 'high',
    isAnonymous: false
  },
  {
    title: 'Lampu Jalan Mati',
    description: 'Lampu penerangan jalan di area perumahan sudah mati selama 1 minggu. Hal ini membuat area menjadi gelap dan tidak aman di malam hari.',
    category: 'Infrastruktur',
    location: {
      address: 'Perumahan Graha Indah, Bekasi',
      coordinates: {
        latitude: -6.2441,
        longitude: 106.9914
      }
    },
    status: 'in_progress',
    priority: 'medium',
    isAnonymous: false
  },
  {
    title: 'Sampah Menumpuk di TPS',
    description: 'Tempat Pembuangan Sampah (TPS) di area pasar sudah penuh dan sampah mulai berserakan ke jalan. Bau tidak sedap mulai tercium.',
    category: 'Lingkungan',
    location: {
      address: 'Pasar Tradisional Cibinong, Bogor',
      coordinates: {
        latitude: -6.4817,
        longitude: 106.8540
      }
    },
    status: 'resolved',
    priority: 'high',
    isAnonymous: true,
    resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    resolution: 'Sampah telah dibersihkan dan jadwal pengangkutan sampah telah diperbaiki.'
  },
  {
    title: 'Kebisingan Pabrik di Malam Hari',
    description: 'Pabrik di area industri mengeluarkan suara bising hingga larut malam, mengganggu istirahat warga sekitar.',
    category: 'Lingkungan',
    location: {
      address: 'Kawasan Industri MM2100, Bekasi',
      coordinates: {
        latitude: -6.3000,
        longitude: 107.1500
      }
    },
    status: 'pending',
    priority: 'medium',
    isAnonymous: false
  },
  {
    title: 'Pelayanan Buruk di Kantor Kelurahan',
    description: 'Petugas di kantor kelurahan memberikan pelayanan yang lambat dan tidak ramah kepada warga yang mengurus dokumen.',
    category: 'Pelayanan Publik',
    location: {
      address: 'Kantor Kelurahan Menteng, Jakarta Pusat',
      coordinates: {
        latitude: -6.1944,
        longitude: 106.8294
      }
    },
    status: 'in_progress',
    priority: 'low',
    isAnonymous: false
  },
  {
    title: 'Pungli di Terminal Bus',
    description: 'Terdapat oknum yang memungut biaya tidak resmi kepada penumpang bus di terminal. Hal ini merugikan masyarakat.',
    category: 'Keamanan',
    location: {
      address: 'Terminal Bus Kampung Rambutan, Jakarta Timur',
      coordinates: {
        latitude: -6.2833,
        longitude: 106.8667
      }
    },
    status: 'pending',
    priority: 'high',
    isAnonymous: true
  },
  {
    title: 'Fasilitas Toilet Umum Rusak',
    description: 'Toilet umum di taman kota dalam kondisi rusak dan tidak terawat. Pintu tidak bisa dikunci dan air tidak mengalir.',
    category: 'Infrastruktur',
    location: {
      address: 'Taman Suropati, Jakarta Pusat',
      coordinates: {
        latitude: -6.1975,
        longitude: 106.8357
      }
    },
    status: 'resolved',
    priority: 'medium',
    isAnonymous: false,
    resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    resolution: 'Toilet telah diperbaiki dan dilakukan perawatan rutin.'
  },
  {
    title: 'Banjir di Underpass',
    description: 'Underpass di area Kemayoran selalu banjir saat hujan deras. Air mencapai ketinggian 50cm dan membahayakan kendaraan.',
    category: 'Infrastruktur',
    location: {
      address: 'Underpass Kemayoran, Jakarta Pusat',
      coordinates: {
        latitude: -6.1667,
        longitude: 106.8500
      }
    },
    status: 'in_progress',
    priority: 'high',
    isAnonymous: false
  }
];

// Hash password function
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Seed users
const seedUsers = async () => {
  try {
    logger.info('Starting user seeding...');
    
    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      logger.info(`Users already exist (${existingUsers} users). Skipping user seeding.`);
      return await User.find().select('_id name email role');
    }
    
    // Hash passwords and create users
    const usersWithHashedPasswords = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await hashPassword(user.password)
      }))
    );
    
    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    logger.info(`Successfully seeded ${createdUsers.length} users`);
    
    return createdUsers;
  } catch (error) {
    logger.error('Error seeding users:', { error: error.message });
    throw error;
  }
};

// Seed reports
const seedReports = async (users) => {
  try {
    logger.info('Starting report seeding...');
    
    // Check if reports already exist
    const existingReports = await Report.countDocuments();
    if (existingReports > 0) {
      logger.info(`Reports already exist (${existingReports} reports). Skipping report seeding.`);
      return;
    }
    
    // Assign random users to reports (except anonymous ones)
    const reportsWithUsers = sampleReports.map((report, index) => {
      if (!report.isAnonymous) {
        // Assign user (skip admin for variety)
        const userIndex = (index % (users.length - 1)) + 1;
        report.reportedBy = users[userIndex]._id;
      }
      
      // Add random creation date (within last 30 days)
      const randomDays = Math.floor(Math.random() * 30);
      report.createdAt = new Date(Date.now() - randomDays * 24 * 60 * 60 * 1000);
      
      return report;
    });
    
    const createdReports = await Report.insertMany(reportsWithUsers);
    logger.info(`Successfully seeded ${createdReports.length} reports`);
    
    return createdReports;
  } catch (error) {
    logger.error('Error seeding reports:', { error: error.message });
    throw error;
  }
};

// Main seeder function
const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...');
    
    // Connect to database if not connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lapor');
      logger.info('Connected to MongoDB for seeding');
    }
    
    // Seed users first
    const users = await seedUsers();
    
    // Seed reports with user references
    await seedReports(users);
    
    logger.info('Database seeding completed successfully!');
    
    // Log summary
    const userCount = await User.countDocuments();
    const reportCount = await Report.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    
    logger.info('Seeding summary:', {
      totalUsers: userCount,
      totalReports: reportCount,
      adminUsers: adminCount,
      pendingReports
    });
    
  } catch (error) {
    logger.error('Database seeding failed:', { error: error.message });
    throw error;
  }
};

// Clear database function (for testing)
const clearDatabase = async () => {
  try {
    logger.warn('Clearing database...');
    
    await User.deleteMany({});
    await Report.deleteMany({});
    
    logger.info('Database cleared successfully');
  } catch (error) {
    logger.error('Error clearing database:', { error: error.message });
    throw error;
  }
};

// Reset database function (clear + seed)
const resetDatabase = async () => {
  try {
    await clearDatabase();
    await seedDatabase();
    logger.info('Database reset completed successfully');
  } catch (error) {
    logger.error('Database reset failed:', { error: error.message });
    throw error;
  }
};

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  
  const runCommand = async () => {
    try {
      switch (command) {
        case 'seed':
          await seedDatabase();
          break;
        case 'clear':
          await clearDatabase();
          break;
        case 'reset':
          await resetDatabase();
          break;
        default:
          console.log('Usage: node seeders/index.js [seed|clear|reset]');
          console.log('  seed  - Add sample data to database');
          console.log('  clear - Remove all data from database');
          console.log('  reset - Clear and then seed database');
          process.exit(1);
      }
      
      process.exit(0);
    } catch (error) {
      console.error('Seeder error:', error.message);
      process.exit(1);
    }
  };
  
  runCommand();
}

module.exports = {
  seedDatabase,
  clearDatabase,
  resetDatabase,
  seedUsers,
  seedReports
};