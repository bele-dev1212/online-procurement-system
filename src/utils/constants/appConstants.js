/**
 * Application-wide Constants
 * Centralized configuration for the procurement system
 */

// Application Configuration
export const APP_CONFIG = {
  // App Information
  APP_NAME: 'ProcurementPro',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Enterprise Procurement and Supplier Management System',
  
  // Company Information
  COMPANY: {
    NAME: 'ProcurementPro Inc.',
    ADDRESS: '123 Business Ave, Suite 100',
    CITY: 'San Francisco',
    STATE: 'CA',
    ZIP_CODE: '94105',
    COUNTRY: 'USA',
    PHONE: '+1 (555) 123-4567',
    EMAIL: 'support@procurementpro.com',
    WEBSITE: 'https://procurementpro.com'
  },
  
  // API Configuration
  API: {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZES: [10, 25, 50, 100],
    MAX_PAGE_SIZE: 500,
  },
  
  // File Upload
  FILES: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_EXTENSIONS: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'],
    MAX_FILES_PER_UPLOAD: 5,
  },
  
  // Notifications
  NOTIFICATIONS: {
    AUTO_HIDE_DURATION: 5000, // 5 seconds
    MAX_VISIBLE: 5,
    STORAGE_KEY: 'procurement_notifications',
  },
  
  // Session Management
  SESSION: {
    TIMEOUT: 60 * 60 * 1000, // 60 minutes
    WARNING_TIME: 5 * 60 * 1000, // 5 minutes before timeout
    REFRESH_INTERVAL: 30 * 60 * 1000, // 30 minutes
  },
  
  // Feature Flags
  FEATURES: {
    BIDDING_MODULE: true,
    INVENTORY_MODULE: true,
    REPORTING_MODULE: true,
    MULTI_TENANCY: false,
    REAL_TIME_UPDATES: true,
    OFFLINE_MODE: false,
    ADVANCED_ANALYTICS: true,
  },
  
  // UI/UX Configuration
  UI: {
    THEME: {
      PRIMARY: '#2563eb',
      SECONDARY: '#64748b',
      SUCCESS: '#10b981',
      WARNING: '#f59e0b',
      ERROR: '#ef4444',
      INFO: '#3b82f6',
    },
    ANIMATION: {
      DURATION: 300,
      EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    BREAKPOINTS: {
      XS: 0,
      SM: 640,
      MD: 768,
      LG: 1024,
      XL: 1280,
      XXL: 1536,
    },
  },
};

// Procurement-specific Constants
export const PROCUREMENT_CONSTANTS = {
  // Purchase Order Status
  PURCHASE_ORDER_STATUS: {
    DRAFT: 'draft',
    PENDING_APPROVAL: 'pending_approval',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    ORDERED: 'ordered',
    PARTIALLY_RECEIVED: 'partially_received',
    RECEIVED: 'received',
    CANCELLED: 'cancelled',
    CLOSED: 'closed',
  },
  
  // Requisition Status
  REQUISITION_STATUS: {
    DRAFT: 'draft',
    SUBMITTED: 'submitted',
    UNDER_REVIEW: 'under_review',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CONVERTED_TO_PO: 'converted_to_po',
    CANCELLED: 'cancelled',
  },
  
  // RFQ Status
  RFQ_STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    OPEN: 'open',
    UNDER_EVALUATION: 'under_evaluation',
    AWARDED: 'awarded',
    CANCELLED: 'cancelled',
    CLOSED: 'closed',
  },
  
  // Approval Workflow
  APPROVAL_WORKFLOW: {
    LEVELS: {
      MANAGER: 'manager',
      DIRECTOR: 'director',
      VP: 'vp',
      FINANCE: 'finance',
    },
    THRESHOLDS: {
      MANAGER: 10000, // $10,000
      DIRECTOR: 50000, // $50,000
      VP: 100000, // $100,000
      FINANCE: 250000, // $250,000
    },
  },
  
  // Currency
  CURRENCY: {
    DEFAULT: 'USD',
    SYMBOL: '$',
    DECIMAL_PLACES: 2,
    SUPPORTED: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
  },
  
  // Units of Measurement
  UNITS: {
    PIECE: 'piece',
    KILOGRAM: 'kg',
    GRAM: 'g',
    LITER: 'l',
    MILLILITER: 'ml',
    METER: 'm',
    CENTIMETER: 'cm',
    SQUARE_METER: 'm²',
    CUBIC_METER: 'm³',
    HOUR: 'hour',
    DAY: 'day',
  },
};

// Inventory Constants
export const INVENTORY_CONSTANTS = {
  // Product Status
  PRODUCT_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    DISCONTINUED: 'discontinued',
    OUT_OF_STOCK: 'out_of_stock',
  },
  
  // Stock Movement Types
  MOVEMENT_TYPES: {
    PURCHASE: 'purchase',
    SALE: 'sale',
    RETURN: 'return',
    ADJUSTMENT: 'adjustment',
    TRANSFER: 'transfer',
    DAMAGE: 'damage',
    EXPIRY: 'expiry',
  },
  
  // Stock Alert Levels
  ALERT_LEVELS: {
    LOW: 'low',
    CRITICAL: 'critical',
    OUT_OF_STOCK: 'out_of_stock',
    OVERSTOCK: 'overstock',
  },
  
  // Reorder Point Calculation
  REORDER_POINT: {
    SAFETY_STOCK_DAYS: 7,
    LEAD_TIME_DAYS: 14,
    DEFAULT_THRESHOLD: 0.2, // 20% of max stock
  },
};

// Bidding Constants
export const BIDDING_CONSTANTS = {
  // Bid Status
  BID_STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    OPEN: 'open',
    UNDER_EVALUATION: 'under_evaluation',
    AWARDED: 'awarded',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
  },
  
  // Bid Types
  BID_TYPES: {
    OPEN_TENDER: 'open_tender',
    LIMITED_TENDER: 'limited_tender',
    SINGLE_SOURCE: 'single_source',
    REQUEST_FOR_PROPOSAL: 'request_for_proposal',
    REQUEST_FOR_QUOTATION: 'request_for_quotation',
  },
  
  // Evaluation Criteria
  EVALUATION_CRITERIA: {
    PRICE: 'price',
    QUALITY: 'quality',
    DELIVERY_TIME: 'delivery_time',
    TECHNICAL_SPECS: 'technical_specs',
    PAST_PERFORMANCE: 'past_performance',
    FINANCIAL_STABILITY: 'financial_stability',
  },
  
  // Bid Document Types
  DOCUMENT_TYPES: {
    TECHNICAL_PROPOSAL: 'technical_proposal',
    FINANCIAL_PROPOSAL: 'financial_proposal',
    COMPANY_PROFILE: 'company_profile',
    CERTIFICATES: 'certificates',
    BID_BOND: 'bid_bond',
    OTHER: 'other',
  },
};

// Supplier Constants
export const SUPPLIER_CONSTANTS = {
  // Supplier Status
  SUPPLIER_STATUS: {
    PENDING: 'pending',
    ACTIVE: 'active',
    SUSPENDED: 'suspended',
    BLACKLISTED: 'blacklisted',
    INACTIVE: 'inactive',
  },
  
  // Supplier Categories
  CATEGORIES: {
    RAW_MATERIALS: 'raw_materials',
    MANUFACTURING: 'manufacturing',
    SERVICES: 'services',
    LOGISTICS: 'logistics',
    TECHNOLOGY: 'technology',
    CONSULTING: 'consulting',
    OTHER: 'other',
  },
  
  // Performance Ratings
  PERFORMANCE_RATINGS: {
    EXCELLENT: 5,
    GOOD: 4,
    AVERAGE: 3,
    POOR: 2,
    VERY_POOR: 1,
  },
  
  // Risk Levels
  RISK_LEVELS: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  },
};

// Notification Constants
export const NOTIFICATION_CONSTANTS = {
  // Notification Types
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    ALERT: 'alert',
  },
  
  // Notification Categories
  CATEGORIES: {
    SYSTEM: 'system',
    PROCUREMENT: 'procurement',
    INVENTORY: 'inventory',
    BIDDING: 'bidding',
    SUPPLIER: 'supplier',
    SECURITY: 'security',
  },
  
  // Priority Levels
  PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  },
  
  // Delivery Channels
  CHANNELS: {
    IN_APP: 'in_app',
    EMAIL: 'email',
    SMS: 'sms',
    PUSH: 'push',
  },
};

// Date and Time Constants
export const DATE_CONSTANTS = {
  // Date Formats
  FORMATS: {
    DISPLAY: 'MMM DD, YYYY',
    DISPLAY_WITH_TIME: 'MMM DD, YYYY hh:mm A',
    DATABASE: 'YYYY-MM-DD',
    DATABASE_WITH_TIME: 'YYYY-MM-DD HH:mm:ss',
    TIME_ONLY: 'hh:mm A',
    SHORT: 'MM/DD/YY',
  },
  
  // Time Zones
  TIMEZONES: {
    UTC: 'UTC',
    EST: 'America/New_York',
    PST: 'America/Los_Angeles',
    GMT: 'Europe/London',
    CET: 'Europe/Paris',
  },
  
  // Business Hours
  BUSINESS_HOURS: {
    START: '09:00',
    END: '17:00',
    TIMEZONE: 'America/New_York',
  },
};

// Validation Constants
export const VALIDATION_CONSTANTS = {
  // Email Validation
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MAX_LENGTH: 254,
  },
  
  // Phone Validation
  PHONE: {
    PATTERN: /^\+?[\d\s\-\\(\\)]{10,}$/,
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
  },
  
  // Password Validation
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: true,
  },
  
  // Text Length Limits
  TEXT_LIMITS: {
    TITLE: 100,
    DESCRIPTION: 1000,
    NAME: 50,
    ADDRESS: 200,
    NOTES: 5000,
  },
};

// Export Constants
export const EXPORT_CONSTANTS = {
  // File Formats
  FORMATS: {
    PDF: 'pdf',
    EXCEL: 'excel',
    CSV: 'csv',
    JSON: 'json',
  },
  
  // Export Types
  TYPES: {
    PURCHASE_ORDERS: 'purchase_orders',
    SUPPLIERS: 'suppliers',
    INVENTORY: 'inventory',
    BIDS: 'bids',
    REPORTS: 'reports',
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'procurement_auth_token',
  REFRESH_TOKEN: 'procurement_refresh_token',
  USER_DATA: 'procurement_user_data',
  USER_PREFERENCES: 'procurement_user_preferences',
  CART_DATA: 'procurement_cart_data',
  RECENT_SEARCHES: 'procurement_recent_searches',
  NOTIFICATIONS: 'procurement_notifications',
  THEME: 'procurement_theme',
  LANGUAGE: 'procurement_language',
};

// Error Codes and Messages
export const ERROR_CONSTANTS = {
  // HTTP Error Codes
  HTTP: {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    VALIDATION_ERROR: 422,
    SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },
  
  // Application Error Codes
  CODES: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTH_ERROR: 'AUTH_ERROR',
    PERMISSION_ERROR: 'PERMISSION_ERROR',
    NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
    DUPLICATE_ERROR: 'DUPLICATE_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
  },
  
  // Default Error Messages
  MESSAGES: {
    NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
    TIMEOUT_ERROR: 'Request timeout. Please try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FORBIDDEN: 'Access forbidden. You do not have permission.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    UNKNOWN_ERROR: 'An unexpected error occurred.',
  },
};

// Utility Functions
export const AppUtils = {
  // Get display text for constants
  getDisplayText: (constantValue, constantObject) => {
    const entry = Object.entries(constantObject).find(([, value]) => value === constantValue);
    return entry ? entry[0].split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ') : constantValue;
  },
  
  // Format currency
  formatCurrency: (amount, currency = PROCUREMENT_CONSTANTS.CURRENCY.DEFAULT) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: PROCUREMENT_CONSTANTS.CURRENCY.DECIMAL_PLACES,
    }).format(amount);
  },
  
  // Get status color
  getStatusColor: (status) => {
    const statusMap = {
      draft: 'gray',
      pending_approval: 'orange',
      approved: 'green',
      rejected: 'red',
      active: 'green',
      inactive: 'gray',
      suspended: 'orange',
      blacklisted: 'red',
    };
    
    return statusMap[status] || 'gray';
  },
  
  // Check if feature is enabled
  isFeatureEnabled: (feature) => {
    return APP_CONFIG.FEATURES[feature] || false;
  },
};

export default APP_CONFIG;