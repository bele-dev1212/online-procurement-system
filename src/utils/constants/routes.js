/**
 * Application Routes Configuration
 * Defines all routes for the procurement system with permissions and metadata
 */

export const ROUTES = {
  // Public routes
  PUBLIC: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
    LANDING: '/',
  },

  // Auth routes (require authentication)
  AUTH: {
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    SETTINGS: '/settings',
    LOGOUT: '/logout',
  },

  // Procurement routes
  PROCUREMENT: {
    BASE: '/procurement',
    PURCHASE_ORDERS: '/procurement/purchase-orders',
    CREATE_PURCHASE_ORDER: '/procurement/purchase-orders/create',
    VIEW_PURCHASE_ORDER: '/procurement/purchase-orders/:id',
    EDIT_PURCHASE_ORDER: '/procurement/purchase-orders/:id/edit',
    
    REQUISITIONS: '/procurement/requisitions',
    CREATE_REQUISITION: '/procurement/requisitions/create',
    VIEW_REQUISITION: '/procurement/requisitions/:id',
    
    RFQS: '/procurement/rfqs',
    CREATE_RFQ: '/procurement/rfqs/create',
    VIEW_RFQ: '/procurement/rfqs/:id',
    EDIT_RFQ: '/procurement/rfqs/:id/edit',
  },

  // Supplier routes
  SUPPLIERS: {
    BASE: '/suppliers',
    DIRECTORY: '/suppliers/directory',
    ADD_SUPPLIER: '/suppliers/add',
    VIEW_SUPPLIER: '/suppliers/:id',
    EDIT_SUPPLIER: '/suppliers/:id/edit',
    PERFORMANCE: '/suppliers/performance',
    CATEGORIES: '/suppliers/categories',
  },

  // Inventory routes
  INVENTORY: {
    BASE: '/inventory',
    MANAGEMENT: '/inventory/management',
    ADD_PRODUCT: '/inventory/products/add',
    VIEW_PRODUCT: '/inventory/products/:id',
    EDIT_PRODUCT: '/inventory/products/:id/edit',
    CATEGORIES: '/inventory/categories',
    STOCK_ALERTS: '/inventory/stock-alerts',
    MOVEMENTS: '/inventory/movements',
  },

  // Bidding routes
  BIDDING: {
    BASE: '/bidding',
    MANAGEMENT: '/bidding/management',
    CREATE_BID: '/bidding/create',
    VIEW_BID: '/bidding/:id',
    EDIT_BID: '/bidding/:id/edit',
    EVALUATION: '/bidding/:id/evaluation',
    RESPONSES: '/bidding/:id/responses',
  },

  // Reports routes
  REPORTS: {
    BASE: '/reports',
    PROCUREMENT_REPORTS: '/reports/procurement',
    SUPPLIER_REPORTS: '/reports/suppliers',
    INVENTORY_REPORTS: '/reports/inventory',
    BIDDING_REPORTS: '/reports/bidding',
    FINANCIAL_REPORTS: '/reports/financial',
    ANALYTICS: '/reports/analytics',
    CUSTOM_REPORTS: '/reports/custom',
  },

  // Settings routes
  SETTINGS: {
    BASE: '/settings',
    USER_SETTINGS: '/settings/user',
    SYSTEM_SETTINGS: '/settings/system',
    NOTIFICATION_SETTINGS: '/settings/notifications',
    SECURITY_SETTINGS: '/settings/security',
    PREFERENCES: '/settings/preferences',
  },

  // Admin routes
  ADMIN: {
    BASE: '/admin',
    USER_MANAGEMENT: '/admin/users',
    ROLE_MANAGEMENT: '/admin/roles',
    SYSTEM_LOGS: '/admin/logs',
    AUDIT_TRAIL: '/admin/audit',
    BACKUP_RESTORE: '/admin/backup',
  },
};

// Route permissions and access control
export const ROUTE_PERMISSIONS = {
  [ROUTES.PUBLIC.LOGIN]: { requiresAuth: false, roles: [] },
  [ROUTES.PUBLIC.REGISTER]: { requiresAuth: false, roles: [] },
  [ROUTES.PUBLIC.FORGOT_PASSWORD]: { requiresAuth: false, roles: [] },
  [ROUTES.PUBLIC.RESET_PASSWORD]: { requiresAuth: false, roles: [] },
  
  [ROUTES.AUTH.DASHBOARD]: { requiresAuth: true, roles: ['user', 'procurement_manager', 'admin'] },
  [ROUTES.AUTH.PROFILE]: { requiresAuth: true, roles: ['user', 'procurement_manager', 'admin'] },
  [ROUTES.AUTH.SETTINGS]: { requiresAuth: true, roles: ['user', 'procurement_manager', 'admin'] },
  
  // Procurement permissions
  [ROUTES.PROCUREMENT.PURCHASE_ORDERS]: { 
    requiresAuth: true, 
    roles: ['procurement_manager', 'admin'],
    permissions: ['view_purchase_orders']
  },
  [ROUTES.PROCUREMENT.CREATE_PURCHASE_ORDER]: { 
    requiresAuth: true, 
    roles: ['procurement_manager', 'admin'],
    permissions: ['create_purchase_orders']
  },
  [ROUTES.PROCUREMENT.VIEW_PURCHASE_ORDER]: { 
    requiresAuth: true, 
    roles: ['procurement_manager', 'admin'],
    permissions: ['view_purchase_orders']
  },
  [ROUTES.PROCUREMENT.EDIT_PURCHASE_ORDER]: { 
    requiresAuth: true, 
    roles: ['procurement_manager', 'admin'],
    permissions: ['edit_purchase_orders']
  },
  
  // Supplier permissions
  [ROUTES.SUPPLIERS.DIRECTORY]: { 
    requiresAuth: true, 
    roles: ['procurement_manager', 'admin'],
    permissions: ['view_suppliers']
  },
  [ROUTES.SUPPLIERS.ADD_SUPPLIER]: { 
    requiresAuth: true, 
    roles: ['procurement_manager', 'admin'],
    permissions: ['create_suppliers']
  },
  [ROUTES.SUPPLIERS.VIEW_SUPPLIER]: { 
    requiresAuth: true, 
    roles: ['procurement_manager', 'admin'],
    permissions: ['view_suppliers']
  },
  [ROUTES.SUPPLIERS.EDIT_SUPPLIER]: { 
    requiresAuth: true, 
    roles: ['procurement_manager', 'admin'],
    permissions: ['edit_suppliers']
  },
  
  // Admin permissions
  [ROUTES.ADMIN.USER_MANAGEMENT]: { 
    requiresAuth: true, 
    roles: ['admin'],
    permissions: ['manage_users']
  },
  [ROUTES.ADMIN.ROLE_MANAGEMENT]: { 
    requiresAuth: true, 
    roles: ['admin'],
    permissions: ['manage_roles']
  },
};

// Route metadata for navigation and UI
export const ROUTE_METADATA = {
  [ROUTES.AUTH.DASHBOARD]: {
    title: 'Dashboard',
    description: 'Procurement system overview and analytics',
    breadcrumb: 'Dashboard',
    icon: 'dashboard',
    category: 'main'
  },
  
  [ROUTES.PROCUREMENT.PURCHASE_ORDERS]: {
    title: 'Purchase Orders',
    description: 'Manage and track purchase orders',
    breadcrumb: 'Procurement / Purchase Orders',
    icon: 'receipt',
    category: 'procurement'
  },
  
  [ROUTES.PROCUREMENT.CREATE_PURCHASE_ORDER]: {
    title: 'Create Purchase Order',
    description: 'Create a new purchase order',
    breadcrumb: 'Procurement / Purchase Orders / Create',
    icon: 'add',
    category: 'procurement'
  },
  
  [ROUTES.SUPPLIERS.DIRECTORY]: {
    title: 'Supplier Directory',
    description: 'Manage supplier information and contracts',
    breadcrumb: 'Suppliers / Directory',
    icon: 'business',
    category: 'suppliers'
  },
  
  [ROUTES.INVENTORY.MANAGEMENT]: {
    title: 'Inventory Management',
    description: 'Track and manage inventory levels',
    breadcrumb: 'Inventory / Management',
    icon: 'inventory',
    category: 'inventory'
  },
  
  [ROUTES.BIDDING.MANAGEMENT]: {
    title: 'Bid Management',
    description: 'Manage bidding processes and evaluations',
    breadcrumb: 'Bidding / Management',
    icon: 'gavel',
    category: 'bidding'
  },
  
  [ROUTES.REPORTS.ANALYTICS]: {
    title: 'Analytics Dashboard',
    description: 'View procurement analytics and insights',
    breadcrumb: 'Reports / Analytics',
    icon: 'analytics',
    category: 'reports'
  },
  
  [ROUTES.SETTINGS.USER_SETTINGS]: {
    title: 'User Settings',
    description: 'Manage your account settings and preferences',
    breadcrumb: 'Settings / User',
    icon: 'settings',
    category: 'settings'
  },
};

// Navigation groups for sidebar menu
export const NAVIGATION_GROUPS = {
  MAIN: [
    {
      path: ROUTES.AUTH.DASHBOARD,
      title: 'Dashboard',
      icon: 'dashboard',
      badge: null,
      children: []
    }
  ],
  
  PROCUREMENT: [
    {
      path: ROUTES.PROCUREMENT.PURCHASE_ORDERS,
      title: 'Purchase Orders',
      icon: 'receipt',
      badge: 'counters.purchaseOrders',
      children: [
        {
          path: ROUTES.PROCUREMENT.CREATE_PURCHASE_ORDER,
          title: 'Create PO',
          icon: 'add'
        }
      ]
    },
    {
      path: ROUTES.PROCUREMENT.REQUISITIONS,
      title: 'Requisitions',
      icon: 'description',
      badge: 'counters.requisitions',
      children: []
    },
    {
      path: ROUTES.PROCUREMENT.RFQS,
      title: 'RFQ Management',
      icon: 'request_quote',
      badge: 'counters.rfqs',
      children: []
    }
  ],
  
  SUPPLIERS: [
    {
      path: ROUTES.SUPPLIERS.DIRECTORY,
      title: 'Supplier Directory',
      icon: 'business',
      badge: null,
      children: [
        {
          path: ROUTES.SUPPLIERS.ADD_SUPPLIER,
          title: 'Add Supplier',
          icon: 'person_add'
        },
        {
          path: ROUTES.SUPPLIERS.PERFORMANCE,
          title: 'Performance',
          icon: 'trending_up'
        }
      ]
    }
  ],
  
  INVENTORY: [
    {
      path: ROUTES.INVENTORY.MANAGEMENT,
      title: 'Inventory Management',
      icon: 'inventory',
      badge: 'counters.lowStock',
      children: [
        {
          path: ROUTES.INVENTORY.ADD_PRODUCT,
          title: 'Add Product',
          icon: 'add'
        },
        {
          path: ROUTES.INVENTORY.CATEGORIES,
          title: 'Categories',
          icon: 'category'
        },
        {
          path: ROUTES.INVENTORY.STOCK_ALERTS,
          title: 'Stock Alerts',
          icon: 'warning'
        }
      ]
    }
  ],
  
  BIDDING: [
    {
      path: ROUTES.BIDDING.MANAGEMENT,
      title: 'Bid Management',
      icon: 'gavel',
      badge: 'counters.pendingBids',
      children: [
        {
          path: ROUTES.BIDDING.CREATE_BID,
          title: 'Create Bid',
          icon: 'add'
        }
      ]
    }
  ],
  
  REPORTS: [
    {
      path: ROUTES.REPORTS.ANALYTICS,
      title: 'Analytics',
      icon: 'analytics',
      badge: null,
      children: [
        {
          path: ROUTES.REPORTS.PROCUREMENT_REPORTS,
          title: 'Procurement',
          icon: 'receipt'
        },
        {
          path: ROUTES.REPORTS.SUPPLIER_REPORTS,
          title: 'Suppliers',
          icon: 'business'
        },
        {
          path: ROUTES.REPORTS.INVENTORY_REPORTS,
          title: 'Inventory',
          icon: 'inventory'
        }
      ]
    }
  ],
  
  SETTINGS: [
    {
      path: ROUTES.SETTINGS.USER_SETTINGS,
      title: 'Settings',
      icon: 'settings',
      badge: null,
      children: [
        {
          path: ROUTES.SETTINGS.SECURITY_SETTINGS,
          title: 'Security',
          icon: 'security'
        },
        {
          path: ROUTES.SETTINGS.NOTIFICATION_SETTINGS,
          title: 'Notifications',
          icon: 'notifications'
        }
      ]
    }
  ]
};

// Route utility functions
export const RouteUtils = {
  // Generate path with parameters
  generatePath: (path, params = {}) => {
    return Object.keys(params).reduce(
      (currentPath, key) => currentPath.replace(`:${key}`, params[key]),
      path
    );
  },

  // Check if route requires authentication
  requiresAuth: (path) => {
    const permission = ROUTE_PERMISSIONS[path] || ROUTE_PERMISSIONS[path.replace(/\/:[^/]+/g, '/*')];
    return permission ? permission.requiresAuth : true;
  },

  // Check if user has access to route
  hasAccess: (path, userRoles = [], userPermissions = []) => {
    const permission = ROUTE_PERMISSIONS[path] || ROUTE_PERMISSIONS[path.replace(/\/:[^/]+/g, '/*')];
    
    if (!permission) return true;
    
    // Check roles
    const hasRole = permission.roles.length === 0 || 
                   permission.roles.some(role => userRoles.includes(role));
    
    // Check permissions
    const hasPermission = !permission.permissions || 
                         permission.permissions.some(perm => userPermissions.includes(perm));
    
    return hasRole && hasPermission;
  },

  // Get route metadata
  getMetadata: (path) => {
    return ROUTE_METADATA[path] || ROUTE_METADATA[path.replace(/\/:[^/]+/g, '/*')] || {};
  },

  // Extract parameters from path
  extractParams: (pattern, path) => {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');
    const params = {};

    if (patternParts.length !== pathParts.length) return null;

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        const paramName = patternParts[i].slice(1);
        params[paramName] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }

    return params;
  },

  // Get breadcrumb trail for a route
  getBreadcrumb: (path) => {
    const metadata = RouteUtils.getMetadata(path);
    if (metadata.breadcrumb) {
      return metadata.breadcrumb.split(' / ');
    }
    
    // Fallback: generate from path
    return path.split('/').filter(part => part).map(part => 
      part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')
    );
  },

  // Check if route is active
  isActive: (currentPath, targetPath, exact = false) => {
    if (exact) {
      return currentPath === targetPath;
    }
    
    return currentPath.startsWith(targetPath) || 
           currentPath.replace(/\/:[^/]+/g, '') === targetPath.replace(/\/:[^/]+/g, '');
  }
};

export default ROUTES;