import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    toast.error(message);
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const leadsAPI = {
  getAll: (params) => api.get('/leads', { params }),
  getById: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post('/leads', data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  delete: (id) => api.delete(`/leads/${id}`),
  convert: (id, data) => api.post(`/leads/${id}/convert`, data),
  getStats: (params) => api.get('/leads/stats', { params }),
  getRecent: (params) => api.get('/leads/recent', { params }),
  bulkUpdate: (data) => api.put('/leads/bulk-update', data),
  bulkDelete: (data) => api.delete('/leads/bulk-delete', data),
};

export const contactsAPI = {
  getAll: (params) => api.get('/contacts', { params }),
  getById: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
  getStats: (params) => api.get('/contacts/stats', { params }),
  getRecent: (params) => api.get('/contacts/recent', { params }),
  getByAccount: (accountId, params) => api.get(`/contacts/by-account/${accountId}`, { params }),
  bulkUpdate: (data) => api.put('/contacts/bulk-update', data),
  bulkDelete: (data) => api.delete('/contacts/bulk-delete', data),
};

export const accountsAPI = {
  getAll: (params) => api.get('/accounts', { params }),
  getById: (id) => api.get(`/accounts/${id}`),
  create: (data) => api.post('/accounts', data),
  update: (id, data) => api.put(`/accounts/${id}`, data),
  delete: (id) => api.delete(`/accounts/${id}`),
  getStats: (params) => api.get('/accounts/stats', { params }),
  getSummary: (id) => api.get(`/accounts/${id}/summary`),
  getHierarchy: (id) => api.get(`/accounts/${id}/hierarchy`),
  getRecent: (params) => api.get('/accounts/recent', { params }),
  search: (params) => api.get('/accounts/search', { params }),
  bulkUpdate: (data) => api.put('/accounts/bulk-update', data),
  bulkDelete: (data) => api.delete('/accounts/bulk-delete', data),
};

export const opportunitiesAPI = {
  getAll: (params) => api.get('/opportunities', { params }),
  getById: (id) => api.get(`/opportunities/${id}`),
  create: (data) => api.post('/opportunities', data),
  update: (id, data) => api.put(`/opportunities/${id}`, data),
  delete: (id) => api.delete(`/opportunities/${id}`),
  getStats: (params) => api.get('/opportunities/stats', { params }),
  getPipeline: (params) => api.get('/opportunities/pipeline', { params }),
  getForecast: (params) => api.get('/opportunities/forecast', { params }),
  getRecent: (params) => api.get('/opportunities/recent', { params }),
  bulkUpdate: (data) => api.put('/opportunities/bulk-update', data),
  bulkDelete: (data) => api.delete('/opportunities/bulk-delete', data),
};

export const activitiesAPI = {
  getAll: (params) => api.get('/activities', { params }),
  getById: (id) => api.get(`/activities/${id}`),
  create: (data) => api.post('/activities', data),
  update: (id, data) => api.put(`/activities/${id}`, data),
  delete: (id) => api.delete(`/activities/${id}`),
  complete: (id, data) => api.put(`/activities/${id}/complete`, data),
  getStats: (params) => api.get('/activities/stats', { params }),
  getUpcoming: (params) => api.get('/activities/upcoming', { params }),
  getOverdue: (params) => api.get('/activities/overdue', { params }),
  getRecent: (params) => api.get('/activities/recent', { params }),
};

export default api;