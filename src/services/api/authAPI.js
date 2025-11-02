import { tokenService } from '../auth/tokenService';

// Use relative URLs to leverage the proxy in package.json
// The proxy forwards /api/* requests to http://localhost:5000/api/*
// For production, use absolute URLs from API_CONFIG
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Will be set from API_CONFIG if needed
  : '/api'; // Use /api prefix to leverage proxy in development

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const getAuthHeaders = () => {
  const token = tokenService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const authAPI = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await handleResponse(response);
      
      if (data.success) {
        tokenService.setToken(data.data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Login API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Register API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get current user API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Verify token
  verifyToken: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Verify token API error:', error);
      throw error;
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const refreshToken = tokenService.getRefreshToken();
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await handleResponse(response);
      
      if (data.success) {
        tokenService.setToken(data.data.token);
      }
      
      return data;
    } catch (error) {
      console.error('Refresh token API error:', error);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      tokenService.removeToken();
      return await handleResponse(response);
    } catch (error) {
      console.error('Logout API error:', error);
      tokenService.removeToken();
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Update profile API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(passwordData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Change password API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Forgot password API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Reset password
  resetPassword: async (resetData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resetData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Reset password API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get user permissions
  getUserPermissions: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/permissions`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get permissions API error:', error);
      throw error;
    }
  },

  // Get user activity log
  getUserActivity: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/auth/activity?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get user activity API error:', error);
      throw error;
    }
  }
};

export default authAPI;