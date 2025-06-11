import { apiClient } from './apiClient';

export const activityService = {
  async getActivities(params = {}) {
    const response = await apiClient.get('/activities', { params });
    return response.data;
  },

  async getActivity(id) {
    const response = await apiClient.get(`/activities/${id}`);
    return response.data;
  },

  async createActivity(data) {
    const response = await apiClient.post('/activities', data);
    return response.data;
  },

  async updateActivity(id, data) {
    const response = await apiClient.put(`/activities/${id}`, data);
    return response.data;
  },

  async deleteActivity(id) {
    const response = await apiClient.delete(`/activities/${id}`);
    return response.data;
  },

  async completeActivity(id, outcome, nextSteps) {
    const response = await apiClient.put(`/activities/${id}/complete`, { outcome, nextSteps });
    return response.data;
  },

  async getActivityStats(params = {}) {
    const response = await apiClient.get('/activities/stats', { params });
    return response.data;
  },

  async getUpcomingActivities(params = {}) {
    const response = await apiClient.get('/activities/upcoming', { params });
    return response.data;
  },

  async getOverdueActivities(params = {}) {
    const response = await apiClient.get('/activities/overdue', { params });
    return response.data;
  }
};