const mongoose = require('mongoose');
const { MONGO_URI, NODE_ENV } = process.env;

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      
      // Development-friendly settings
      maxPoolSize: 5, // Smaller pool for development
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
      
      // Enable debugging in development
      debug: true,
    };

    // Enable mongoose debugging
    if (NODE_ENV === 'development') {
      mongoose.set('debug', true);
    }

    const conn = await mongoose.connect(MONGO_URI, options);

    console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔧 Environment: ${NODE_ENV}`);
    
    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    // Development-specific events
    mongoose.connection.on('open', () => {
      console.log('📂 MongoDB connection opened');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🔄 Shutting down gracefully...');
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

// Development helper functions
const dropDatabase = async () => {
  if (NODE_ENV !== 'development') {
    throw new Error('Database drop is only allowed in development environment');
  }
  
  try {
    await mongoose.connection.dropDatabase();
    console.log('🗑️  Database dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping database:', error.message);
    throw error;
  }
};

const getCollections = async () => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    return collections.map(col => col.name);
  } catch (error) {
    console.error('❌ Error getting collections:', error.message);
    return [];
  }
};

module.exports = {
  connectDB,
  dropDatabase,
  getCollections
};