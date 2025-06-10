// backend/middleware/auth.js
const { verifyToken, extractTokenFromHeader } = require('../config/jwt');
const User = require('../models/User');

/**
 * Middleware to authenticate user using JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Token is invalid. User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    if (error.message.includes('expired')) {
      return res.status(401).json({
        status: 'error',
        message: 'Token has expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(401).json({
      status: 'error',
      message: 'Token is invalid.',
      code: 'INVALID_TOKEN'
    });
  }
};

/**
 * Middleware to authorize user based on roles
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is admin
 */
const requireAdmin = authorize('admin');

/**
 * Middleware to check if user is admin or manager
 */
const requireManager = authorize('admin', 'manager');

/**
 * Middleware to check if user is admin, manager, or sales_rep
 */
const requireSalesAccess = authorize('admin', 'manager', 'sales_rep');

/**
 * Middleware for optional authentication (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

/**
 * Middleware to check resource ownership or admin access
 * @param {string} resourceModel - The mongoose model name
 * @param {string} userField - The field in the resource that contains user ID
 */
const checkOwnership = (resourceModel, userField = 'createdBy') => {
  return async (req, res, next) => {
    try {
      const Model = require(`../models/${resourceModel}`);
      const resource = await Model.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({
          status: 'error',
          message: `${resourceModel} not found`
        });
      }

      // Allow admin and manager full access
      if (['admin', 'manager'].includes(req.user.role)) {
        req.resource = resource;
        return next();
      }

      // Check if user owns the resource
      const resourceUserId = resource[userField]?.toString();
      const currentUserId = req.user._id.toString();

      if (resourceUserId !== currentUserId) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied. You can only access your own resources.'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error checking resource ownership'
      });
    }
  };
};

/**
 * Middleware to validate user account status
 */
const validateAccountStatus = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Check if account is locked
    if (req.user.isLocked) {
      return res.status(423).json({
        status: 'error',
        message: 'Account is temporarily locked. Please try again later.',
        code: 'ACCOUNT_LOCKED'
      });
    }

    // Check if account is active
    if (!req.user.isActive) {
      return res.status(403).json({
        status: 'error',
        message: 'Account is deactivated. Please contact administrator.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Check if email is verified (optional based on your requirements)
    if (!req.user.isEmailVerified && process.env.REQUIRE_EMAIL_VERIFICATION === 'true') {
      return res.status(403).json({
        status: 'error',
        message: 'Email verification required. Please check your email.',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    next();
  } catch (error) {
    console.error('Account status validation error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error validating account status'
    });
  }
};

/**
 * Middleware to log user activity
 */
const logActivity = (action) => {
  return (req, res, next) => {
    // Store activity info in request for later logging
    req.activity = {
      action,
      userId: req.user?._id,
      userEmail: req.user?.email,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    };

    // Continue to next middleware
    next();

    // You can implement actual logging here or in a separate middleware
    // For now, just console.log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('User Activity:', req.activity);
    }
  };
};

module.exports = {
  authenticate,
  authorize,
  requireAdmin,
  requireManager,
  requireSalesAccess,
  optionalAuth,
  checkOwnership,
  validateAccountStatus,
  logActivity
};