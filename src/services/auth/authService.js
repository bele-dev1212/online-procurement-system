// src/services/auth/authService.js
import apiClient from '../api/apiConfig';

const authService = {
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return {
        success: true,
        user: response.data.user,
        token: response.data.token,
        message: 'Login successful'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  },
  
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: true }; // Still clear local data even if API fails
    }
  },
  
  verifyToken: async () => {
    try {
      const response = await apiClient.get('/auth/verify');
      return {
        success: true,
        data: {
          user: response.data.user
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Token verification failed'
      };
    }
  }
};

export { authService };
