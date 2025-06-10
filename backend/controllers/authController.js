// backend/controllers/authController.js
const User = require('../models/User');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { verifyToken } = require('../config/jwt');
const crypto = require('crypto');

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, role, phone, department, title } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400, 'USER_EXISTS'));
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
    role: role || 'user',
    phone,
    department,
    title
  });

  // Generate tokens
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();
  
  // Save refresh token
  await user.save();

  // Remove password from output
  user.password = undefined;

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      user,
      token,
      refreshToken
    }
  });
});

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400, 'MISSING_CREDENTIALS'));
  }

  try {
    // Find user and validate credentials
    const user = await User.findByCredentials(email, password);
    
    // Generate tokens
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    
    // Save refresh token
    await user.save();

    // Remove password from output
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user,
        token,
        refreshToken
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 401, 'LOGIN_FAILED'));
  }
});

/**
 * Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
const logout = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Remove specific refresh token
    await User.updateOne(
      { _id: req.user._id },
      { $pull: { refreshTokens: { token: refreshToken } } }
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Logout successful'
  });
});

/**
 * Logout from all devices
 * @route POST /api/auth/logout-all
 * @access Private
 */
const logoutAll = asyncHandler(async (req, res, next) => {
  // Remove all refresh tokens
  await User.updateOne(
    { _id: req.user._id },
    { $set: { refreshTokens: [] } }
  );

  res.status(200).json({
    status: 'success',
    message: 'Logged out from all devices successfully'
  });
});

/**
 * Refresh access token
 * @route POST /api/auth/refresh-token
 * @access Public
 */
const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400, 'MISSING_REFRESH_TOKEN'));
  }

  try {
    // Verify refresh token
    const decoded = verifyToken(refreshToken);
    
    if (decoded.type !== 'refresh') {
      return next(new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN'));
    }

    // Find user and check if refresh token exists
    const user = await User.findOne({
      _id: decoded.id,
      'refreshTokens.token': refreshToken
    });

    if (!user) {
      return next(new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN'));
    }

    // Generate new tokens
    const newToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();

    // Remove old refresh token and save new one
    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    return next(new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN'));
  }
});

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
const getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

/**
 * Update current user profile
 * @route PUT /api/auth/me
 * @access Private
 */
const updateMe = asyncHandler(async (req, res, next) => {
  const { password, role, ...allowedUpdates } = req.body;

  // Don't allow password and role updates through this endpoint
  if (password) {
    return next(new AppError('Use /change-password endpoint to update password', 400, 'INVALID_UPDATE'));
  }

  if (role && req.user.role !== 'admin') {
    return next(new AppError('Only admins can update user roles', 403, 'FORBIDDEN'));
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    allowedUpdates,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      user: updatedUser
    }
  });
});

/**
 * Change password
 * @route PUT /api/auth/change-password
 * @access Private
 */
const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current and new password', 400, 'MISSING_PASSWORDS'));
  }

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isCurrentPasswordCorrect = await user.matchPassword(currentPassword);
  if (!isCurrentPasswordCorrect) {
    return next(new AppError('Current password is incorrect', 400, 'INCORRECT_PASSWORD'));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Generate new tokens (invalidate old ones)
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  // Clear all old refresh tokens
  user.refreshTokens = [user.refreshTokens[user.refreshTokens.length - 1]];
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully',
    data: {
      token,
      refreshToken
    }
  });
});

/**
 * Forgot password
 * @route POST /api/auth/forgot-password
 * @access Public
 */
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide email address', 400, 'MISSING_EMAIL'));
  }

  // Find user by email
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return next(new AppError('No user found with that email address', 404, 'USER_NOT_FOUND'));
  }

  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save();

  try {
    // TODO: Send email with reset token
    // For now, just return success (in production, send actual email)
    
    res.status(200).json({
      status: 'success',
      message: 'Password reset token sent to email',
      // Remove this in production - only for development
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return next(new AppError('Error sending email. Please try again later.', 500, 'EMAIL_SEND_ERROR'));
  }
});

/**
 * Reset password
 * @route PUT /api/auth/reset-password/:token
 * @access Public
 */
const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return next(new AppError('Please provide new password', 400, 'MISSING_PASSWORD'));
  }

  // Hash the token and find user
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400, 'INVALID_RESET_TOKEN'));
  }

  // Set new password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Generate new tokens
  const authToken = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password reset successful',
    data: {
      token: authToken,
      refreshToken
    }
  });
});

/**
 * Verify email
 * @route GET /api/auth/verify-email/:token
 * @access Public
 */
const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  // Find user with verification token
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Invalid or expired verification token', 400, 'INVALID_VERIFICATION_TOKEN'));
  }

  // Verify email
  await user.verifyEmail();

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully'
  });
});

/**
 * Resend email verification
 * @route POST /api/auth/resend-verification
 * @access Private
 */
const resendVerification = asyncHandler(async (req, res, next) => {
  const user = req.user;

  if (user.isEmailVerified) {
    return next(new AppError('Email is already verified', 400, 'EMAIL_ALREADY_VERIFIED'));
  }

  // Generate new verification token
  user.emailVerificationToken = crypto.randomBytes(20).toString('hex');
  user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  await user.save();

  try {
    // TODO: Send verification email
    // For now, just return success
    
    res.status(200).json({
      status: 'success',
      message: 'Verification email sent',
      // Remove this in production
      ...(process.env.NODE_ENV === 'development' && { 
        token: user.emailVerificationToken 
      })
    });
  } catch (error) {
    return next(new AppError('Error sending verification email', 500, 'EMAIL_SEND_ERROR'));
  }
});

module.exports = {
  register,
  login,
  logout,
  logoutAll,
  refreshToken,
  getMe,
  updateMe,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification
};