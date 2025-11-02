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

export const invitationAPI = {
  // Get invitation details by token
  getInvitation: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/invitations/${token}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get invitation API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Accept invitation
  acceptInvitation: async (token, userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/invitations/${token}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Accept invitation API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Send invitation (admin only)
  sendInvitation: async (invitationData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/invitations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(invitationData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Send invitation API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get all invitations for organization (admin only)
  getInvitations: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/invitations?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get invitations API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Cancel/revoke invitation (admin only)
  revokeInvitation: async (invitationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Revoke invitation API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Resend invitation (admin only)
  resendInvitation: async (invitationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/invitations/${invitationId}/resend`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Resend invitation API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }
};

export default invitationAPI;


