import { apiClient } from './apiClient';

export const leadService = {
  async getLeads(params = {}) {
    const response = await apiClient.get('/leads', { params });
    return response.data;
  },

  async getLead(id) {
    const response = await apiClient.get(`/leads/${id}`);
    return response.data;
  },

  async createLead(data) {
    const response = await apiClient.post('/leads', data);
    return response.data;
  },

  async updateLead(id, data) {
    const response = await apiClient.put(`/leads/${id}`, data);
    return response.data;
  },

  async deleteLead(id) {
    const response = await apiClient.delete(`/leads/${id}`);
    return response.data;
  },

  async convertLead(id, conversionData) {
    const response = await apiClient.post(`/leads/${id}/convert`, conversionData);
    return response.data;
  },

  async getLeadStats(params = {}) {
    const response = await apiClient.get('/leads/stats', { params });
    return response.data;
  },

  async bulkUpdateLeads(leadIds, updates) {
    const response = await apiClient.put('/leads/bulk-update', { leadIds, updates });
    return response.data;
  },

  async bulkDeleteLeads(leadIds) {
    const response = await apiClient.delete('/leads/bulk-delete', { data: { leadIds } });
    return response.data;
  }
};