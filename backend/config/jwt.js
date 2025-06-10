// backend/config/jwt.js
const jwt = require('jsonwebtoken');

// JWT Configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET || 'fallback_secret_key_for_development_only',
  expiresIn: process.env.JWT_EXPIRE || '30d',
  issuer: 'crm-system',
  audience: 'crm-users'
};

/**
 * Generate JWT token
 * @param {Object} payload - The payload to encode in the token
 * @param {String} expiresIn - Token expiration time (optional)
 * @returns {String} - JWT token
 */
const generateToken = (payload, expiresIn = jwtConfig.expiresIn) => {
  try {
    const options = {
      expiresIn,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    };

    return jwt.sign(payload, jwtConfig.secret, options);
  } catch (error) {
    throw new Error('Error generating token: ' + error.message);
  }
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} - Decoded token payload
 */
const verifyToken = (token) => {
  try {
    const options = {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    };

    return jwt.verify(token, jwtConfig.secret, options);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Token not active');
    }
    throw new Error('Token verification failed: ' + error.message);
  }
};

/**
 * Generate refresh token
 * @param {Object} payload - The payload to encode in the refresh token
 * @returns {String} - Refresh token
 */
const generateRefreshToken = (payload) => {
  try {
    const options = {
      expiresIn: '7d', // Refresh tokens last longer
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience
    };

    return jwt.sign(payload, jwtConfig.secret, options);
  } catch (error) {
    throw new Error('Error generating refresh token: ' + error.message);
  }
};

/**
 * Decode token without verification (for getting user info from expired tokens)
 * @param {String} token - JWT token to decode
 * @returns {Object} - Decoded token payload
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    throw new Error('Error decoding token: ' + error.message);
  }
};

/**
 * Check if token is expired
 * @param {String} token - JWT token to check
 * @returns {Boolean} - True if expired, false otherwise
 */
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Extract token from Authorization header
 * @param {String} authHeader - Authorization header value
 * @returns {String|null} - Extracted token or null
 */
const extractTokenFromHeader = (authHeader) => {
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }
  return null;
};

/**
 * Get token expiration time
 * @param {String} token - JWT token
 * @returns {Date|null} - Expiration date or null
 */
const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch (error) {
    return null;
  }
};

module.exports = {
  jwtConfig,
  generateToken,
  verifyToken,
  generateRefreshToken,
  decodeToken,
  isTokenExpired,
  extractTokenFromHeader,
  getTokenExpiration
};