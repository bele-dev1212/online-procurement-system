// services/api/superAdminAPI.js
import api from './apiConfig';

export const superAdminAPI = {
  // Users Management
  getUsers: (filters = {}) => api.get('/api/super-admin/users', { params: filters }),
  updateUserStatus: (userId, data) => api.put(`/api/super-admin/users/${userId}/status`, data),
  
  // Organizations Management
  getOrganizations: (filters = {}) => api.get('/api/super-admin/organizations', { params: filters }),
  getOrganization: (id) => api.get(`/api/super-admin/organizations/${id}`),
  updateOrganizationStatus: (orgId, data) => api.put(`/api/super-admin/organizations/${orgId}/status`, data),
  deleteOrganization: (orgId) => api.delete(`/api/super-admin/organizations/${orgId}`),
  
  // Platform Statistics
  getPlatformStats: () => api.get('/api/super-admin/stats'),
  
  // Analytics
  getUserGrowth: (timeRange) => api.get(`/api/super-admin/analytics/user-growth?range=${timeRange}`),
  getRecentActivity: () => api.get('/api/super-admin/analytics/recent-activity'),
  getAnalytics: (period = 'monthly') => api.get(`/api/super-admin/analytics?period=${period}`),
  
  // Platform Configuration
  getPlatformConfig: () => api.get('/api/super-admin/config'),
  updatePlatformConfig: (config) => api.put('/api/super-admin/config', config),
  
  // Subscriptions & Billing
  getSubscriptions: () => api.get('/api/super-admin/subscriptions'),
  updateSubscription: (subId, data) => api.put(`/api/super-admin/subscriptions/${subId}`, data),
};

export default superAdminAPI;
