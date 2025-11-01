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

export const reportsAPI = {
  // Procurement Reports
  getProcurementReports: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/reports/procurement?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get procurement reports API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Supplier Reports
  getSupplierReports: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/reports/suppliers?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get supplier reports API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Inventory Reports
  getInventoryReports: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/reports/inventory?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get inventory reports API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Bidding Reports
  getBiddingReports: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/reports/bidding?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get bidding reports API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Financial Reports
  getFinancialReports: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/reports/financial?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get financial reports API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Analytics Dashboard Data
  getAnalyticsDashboard: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/reports/analytics/dashboard?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get analytics dashboard API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Procurement Analytics
  getProcurementAnalytics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/reports/analytics/procurement?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get procurement analytics API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Supplier Performance Analytics
  getSupplierAnalytics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/reports/analytics/suppliers?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get supplier analytics API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Inventory Analytics
  getInventoryAnalytics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/reports/analytics/inventory?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get inventory analytics API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Bidding Analytics
  getBiddingAnalytics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/reports/analytics/bidding?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get bidding analytics API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Cost Savings Analysis
  getCostSavingsAnalysis: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/reports/analytics/cost-savings?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get cost savings analysis API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Spend Analysis
  getSpendAnalysis: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/reports/analytics/spend?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get spend analysis API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Generate Custom Report
  generateCustomReport: async (reportConfig) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/custom/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(reportConfig),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Generate custom report API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Export Report
  exportReport: async (reportType, format = 'pdf', params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        format,
        ...params
      });
      
      const response = await fetch(`${API_BASE_URL}/reports/export/${reportType}?${queryParams}`, {
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
        message: 'Report exported successfully'
      };
    } catch (error) {
      console.error('Export report API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get Report Templates
  getReportTemplates: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/templates`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get report templates API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Save Report Template
  saveReportTemplate: async (templateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/templates`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(templateData),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Save report template API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get Report History
  getReportHistory: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/reports/history?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get report history API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get Real-time Metrics
  getRealTimeMetrics: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/metrics/real-time`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get real-time metrics API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get KPI Dashboard
  getKPIDashboard: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/reports/kpi-dashboard?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get KPI dashboard API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get Compliance Reports
  getComplianceReports: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`${API_BASE_URL}/reports/compliance?${queryParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get compliance reports API error:', error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }
};

export default reportsAPI;