import { tokenService } from '../auth/tokenService';
import { apiConfig } from '../../utils/config/apiConfig';

const API_BASE_URL = apiConfig.baseURL;

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

export const biddingAPI = {
  // Get all bids with filtering and pagination
  getAllBids: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/bidding/bids?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get bids API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get bid by ID
  getBidById: async (bidId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bidding/bids/${bidId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get bid by ID API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Create new bid
  createBid: async (bidData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bidding/bids`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(bidData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Create bid API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Update bid
  updateBid: async (bidId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bidding/bids/${bidId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Update bid API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Delete bid
  deleteBid: async (bidId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bidding/bids/${bidId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Delete bid API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Submit bid for approval
  submitForApproval: async (bidId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bidding/bids/${bidId}/submit`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Submit bid API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Approve bid
  approveBid: async (bidId, approvalData = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bidding/bids/${bidId}/approve`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(approvalData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Approve bid API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Reject bid
  rejectBid: async (bidId, rejectionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bidding/bids/${bidId}/reject`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(rejectionData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Reject bid API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Cancel bid
  cancelBid: async (bidId, cancellationData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bidding/bids/${bidId}/cancel`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(cancellationData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Cancel bid API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Add bid response
  addBidResponse: async (bidId, responseData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bidding/bids/${bidId}/responses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(responseData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Add bid response API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get bid responses
  getBidResponses: async (bidId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bidding/bids/${bidId}/responses`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get bid responses API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Evaluate bid response
  evaluateBidResponse: async (bidId, responseId, evaluationData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bidding/bids/${bidId}/responses/${responseId}/evaluate`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(evaluationData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Evaluate bid response API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Award bid
  awardBid: async (bidId, awardData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bidding/bids/${bidId}/award`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(awardData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Award bid API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get bid evaluation criteria
  getBidEvaluationCriteria: async (bidId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bidding/bids/${bidId}/evaluation-criteria`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get bid evaluation criteria API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Update bid evaluation criteria
  updateBidEvaluationCriteria: async (bidId, criteriaData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bidding/bids/${bidId}/evaluation-criteria`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(criteriaData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Update bid evaluation criteria API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get bid documents
  getBidDocuments: async (bidId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bidding/bids/${bidId}/documents`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get bid documents API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Upload bid document
  uploadBidDocument: async (bidId, documentData) => {
    try {
      const formData = new FormData();
      Object.keys(documentData).forEach(key => {
        formData.append(key, documentData[key]);
      });

      const response = await fetch(`${API_BASE_URL}/bidding/bids/${bidId}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenService.getToken()}`
        },
        body: formData,
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Upload bid document API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get bid history
  getBidHistory: async (bidId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bidding/bids/${bidId}/history`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get bid history API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get bidding statistics
  getBidStats: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/bidding/stats?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get bid stats API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Search bids
  searchBids: async (searchTerm, filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm,
        ...filters
      });
      
      const response = await fetch(`${API_BASE_URL}/bidding/bids/search?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Search bids API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get bid templates
  getBidTemplates: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bidding/templates`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get bid templates API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Create bid from template
  createBidFromTemplate: async (templateId, bidData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bidding/templates/${templateId}/create-bid`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(bidData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Create bid from template API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }
};

export default biddingAPI;