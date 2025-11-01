/**
 * API Configuration
 * Centralized configuration for all API endpoints and services
 */

import { ConfigHelpers } from './appConfig';

/**
 * API Base Configuration
 */
export const API_CONFIG = {
  // Base URLs for different environments
  BASE_URLS: {
    DEVELOPMENT: 'http://localhost:3001/api/v1',
    STAGING: 'https://staging-api.procurementpro.com/api/v1',
    DEMO: 'https://demo-api.procurementpro.com/api/v1',
    PRODUCTION: 'https://api.procurementpro.com/api/v1',
  },

  // WebSocket URLs
  WS_URLS: {
    DEVELOPMENT: 'ws://localhost:3001/ws',
    STAGING: 'wss://staging-api.procurementpro.com/ws',
    DEMO: 'wss://demo-api.procurementpro.com/ws',
    PRODUCTION: 'wss://api.procurementpro.com/ws',
  },

  // API Version
  VERSION: 'v1',
  API_VERSION_HEADER: 'X-API-Version',

  // Default Request Configuration
  REQUEST: {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  },

  // Authentication Configuration
  AUTH: {
    TOKEN_HEADER: 'Authorization',
    TOKEN_PREFIX: 'Bearer',
    REFRESH_TOKEN_ENDPOINT: '/auth/refresh',
    LOGOUT_ENDPOINT: '/auth/logout',
    TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes before expiry
  },

  // Rate Limiting Configuration
  RATE_LIMITING: {
    ENABLED: true,
    MAX_REQUESTS: 100,
    TIME_WINDOW: 15 * 60 * 1000, // 15 minutes
    RETRY_AFTER_HEADER: 'Retry-After',
  },

  // CORS Configuration
  CORS: {
    ALLOWED_ORIGINS: [
      'http://localhost:3000',
      'https://staging.procurementpro.com',
      'https://demo.procurementpro.com',
      'https://procurementpro.com',
    ],
    ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    ALLOWED_HEADERS: [
      'Content-Type',
      'Authorization',
      'X-API-Version',
      'X-Requested-With',
    ],
  },
};

/**
 * API Endpoints Configuration
 */
export const API_ENDPOINTS = {
  // Authentication Endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    VERIFY_TOKEN: '/auth/verify',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    PROFILE: '/auth/profile',
    PREFERENCES: '/auth/preferences',
  },

  // User Management Endpoints
  USERS: {
    BASE: '/users',
    LIST: '/users',
    CREATE: '/users',
    DETAIL: '/users/:id',
    UPDATE: '/users/:id',
    DELETE: '/users/:id',
    ROLES: '/users/:id/roles',
    PERMISSIONS: '/users/:id/permissions',
    ACTIVITY: '/users/:id/activity',
    AVATAR: '/users/:id/avatar',
  },

  // Procurement Endpoints
  PROCUREMENT: {
    // Purchase Orders
    PURCHASE_ORDERS: {
      BASE: '/purchase-orders',
      LIST: '/purchase-orders',
      CREATE: '/purchase-orders',
      DETAIL: '/purchase-orders/:id',
      UPDATE: '/purchase-orders/:id',
      DELETE: '/purchase-orders/:id',
      APPROVE: '/purchase-orders/:id/approve',
      REJECT: '/purchase-orders/:id/reject',
      CANCEL: '/purchase-orders/:id/cancel',
      ITEMS: '/purchase-orders/:id/items',
      HISTORY: '/purchase-orders/:id/history',
      DOCUMENTS: '/purchase-orders/:id/documents',
      STATS: '/purchase-orders/stats',
      SEARCH: '/purchase-orders/search',
    },

    // Requisitions
    REQUISITIONS: {
      BASE: '/requisitions',
      LIST: '/requisitions',
      CREATE: '/requisitions',
      DETAIL: '/requisitions/:id',
      UPDATE: '/requisitions/:id',
      DELETE: '/requisitions/:id',
      APPROVE: '/requisitions/:id/approve',
      REJECT: '/requisitions/:id/reject',
      CONVERT_TO_PO: '/requisitions/:id/convert-to-po',
      ITEMS: '/requisitions/:id/items',
    },

    // RFQ Management
    RFQS: {
      BASE: '/rfqs',
      LIST: '/rfqs',
      CREATE: '/rfqs',
      DETAIL: '/rfqs/:id',
      UPDATE: '/rfqs/:id',
      DELETE: '/rfqs/:id',
      PUBLISH: '/rfqs/:id/publish',
      CLOSE: '/rfqs/:id/close',
      RESPONSES: '/rfqs/:id/responses',
      EVALUATE: '/rfqs/:id/evaluate',
      AWARD: '/rfqs/:id/award',
    },
  },

  // Supplier Management Endpoints
  SUPPLIERS: {
    BASE: '/suppliers',
    LIST: '/suppliers',
    CREATE: '/suppliers',
    DETAIL: '/suppliers/:id',
    UPDATE: '/suppliers/:id',
    DELETE: '/suppliers/:id',
    APPROVE: '/suppliers/:id/approve',
    SUSPEND: '/suppliers/:id/suspend',
    ACTIVATE: '/suppliers/:id/activate',
    PERFORMANCE: '/suppliers/:id/performance',
    RATING: '/suppliers/:id/rating',
    DOCUMENTS: '/suppliers/:id/documents',
    CATEGORIES: '/suppliers/categories',
    SEARCH: '/suppliers/search',
    STATS: '/suppliers/stats',
  },

  // Inventory Management Endpoints
  INVENTORY: {
    // Products
    PRODUCTS: {
      BASE: '/inventory/products',
      LIST: '/inventory/products',
      CREATE: '/inventory/products',
      DETAIL: '/inventory/products/:id',
      UPDATE: '/inventory/products/:id',
      DELETE: '/inventory/products/:id',
      STOCK: '/inventory/products/:id/stock',
      MOVEMENTS: '/inventory/products/:id/movements',
      BULK_UPDATE: '/inventory/products/bulk-update',
      IMPORT: '/inventory/products/import',
      EXPORT: '/inventory/products/export',
      SEARCH: '/inventory/products/search',
    },

    // Categories
    CATEGORIES: {
      BASE: '/inventory/categories',
      LIST: '/inventory/categories',
      CREATE: '/inventory/categories',
      DETAIL: '/inventory/categories/:id',
      UPDATE: '/inventory/categories/:id',
      DELETE: '/inventory/categories/:id',
    },

    // Stock Management
    STOCK: {
      ALERTS: '/inventory/stock-alerts',
      MOVEMENTS: '/inventory/movements',
      ADJUSTMENTS: '/inventory/adjustments',
      TRANSFERS: '/inventory/transfers',
    },

    // Inventory Analytics
    ANALYTICS: {
      STATS: '/inventory/stats',
      TRENDS: '/inventory/trends',
      FORECAST: '/inventory/forecast',
    },
  },

  // Bidding Management Endpoints
  BIDDING: {
    // Bids
    BIDS: {
      BASE: '/bidding/bids',
      LIST: '/bidding/bids',
      CREATE: '/bidding/bids',
      DETAIL: '/bidding/bids/:id',
      UPDATE: '/bidding/bids/:id',
      DELETE: '/bidding/bids/:id',
      SUBMIT: '/bidding/bids/:id/submit',
      APPROVE: '/bidding/bids/:id/approve',
      REJECT: '/bidding/bids/:id/reject',
      CANCEL: '/bidding/bids/:id/cancel',
      AWARD: '/bidding/bids/:id/award',
      RESPONSES: '/bidding/bids/:id/responses',
      EVALUATE: '/bidding/bids/:id/evaluate',
      DOCUMENTS: '/bidding/bids/:id/documents',
      HISTORY: '/bidding/bids/:id/history',
    },

    // Bid Responses
    RESPONSES: {
      BASE: '/bidding/responses',
      CREATE: '/bidding/responses',
      DETAIL: '/bidding/responses/:id',
      UPDATE: '/bidding/responses/:id',
      DELETE: '/bidding/responses/:id',
      EVALUATE: '/bidding/responses/:id/evaluate',
    },

    // Bid Templates
    TEMPLATES: {
      BASE: '/bidding/templates',
      LIST: '/bidding/templates',
      CREATE: '/bidding/templates',
      DETAIL: '/bidding/templates/:id',
      UPDATE: '/bidding/templates/:id',
      DELETE: '/bidding/templates/:id',
    },
  },

  // Reports and Analytics Endpoints
  REPORTS: {
    BASE: '/reports',
    PROCUREMENT: '/reports/procurement',
    SUPPLIER: '/reports/supplier',
    INVENTORY: '/reports/inventory',
    BIDDING: '/reports/bidding',
    FINANCIAL: '/reports/financial',
    ANALYTICS: '/reports/analytics',
    CUSTOM: '/reports/custom',
    EXPORT: '/reports/export',
    TEMPLATES: '/reports/templates',
    HISTORY: '/reports/history',
  },

  // Document Management Endpoints
  DOCUMENTS: {
    BASE: '/documents',
    UPLOAD: '/documents/upload',
    DOWNLOAD: '/documents/:id/download',
    DETAIL: '/documents/:id',
    UPDATE: '/documents/:id',
    DELETE: '/documents/:id',
    SHARE: '/documents/:id/share',
    VERSIONS: '/documents/:id/versions',
  },

  // Notification Endpoints
  NOTIFICATIONS: {
    BASE: '/notifications',
    LIST: '/notifications',
    MARK_READ: '/notifications/:id/read',
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: '/notifications/:id',
    PREFERENCES: '/notifications/preferences',
    TEMPLATES: '/notifications/templates',
  },

  // System Administration Endpoints
  ADMIN: {
    // System Settings
    SETTINGS: {
      BASE: '/admin/settings',
      GENERAL: '/admin/settings/general',
      SECURITY: '/admin/settings/security',
      NOTIFICATIONS: '/admin/settings/notifications',
      INTEGRATIONS: '/admin/settings/integrations',
    },

    // User Management
    USER_MANAGEMENT: {
      ROLES: '/admin/roles',
      PERMISSIONS: '/admin/permissions',
      AUDIT_LOGS: '/admin/audit-logs',
    },

    // System Health
    SYSTEM: {
      HEALTH: '/admin/health',
      METRICS: '/admin/metrics',
      LOGS: '/admin/logs',
      BACKUP: '/admin/backup',
      RESTORE: '/admin/restore',
    },
  },

  // File Upload Endpoints
  UPLOAD: {
    SINGLE: '/upload/single',
    MULTIPLE: '/upload/multiple',
    CHUNK: '/upload/chunk',
    COMPLETE: '/upload/complete',
    CANCEL: '/upload/cancel',
  },
};

/**
 * API Response Configuration
 */
export const API_RESPONSE_CONFIG = {
  // Standard Response Format
  RESPONSE_FORMAT: {
    SUCCESS: 'success',
    ERROR: 'error',
    DATA: 'data',
    MESSAGE: 'message',
    PAGINATION: 'pagination',
    META: 'meta',
  },

  // Standard Error Codes
  ERROR_CODES: {
    // HTTP Status Code Mappings
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    VALIDATION_ERROR: 422,
    TOO_MANY_REQUESTS: 429,
    SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,

    // Application Specific Error Codes
    INVALID_TOKEN: 'INVALID_TOKEN',
    EXPIRED_TOKEN: 'EXPIRED_TOKEN',
    INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
    DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    MAINTENANCE_MODE: 'MAINTENANCE_MODE',
  },

  // Pagination Configuration
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    PAGE_PARAM: 'page',
    LIMIT_PARAM: 'limit',
    SORT_PARAM: 'sort',
    FILTER_PARAM: 'filter',
    SEARCH_PARAM: 'search',
  },
};

/**
 * API Service Configuration
 */
export const API_SERVICE_CONFIG = {
  // Request Interceptors
  REQUEST_INTERCEPTORS: [
    {
      name: 'auth',
      priority: 1,
    },
    {
      name: 'logging',
      priority: 2,
    },
    {
      name: 'caching',
      priority: 3,
    },
  ],

  // Response Interceptors
  RESPONSE_INTERCEPTORS: [
    {
      name: 'error-handling',
      priority: 1,
    },
    {
      name: 'logging',
      priority: 2,
    },
    {
      name: 'caching',
      priority: 3,
    },
  ],

  // Cache Configuration
  CACHE: {
    ENABLED: true,
    STRATEGIES: {
      MEMORY: 'memory',
      LOCAL_STORAGE: 'localStorage',
      SESSION_STORAGE: 'sessionStorage',
      INDEXED_DB: 'indexedDB',
    },
    DEFAULT_STRATEGY: 'memory',
    TTL: {
      SHORT: 5 * 60 * 1000, // 5 minutes
      MEDIUM: 30 * 60 * 1000, // 30 minutes
      LONG: 2 * 60 * 60 * 1000, // 2 hours
    },
  },

  // Retry Configuration
  RETRY: {
    ENABLED: true,
    MAX_ATTEMPTS: 3,
    BASE_DELAY: 1000,
    MAX_DELAY: 10000,
    BACKOFF_MULTIPLIER: 2,
    RETRYABLE_STATUS_CODES: [408, 429, 500, 502, 503, 504],
  },

  // Timeout Configuration
  TIMEOUT: {
    DEFAULT: 30000,
    UPLOAD: 120000,
    DOWNLOAD: 60000,
    WEBSOCKET: 30000,
  },
};

/**
 * WebSocket Configuration
 */
export const WS_CONFIG = {
  // Connection Settings
  CONNECTION: {
    RECONNECT_ATTEMPTS: 5,
    RECONNECT_DELAY: 1000,
    HEARTBEAT_INTERVAL: 30000,
    HEARTBEAT_TIMEOUT: 5000,
  },

  // Event Types
  EVENTS: {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    ERROR: 'error',
    MESSAGE: 'message',
    NOTIFICATION: 'notification',
    UPDATE: 'update',
    HEARTBEAT: 'heartbeat',
  },

  // Channels
  CHANNELS: {
    NOTIFICATIONS: 'notifications',
    UPDATES: 'updates',
    BIDDING: 'bidding',
    PROCUREMENT: 'procurement',
    INVENTORY: 'inventory',
  },
};

/**
 * API Configuration Helper Functions
 */
export const ApiConfigHelpers = {
  // Get base URL for current environment
  getBaseUrl: () => {
    const environment = ConfigHelpers.isDevelopment() ? 'DEVELOPMENT' : 
                       ConfigHelpers.isProduction() ? 'PRODUCTION' : 'STAGING';
    
    return API_CONFIG.BASE_URLS[environment] || API_CONFIG.BASE_URLS.PRODUCTION;
  },

  // Get WebSocket URL for current environment
  getWebSocketUrl: () => {
    const environment = ConfigHelpers.isDevelopment() ? 'DEVELOPMENT' : 
                       ConfigHelpers.isProduction() ? 'PRODUCTION' : 'STAGING';
    
    return API_CONFIG.WS_URLS[environment] || API_CONFIG.WS_URLS.PRODUCTION;
  },

  // Build complete endpoint URL
  buildUrl: (endpoint, params = {}) => {
    const baseUrl = ApiConfigHelpers.getBaseUrl();
    let url = `${baseUrl}${endpoint}`;
    
    // Replace path parameters
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, encodeURIComponent(params[key]));
    });
    
    return url;
  },

  // Build URL with query parameters
  buildUrlWithQuery: (endpoint, queryParams = {}) => {
    const baseUrl = ApiConfigHelpers.buildUrl(endpoint);
    const queryString = new URLSearchParams();
    
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] !== undefined && queryParams[key] !== null) {
        queryString.append(key, queryParams[key]);
      }
    });
    
    const query = queryString.toString();
    return query ? `${baseUrl}?${query}` : baseUrl;
  },

  // Get endpoint by path
  getEndpoint: (path) => {
    const paths = path.split('.');
    let endpoint = API_ENDPOINTS;
    
    for (const path of paths) {
      if (endpoint[path] === undefined) {
        throw new Error(`Endpoint not found: ${path}`);
      }
      endpoint = endpoint[path];
    }
    
    return endpoint;
  },

  // Check if endpoint requires authentication
  requiresAuth: (endpoint) => {
    const publicEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/refresh',
    ];
    
    return !publicEndpoints.some(publicEndpoint => 
      endpoint.startsWith(publicEndpoint)
    );
  },

  // Get timeout for specific endpoint type
  getTimeout: (endpoint, method = 'GET') => {
    if (endpoint.includes('/upload') || method === 'POST' && endpoint.includes('/documents')) {
      return API_SERVICE_CONFIG.TIMEOUT.UPLOAD;
    }
    
    if (endpoint.includes('/download') || method === 'GET' && endpoint.includes('/export')) {
      return API_SERVICE_CONFIG.TIMEOUT.DOWNLOAD;
    }
    
    return API_SERVICE_CONFIG.TIMEOUT.DEFAULT;
  },

  // Validate API response
  validateResponse: (response) => {
    if (!response || typeof response !== 'object') {
      return {
        isValid: false,
        error: 'Invalid response format',
      };
    }
    
    const { success, data, message, error } = response;
    
    if (success === false) {
      return {
        isValid: false,
        error: error || message || 'Unknown error occurred',
        data: null,
      };
    }
    
    return {
      isValid: true,
      data: data || null,
      message: message || null,
    };
  },

  // Get pagination parameters
  getPaginationParams: (page = 1, limit = 10, sort = null, filters = {}) => {
    const params = {
      [API_RESPONSE_CONFIG.PAGINATION.PAGE_PARAM]: page,
      [API_RESPONSE_CONFIG.PAGINATION.LIMIT_PARAM]: Math.min(
        limit, 
        API_RESPONSE_CONFIG.PAGINATION.MAX_LIMIT
      ),
    };
    
    if (sort) {
      params[API_RESPONSE_CONFIG.PAGINATION.SORT_PARAM] = sort;
    }
    
    if (Object.keys(filters).length > 0) {
      params[API_RESPONSE_CONFIG.PAGINATION.FILTER_PARAM] = JSON.stringify(filters);
    }
    
    return params;
  },

  // Parse pagination response
  parsePaginationResponse: (response) => {
    const pagination = response[API_RESPONSE_CONFIG.RESPONSE_FORMAT.PAGINATION];
    
    if (!pagination) {
      return {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasNext: false,
        hasPrev: false,
      };
    }
    
    return {
      currentPage: pagination.currentPage || 1,
      totalPages: pagination.totalPages || 1,
      totalItems: pagination.totalItems || 0,
      hasNext: pagination.hasNext || false,
      hasPrev: pagination.hasPrev || false,
      itemsPerPage: pagination.itemsPerPage || 10,
    };
  },

  // Get cache key for endpoint
  getCacheKey: (endpoint, params = {}) => {
    const keyParts = [endpoint];
    
    Object.keys(params)
      .sort()
      .forEach(key => {
        keyParts.push(`${key}=${JSON.stringify(params[key])}`);
      });
    
    return keyParts.join('|');
  },

  // Check if request should be cached
  shouldCache: (method, endpoint) => {
    if (method !== 'GET') return false;
    
    const nonCacheableEndpoints = [
      '/auth/',
      '/notifications',
      '/admin/',
    ];
    
    return !nonCacheableEndpoints.some(prefix => endpoint.startsWith(prefix));
  },
};

// Freeze configurations to prevent accidental modifications
Object.freeze(API_CONFIG);
Object.freeze(API_ENDPOINTS);
Object.freeze(API_RESPONSE_CONFIG);
Object.freeze(API_SERVICE_CONFIG);
Object.freeze(WS_CONFIG);

export default API_CONFIG;
export const apiConfig = API_CONFIG;