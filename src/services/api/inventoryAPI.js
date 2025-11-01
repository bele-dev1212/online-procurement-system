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

export const inventoryAPI = {
  // Get all products with filtering and pagination
  getAllProducts: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/inventory/products?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get products API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get product by ID
  getProductById: async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/products/${productId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get product by ID API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Create new product
  createProduct: async (productData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Create product API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Update product
  updateProduct: async (productId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/products/${productId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Update product API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Delete product
  deleteProduct: async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/products/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Delete product API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Update product stock
  updateProductStock: async (productId, stockData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/products/${productId}/stock`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(stockData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Update product stock API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get product categories
  getProductCategories: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/categories`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get product categories API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Create product category
  createProductCategory: async (categoryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/categories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Create product category API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Update product category
  updateProductCategory: async (categoryId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/categories/${categoryId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Update product category API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Delete product category
  deleteProductCategory: async (categoryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/categories/${categoryId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Delete product category API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get stock alerts
  getStockAlerts: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/inventory/stock-alerts?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get stock alerts API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Create stock alert
  createStockAlert: async (alertData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/stock-alerts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(alertData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Create stock alert API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Update stock alert
  updateStockAlert: async (alertId, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/stock-alerts/${alertId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Update stock alert API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get inventory movements
  getInventoryMovements: async (productId = null, params = {}) => {
    try {
      const url = productId 
        ? `${API_BASE_URL}/inventory/products/${productId}/movements`
        : `${API_BASE_URL}/inventory/movements`;
      
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${url}?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get inventory movements API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Add inventory movement
  addInventoryMovement: async (movementData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/movements`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(movementData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Add inventory movement API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get inventory statistics
  getInventoryStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/stats`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get inventory stats API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Search products
  searchProducts: async (searchTerm, filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm,
        ...filters
      });
      
      const response = await fetch(`${API_BASE_URL}/inventory/products/search?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Search products API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Bulk update products
  bulkUpdateProducts: async (updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/products/bulk-update`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Bulk update products API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Import products
  importProducts: async (importData) => {
    try {
      const formData = new FormData();
      Object.keys(importData).forEach(key => {
        formData.append(key, importData[key]);
      });

      const response = await fetch(`${API_BASE_URL}/inventory/products/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenService.getToken()}`
        },
        body: formData,
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Import products API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Export products
  exportProducts: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/inventory/products/export?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      return {
        success: true,
        data: blob,
        message: 'Products exported successfully'
      };
    } catch (error) {
      console.error('Export products API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }
};

export default inventoryAPI;