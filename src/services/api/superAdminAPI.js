import { apiClient } from './apiConfig';

export const superAdminAPI = {
  // User Management
  getUsers: (filters = {}) => 
    apiClient.get('/api/super-admin/users', { params: filters }),
  
  updateUserStatus: (userId, data) => 
    apiClient.patch(`/api/super-admin/users/${userId}/status`, data),

  // Organization Management
  getOrganizations: (filters = {}) => 
    apiClient.get('/api/super-admin/organizations', { params: filters }),
  
  updateOrganizationStatus: (orgId, data) => 
    apiClient.patch(`/api/super-admin/organizations/${orgId}/status`, data),

  // Platform Analytics
  getPlatformStats: () => 
    apiClient.get('/api/super-admin/analytics/platform-stats'),

  // System Configuration
  getPlatformConfig: () => 
    apiClient.get('/api/super-admin/config'),
  
  updatePlatformConfig: (config) => 
    apiClient.put('/api/super-admin/config', { configs: config })
};