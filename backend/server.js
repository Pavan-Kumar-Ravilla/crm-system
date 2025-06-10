// backend/server.js
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

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to API routes only
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000'
    ].filter(Boolean); // Remove undefined values
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid JSON'
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
  res.status(204).send(); // No content
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
      memory: process.memoryUsage()
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
    endpoints: {
      auth: {
        base: '/api/auth',
        endpoints: [
          'POST /api/auth/register',
          'POST /api/auth/login',
          'POST /api/auth/logout',
          'GET /api/auth/me',
          'PUT /api/auth/me',
          'PUT /api/auth/change-password'
        ]
      },
      leads: {
        base: '/api/leads',
        endpoints: [
          'GET /api/leads',
          'POST /api/leads',
          'GET /api/leads/:id',
          'PUT /api/leads/:id',
          'DELETE /api/leads/:id',
          'POST /api/leads/:id/convert'
        ]
      },
      contacts: {
        base: '/api/contacts',
        endpoints: [
          'GET /api/contacts',
          'POST /api/contacts',
          'GET /api/contacts/:id',
          'PUT /api/contacts/:id',
          'DELETE /api/contacts/:id'
        ]
      },
      accounts: {
        base: '/api/accounts',
        endpoints: [
          'GET /api/accounts',
          'POST /api/accounts',
          'GET /api/accounts/:id',
          'PUT /api/accounts/:id',
          'DELETE /api/accounts/:id'
        ]
      },
      opportunities: {
        base: '/api/opportunities',
        endpoints: [
          'GET /api/opportunities',
          'POST /api/opportunities',
          'GET /api/opportunities/:id',
          'PUT /api/opportunities/:id',
          'DELETE /api/opportunities/:id'
        ]
      },
      activities: {
        base: '/api/activities',
        endpoints: [
          'GET /api/activities',
          'POST /api/activities',
          'GET /api/activities/:id',
          'PUT /api/activities/:id',
          'DELETE /api/activities/:id'
        ]
      }
    },
    documentation: {
      health: 'GET /health - Server health check',
      swagger: 'API documentation available at /api/docs (if enabled)',
      postman: 'Postman collection available for testing'
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
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      leads: '/api/leads',
      contacts: '/api/contacts',
      accounts: '/api/accounts',
      opportunities: '/api/opportunities',
      activities: '/api/activities'
    }
  });
});

// 404 handler for undefined routes
app.use(notFound);

// Global error handling middleware
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Unhandled Rejection: ${err.message}`);
  if (process.env.NODE_ENV === 'production') {
    // Close server & exit process in production
    if (server) {
      server.close(() => {
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`❌ Uncaught Exception: ${err.message}`);
  console.log('Shutting down the server due to uncaught exception');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received');
  if (server) {
    server.close(() => {
      console.log('💀 Process terminated');
    });
  }
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received');
  if (server) {
    server.close(() => {
      console.log('💀 Process terminated');
    });
  }
});

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`
🚀 CRM Server Started Successfully!
📍 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Port: ${PORT}
📱 Health check: http://localhost:${PORT}/health
🔗 API base URL: http://localhost:${PORT}/api
📊 Database: Connected
⏰ Started at: ${new Date().toISOString()}
      `);
    });

    // Make server available for graceful shutdown
    global.server = server;
    
    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Start the server
startServer();

module.exports = app;