// backend/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection options (updated for latest Mongoose version)
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      // Removed deprecated options:
      // bufferCommands: false, // Deprecated in newer versions
      // bufferMaxEntries: 0, // This was causing the error
    };

    // Use default MongoDB URI if not provided
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm-system';

    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI, options);

    console.log(`
📊 MongoDB Connected Successfully!
🔗 Host: ${conn.connection.host}
🏷️  Database: ${conn.connection.name}
🌐 Ready State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}
    `);

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Log detailed error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error details:', error);
    }
    
    // Don't exit in development to allow for easy debugging
    if (process.env.NODE_ENV !== 'development') {
      process.exit(1);
    }
  }
};

// Database health check
const checkDBHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    return {
      status: state === 1 ? 'healthy' : 'unhealthy',
      state: states[state],
      host: mongoose.connection.host,
      name: mongoose.connection.name
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

module.exports = {
  connectDB,
  checkDBHealth
};