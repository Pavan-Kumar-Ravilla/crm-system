// src/services/api.js
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error status is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
            { refreshToken }
          );

          const { token, refreshToken: newRefreshToken } = response.data.data;
          
          // Update stored tokens
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          // Update the authorization header and retry the original request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to handle API responses
const handleResponse = (response) => {
  return response.data.data || response.data;
};

// Helper function to handle API errors
const handleError = (error) => {
  if (error.response) {
    // Server responded with error status
    const errorMessage = error.response.data?.message || 'An error occurred';
    const errorCode = error.response.data?.code;
    
    throw {
      message: errorMessage,
      code: errorCode,
      status: error.response.status,
      data: error.response.data
    };
  } else if (error.request) {
    // Request was made but no response received
    throw {
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR'
    };
  } else {
    // Something else happened
    throw {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR'
    };
  }
};

// Generic API methods
const apiMethods = {
  // GET request
  get: async (url, params = {}) => {
    try {
      const response = await api.get(url, { params });
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  // POST request
  post: async (url, data = {}) => {
    try {
      const response = await api.post(url, data);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  // PUT request
  put: async (url, data = {}) => {
    try {
      const response = await api.put(url, data);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  // DELETE request
  delete: async (url) => {
    try {
      const response = await api.delete(url);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  },

  // PATCH request
  patch: async (url, data = {}) => {
    try {
      const response = await api.patch(url, data);
      return handleResponse(response);
    } catch (error) {
      handleError(error);
    }
  }
};

// Authentication API
export const authAPI = {
  login: (credentials) => apiMethods.post('/auth/login', credentials),
  register: (userData) => apiMethods.post('/auth/register', userData),
  logout: (refreshToken) => apiMethods.post('/auth/logout', { refreshToken }),
  logoutAll: () => apiMethods.post('/auth/logout-all'),
  refreshToken: (refreshToken) => apiMethods.post('/auth/refresh-token', { refreshToken }),
  getMe: () => apiMethods.get('/auth/me'),
  updateProfile: (updates) => apiMethods.put('/auth/me', updates),
  changePassword: (passwordData) => apiMethods.put('/auth/change-password', passwordData),
  forgotPassword: (email) => apiMethods.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => apiMethods.put(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token) => apiMethods.get(`/auth/verify-email/${token}`),
  resendVerification: () => apiMethods.post('/auth/resend-verification')
};

// Leads API
export const leadsAPI = {
  getAll: (params) => apiMethods.get('/leads', params),
  getById: (id) => apiMethods.get(`/leads/${id}`),
  create: (leadData) => apiMethods.post('/leads', leadData),
  update: (id, leadData) => apiMethods.put(`/leads/${id}`, leadData),
  delete: (id) => apiMethods.delete(`/leads/${id}`),
  convert: (id, conversionData) => apiMethods.post(`/leads/${id}/convert`, conversionData),
  getStats: (params) => apiMethods.get('/leads/stats', params),
  getRecent: (params) => apiMethods.get('/leads/recent', params),
  bulkUpdate: (leadIds, updates) => apiMethods.put('/leads/bulk-update', { leadIds, updates }),
  bulkDelete: (leadIds) => apiMethods.delete('/leads/bulk-delete', { leadIds }),
  search: (query) => apiMethods.get('/leads/search', { q: query })
};

// Contacts API
export const contactsAPI = {
  getAll: (params) => apiMethods.get('/contacts', params),
  getById: (id) => apiMethods.get(`/contacts/${id}`),
  create: (contactData) => apiMethods.post('/contacts', contactData),
  update: (id, contactData) => apiMethods.put(`/contacts/${id}`, contactData),
  delete: (id) => apiMethods.delete(`/contacts/${id}`),
  getStats: (params) => apiMethods.get('/contacts/stats', params),
  getRecent: (params) => apiMethods.get('/contacts/recent', params),
  getByAccount: (accountId, params) => apiMethods.get(`/contacts/by-account/${accountId}`, params),
  getHierarchy: (accountId) => apiMethods.get(`/contacts/hierarchy/${accountId}`),
  bulkUpdate: (contactIds, updates) => apiMethods.put('/contacts/bulk-update', { contactIds, updates }),
  bulkDelete: (contactIds) => apiMethods.delete('/contacts/bulk-delete', { contactIds }),
  search: (query) => apiMethods.get('/contacts/search', { q: query })
};

// Accounts API
export const accountsAPI = {
  getAll: (params) => apiMethods.get('/accounts', params),
  getById: (id) => apiMethods.get(`/accounts/${id}`),
  create: (accountData) => apiMethods.post('/accounts', accountData),
  update: (id, accountData) => apiMethods.put(`/accounts/${id}`, accountData),
  delete: (id) => apiMethods.delete(`/accounts/${id}`),
  getStats: (params) => apiMethods.get('/accounts/stats', params),
  getSummary: (id) => apiMethods.get(`/accounts/${id}/summary`),
  getHierarchy: (id) => apiMethods.get(`/accounts/${id}/hierarchy`),
  getRecent: (params) => apiMethods.get('/accounts/recent', params),
  bulkUpdate: (accountIds, updates) => apiMethods.put('/accounts/bulk-update', { accountIds, updates }),
  bulkDelete: (accountIds) => apiMethods.delete('/accounts/bulk-delete', { accountIds }),
  search: (query) => apiMethods.get('/accounts/search', { q: query })
};

// Opportunities API
export const opportunitiesAPI = {
  getAll: (params) => apiMethods.get('/opportunities', params),
  getById: (id) => apiMethods.get(`/opportunities/${id}`),
  create: (opportunityData) => apiMethods.post('/opportunities', opportunityData),
  update: (id, opportunityData) => apiMethods.put(`/opportunities/${id}`, opportunityData),
  delete: (id) => apiMethods.delete(`/opportunities/${id}`),
  getStats: (params) => apiMethods.get('/opportunities/stats', params),
  getPipeline: (params) => apiMethods.get('/opportunities/pipeline', params),
  getForecast: (params) => apiMethods.get('/opportunities/forecast', params),
  getRecent: (params) => apiMethods.get('/opportunities/recent', params),
  getByAccount: (accountId, params) => apiMethods.get(`/opportunities/by-account/${accountId}`, params),
  advanceStage: (id) => apiMethods.post(`/opportunities/${id}/advance-stage`),
  addProduct: (id, productData) => apiMethods.post(`/opportunities/${id}/products`, productData),
  removeProduct: (id, productId) => apiMethods.delete(`/opportunities/${id}/products/${productId}`),
  addDecisionMaker: (id, decisionMakerData) => apiMethods.post(`/opportunities/${id}/decision-makers`, decisionMakerData),
  removeDecisionMaker: (id, decisionMakerId) => apiMethods.delete(`/opportunities/${id}/decision-makers/${decisionMakerId}`),
  bulkUpdate: (opportunityIds, updates) => apiMethods.put('/opportunities/bulk-update', { opportunityIds, updates }),
  bulkDelete: (opportunityIds) => apiMethods.delete('/opportunities/bulk-delete', { opportunityIds }),
  search: (query) => apiMethods.get('/opportunities/search', { q: query })
};

// Activities API
export const activitiesAPI = {
  getAll: (params) => apiMethods.get('/activities', params),
  getById: (id) => apiMethods.get(`/activities/${id}`),
  create: (activityData) => apiMethods.post('/activities', activityData),
  update: (id, activityData) => apiMethods.put(`/activities/${id}`, activityData),
  delete: (id) => apiMethods.delete(`/activities/${id}`),
  getStats: (params) => apiMethods.get('/activities/stats', params),
  getUpcoming: (params) => apiMethods.get('/activities/upcoming', params),
  getOverdue: (params) => apiMethods.get('/activities/overdue', params),
  getRecent: (params) => apiMethods.get('/activities/recent', params),
  getByLead: (leadId, params) => apiMethods.get(`/activities/by-lead/${leadId}`, params),
  getByContact: (contactId, params) => apiMethods.get(`/activities/by-contact/${contactId}`, params),
  getByAccount: (accountId, params) => apiMethods.get(`/activities/by-account/${accountId}`, params),
  getByOpportunity: (opportunityId, params) => apiMethods.get(`/activities/by-opportunity/${opportunityId}`, params),
  markCompleted: (id, outcome, nextSteps) => apiMethods.post(`/activities/${id}/complete`, { outcome, nextSteps }),
  createFollowUp: (id, followUpData) => apiMethods.post(`/activities/${id}/follow-up`, followUpData),
  addAttendee: (id, attendeeData) => apiMethods.post(`/activities/${id}/attendees`, attendeeData),
  updateAttendeeResponse: (id, attendeeId, response) => apiMethods.put(`/activities/${id}/attendees/${attendeeId}`, { responseStatus: response }),
  bulkUpdate: (activityIds, updates) => apiMethods.put('/activities/bulk-update', { activityIds, updates }),
  bulkDelete: (activityIds) => apiMethods.delete('/activities/bulk-delete', { activityIds }),
  search: (query) => apiMethods.get('/activities/search', { q: query })
};

// Dashboard API
export const dashboardAPI = {
  getOverview: (params) => apiMethods.get('/dashboard/overview', params),
  getRecentActivity: (params) => apiMethods.get('/dashboard/recent-activity', params),
  getTopAccounts: (params) => apiMethods.get('/dashboard/top-accounts', params),
  getTopOpportunities: (params) => apiMethods.get('/dashboard/top-opportunities', params),
  getSalesMetrics: (params) => apiMethods.get('/dashboard/sales-metrics', params),
  getActivityMetrics: (params) => apiMethods.get('/dashboard/activity-metrics', params)
};

// Users API (for admin functions)
export const usersAPI = {
  getAll: (params) => apiMethods.get('/users', params),
  getById: (id) => apiMethods.get(`/users/${id}`),
  create: (userData) => apiMethods.post('/users', userData),
  update: (id, userData) => apiMethods.put(`/users/${id}`, userData),
  delete: (id) => apiMethods.delete(`/users/${id}`),
  activate: (id) => apiMethods.post(`/users/${id}/activate`),
  deactivate: (id) => apiMethods.post(`/users/${id}/deactivate`),
  resetPassword: (id) => apiMethods.post(`/users/${id}/reset-password`)
};

// Export the axios instance for custom requests
export default api;