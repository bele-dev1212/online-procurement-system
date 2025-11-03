// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

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

  // Your backend API base URL - running on port 5000
  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      // ADDED: Immediate return if no token exists
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      if (token) {
        // Verify token with backend using the /auth/me endpoint
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setUser(result.data.user);
            // Store user info in localStorage for persistence
            localStorage.setItem('user_info', JSON.stringify(result.data.user));
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_info');
          }
        } else {
          // Token is invalid, clear it
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_info');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Login successful
        const { user: userData, token } = result.data;
        
        setUser(userData);
        localStorage.setItem('access_token', token);
        localStorage.setItem('user_info', JSON.stringify(userData));
        
        return { 
          success: true, 
          user: userData,
          message: result.message 
        };
      } else {
        // Login failed
        const errorMessage = result.message || 'Login failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error.message || 'Network error. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        // Call logout endpoint if you have one, or just clear locally
        // For now, we'll just clear local storage since your backend doesn't have logout
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch(error => {
          console.log('Logout API call failed, clearing locally:', error);
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      setUser(null);
      setError(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    // State
    user,
    loading,
    error,
    isAuthenticated: !!user,
    
    // Actions
    login,
    logout,
    clearError,
    checkAuthStatus: () => checkAuthStatus(),
    
    // Role and permission checks
    hasRole: (role) => user?.role === role,
    hasPermission: (permission) => user?.permissions?.includes(permission) || false,
    
    // Super admin check
    isSuperAdmin: user?.role === 'super_admin' || user?.isSuperAdmin === true
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;