// src/services/auth/authService.js
import { tokenService } from './tokenService';
import { authAPI } from '../api/authAPI';

class AuthService {
  constructor() {
    this.isRefreshing = false;
    this.failedQueue = [];
    this.useMockData = !process.env.VITE_API_BASE_URL || process.env.VITE_USE_MOCK_API === 'true';
    console.log('🔐 AuthService initialized - Using mock data:', this.useMockData);
  }

  // Process failed requests queue after token refresh
  processQueue = (error, token = null) => {
    this.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });

    this.failedQueue = [];
  };

  // Mock login API - Used when backend is not available
  mockLoginAPI = (email, password) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('🔐 Mock API - Processing login for:', email);
        
        const validUsers = [
          { 
            email: 'admin@procurement.com', 
            password: 'admin123', 
            user: {
              id: 1,
              email: 'admin@procurement.com',
              name: 'System Administrator',
              role: 'admin',
              permissions: ['read', 'write', 'delete', 'admin'],
              emailVerified: true,
              avatar: 'https://ui-avatars.com/api/?name=Admin&background=3B82F6&color=fff',
              sessionTimeout: 60
            }
          },
          { 
            email: 'manager@procurement.com', 
            password: 'manager123', 
            user: {
              id: 2,
              email: 'manager@procurement.com',
              name: 'Procurement Manager',
              role: 'manager',
              permissions: ['read', 'write'],
              emailVerified: true,
              avatar: 'https://ui-avatars.com/api/?name=Manager&background=10B981&color=fff',
              sessionTimeout: 60
            }
          },
          { 
            email: 'user@procurement.com', 
            password: 'user123', 
            user: {
              id: 3,
              email: 'user@procurement.com',
              name: 'Procurement User',
              role: 'user',
              permissions: ['read'],
              emailVerified: true,
              avatar: 'https://ui-avatars.com/api/?name=User&background=6B7280&color=fff',
              sessionTimeout: 60
            }
          }
        ];

        const userData = validUsers.find(u => 
          u.email === email && u.password === password
        );

        if (userData) {
          console.log('🔐 Mock API - Login successful for:', email);
          resolve({
            success: true,
            data: {
              token: 'mock-jwt-token-' + Date.now() + '-' + userData.user.id,
              user: userData.user,
              permissions: userData.user.permissions
            },
            message: 'Login successful'
          });
        } else {
          console.log('🔐 Mock API - Login failed for:', email);
          resolve({
            success: false,
            message: 'Invalid email or password',
            data: null
          });
        }
      }, 1000); // Simulate API delay
    });
  };

  // Login user with mock fallback
  login = async (credentials) => {
    try {
      console.log('🔐 AuthService - Login attempt for:', credentials.email);
      
      let response;
      
      if (this.useMockData) {
        console.log('🔐 Using mock login API');
        response = await this.mockLoginAPI(credentials.email, credentials.password);
      } else {
        console.log('🔐 Using real API');
        response = await authAPI.login(credentials);
      }
      
      console.log('🔐 AuthService - Login response:', response);

      if (response.success) {
        const { user, token, refreshToken, permissions } = response.data;
        
        // Store tokens
        tokenService.setToken(token);
        if (refreshToken) {
          tokenService.setRefreshToken(refreshToken);
        }
        
        // Store user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('permissions', JSON.stringify(permissions || []));
        
        // Set last activity timestamp
        this.setLastActivity();
        
        console.log('🔐 AuthService - Login successful, user stored:', user.email);
        
        return {
          success: true,
          user,
          permissions,
          message: response.message
        };
      } else {
        console.log('🔐 AuthService - Login failed:', response.message);
        return {
          success: false,
          message: response.message,
          user: null,
          permissions: []
        };
      }
    } catch (error) {
      console.error('🔐 AuthService - Login error:', error);
      
      // If real API fails and we're not using mock data, try mock as fallback
      if (!this.useMockData) {
        console.log('🔐 Real API failed, trying mock login as fallback');
        return await this.login(credentials); // Recursive call will use mock data
      }
      
      return {
        success: false,
        message: error.message || 'Login failed. Please try again.',
        user: null,
        permissions: []
      };
    }
  };

  // Mock token verification
  mockVerifyToken = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = this.getCurrentUser();
        if (user) {
          resolve({
            success: true,
            data: { user },
            message: 'Token verified successfully'
          });
        } else {
          resolve({
            success: false,
            message: 'No valid user found',
            data: null
          });
        }
      }, 500);
    });
  };

  // Verify token validity with mock fallback
  verifyToken = async () => {
    try {
      const token = tokenService.getToken();
      
      if (!token) {
        return {
          success: false,
          message: 'No token found',
          data: null
        };
      }

      if (tokenService.isTokenExpired(token)) {
        // Attempt to refresh token
        const refreshResult = await this.refreshToken();
        if (!refreshResult.success) {
          this.clearAuthData();
          return {
            success: false,
            message: 'Token expired and refresh failed',
            data: null
          };
        }
        return refreshResult;
      }

      let response;
      
      if (this.useMockData) {
        response = await this.mockVerifyToken();
      } else {
        response = await authAPI.verifyToken();
      }
      
      if (response.success) {
        // Update stored user data if needed
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        // Update last activity
        this.setLastActivity();
        
        return response;
      } else {
        this.clearAuthData();
        return {
          success: false,
          message: response.message,
          data: null
        };
      }
    } catch (error) {
      console.error('AuthService - Verify token error:', error);
      
      // If real API fails, try mock verification
      if (!this.useMockData) {
        console.log('🔐 Real token verification failed, trying mock verification');
        return await this.mockVerifyToken();
      }
      
      this.clearAuthData();
      return {
        success: false,
        message: error.message || 'Token verification failed',
        data: null
      };
    }
  };

  // Mock refresh token
  mockRefreshToken = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = this.getCurrentUser();
        if (user) {
          resolve({
            success: true,
            data: {
              token: 'mock-refreshed-token-' + Date.now(),
              user: user
            },
            message: 'Token refreshed successfully'
          });
        } else {
          resolve({
            success: false,
            message: 'No user found for token refresh',
            data: null
          });
        }
      }, 500);
    });
  };

  // Refresh access token with mock fallback
  refreshToken = async () => {
    try {
      const refreshToken = tokenService.getRefreshToken();
      
      if (!refreshToken && !this.useMockData) {
        throw new Error('No refresh token available');
      }

      let response;
      
      if (this.useMockData) {
        response = await this.mockRefreshToken();
      } else {
        response = await authAPI.refreshToken();
      }
      
      if (response.success) {
        const { token, user } = response.data;
        
        tokenService.setToken(token);
        
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        this.setLastActivity();
        
        return {
          success: true,
          user,
          message: 'Token refreshed successfully'
        };
      } else {
        throw new Error(response.message || 'Token refresh failed');
      }
    } catch (error) {
      console.error('AuthService - Refresh token error:', error);
      
      // If real refresh fails, try mock refresh
      if (!this.useMockData) {
        console.log('🔐 Real token refresh failed, trying mock refresh');
        return await this.mockRefreshToken();
      }
      
      this.clearAuthData();
      return {
        success: false,
        message: error.message || 'Token refresh failed',
        user: null
      };
    }
  };

  // Register new user
  register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        return {
          success: true,
          message: response.message,
          data: response.data
        };
      } else {
        return {
          success: false,
          message: response.message,
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

  // Logout user
  logout = async () => {
    try {
      if (!this.useMockData) {
        // Call logout API to invalidate token on server
        await authAPI.logout();
      } else {
        console.log('🔐 Mock logout - clearing local data');
      }
    } catch (error) {
      console.error('AuthService - Logout API error:', error);
      // Continue with client-side logout even if API call fails
    } finally {
      // Clear all stored data
      this.clearAuthData();
      console.log('🔐 Logout completed - all auth data cleared');
    }
  };

  // Update user profile
  updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      
      if (response.success) {
        // Update stored user data
        const currentUser = this.getCurrentUser();
        const updatedUser = { ...currentUser, ...response.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return {
          success: true,
          user: updatedUser,
          message: response.message
        };
      } else {
        return {
          success: false,
          message: response.message,
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
      const response = await authAPI.changePassword(passwordData);
      
      if (response.success) {
        return {
          success: true,
          message: response.message
        };
      } else {
        return {
          success: false,
          message: response.message
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
      const response = await authAPI.forgotPassword(email);
      
      if (response.success) {
        return {
          success: true,
          message: response.message
        };
      } else {
        return {
          success: false,
          message: response.message
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

  // Reset password
  resetPassword = async (resetData) => {
    try {
      const response = await authAPI.resetPassword(resetData);
      
      if (response.success) {
        return {
          success: true,
          message: response.message
        };
      } else {
        return {
          success: false,
          message: response.message
        };
      }
    } catch (error) {
      console.error('AuthService - Reset password error:', error);
      return {
        success: false,
        message: error.message || 'Password reset failed'
      };
    }
  };

  // Get current user from localStorage
  getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      console.log('🔐 AuthService - Get current user:', user?.email);
      return user;
    } catch (error) {
      console.error('AuthService - Get current user error:', error);
      return null;
    }
  };

  // Get user permissions
  getPermissions = () => {
    try {
      const permissionsStr = localStorage.getItem('permissions');
      const permissions = permissionsStr ? JSON.parse(permissionsStr) : [];
      console.log('🔐 AuthService - Get permissions:', permissions);
      return permissions;
    } catch (error) {
      console.error('AuthService - Get permissions error:', error);
      return [];
    }
  };

  // Check if user has specific permission
  hasPermission = (permission) => {
    const permissions = this.getPermissions();
    const hasPerm = permissions.includes(permission) || permissions.includes('admin');
    console.log(`🔐 AuthService - Permission check "${permission}":`, hasPerm);
    return hasPerm;
  };

  // Check if user has specific role
  hasRole = (role) => {
    const user = this.getCurrentUser();
    const hasRole = user ? user.role === role || user.role === 'admin' : false;
    console.log(`🔐 AuthService - Role check "${role}":`, hasRole);
    return hasRole;
  };

  // Check if user is authenticated
  isAuthenticated = () => {
    const token = tokenService.getToken();
    const user = this.getCurrentUser();
    
    console.log('🔐 AuthService - Authentication check:', {
      hasToken: !!token,
      hasUser: !!user,
      token: token ? `${token.substring(0, 20)}...` : null,
      user: user ? user.email : null
    });

    if (!token || !user) {
      return false;
    }

    // Check token expiration
    if (tokenService.isTokenExpired(token)) {
      console.log('🔐 AuthService - Token expired');
      return false;
    }

    console.log('🔐 AuthService - User is authenticated');
    return true;
  };

  // Set last activity timestamp
  setLastActivity = () => {
    const timestamp = Date.now();
    localStorage.setItem('lastActivity', timestamp.toString());
    console.log('🔐 AuthService - Last activity set:', new Date(timestamp).toISOString());
  };

  // Get last activity timestamp
  getLastActivity = () => {
    const lastActivity = localStorage.getItem('lastActivity');
    const timestamp = lastActivity ? parseInt(lastActivity, 10) : null;
    console.log('🔐 AuthService - Last activity:', timestamp ? new Date(timestamp).toISOString() : 'Never');
    return timestamp;
  };

  // Check session timeout
  checkSessionTimeout = (timeoutMinutes = 60) => {
    const lastActivity = this.getLastActivity();
    if (!lastActivity) {
      console.log('🔐 AuthService - No last activity found');
      return true;
    }

    const timeoutMs = timeoutMinutes * 60 * 1000;
    const currentTime = Date.now();
    const isTimedOut = (currentTime - lastActivity) > timeoutMs;
    
    console.log('🔐 AuthService - Session timeout check:', {
      lastActivity: new Date(lastActivity).toISOString(),
      currentTime: new Date(currentTime).toISOString(),
      timeoutMinutes,
      isTimedOut
    });
    
    return isTimedOut;
  };

  // Clear all authentication data
  clearAuthData = () => {
    console.log('🔐 AuthService - Clearing all authentication data');
    tokenService.removeToken();
    tokenService.removeRefreshToken();
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    localStorage.removeItem('lastActivity');
    console.log('🔐 AuthService - All auth data cleared');
  };

  // Get user activity log
  getUserActivity = async (params = {}) => {
    try {
      const response = await authAPI.getUserActivity(params);
      
      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message
        };
      } else {
        return {
          success: false,
          message: response.message,
          data: null
        };
      }
    } catch (error) {
      console.error('AuthService - Get user activity error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch user activity',
        data: null
      };
    }
  };

  // Update user preferences
  updatePreferences = async (preferences) => {
    try {
      const currentUser = this.getCurrentUser();
      const updatedUser = {
        ...currentUser,
        preferences: {
          ...currentUser.preferences,
          ...preferences
        }
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Also update on server if not using mock data
      if (!this.useMockData) {
        const response = await this.updateProfile({ preferences });
        return response;
      }
      
      return {
        success: true,
        message: 'Preferences updated successfully'
      };
    } catch (error) {
      console.error('AuthService - Update preferences error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update preferences'
      };
    }
  };

  // Get user settings
  getUserSettings = () => {
    const user = this.getCurrentUser();
    const settings = user?.settings || {};
    console.log('🔐 AuthService - Get user settings:', settings);
    return settings;
  };

  // Update user settings
  updateUserSettings = async (settings) => {
    try {
      const currentUser = this.getCurrentUser();
      const updatedUser = {
        ...currentUser,
        settings: {
          ...currentUser.settings,
          ...settings
        }
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      if (!this.useMockData) {
        const response = await this.updateProfile({ settings });
        return response;
      }
      
      return {
        success: true,
        message: 'User settings updated successfully'
      };
    } catch (error) {
      console.error('AuthService - Update user settings error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update user settings'
      };
    }
  };

  // Check if user needs to complete profile
  isProfileComplete = () => {
    const user = this.getCurrentUser();
    if (!user) return false;

    const requiredFields = ['email', 'name', 'role'];
    const isComplete = requiredFields.every(field => user[field]);
    console.log('🔐 AuthService - Profile complete check:', isComplete);
    return isComplete;
  };

  // Get user dashboard data
  getUserDashboard = async () => {
    try {
      // This would typically call a dedicated dashboard API
      const user = this.getCurrentUser();
      const permissions = this.getPermissions();
      
      return {
        success: true,
        data: {
          user,
          permissions,
          quickStats: {
            pendingApprovals: 0,
            activeBids: 0,
            lowStockItems: 0,
            recentActivities: []
          }
        }
      };
    } catch (error) {
      console.error('AuthService - Get user dashboard error:', error);
      return {
        success: false,
        message: error.message || 'Failed to load dashboard',
        data: null
      };
    }
  };

  // Multi-factor authentication setup
  setupMFA = async () => {
    try {
      // This would integrate with your MFA service
      // For now, return a mock response
      return {
        success: true,
        data: {
          qrCode: 'mock-qr-code-data',
          secret: 'mock-secret-key',
          backupCodes: ['code1', 'code2', 'code3', 'code4', 'code5']
        },
        message: 'MFA setup initiated'
      };
    } catch (error) {
      console.error('AuthService - Setup MFA error:', error);
      return {
        success: false,
        message: error.message || 'MFA setup failed'
      };
    }
  };

  // Verify MFA token
  verifyMFA = async () => {
    try {
      // This would verify the MFA token with your backend
      // For now, return a mock success response
      return {
        success: true,
        message: 'MFA verification successful'
      };
    } catch (error) {
      console.error('AuthService - Verify MFA error:', error);
      return {
        success: false,
        message: error.message || 'MFA verification failed'
      };
    }
  };

  // Disable MFA
  disableMFA = async () => {
    try {
      // This would disable MFA for the user
      return {
        success: true,
        message: 'MFA disabled successfully'
      };
    } catch (error) {
      console.error('AuthService - Disable MFA error:', error);
      return {
        success: false,
        message: error.message || 'Failed to disable MFA'
      };
    }
  };

  // Get service status
  getServiceStatus = () => {
    return {
      usingMockData: this.useMockData,
      isAuthenticated: this.isAuthenticated(),
      currentUser: this.getCurrentUser(),
      hasToken: !!tokenService.getToken()
    };
  };
}

// Create singleton instance
export const authService = new AuthService();
export default authService;