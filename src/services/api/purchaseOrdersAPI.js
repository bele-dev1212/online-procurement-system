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

export const purchaseOrdersAPI = {
  // Get all purchase orders with filtering and pagination
  getAllPurchaseOrders: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/purchase-orders?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get purchase orders API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get purchase order by ID
  getPurchaseOrderById: async (purchaseOrderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-orders/${purchaseOrderId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get purchase order by ID API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Create new purchase order
  createPurchaseOrder: async (purchaseOrderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(purchaseOrderData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Create purchase order API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Update purchase order
  updatePurchaseOrder: async (purchaseOrderId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-orders/${purchaseOrderId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Update purchase order API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Delete purchase order
  deletePurchaseOrder: async (purchaseOrderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-orders/${purchaseOrderId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Delete purchase order API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Submit purchase order for approval
  submitForApproval: async (purchaseOrderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-orders/${purchaseOrderId}/submit`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Submit purchase order API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Approve purchase order
  approvePurchaseOrder: async (purchaseOrderId, approvalData = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-orders/${purchaseOrderId}/approve`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(approvalData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Approve purchase order API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Reject purchase order
  rejectPurchaseOrder: async (purchaseOrderId, rejectionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-orders/${purchaseOrderId}/reject`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(rejectionData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Reject purchase order API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Cancel purchase order
  cancelPurchaseOrder: async (purchaseOrderId, cancellationData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-orders/${purchaseOrderId}/cancel`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(cancellationData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Cancel purchase order API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get purchase order items
  getPurchaseOrderItems: async (purchaseOrderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-orders/${purchaseOrderId}/items`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get purchase order items API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Add item to purchase order
  addPurchaseOrderItem: async (purchaseOrderId, itemData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-orders/${purchaseOrderId}/items`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(itemData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Add purchase order item API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Update purchase order item
  updatePurchaseOrderItem: async (purchaseOrderId, itemId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-orders/${purchaseOrderId}/items/${itemId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Update purchase order item API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Remove item from purchase order
  removePurchaseOrderItem: async (purchaseOrderId, itemId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-orders/${purchaseOrderId}/items/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Remove purchase order item API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get purchase order history
  getPurchaseOrderHistory: async (purchaseOrderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-orders/${purchaseOrderId}/history`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get purchase order history API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get purchase order documents
  getPurchaseOrderDocuments: async (purchaseOrderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-orders/${purchaseOrderId}/documents`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get purchase order documents API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Upload purchase order document
  uploadPurchaseOrderDocument: async (purchaseOrderId, documentData) => {
    try {
      const formData = new FormData();
      Object.keys(documentData).forEach(key => {
        formData.append(key, documentData[key]);
      });

      const response = await fetch(`${API_BASE_URL}/purchase-orders/${purchaseOrderId}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenService.getToken()}`
        },
        body: formData,
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Upload purchase order document API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get purchase order statistics
  getPurchaseOrderStats: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/purchase-orders/stats?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get purchase order stats API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Search purchase orders
  searchPurchaseOrders: async (searchTerm, filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm,
        ...filters
      });
      
      const response = await fetch(`${API_BASE_URL}/purchase-orders/search?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Search purchase orders API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }
};

export default purchaseOrdersAPI;