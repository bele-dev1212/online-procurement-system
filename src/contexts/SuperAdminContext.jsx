import React, { createContext, useContext, useReducer } from 'react';
import { superAdminAPI } from '../services/api/superAdminAPI';

const SuperAdminContext = createContext();

const initialState = {
  users: [],
  organizations: [],
  platformStats: {},
  analytics: {},
  platformConfig: {},
  subscriptions: [],
  loading: false,
  error: null
};

function superAdminReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_USERS':
      return { ...state, users: action.payload, loading: false };
    case 'SET_ORGANIZATIONS':
      return { ...state, organizations: action.payload, loading: false };
    case 'SET_PLATFORM_STATS':
      return { ...state, platformStats: action.payload, loading: false };
    case 'SET_PLATFORM_CONFIG':
      return { ...state, platformConfig: action.payload, loading: false };
    case 'SET_SUBSCRIPTIONS':
      return { ...state, subscriptions: action.payload, loading: false };
    case 'SET_ANALYTICS':
      return { ...state, analytics: action.payload, loading: false };
    default:
      return state;
  }
}

export const SuperAdminProvider = ({ children }) => {
  const [state, dispatch] = useReducer(superAdminReducer, initialState);

  const actions = {
    // Users Management
    fetchUsers: async (filters = {}) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const response = await superAdminAPI.getUsers(filters);
        dispatch({ type: 'SET_USERS', payload: response.data });
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch users';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      }
    },

    updateUserStatus: async (userId, status) => {
      try {
        await superAdminAPI.updateUserStatus(userId, { status });
        await actions.fetchUsers();
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update user status';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      }
    },

    // Organizations Management
    fetchOrganizations: async (filters = {}) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const response = await superAdminAPI.getOrganizations(filters);
        dispatch({ type: 'SET_ORGANIZATIONS', payload: response.data });
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch organizations';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      }
    },

    updateOrganizationStatus: async (orgId, status) => {
      try {
        await superAdminAPI.updateOrganizationStatus(orgId, { status });
        await actions.fetchOrganizations();
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update organization status';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      }
    },

    deleteOrganization: async (orgId) => {
      try {
        await superAdminAPI.deleteOrganization(orgId);
        await actions.fetchOrganizations();
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete organization';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      }
    },

    // Platform Statistics
    fetchPlatformStats: async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const response = await superAdminAPI.getPlatformStats();
        dispatch({ type: 'SET_PLATFORM_STATS', payload: response.data });
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch platform statistics';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      }
    },

    // Analytics and Growth Data
    fetchUserGrowth: async (timeRange = '30d') => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const response = await superAdminAPI.getUserGrowth(timeRange);
        // Update analytics with user growth data
        dispatch({ 
          type: 'SET_ANALYTICS', 
          payload: { 
            ...state.analytics,
            userGrowth: response.data 
          } 
        });
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch user growth data';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      }
    },

    fetchRecentActivity: async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const response = await superAdminAPI.getRecentActivity();
        // Update analytics with recent activity data
        dispatch({ 
          type: 'SET_ANALYTICS', 
          payload: { 
            ...state.analytics,
            recentActivity: response.data 
          } 
        });
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch recent activity';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      }
    },

    fetchAnalytics: async (period = 'monthly') => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const response = await superAdminAPI.getAnalytics(period);
        dispatch({ type: 'SET_ANALYTICS', payload: response.data });
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch analytics';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      }
    },

    // Platform Configuration
    fetchPlatformConfig: async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const response = await superAdminAPI.getPlatformConfig();
        dispatch({ type: 'SET_PLATFORM_CONFIG', payload: response.data });
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch platform configuration';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      }
    },

    updatePlatformConfig: async (config) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const response = await superAdminAPI.updatePlatformConfig(config);
        dispatch({ type: 'SET_PLATFORM_CONFIG', payload: response.data });
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update platform configuration';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      }
    },

    // Subscriptions
    fetchSubscriptions: async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const response = await superAdminAPI.getSubscriptions();
        dispatch({ type: 'SET_SUBSCRIPTIONS', payload: response.data });
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch subscriptions';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      }
    },

    updateSubscription: async (subId, data) => {
      try {
        const response = await superAdminAPI.updateSubscription(subId, data);
        await actions.fetchSubscriptions();
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update subscription';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      }
    },

    // Utility functions
    clearError: () => {
      dispatch({ type: 'SET_ERROR', payload: null });
    },

    // Initialize all data
    initializeData: async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        await Promise.all([
          actions.fetchPlatformStats(),
          actions.fetchOrganizations(),
          actions.fetchUsers(),
          actions.fetchSubscriptions(),
          actions.fetchPlatformConfig()
        ]);
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to initialize data';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      }
    }
  };

  return (
    <SuperAdminContext.Provider value={{ ...state, ...actions }}>
      {children}
    </SuperAdminContext.Provider>
  );
};

export const useSuperAdmin = () => {
  const context = useContext(SuperAdminContext);
  if (!context) {
    throw new Error('useSuperAdmin must be used within a SuperAdminProvider');
  }
  return context;
};
