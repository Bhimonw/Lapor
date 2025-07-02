const mongoose = require('mongoose');
const { MONGO_URI, NODE_ENV } = process.env;

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      
      // Connection pool settings for production
      maxPoolSize: 20, // Maximum number of connections
      minPoolSize: 5,  // Minimum number of connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      
      // Timeout settings
      serverSelectionTimeoutMS: 10000, // How long to try selecting a server
      socketTimeoutMS: 45000, // How long a send or receive on a socket can take
      connectTimeoutMS: 10000, // How long to wait for initial connection
      
      // Reliability settings
      retryWrites: true,
      retryReads: true,
      w: 'majority', // Write concern
      readPreference: 'primary',
      
      // Buffer settings
      bufferMaxEntries: 0,
      bufferCommands: false,
      
      // Authentication (if needed)
      authSource: 'admin',
      
      // SSL/TLS settings for production
      ssl: process.env.MONGO_SSL === 'true',
      sslValidate: process.env.MONGO_SSL_VALIDATE !== 'false',
      
      // Compression
      compressors: ['zlib'],
      zlibCompressionLevel: 6,
    };

    const conn = await mongoose.connect(MONGO_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
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

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal) => {
      console.log(`\n🔄 Received ${signal}. Gracefully shutting down...`);
      try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Log additional error details in production
    if (NODE_ENV === 'production') {
      console.error('Error details:', {
        name: error.name,
        code: error.code,
        codeName: error.codeName
      });
    }
    
    process.exit(1);
  }
};

// Health check function
const checkDBHealth = () => {
  return {
    status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
    readyState: mongoose.connection.readyState
  };
};

module.exports = {
  connectDB,
  checkDBHealth
};