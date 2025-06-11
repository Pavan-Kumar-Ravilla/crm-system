const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import database connection
const { connectDB, checkDBHealth } = require('./config/database');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const contactRoutes = require('./routes/contacts');
const accountRoutes = require('./routes/accounts');
const opportunityRoutes = require('./routes/opportunities');
const activityRoutes = require('./routes/activities');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ].filter(Boolean); // Remove undefined values
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Increased for development
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  }
});

// Apply rate limiting to API routes only
app.use('/api/', limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware with increased limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('Invalid JSON received:', e.message);
      res.status(400).json({
        status: 'error',
        message: 'Invalid JSON format',
        code: 'INVALID_JSON'
      });
      return;
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for accurate IP addresses behind reverse proxy
app.set('trust proxy', 1);

// Handle favicon requests to prevent 404 errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).send();
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await checkDBHealth();
    
    res.status(200).json({
      status: 'success',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: dbHealth,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Base API route - provides API information
app.get('/api', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'CRM API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    documentation: 'https://api-docs.example.com',
    endpoints: {
      auth: '/api/auth',
      leads: '/api/leads',
      contacts: '/api/contacts',
      accounts: '/api/accounts',
      opportunities: '/api/opportunities',
      activities: '/api/activities'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/activities', activityRoutes);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'CRM API Server is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    documentation: 'https://api-docs.example.com',
    health: '/health',
    api: '/api'
  });
});

// 404 handler for undefined routes
app.use(notFound);

// Global error handling middleware
app.use(errorHandler);

// Enhanced error handling for uncaught exceptions
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Unhandled Rejection: ${err.message}`);
  console.error(err.stack);
  
  // Close server & exit process gracefully
  if (global.server) {
    global.server.close(() => {
      console.log('🔴 Server closed due to unhandled rejection');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.log(`❌ Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  console.log('🔴 Shutting down server due to uncaught exception');
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n👋 ${signal} received`);
  
  if (global.server) {
    global.server.close(() => {
      console.log('💀 HTTP server closed');
      
      // Close database connection
      const mongoose = require('mongoose');
      mongoose.connection.close(() => {
        console.log('🔌 Database connection closed');
        process.exit(0);
      });
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
      console.log('⚠️  Forcing server shutdown...');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Connect to database and start server
const startServer = async () => {
  try {
    console.log('🚀 Starting CRM Backend Server...\n');
    
    // Connect to database
    await connectDB();
    
    // Start server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`
🎉 CRM Server Started Successfully!
📍 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Port: ${PORT}
🏠 Local: http://localhost:${PORT}
📱 Health: http://localhost:${PORT}/health
🔗 API: http://localhost:${PORT}/api
📊 Database: Connected
⏰ Started: ${new Date().toISOString()}
      `);
    });

    // Make server available for graceful shutdown
    global.server = server;
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
      }
    });
    
    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
