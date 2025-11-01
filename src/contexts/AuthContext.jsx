// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import { authService } from '../services/auth/authService';
import { tokenService } from '../services/auth/tokenService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const sessionTimeoutRef = useRef(null);
  const hasCheckedAuth = useRef(false);
  const authCheckInProgress = useRef(false);
  const isMounted = useRef(true);

  // Logout function
  const logout = useCallback(async (options = {}) => {
    const { silent = false, redirectToLogin = true } = options;
    
    try {
      if (!silent) {
        console.log('🔐 Logout initiated');
      }
      
      await authService.logout();
    } catch (error) {
      console.error('🔐 Logout error:', error);
    } finally {
      // Clear all authentication data
      tokenService.clearAllAuthData();
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        setUser(null);
        setError(null);
        setLoading(false);
      }
      
      // Clear session timer
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }
      
      // Reset auth check flags
      hasCheckedAuth.current = false;
      authCheckInProgress.current = false;
      
      if (!silent) {
        console.log('🔐 Logout completed - all auth data cleared');
        
        // Redirect to login if needed
        if (redirectToLogin && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
  }, []);

  // Session timer
  const startSessionTimer = useCallback((timeoutMinutes = 60) => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }

    const timeoutMs = timeoutMinutes * 60 * 1000;
    
    sessionTimeoutRef.current = setTimeout(() => {
      console.log('🔐 Session expired - auto logout triggered');
      logout({ silent: true, redirectToLogin: true });
    }, timeoutMs);
    
    console.log(`🔐 Session timer started: ${timeoutMinutes} minutes`);
  }, [logout]);

  // Stop session timer
  const stopSessionTimer = useCallback(() => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
  }, []);

  // Check authentication status
  const checkAuthStatus = useCallback(async (force = false) => {
    if (authCheckInProgress.current && !force) {
      return;
    }

    if (hasCheckedAuth.current && !force) {
      return;
    }

    authCheckInProgress.current = true;
    hasCheckedAuth.current = true;

    console.log('🔐 Starting auth status check...');

    try {
      if (isMounted.current) {
        setLoading(true);
        setError(null);
      }

      const token = tokenService.getToken();
      const userInfo = tokenService.getUserInfo();

      // If no token but we have user info, this might be a mock scenario
      if (!token && userInfo) {
        console.log('🔐 No token but user info found (mock scenario)');
        if (isMounted.current) {
          setUser(userInfo);
        }
        startSessionTimer(userInfo.sessionTimeout || 60);
        return;
      }

      if (!token) {
        console.log('🔐 No token found - user not authenticated');
        if (isMounted.current) {
          setUser(null);
        }
        return;
      }

      // Check token expiration
      const isExpired = tokenService.isTokenExpired(token);
      if (isExpired) {
        console.log('🔐 Token expired - clearing auth data');
        await logout({ silent: true, redirectToLogin: false });
        return;
      }

      // Use user info from token service
      if (userInfo) {
        console.log('🔐 User authenticated via token service:', userInfo.email);
        if (isMounted.current) {
          setUser(userInfo);
        }
        startSessionTimer(userInfo.sessionTimeout || 60);
        return;
      }

      // Fallback to API verification
      console.log('🔐 No user info in storage, verifying with API...');
      const verificationResult = await authService.verifyToken();
      
      if (verificationResult?.success) {
        console.log('🔐 API verification successful');
        const verifiedUser = verificationResult.data.user;
        
        tokenService.setUserInfo(verifiedUser);
        if (isMounted.current) {
          setUser(verifiedUser);
        }
        startSessionTimer(verifiedUser.sessionTimeout || 60);
      } else {
        console.log('🔐 API verification failed - clearing auth data');
        await logout({ silent: true, redirectToLogin: false });
        if (isMounted.current) {
          setError(verificationResult?.message || 'Authentication verification failed');
        }
      }

    } catch (error) {
      console.error('🔐 Auth check failed:', error);
      if (isMounted.current) {
        setError(error.message || 'Authentication check failed');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      authCheckInProgress.current = false;
    }
  }, [logout, startSessionTimer]);

  // Login function
  const login = useCallback(async (credentials) => {
    console.log('🔐 Login attempt started for:', credentials.email);
    
    try {
      if (isMounted.current) {
        setLoading(true);
        setError(null);
      }

      const response = await authService.login(credentials);

      if (response?.success) {
        const { user, token } = response;
        
        if (token) {
          tokenService.setToken(token);
        }
        tokenService.setUserInfo(user);
        
        if (isMounted.current) {
          setUser(user);
          setError(null);
        }
        
        startSessionTimer(user.sessionTimeout || 60);

        console.log('🔐 Login successful:', user.email);
        return { 
          success: true, 
          user,
          message: response.message 
        };
      } else {
        const errorMessage = response?.message || 'Login failed';
        console.log('🔐 Login failed:', errorMessage);
        if (isMounted.current) {
          setError(errorMessage);
        }
        
        return { 
          success: false, 
          error: errorMessage 
        };
      }
    } catch (error) {
      console.error('🔐 Login error:', error);
      const errorMessage = error.message || 'Login failed due to unexpected error';
      if (isMounted.current) {
        setError(errorMessage);
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [startSessionTimer]);

  // Initialize auth check
  useEffect(() => {
    console.log('🔐 AuthProvider mounted');
    isMounted.current = true;
    
    if (!hasCheckedAuth.current) {
      checkAuthStatus();
    }

    return () => {
      console.log('🔐 AuthProvider unmounting');
      isMounted.current = false;
      stopSessionTimer();
    };
  }, [checkAuthStatus, stopSessionTimer]);

  // Context value
  const value = useMemo(() => ({
    // State
    user,
    loading,
    error,
    isAuthenticated: !!user,
    permissions: user?.permissions || [],
    userRole: user?.role || null,
    isEmailVerified: user?.emailVerified ?? false,
    userId: user?.id || null,

    // Actions
    login,
    logout: (options) => logout(options),
    checkAuthStatus: (force = false) => checkAuthStatus(force),

    // Permission checks
    hasPermission: (permission) => {
      const permissions = user?.permissions || [];
      const userRole = user?.role || null;
      return permissions.includes(permission) || userRole === 'admin';
    },
    
    hasRole: (role) => {
      const userRole = user?.role || null;
      return userRole === role || userRole === 'admin';
    },

    // Utility functions
    clearError: () => setError(null),
  }), [user, loading, error, login, logout, checkAuthStatus]);

  console.log('🔐 AuthContext rendering', {
    user: user?.email,
    loading,
    isAuthenticated: !!user
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };