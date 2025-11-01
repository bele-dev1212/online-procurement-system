import { useState, useContext, useCallback, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { authAPI } from '../services/api/authAPI';
import { tokenService } from '../services/auth/tokenService';
import { useNotifications } from './useNotifications';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const context = useContext(AuthContext);
  
  // Check if context exists and has required properties
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { 
    user, 
    setUser,
    isAuthenticated,
    setIsAuthenticated 
  } = context;

  const { addNotification } = useNotifications();

useEffect(() => {
  let isMounted = true;
  
  const checkAuthStatus = async () => {
    const token = tokenService.getToken();
    // Remove the `!user` check since we only want to run this once on mount
    if (token && isMounted) {
      try {
        setLoading(true);
        const userData = await authAPI.getCurrentUser();
        if (isMounted) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        if (isMounted) {
          tokenService.removeToken();
          setError('Session expired. Please login again.');
          addNotification({
            type: 'warning',
            title: 'Session Expired',
            message: 'Your session has expired. Please login again.'
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
  };

  checkAuthStatus();

  return () => {
    isMounted = false;
  };
}, [addNotification, setIsAuthenticated, setUser]); // Empty array - runs once on mount// Run once on mount // ← Empty array = run only once on mount

const login = async (email, password, rememberMe = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.login({ email, password });
      const { user: userData, token, refreshToken } = response;

      // Store tokens
      tokenService.setToken(token, rememberMe);
      if (refreshToken) {
        tokenService.setRefreshToken(refreshToken);
      }

      // Update context
      setUser(userData);
      setIsAuthenticated(true);

      addNotification({
        type: 'success',
        title: 'Login Successful',
        message: 'Welcome back!'
      });
      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Login Failed',
        message: errorMessage
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.register(userData);
      const { user: newUser, token } = response;

      // Store token
      tokenService.setToken(token);

      // Update context
      setUser(newUser);
      setIsAuthenticated(true);

      addNotification({
        type: 'success',
        title: 'Registration Successful',
        message: 'Welcome to the system!'
      });
      return { success: true, user: newUser };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Registration Failed',
        message: errorMessage
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Call logout API to invalidate token on server
      await authAPI.logout();
    } catch (err) {
      console.error('Logout API error:', err);
      // Continue with client-side logout even if API fails
    } finally {
      // Clear local storage
      tokenService.removeToken();
      tokenService.removeRefreshToken();
      
      // Update context
      setUser(null);
      setIsAuthenticated(false);

      addNotification({
        type: 'info',
        title: 'Logged Out',
        message: 'You have been logged out successfully.'
      });
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await authAPI.updateProfile(profileData);
      setUser(updatedUser);
      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully!'
      });
      return updatedUser;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile.';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    setLoading(true);
    setError(null);
    try {
      await authAPI.changePassword(passwordData);
      addNotification({
        type: 'success',
        title: 'Password Changed',
        message: 'Your password has been changed successfully!'
      });
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to change password.';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Password Change Failed',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (preferences) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await authAPI.updatePreferences(preferences);
      setUser(updatedUser);
      addNotification({
        type: 'success',
        title: 'Preferences Updated',
        message: 'Your preferences have been updated successfully!'
      });
      return updatedUser;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update preferences.';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const updatedUser = await authAPI.uploadAvatar(formData);
      setUser(updatedUser);
      addNotification({
        type: 'success',
        title: 'Profile Picture Updated',
        message: 'Your profile picture has been updated successfully!'
      });
      return updatedUser;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to upload profile picture.';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email) => {
    setLoading(true);
    setError(null);
    try {
      await authAPI.requestPasswordReset(email);
      addNotification({
        type: 'success',
        title: 'Reset Email Sent',
        message: 'Password reset instructions have been sent to your email.'
      });
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send reset email.';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Reset Failed',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    setLoading(true);
    setError(null);
    try {
      await authAPI.resetPassword(token, newPassword);
      addNotification({
        type: 'success',
        title: 'Password Reset',
        message: 'Your password has been reset successfully! You can now login with your new password.'
      });
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password.';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Reset Failed',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSessions = async () => {
    try {
      const sessions = await authAPI.getSessions();
      return sessions;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load sessions.';
      setError(errorMessage);
      throw err;
    }
  };

  const revokeSession = async (sessionId) => {
    setLoading(true);
    try {
      await authAPI.revokeSession(sessionId);
      addNotification({
        type: 'success',
        title: 'Session Revoked',
        message: 'The session has been revoked successfully.'
      });
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to revoke session.';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Revoke Failed',
        message: errorMessage
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const newToken = await authAPI.refreshToken();
      tokenService.setToken(newToken);
      return newToken;
    } catch (err) {
      logout();
      throw err;
    }
  };

  const hasPermission = useCallback((permission) => {
    if (!user || !user.role) return false;
    
    const userPermissions = {
      admin: ['read', 'write', 'delete', 'approve', 'manage_users', 'system_config'],
      manager: ['read', 'write', 'approve', 'manage_team'],
      user: ['read', 'write'],
      viewer: ['read']
    };

    return userPermissions[user.role]?.includes(permission) || false;
  }, [user]);

  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    user,
    isAuthenticated,

    // Auth actions
    login,
    register,
    logout,
    refreshToken,

    // User management
    updateProfile,
    changePassword,
    updatePreferences,
    uploadAvatar,

    // Password reset
    requestPasswordReset,
    resetPassword,

    // Session management
    getSessions,
    revokeSession,

    // Permissions
    hasPermission,
    hasRole,

    // Error handling
    clearError
  };
};