// src/services/authService.js
import { authAPI } from './api';

export const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await authAPI.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async (refreshToken) => {
    try {
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw error for logout - we still want to clear local data
    }
  },

  // Logout from all devices
  logoutAll: async () => {
    try {
      await authAPI.logoutAll();
    } catch (error) {
      console.error('Logout all error:', error);
      // Don't throw error for logout - we still want to clear local data
    }
  },

  // Refresh authentication token
  refreshToken: async (refreshToken) => {
    try {
      const response = await authAPI.refreshToken(refreshToken);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get current user profile
  getMe: async () => {
    try {
      const response = await authAPI.getMe();
      return response.user;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (updates) => {
    try {
      const response = await authAPI.updateProfile(updates);
      return response.user;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await authAPI.changePassword(passwordData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      await authAPI.forgotPassword(email);
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, password) => {
    try {
      const response = await authAPI.resetPassword(token, password);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Verify email
  verifyEmail: async (token) => {
    try {
      await authAPI.verifyEmail(token);
    } catch (error) {
      throw error;
    }
  },

  // Resend verification email
  resendVerification: async () => {
    try {
      await authAPI.resendVerification();
    } catch (error) {
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Get stored refresh token
  getRefreshToken: () => {
    return localStorage.getItem('refreshToken');
  },

  // Clear stored tokens
  clearTokens: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
};

export default authService;