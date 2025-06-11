import { apiClient } from './apiClient';

export const opportunityService = {
  async getOpportunities(params = {}) {
    const response = await apiClient.get('/opportunities', { params });
    return response.data;
  },

  async getOpportunity(id) {
    const response = await apiClient.get(`/opportunities/${id}`);
    return response.data;
  },

  async createOpportunity(data) {
    const response = await apiClient.post('/opportunities', data);
    return response.data;
  },

  async updateOpportunity(id, data) {
    const response = await apiClient.put(`/opportunities/${id}`, data);
    return response.data;
  },

  async deleteOpportunity(id) {
    const response = await apiClient.delete(`/opportunities/${id}`);
    return response.data;
  },

  async getOpportunityStats(params = {}) {
    const response = await apiClient.get('/opportunities/stats', { params });
    return response.data;
  },

  async getPipelineData(params = {}) {
    const response = await apiClient.get('/opportunities/pipeline', { params });
    return response.data;
  },

  async getForecastData(params = {}) {
    const response = await apiClient.get('/opportunities/forecast', { params });
    return response.data;
  }
};