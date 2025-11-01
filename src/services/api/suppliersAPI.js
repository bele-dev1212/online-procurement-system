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

export const suppliersAPI = {
  // Get all suppliers with filtering and pagination
  getAllSuppliers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/suppliers?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get suppliers API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get supplier by ID
  getSupplierById: async (supplierId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/suppliers/${supplierId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get supplier by ID API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Create new supplier
  createSupplier: async (supplierData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/suppliers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(supplierData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Create supplier API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Update supplier
  updateSupplier: async (supplierId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/suppliers/${supplierId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Update supplier API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Delete supplier
  deleteSupplier: async (supplierId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/suppliers/${supplierId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Delete supplier API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Approve supplier
  approveSupplier: async (supplierId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/suppliers/${supplierId}/approve`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Approve supplier API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Suspend supplier
  suspendSupplier: async (supplierId, reason) => {
    try {
      const response = await fetch(`${API_BASE_URL}/suppliers/${supplierId}/suspend`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Suspend supplier API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Activate supplier
  activateSupplier: async (supplierId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/suppliers/${supplierId}/activate`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Activate supplier API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get supplier performance
  getSupplierPerformance: async (supplierId = null) => {
    try {
      const url = supplierId 
        ? `${API_BASE_URL}/suppliers/${supplierId}/performance`
        : `${API_BASE_URL}/suppliers/performance`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get supplier performance API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Update supplier rating
  updateSupplierRating: async (supplierId, ratingData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/suppliers/${supplierId}/rating`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(ratingData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Update supplier rating API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get supplier categories
  getSupplierCategories: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/supplier-categories`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get supplier categories API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Create supplier category
  createSupplierCategory: async (categoryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/supplier-categories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Create supplier category API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Search suppliers
  searchSuppliers: async (searchTerm, filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm,
        ...filters
      });
      
      const response = await fetch(`${API_BASE_URL}/suppliers/search?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Search suppliers API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get supplier statistics
  getSupplierStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/suppliers/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get supplier stats API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get supplier documents
  getSupplierDocuments: async (supplierId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/suppliers/${supplierId}/documents`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get supplier documents API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Upload supplier document
  uploadSupplierDocument: async (supplierId, documentData) => {
    try {
      const formData = new FormData();
      Object.keys(documentData).forEach(key => {
        formData.append(key, documentData[key]);
      });

      const response = await fetch(`${API_BASE_URL}/suppliers/${supplierId}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenService.getToken()}`
        },
        body: formData,
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Upload supplier document API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }
};

export default suppliersAPI;