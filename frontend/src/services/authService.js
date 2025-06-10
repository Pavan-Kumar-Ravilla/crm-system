// src/services/authService.js
import { authAPI } from './api';

class AuthService {
  constructor() {
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  /**
   * Process queue of failed requests after token refresh
   */
  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  /**
   * Login user with email and password
   */
  async login(credentials) {
    try {
      const response = await authAPI.login(credentials);
      
      if (response.token && response.refreshToken) {
        this.setTokens(response.token, response.refreshToken);
      }
      
      return response;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Register new user
   */
  async register(userData) {
    try {
      const response = await authAPI.register(userData);
      
      if (response.token && response.refreshToken) {
        this.setTokens(response.token, response.refreshToken);
      }
      
      return response;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Logout user
   */
  async logout(refreshToken = null) {
    try {