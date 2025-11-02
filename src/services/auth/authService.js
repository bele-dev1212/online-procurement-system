// src/services/auth/authService.js
import { tokenService } from './tokenService';

class AuthService {
  constructor() {
    this.isRefreshing = false;
    this.failedQueue = [];
    
    // Force real API - no mock data
    this.useMockData = false;
    console.log('🔐 AuthService initialized - Using REAL API');
  }

  // Login user with REAL API only
  login = async (credentials) => {
    try {
      console.log('🔐 AuthService - REAL API Login attempt for:', credentials.email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      
      console.log('🔐 AuthService - Login response:', {
        status: response.status,
        success: data.success,
        message: data.message
      });

      if (!response.ok) {
        throw new Error(data.message || `Login failed with status ${response.status}`);
      }

      if (data.success) {
        const { user, token } = data.data;
        
        // Transform MongoDB _id to id for frontend compatibility
        const transformedUser = {
          ...user,
          id: user._id ? user._id.toString() : user.id,
          isSuperAdmin: user.isSuperAdmin || user.role === 'super_admin'
        };
        
        // ✅ COMPATIBLE: Use tokenService methods
        tokenService.setToken(token);
        tokenService.setUserInfo(transformedUser);
        
        // Set last activity timestamp
        this.setLastActivity();
        
        console.log('🔐 AuthService - Login successful, user stored:', transformedUser.email);
        
        return {
          success: true,
          user: transformedUser,
          message: data.message
        };
      } else {
        console.log('🔐 AuthService - Login failed:', data.message);
        return {
          success: false,
          message: data.message,
          user: null
        };
      }

    } catch (error) {
      console.error('🔐 AuthService - Login error:', error);
      
      return {
        success: false,
        message: error.message || 'Login failed. Please try again.',
        user: null
      };
    }
  };

  // Verify token with REAL API
  verifyToken = async () => {
    try {
      // ✅ COMPATIBLE: Use tokenService methods
      if (!tokenService.isAuthenticated()) {
        return {
          success: false,
          message: 'No valid token found',
          data: null
        };
      }

      const token = tokenService.getToken();
      
      // Verify token with backend
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Update stored user data if needed
        if (data.data.user) {
          tokenService.setUserInfo(data.data.user);
        }
        
        // Update last activity
        this.setLastActivity();
        
        console.log('🔐 AuthService - Token verification successful');
        return data;
      } else {
        tokenService.clearAllAuthData();
        return {
          success: false,
          message: data.message || 'Token verification failed',
          data: null
        };
      }

    } catch (error) {
      console.error('AuthService - Verify token error:', error);
      
      tokenService.clearAllAuthData();
      return {
        success: false,
        message: error.message || 'Token verification failed',
        data: null
      };
    }
  };

  // Logout user
  logout = async () => {
    try {
      const token = tokenService.getToken();
      
      if (token) {
        // Call logout API to invalidate token on server
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('AuthService - Logout API error:', error);
      // Continue with client-side logout even if API call fails
    } finally {
      // ✅ COMPATIBLE: Use tokenService methods
      tokenService.clearAllAuthData();
      console.log('🔐 Logout completed - all auth data cleared');
    }
  };

  // Register new user
  register = async (userData) => {
    try {
      const response = await fetch('/api/organizations/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Registration failed with status ${response.status}`);
      }

      if (data.success) {
        return {
          success: true,
          message: data.message,
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.message,
          data: null
        };
      }
    } catch (error) {
      console.error('AuthService - Register error:', error);
      return {
        success: false,
        message: error.message || 'Registration failed. Please try again.',
        data: null
      };
    }
  };

  // ✅ COMPATIBLE: Get current user from tokenService
  getCurrentUser = () => {
    return tokenService.getUserInfo();
  };

  // ✅ COMPATIBLE: Get user permissions from tokenService
  getPermissions = () => {
    const user = this.getCurrentUser();
    return user?.permissions || [];
  };

  // ✅ COMPATIBLE: Check if user has specific permission
  hasPermission = (permission) => {
    const permissions = this.getPermissions();
    return permissions.includes(permission) || permissions.includes('admin');
  };

  // ✅ COMPATIBLE: Check if user has specific role
  hasRole = (role) => {
    const user = this.getCurrentUser();
    return user ? user.role === role || user.role === 'admin' : false;
  };

  // ✅ COMPATIBLE: Check if user is authenticated
  isAuthenticated = () => {
    return tokenService.isAuthenticated();
  };

  // Set last activity timestamp
  setLastActivity = () => {
    const timestamp = Date.now();
    localStorage.setItem('lastActivity', timestamp.toString());
  };

  // Get last activity timestamp
  getLastActivity = () => {
    const lastActivity = localStorage.getItem('lastActivity');
    return lastActivity ? parseInt(lastActivity, 10) : null;
  };

  // Check session timeout
  checkSessionTimeout = (timeoutMinutes = 60) => {
    const lastActivity = this.getLastActivity();
    if (!lastActivity) return true;

    const timeoutMs = timeoutMinutes * 60 * 1000;
    const currentTime = Date.now();
    return (currentTime - lastActivity) > timeoutMs;
  };

  // ✅ COMPATIBLE: Clear all authentication data
  clearAuthData = () => {
    tokenService.clearAllAuthData();
    localStorage.removeItem('lastActivity');
  };

  // Update user profile
  updateProfile = async (profileData) => {
    try {
      const token = tokenService.getToken();
      
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Profile update failed with status ${response.status}`);
      }

      if (data.success) {
        // Update stored user data
        const currentUser = this.getCurrentUser();
        const updatedUser = { ...currentUser, ...data.data.user };
        tokenService.setUserInfo(updatedUser);
        
        return {
          success: true,
          user: updatedUser,
          message: data.message
        };
      } else {
        return {
          success: false,
          message: data.message,
          user: null
        };
      }
    } catch (error) {
      console.error('AuthService - Update profile error:', error);
      return {
        success: false,
        message: error.message || 'Profile update failed',
        user: null
      };
    }
  };

  // Change password
  changePassword = async (passwordData) => {
    try {
      const token = tokenService.getToken();
      
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Password change failed with status ${response.status}`);
      }

      if (data.success) {
        return {
          success: true,
          message: data.message
        };
      } else {
        return {
          success: false,
          message: data.message
        };
      }
    } catch (error) {
      console.error('AuthService - Change password error:', error);
      return {
        success: false,
        message: error.message || 'Password change failed'
      };
    }
  };

  // Forgot password
  forgotPassword = async (email) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Password reset request failed with status ${response.status}`);
      }

      if (data.success) {
        return {
          success: true,
          message: data.message
        };
      } else {
        return {
          success: false,
          message: data.message
        };
      }
    } catch (error) {
      console.error('AuthService - Forgot password error:', error);
      return {
        success: false,
        message: error.message || 'Password reset request failed'
      };
    }
  };

  // Get service status
  getServiceStatus = () => {
    return {
      usingMockData: this.useMockData,
      isAuthenticated: this.isAuthenticated(),
      currentUser: this.getCurrentUser(),
      hasToken: !!tokenService.getToken(),
      lastActivity: this.getLastActivity()
    };
  };
}

// Create singleton instance
export const authService = new AuthService();
export default authService;
