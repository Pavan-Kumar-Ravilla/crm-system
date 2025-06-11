import { apiClient } from './apiClient';

export const authService = {
  async login(credentials) {
    return apiClient.post('/auth/login', credentials);
  },

  async register(userData) {
    return apiClient.post('/auth/register', userData);
  },

  async logout() {
    return apiClient.post('/auth/logout');
  },

  async getMe() {
    return apiClient.get('/auth/me');
  },

  async updateProfile(profileData) {
    return apiClient.put('/auth/me', profileData);
  },

  async changePassword(passwordData) {
    return apiClient.put('/auth/change-password', passwordData);
  },

  async forgotPassword(email) {
    return apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token, password) {
    return apiClient.put(`/auth/reset-password/${token}`, { password });
  },

  async refreshToken(refreshToken) {
    return apiClient.post('/auth/refresh-token', { refreshToken });
  }
};
