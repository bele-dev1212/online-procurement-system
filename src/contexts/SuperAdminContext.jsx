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
    default:
      return state;
  }
}

export const SuperAdminProvider = ({ children }) => {
  const [state, dispatch] = useReducer(superAdminReducer, initialState);

  const actions = {
    fetchUsers: async (filters = {}) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const response = await superAdminAPI.getUsers(filters);
        dispatch({ type: 'SET_USERS', payload: response.data });
        return response.data;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    fetchOrganizations: async (filters = {}) => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const response = await superAdminAPI.getOrganizations(filters);
        dispatch({ type: 'SET_ORGANIZATIONS', payload: response.data });
        return response.data;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    fetchPlatformStats: async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const response = await superAdminAPI.getPlatformStats();
        dispatch({ type: 'SET_PLATFORM_STATS', payload: response.data });
        return response.data;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    updateOrganizationStatus: async (orgId, data) => {
      try {
        await superAdminAPI.updateOrganizationStatus(orgId, data);
        await actions.fetchOrganizations();
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    fetchPlatformConfig: async () => {
      try {
        const response = await superAdminAPI.getPlatformConfig();
        dispatch({ type: 'SET_PLATFORM_CONFIG', payload: response.data });
        return response.data;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    updatePlatformConfig: async (config) => {
      try {
        const response = await superAdminAPI.updatePlatformConfig(config);
        dispatch({ type: 'SET_PLATFORM_CONFIG', payload: response.data });
        return response.data;
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
        throw error;
      }
    },

    clearError: () => {
      dispatch({ type: 'SET_ERROR', payload: null });
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