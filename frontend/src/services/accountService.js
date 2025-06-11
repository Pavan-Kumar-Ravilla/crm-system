import { apiClient } from './apiClient';

export const accountService = {
  async getAccounts(params = {}) {
    const response = await apiClient.get('/accounts', { params });
    return response.data;
  },

  async getAccount(id) {
    const response = await apiClient.get(`/accounts/${id}`);
    return response.data;
  },

  async createAccount(data) {
    const response = await apiClient.post('/accounts', data);
    return response.data;
  },

  async updateAccount(id, data) {
    const response = await apiClient.put(`/accounts/${id}`, data);
    return response.data;
  },

  async deleteAccount(id) {
    const response = await apiClient.delete(`/accounts/${id}`);
    return response.data;
  },

  async getAccountStats(params = {}) {
    const response = await apiClient.get('/accounts/stats', { params });
    return response.data;
  },

  async getAccountSummary(id) {
    const response = await apiClient.get(`/accounts/${id}/summary`);
    return response.data;
  }
};
