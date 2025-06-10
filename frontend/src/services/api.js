import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    
    if (status === 401) {
      // Unauthorized - clear auth data and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    if (status === 403) {
      toast.error('Access denied. You do not have permission to perform this action.');
    } else if (status === 404) {
      toast.error('Resource not found.');
    } else if (status === 422) {
      // Validation errors
      const validationErrors = error.response?.data?.errors;
      if (validationErrors && Array.isArray(validationErrors)) {
        validationErrors.forEach(err => toast.error(err.message));
      } else {
        toast.error(error.response?.data?.message || 'Validation failed');
      }
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection and try again.');
    } else if (error.message === 'Network Error') {
      toast.error('Network error. Please check your connection.');
    } else {
      const message = error.response?.data?.message || error.message || 'Something went wrong';
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Leads API
export const leadsAPI = {
  getAll: (params = {}) => api.get('/leads', { params }),
  getById: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post('/leads', data),
  update: ({ id, data }) => api.put(`/leads/${id}`, data),
  delete: (id) => api.delete(`/leads/${id}`),
  convert: ({ id, data }) => api.post(`/leads/${id}/convert`, data),
  getStats: (params = {}) => api.get('/leads/stats', { params }),
  getRecent: (params = {}) => api.get('/leads/recent', { params }),
  bulkUpdate: (data) => api.put('/leads/bulk-update', data),
  bulkDelete: (data) => api.post('/leads/bulk-delete', data),
  search: (params = {}) => api.get('/leads/search', { params }),
  export: (params = {}) => api.get('/leads/export', { params, responseType: 'blob' }),
};

// Contacts API
export const contactsAPI = {
  getAll: (params = {}) => api.get('/contacts', { params }),
  getById: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: ({ id, data }) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
  getStats: (params = {}) => api.get('/contacts/stats', { params }),
  getRecent: (params = {}) => api.get('/contacts/recent', { params }),
  getByAccount: (accountId, params = {}) => api.get(`/contacts/by-account/${accountId}`, { params }),
  bulkUpdate: (data) => api.put('/contacts/bulk-update', data),
  bulkDelete: (data) => api.post('/contacts/bulk-delete', data),
  search: (params = {}) => api.get('/contacts/search', { params }),
  export: (params = {}) => api.get('/contacts/export', { params, responseType: 'blob' }),
};

// Accounts API
export const accountsAPI = {
  getAll: (params = {}) => api.get('/accounts', { params }),
  getById: (id) => api.get(`/accounts/${id}`),
  create: (data) => api.post('/accounts', data),
  update: ({ id, data }) => api.put(`/accounts/${id}`, data),
  delete: (id) => api.delete(`/accounts/${id}`),
  getStats: (params = {}) => api.get('/accounts/stats', { params }),
  getSummary: (id) => api.get(`/accounts/${id}/summary`),
  getHierarchy: (id) => api.get(`/accounts/${id}/hierarchy`),
  getRecent: (params = {}) => api.get('/accounts/recent', { params }),
  search: (params = {}) => api.get('/accounts/search', { params }),
  bulkUpdate: (data) => api.put('/accounts/bulk-update', data),
  bulkDelete: (data) => api.post('/accounts/bulk-delete', data),
  export: (params = {}) => api.get('/accounts/export', { params, responseType: 'blob' }),
};

// Opportunities API
export const opportunitiesAPI = {
  getAll: (params = {}) => api.get('/opportunities', { params }),
  getById: (id) => api.get(`/opportunities/${id}`),
  create: (data) => api.post('/opportunities', data),
  update: ({ id, data }) => api.put(`/opportunities/${id}`, data),
  delete: (id) => api.delete(`/opportunities/${id}`),
  getStats: (params = {}) => api.get('/opportunities/stats', { params }),
  getPipeline: (params = {}) => api.get('/opportunities/pipeline', { params }),
  getForecast: (params = {}) => api.get('/opportunities/forecast', { params }),
  getRecent: (params = {}) => api.get('/opportunities/recent', { params }),
  bulkUpdate: (data) => api.put('/opportunities/bulk-update', data),
  bulkDelete: (data) => api.post('/opportunities/bulk-delete', data),
  search: (params = {}) => api.get('/opportunities/search', { params }),
  export: (params = {}) => api.get('/opportunities/export', { params, responseType: 'blob' }),
};

// Activities API
export const activitiesAPI = {
  getAll: (params = {}) => api.get('/activities', { params }),
  getById: (id) => api.get(`/activities/${id}`),
  create: (data) => api.post('/activities', data),
  update: ({ id, data }) => api.put(`/activities/${id}`, data),
  delete: (id) => api.delete(`/activities/${id}`),
  complete: ({ id, data }) => api.put(`/activities/${id}/complete`, data),
  getStats: (params = {}) => api.get('/activities/stats', { params }),
  getUpcoming: (params = {}) => api.get('/activities/upcoming', { params }),
  getOverdue: (params = {}) => api.get('/activities/overdue', { params }),
  getRecent: (params = {}) => api.get('/activities/recent', { params }),
  search: (params = {}) => api.get('/activities/search', { params }),
  export: (params = {}) => api.get('/activities/export', { params, responseType: 'blob' }),
};

// Reports API
export const reportsAPI = {
  getAll: (params = {}) => api.get('/reports', { params }),
  getById: (id) => api.get(`/reports/${id}`),
  create: (data) => api.post('/reports', data),
  update: ({ id, data }) => api.put(`/reports/${id}`, data),
  delete: (id) => api.delete(`/reports/${id}`),
  run: (id, params = {}) => api.post(`/reports/${id}/run`, params),
  schedule: ({ id, data }) => api.post(`/reports/${id}/schedule`, data),
  getScheduled: (params = {}) => api.get('/reports/scheduled', { params }),
};

// Dashboard API
export const dashboardAPI = {
  getOverview: (params = {}) => api.get('/dashboard/overview', { params }),
  getSalesMetrics: (params = {}) => api.get('/dashboard/sales-metrics', { params }),
  getRecentActivity: (params = {}) => api.get('/dashboard/recent-activity', { params }),
  getNotifications: (params = {}) => api.get('/dashboard/notifications', { params }),
  markNotificationRead: (id) => api.put(`/dashboard/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/dashboard/notifications/mark-all-read'),
};

// Search API
export const searchAPI = {
  global: (query, params = {}) => api.get('/search/global', { params: { q: query, ...params } }),
  suggestions: (query) => api.get('/search/suggestions', { params: { q: query } }),
  recent: () => api.get('/search/recent'),
  saveSearch: (data) => api.post('/search/save', data),
  getSavedSearches: () => api.get('/search/saved'),
  deleteSavedSearch: (id) => api.delete(`/search/saved/${id}`),
};

// Settings API
export const settingsAPI = {
  getProfile: () => api.get('/settings/profile'),
  updateProfile: (data) => api.put('/settings/profile', data),
  getPreferences: () => api.get('/settings/preferences'),
  updatePreferences: (data) => api.put('/settings/preferences', data),
  getTeam: () => api.get('/settings/team'),
  inviteUser: (data) => api.post('/settings/team/invite', data),
  updateUserRole: ({ userId, role }) => api.put(`/settings/team/${userId}/role`, { role }),
  removeUser: (userId) => api.delete(`/settings/team/${userId}`),
  getIntegrations: () => api.get('/settings/integrations'),
  updateIntegration: ({ id, data }) => api.put(`/settings/integrations/${id}`, data),
};

export default api;