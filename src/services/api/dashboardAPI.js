import { tokenService } from '../auth/tokenService';

// Use relative URLs to leverage the proxy in package.json
const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : '/api';

const getAuthHeaders = () => {
  const token = tokenService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const dashboardAPI = {
  // Get dashboard data based on user role and time range
  getDashboardData: async (timeRange = 'monthly', role = null) => {
    try {
      const queryParams = new URLSearchParams({ timeRange });
      if (role) {
        queryParams.append('role', role);
      }

      const response = await fetch(`${API_BASE_URL}/dashboard?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get dashboard data API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get overview metrics
  getOverviewMetrics: async (timeRange = 'monthly') => {
    try {
      const queryParams = new URLSearchParams({ timeRange });
      const response = await fetch(`${API_BASE_URL}/dashboard/overview?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get overview metrics API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get recent activities
  getRecentActivities: async (limit = 10) => {
    try {
      const queryParams = new URLSearchParams({ limit: limit.toString() });
      const response = await fetch(`${API_BASE_URL}/dashboard/activities?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get recent activities API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get pending approvals
  getPendingApprovals: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/pending-approvals`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get pending approvals API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get stock alerts
  getStockAlerts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/stock-alerts`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get stock alerts API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get supplier performance
  getSupplierPerformance: async (limit = 5) => {
    try {
      const queryParams = new URLSearchParams({ limit: limit.toString() });
      const response = await fetch(`${API_BASE_URL}/dashboard/supplier-performance?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get supplier performance API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }
};

export default dashboardAPI;


