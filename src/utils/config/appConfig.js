/**
 * Application Configuration
 * Centralized configuration for the entire procurement system
 */

// Environment detection
const getEnvironment = () => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  } else if (hostname.includes('staging') || hostname.includes('test')) {
    return 'staging';
  } else if (hostname.includes('demo')) {
    return 'demo';
  } else {
    return 'production';
  }
};

const ENVIRONMENT = getEnvironment();

/**
 * Core Application Configuration
 */
export const APP_CONFIG = {
  // Application Information
  APP: {
    NAME: 'ProcurementPro',
    VERSION: '1.0.0',
    DESCRIPTION: 'Enterprise Procurement and Supplier Management System',
  
   BUILD: import.meta.env.VITE_BUILD_VERSION || '1.0.0',
    ENVIRONMENT: ENVIRONMENT,
    
    // Company Information
    COMPANY: {
      NAME: 'ProcurementPro Inc.',
      LEGAL_NAME: 'ProcurementPro Technologies Inc.',
      ADDRESS: {
        STREET: '123 Business Avenue, Suite 100',
        CITY: 'San Francisco',
        STATE: 'CA',
        ZIP_CODE: '94105',
        COUNTRY: 'United States',
      },
      CONTACT: {
        PHONE: '+1 (555) 123-4567',
        EMAIL: 'support@procurementpro.com',
        SUPPORT_EMAIL: 'help@procurementpro.com',
        SALES_EMAIL: 'sales@procurementpro.com',
        WEBSITE: 'https://procurementpro.com',
      },
      SOCIAL: {
        LINKEDIN: 'https://linkedin.com/company/procurementpro',
        TWITTER: 'https://twitter.com/procurementpro',
        FACEBOOK: 'https://facebook.com/procurementpro',
      },
    },
  },

  // Environment-specific configurations
  ENVIRONMENTS: {
    DEVELOPMENT: {
      DEBUG: true,
      LOG_LEVEL: 'debug',
      ENABLE_DEV_TOOLS: true,
      MOCK_API: true,
      CONSOLE_WARNINGS: true,
    },
    STAGING: {
      DEBUG: true,
      LOG_LEVEL: 'info',
      ENABLE_DEV_TOOLS: true,
      MOCK_API: false,
      CONSOLE_WARNINGS: true,
    },
    DEMO: {
      DEBUG: false,
      LOG_LEVEL: 'warn',
      ENABLE_DEV_TOOLS: false,
      MOCK_API: false,
      CONSOLE_WARNINGS: false,
    },
    PRODUCTION: {
      DEBUG: false,
      LOG_LEVEL: 'error',
      ENABLE_DEV_TOOLS: false,
      MOCK_API: false,
      CONSOLE_WARNINGS: false,
    },
  },

  // Feature Flags - Control feature availability
  FEATURES: {
    // Module Toggles
    MODULES: {
      PROCUREMENT: true,
      INVENTORY: true,
      SUPPLIERS: true,
      BIDDING: true,
      REPORTING: true,
      ANALYTICS: true,
      DOCUMENT_MANAGEMENT: true,
      CONTRACT_MANAGEMENT: true,
    },
    
    // Advanced Features
    ADVANCED: {
      REAL_TIME_NOTIFICATIONS: true,
      OFFLINE_MODE: false,
      MULTI_TENANCY: false,
      WORKFLOW_ENGINE: true,
      APPROVAL_CHAINS: true,
      BULK_OPERATIONS: true,
      IMPORT_EXPORT: true,
      API_INTEGRATIONS: true,
      MOBILE_APP: false,
      DARK_MODE: true,
    },
    
    // Experimental Features
    EXPERIMENTAL: {
      AI_SUGGESTIONS: false,
      PREDICTIVE_ANALYTICS: false,
      CHATBOT_SUPPORT: false,
      VOICE_COMMANDS: false,
      BLOCKCHAIN_VERIFICATION: false,
    },
  },

  // UI/UX Configuration
  UI: {
    // Theme Configuration
    THEME: {
      PRIMARY: '#2563eb',
      SECONDARY: '#64748b',
      ACCENT: '#f59e0b',
      SUCCESS: '#10b981',
      WARNING: '#f59e0b',
      ERROR: '#ef4444',
      INFO: '#3b82f6',
      
      // Neutral Colors
      NEUTRAL: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
      },
      
      // Typography
      TYPOGRAPHY: {
        FONT_FAMILY: {
          PRIMARY: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          MONOSPACE: "'Fira Code', 'Courier New', monospace",
        },
        FONT_WEIGHTS: {
          LIGHT: 300,
          REGULAR: 400,
          MEDIUM: 500,
          SEMIBOLD: 600,
          BOLD: 700,
        },
        FONT_SIZES: {
          XS: '0.75rem',
          SM: '0.875rem',
          BASE: '1rem',
          LG: '1.125rem',
          XL: '1.25rem',
          '2XL': '1.5rem',
          '3XL': '1.875rem',
          '4XL': '2.25rem',
        },
      },
    },

    // Layout Configuration
    LAYOUT: {
      SIDEBAR: {
        WIDTH: 280,
        COLLAPSED_WIDTH: 80,
        BREAKPOINT: 'lg',
      },
      HEADER: {
        HEIGHT: 64,
        STICKY: true,
      },
      FOOTER: {
        HEIGHT: 60,
        VISIBLE: true,
      },
      CONTENT: {
        MAX_WIDTH: '1440px',
        PADDING: '2rem',
      },
    },

    // Responsive Breakpoints
    BREAKPOINTS: {
      XS: 0,
      SM: 640,
      MD: 768,
      LG: 1024,
      XL: 1280,
      XXL: 1536,
    },

    // Animation Configuration
    ANIMATION: {
      DURATION: {
        FAST: 150,
        NORMAL: 300,
        SLOW: 500,
      },
      EASING: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
        EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
        EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
        EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
        BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },

    // Component-specific configurations
    COMPONENTS: {
      TABLE: {
        DEFAULT_PAGE_SIZE: 10,
        PAGE_SIZES: [10, 25, 50, 100],
        SORTABLE: true,
        FILTERABLE: true,
        SELECTABLE: true,
        RESIZABLE: false,
      },
      FORM: {
        SHOW_VALIDATION_ON: ['submit', 'blur'], // 'change', 'blur', 'submit'
        AUTO_SAVE: false,
        AUTO_SAVE_DELAY: 1000,
      },
      MODAL: {
        CLOSE_ON_ESCAPE: true,
        CLOSE_ON_OUTSIDE_CLICK: true,
        PREVENT_SCROLL: true,
      },
    },
  },

  // Localization and Internationalization
  I18N: {
    DEFAULT_LOCALE: 'en-US',
    SUPPORTED_LOCALES: [
      { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
      { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
      { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
      { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
      { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
      { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
    ],
    CURRENCY: {
      DEFAULT: 'USD',
      SUPPORTED: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
    },
    TIMEZONE: {
      DEFAULT: 'America/New_York',
      SUPPORTED: [
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Asia/Tokyo',
        'Asia/Shanghai',
      ],
    },
    DATE_FORMAT: {
      DISPLAY: 'MMM DD, YYYY',
      DISPLAY_WITH_TIME: 'MMM DD, YYYY hh:mm A',
      DATABASE: 'YYYY-MM-DD',
      TIME_ONLY: 'hh:mm A',
    },
  },

  // Performance Configuration
  PERFORMANCE: {
    // Caching
    CACHE: {
      ENABLED: true,
      DURATION: {
        SHORT: 5 * 60 * 1000, // 5 minutes
        MEDIUM: 30 * 60 * 1000, // 30 minutes
        LONG: 2 * 60 * 60 * 1000, // 2 hours
        SESSION: 24 * 60 * 60 * 1000, // 24 hours
      },
      STRATEGY: 'memory-first', // 'memory-first', 'network-first', 'cache-first'
    },

    // Lazy Loading
    LAZY_LOADING: {
      ENABLED: true,
      THRESHOLD: 0.1, // Intersection Observer threshold
      ROOT_MARGIN: '50px',
    },

    // Bundle Optimization
    BUNDLE: {
      CHUNK_SIZE: 1024 * 1024, // 1MB
      PRELOAD_CRITICAL: true,
      COMPRESSION: true,
    },

    // Monitoring
    MONITORING: {
      ENABLE_PERFORMANCE_METRICS: true,
      SAMPLE_RATE: 0.1, // 10% of users
      LONG_TASK_THRESHOLD: 50, // milliseconds
    },
  },

  // Security Configuration
  SECURITY: {
    // Authentication
    AUTH: {
      SESSION_TIMEOUT: 60 * 60 * 1000, // 60 minutes
      SESSION_WARNING_TIME: 5 * 60 * 1000, // 5 minutes before timeout
      REFRESH_TOKEN_ENABLED: true,
      REFRESH_TOKEN_TIMEOUT: 7 * 24 * 60 * 60 * 1000, // 7 days
      MAX_LOGIN_ATTEMPTS: 5,
      LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
    },

    // Password Policy
    PASSWORD_POLICY: {
      MIN_LENGTH: 8,
      REQUIRE_UPPERCASE: true,
      REQUIRE_LOWERCASE: true,
      REQUIRE_NUMBERS: true,
      REQUIRE_SYMBOLS: true,
      MAX_AGE: 90 * 24 * 60 * 60 * 1000, // 90 days
      PREVENT_REUSE: 5, // Last 5 passwords
    },

    // Data Protection
    DATA_PROTECTION: {
      ENCRYPT_SENSITIVE_DATA: true,
      MASK_PII: true,
      AUTO_LOGOUT: true,
      SANITIZE_INPUT: true,
    },

    // Headers and CSP
    HEADERS: {
      CSP: {
        DEFAULT_SRC: ["'self'"],
        SCRIPT_SRC: ["'self'", "'unsafe-inline'"],
        STYLE_SRC: ["'self'", "'unsafe-inline'"],
        IMG_SRC: ["'self'", "data:", "https:"],
        CONNECT_SRC: ["'self'", "https://api.procurementpro.com"],
      },
    },
  },

  // Storage Configuration
  STORAGE: {
    LOCAL_STORAGE: {
      PREFIX: 'procurement_',

      ENCRYPTION_KEY: import.meta.env.REACT_APP_STORAGE_KEY || 'default-storage-key',
      QUOTA: 5 * 1024 * 1024, // 5MB
    },
    SESSION_STORAGE: {
      PREFIX: 'procurement_session_',

      ENCRYPTION_KEY: import.meta.env.REACT_APP_SESSION_KEY || 'default-session-key',
    },
    INDEXED_DB: {
      NAME: 'ProcurementDB',
      VERSION: 1,
      STORES: [
        { name: 'cache', keyPath: 'id', indexes: ['expiresAt'] },
        { name: 'offlineData', keyPath: 'id', indexes: ['type', 'timestamp'] },
        { name: 'attachments', keyPath: 'id', indexes: ['name', 'type'] },
      ],
    },
  },

  // Error Handling Configuration
  ERROR_HANDLING: {
    // Error Reporting
    REPORTING: {
      ENABLED: true,
      SERVICE: 'sentry', // 'sentry', 'logrocket', 'custom'
  
      DSN: import.meta.env.REACT_APP_SENTRY_DSN,
      ENVIRONMENT: ENVIRONMENT,
      SAMPLE_RATE: ENVIRONMENT === 'production' ? 0.1 : 1.0,
    },

    // Error Boundaries
    BOUNDARIES: {
      SHOW_FALLBACK_UI: true,
      LOG_ERRORS: true,
      AUTO_RELOAD: false,
    },

    // Network Error Handling
    NETWORK: {
      MAX_RETRIES: 3,
      RETRY_DELAY: 1000,
      TIMEOUT: 30000,
      OFFLINE_DETECTION: true,
    },
  },

  // Analytics and Tracking
  ANALYTICS: {
    // Google Analytics
    GOOGLE_ANALYTICS: {
      ENABLED: ENVIRONMENT === 'production',

      TRACKING_ID: import.meta.env.REACT_APP_GA_TRACKING_ID,
      ANONYMIZE_IP: true,
    },

    // Custom Analytics
    CUSTOM: {
      ENABLED: true,
      ENDPOINT: '/api/analytics',
      TRACK_PAGE_VIEWS: true,
      TRACK_USER_ACTIONS: true,
      TRACK_PERFORMANCE: true,
    },

    // Privacy Compliance
    PRIVACY: {
      RESPECT_DNT: true, // Do Not Track
      REQUIRE_CONSENT: true,
      COOKIE_CONSENT: true,
    },
  },

  // Third-party Integrations
  INTEGRATIONS: {
    // Payment Processors
    PAYMENT: {
      STRIPE: {
        ENABLED: true,

        PUBLIC_KEY: import.meta.env.REACT_APP_STRIPE_PUBLIC_KEY,
        CURRENCY: 'USD',
      },
      PAYPAL: {
        ENABLED: false,

        CLIENT_ID: import.meta.env.REACT_APP_PAYPAL_CLIENT_ID,
      },
    },

    // Document Processing
    DOCUMENT: {
      ADOBE_PDF: {
        ENABLED: true,

        CLIENT_ID: import.meta.env.REACT_APP_ADOBE_CLIENT_ID,
      },
      GOOGLE_DOCS: {
        ENABLED: false,

        API_KEY: import.meta.env.REACT_APP_GOOGLE_DOCS_API_KEY,
      },
    },

    // Communication
    COMMUNICATION: {
      EMAIL: {
        SERVICE: 'sendgrid', // 'sendgrid', 'mailgun', 'ses'
  
        API_KEY: import.meta.env.REACT_APP_EMAIL_API_KEY,
      },
      SMS: {
        SERVICE: 'twilio',

        ACCOUNT_SID: import.meta.env.REACT_APP_TWILIO_ACCOUNT_SID,

        AUTH_TOKEN: import.meta.env.REACT_APP_TWILIO_AUTH_TOKEN,
      },
    },

    // Cloud Storage
    CLOUD_STORAGE: {
      AWS_S3: {
        ENABLED: true,

        BUCKET: import.meta.env.REACT_APP_AWS_S3_BUCKET,

        REGION: import.meta.env.REACT_APP_AWS_REGION,
      },
      GOOGLE_CLOUD: {
        ENABLED: false,

        BUCKET: import.meta.env.REACT_APP_GCP_BUCKET,
      },
    },
  },

  // Business Rules and Limits
  BUSINESS_RULES: {
    // Procurement Limits
    PROCUREMENT: {
      MAX_PO_AMOUNT: 1000000, // $1,000,000
      MAX_LINE_ITEMS: 100,
      MAX_ATTACHMENTS: 10,
      APPROVAL_THRESHOLDS: {
        MANAGER: 10000,
        DIRECTOR: 50000,
        VP: 100000,
        FINANCE: 250000,
      },
    },

    // Inventory Limits
    INVENTORY: {
      MAX_STOCK_LEVEL: 100000,
      MIN_STOCK_LEVEL: 0,
      LOW_STOCK_THRESHOLD: 0.2, // 20% of max
      CRITICAL_STOCK_THRESHOLD: 0.1, // 10% of max
    },

    // Supplier Limits
    SUPPLIERS: {
      MAX_SUPPLIERS_PER_CATEGORY: 1000,
      MAX_CONTACTS_PER_SUPPLIER: 10,
      PERFORMANCE_REVIEW_INTERVAL: 90, // days
    },

    // Bidding Limits
    BIDDING: {
      MAX_BID_AMOUNT: 5000000, // $5,000,000
      MAX_BIDDERS_PER_RFQ: 50,
      BID_EVALUATION_DAYS: 30,
    },
  },
};

/**
 * Configuration Helper Functions
 */
export const ConfigHelpers = {
  // Get current environment configuration
  getEnvConfig: () => {
    return APP_CONFIG.ENVIRONMENTS[ENVIRONMENT.toUpperCase()] || APP_CONFIG.ENVIRONMENTS.PRODUCTION;
  },

  // Check if feature is enabled
  isFeatureEnabled: (featurePath) => {
    const paths = featurePath.split('.');
    let value = APP_CONFIG.FEATURES;
    
    for (const path of paths) {
      if (value[path] === undefined) {
        return false;
      }
      value = value[path];
    }
    
    return Boolean(value);
  },

  // Get configuration value with fallback
  getConfig: (path, defaultValue = null) => {
    const paths = path.split('.');
    let value = APP_CONFIG;
    
    for (const path of paths) {
      if (value[path] === undefined) {
        return defaultValue;
      }
      value = value[path];
    }
    
    return value;
  },

  // Check if running in development
  isDevelopment: () => ENVIRONMENT === 'development',

  // Check if running in production
  isProduction: () => ENVIRONMENT === 'production',

  // Check if debug mode is enabled
  isDebugEnabled: () => {
    const envConfig = ConfigHelpers.getEnvConfig();
    return envConfig.DEBUG || false;
  },

  // Get API base URL based on environment
  getApiBaseUrl: () => {
    const urls = {
      development: 'http://localhost:3001/api',
      staging: 'https://staging-api.procurementpro.com/api',
      demo: 'https://demo-api.procurementpro.com/api',
      production: 'https://api.procurementpro.com/api',
    };
    
    return urls[ENVIRONMENT] || urls.production;
  },

  // Get WebSocket URL based on environment
  getWebSocketUrl: () => {
    const urls = {
      development: 'ws://localhost:3001/ws',
      staging: 'wss://staging-api.procurementpro.com/ws',
      demo: 'wss://demo-api.procurementpro.com/ws',
      production: 'wss://api.procurementpro.com/ws',
    };
    
    return urls[ENVIRONMENT] || urls.production;
  },

  // Validate configuration
  validateConfig: () => {
    const errors = [];
    
    // Check required environment variables
    const requiredEnvVars = [
      'REACT_APP_BUILD_VERSION',
    ];
    
    requiredEnvVars.forEach(envVar => {

      if (!import.meta.env[envVar]) {
        errors.push(`Missing required environment variable: ${envVar}`);
      }
    });
    
    // Validate feature flags
    if (!APP_CONFIG.FEATURES.MODULES.PROCUREMENT) {
      errors.push('Procurement module must be enabled');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Get build information
  getBuildInfo: () => {
    return {
      version: APP_CONFIG.APP.VERSION,
      build: APP_CONFIG.APP.BUILD,
      environment: ENVIRONMENT,

      timestamp: import.meta.env.REACT_APP_BUILD_TIMESTAMP || new Date().toISOString(),

      commit: import.meta.env.REACT_APP_COMMIT_HASH || 'unknown',
    };
  },
};

// Freeze configuration to prevent accidental modifications
Object.freeze(APP_CONFIG);

export default APP_CONFIG;