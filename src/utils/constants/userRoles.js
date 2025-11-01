/**
 * User Roles and Permissions Configuration
 * Defines roles, permissions, and access control for the procurement system
 */

// User Role Definitions
export const USER_ROLES = {
  // System Administrator - Full system access
  ADMIN: 'admin',
  
  // Procurement Manager - Manages procurement processes
  PROCUREMENT_MANAGER: 'procurement_manager',
  
  // Inventory Manager - Manages inventory and stock
  INVENTORY_MANAGER: 'inventory_manager',
  
  // Supplier Manager - Manages supplier relationships
  SUPPLIER_MANAGER: 'supplier_manager',
  
  // Bid Manager - Manages bidding processes
  BID_MANAGER: 'bid_manager',
  
  // Finance Manager - Handles financial approvals
  FINANCE_MANAGER: 'finance_manager',
  
  // Department Manager - Department-level approvals
  DEPARTMENT_MANAGER: 'department_manager',
  
  // Regular User - Basic system user
  USER: 'user',
  
  // Supplier User - External supplier access
  SUPPLIER_USER: 'supplier_user',
  
  // Read-only User - View-only access
  VIEWER: 'viewer',
  
  // Auditor - Access to audit trails and reports
  AUDITOR: 'auditor',
};

// Permission Definitions
export const PERMISSIONS = {
  // User Management
  USER_MANAGEMENT: {
    VIEW_USERS: 'view_users',
    CREATE_USERS: 'create_users',
    EDIT_USERS: 'edit_users',
    DELETE_USERS: 'delete_users',
    MANAGE_USER_ROLES: 'manage_user_roles',
    RESET_PASSWORDS: 'reset_passwords',
  },
  
  // Procurement Management
  PROCUREMENT: {
    VIEW_PURCHASE_ORDERS: 'view_purchase_orders',
    CREATE_PURCHASE_ORDERS: 'create_purchase_orders',
    EDIT_PURCHASE_ORDERS: 'edit_purchase_orders',
    DELETE_PURCHASE_ORDERS: 'delete_purchase_orders',
    APPROVE_PURCHASE_ORDERS: 'approve_purchase_orders',
    VIEW_REQUISITIONS: 'view_requisitions',
    CREATE_REQUISITIONS: 'create_requisitions',
    APPROVE_REQUISITIONS: 'approve_requisitions',
    VIEW_RFQS: 'view_rfqs',
    CREATE_RFQS: 'create_rfqs',
    MANAGE_RFQS: 'manage_rfqs',
  },
  
  // Supplier Management
  SUPPLIERS: {
    VIEW_SUPPLIERS: 'view_suppliers',
    CREATE_SUPPLIERS: 'create_suppliers',
    EDIT_SUPPLIERS: 'edit_suppliers',
    DELETE_SUPPLIERS: 'delete_suppliers',
    APPROVE_SUPPLIERS: 'approve_suppliers',
    SUSPEND_SUPPLIERS: 'suspend_suppliers',
    VIEW_SUPPLIER_PERFORMANCE: 'view_supplier_performance',
    MANAGE_SUPPLIER_CATEGORIES: 'manage_supplier_categories',
  },
  
  // Inventory Management
  INVENTORY: {
    VIEW_PRODUCTS: 'view_products',
    CREATE_PRODUCTS: 'create_products',
    EDIT_PRODUCTS: 'edit_products',
    DELETE_PRODUCTS: 'delete_products',
    MANAGE_INVENTORY_LEVELS: 'manage_inventory_levels',
    VIEW_STOCK_MOVEMENTS: 'view_stock_movements',
    CREATE_STOCK_ADJUSTMENTS: 'create_stock_adjustments',
    MANAGE_CATEGORIES: 'manage_categories',
    VIEW_STOCK_ALERTS: 'view_stock_alerts',
  },
  
  // Bidding Management
  BIDDING: {
    VIEW_BIDS: 'view_bids',
    CREATE_BIDS: 'create_bids',
    EDIT_BIDS: 'edit_bids',
    DELETE_BIDS: 'delete_bids',
    PUBLISH_BIDS: 'publish_bids',
    EVALUATE_BIDS: 'evaluate_bids',
    AWARD_BIDS: 'award_bids',
    VIEW_BID_RESPONSES: 'view_bid_responses',
    MANAGE_BID_TEMPLATES: 'manage_bid_templates',
  },
  
  // Reports and Analytics
  REPORTS: {
    VIEW_REPORTS: 'view_reports',
    GENERATE_REPORTS: 'generate_reports',
    EXPORT_REPORTS: 'export_reports',
    VIEW_ANALYTICS: 'view_analytics',
    VIEW_DASHBOARD: 'view_dashboard',
    VIEW_AUDIT_LOGS: 'view_audit_logs',
  },
  
  // System Management
  SYSTEM: {
    MANAGE_SYSTEM_SETTINGS: 'manage_system_settings',
    VIEW_SYSTEM_LOGS: 'view_system_logs',
    MANAGE_BACKUPS: 'manage_backups',
    MANAGE_INTEGRATIONS: 'manage_integrations',
    VIEW_SYSTEM_HEALTH: 'view_system_health',
  },
  
  // Financial Permissions
  FINANCE: {
    VIEW_FINANCIAL_DATA: 'view_financial_data',
    APPROVE_EXPENDITURES: 'approve_expenditures',
    VIEW_BUDGETS: 'view_budgets',
    MANAGE_BUDGETS: 'manage_budgets',
    VIEW_COST_ANALYSIS: 'view_cost_analysis',
  },
  
  // Document Management
  DOCUMENTS: {
    UPLOAD_DOCUMENTS: 'upload_documents',
    VIEW_DOCUMENTS: 'view_documents',
    DELETE_DOCUMENTS: 'delete_documents',
    SHARE_DOCUMENTS: 'share_documents',
  },
  
  // Notification Management
  NOTIFICATIONS: {
    VIEW_NOTIFICATIONS: 'view_notifications',
    MANAGE_NOTIFICATIONS: 'manage_notifications',
    CONFIGURE_NOTIFICATIONS: 'configure_notifications',
  },
};

// Role-Permission Mapping
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    // User Management
    ...Object.values(PERMISSIONS.USER_MANAGEMENT),
    
    // Procurement
    ...Object.values(PERMISSIONS.PROCUREMENT),
    
    // Suppliers
    ...Object.values(PERMISSIONS.SUPPLIERS),
    
    // Inventory
    ...Object.values(PERMISSIONS.INVENTORY),
    
    // Bidding
    ...Object.values(PERMISSIONS.BIDDING),
    
    // Reports
    ...Object.values(PERMISSIONS.REPORTS),
    
    // System
    ...Object.values(PERMISSIONS.SYSTEM),
    
    // Finance
    ...Object.values(PERMISSIONS.FINANCE),
    
    // Documents
    ...Object.values(PERMISSIONS.DOCUMENTS),
    
    // Notifications
    ...Object.values(PERMISSIONS.NOTIFICATIONS),
  ],
  
  [USER_ROLES.PROCUREMENT_MANAGER]: [
    // Procurement
    PERMISSIONS.PROCUREMENT.VIEW_PURCHASE_ORDERS,
    PERMISSIONS.PROCUREMENT.CREATE_PURCHASE_ORDERS,
    PERMISSIONS.PROCUREMENT.EDIT_PURCHASE_ORDERS,
    PERMISSIONS.PROCUREMENT.APPROVE_PURCHASE_ORDERS,
    PERMISSIONS.PROCUREMENT.VIEW_REQUISITIONS,
    PERMISSIONS.PROCUREMENT.CREATE_REQUISITIONS,
    PERMISSIONS.PROCUREMENT.APPROVE_REQUISITIONS,
    PERMISSIONS.PROCUREMENT.VIEW_RFQS,
    PERMISSIONS.PROCUREMENT.CREATE_RFQS,
    PERMISSIONS.PROCUREMENT.MANAGE_RFQS,
    
    // Suppliers
    PERMISSIONS.SUPPLIERS.VIEW_SUPPLIERS,
    PERMISSIONS.SUPPLIERS.CREATE_SUPPLIERS,
    PERMISSIONS.SUPPLIERS.EDIT_SUPPLIERS,
    PERMISSIONS.SUPPLIERS.VIEW_SUPPLIER_PERFORMANCE,
    
    // Bidding
    PERMISSIONS.BIDDING.VIEW_BIDS,
    PERMISSIONS.BIDDING.CREATE_BIDS,
    PERMISSIONS.BIDDING.EDIT_BIDS,
    PERMISSIONS.BIDDING.PUBLISH_BIDS,
    PERMISSIONS.BIDDING.EVALUATE_BIDS,
    PERMISSIONS.BIDDING.AWARD_BIDS,
    PERMISSIONS.BIDDING.VIEW_BID_RESPONSES,
    
    // Reports
    PERMISSIONS.REPORTS.VIEW_REPORTS,
    PERMISSIONS.REPORTS.GENERATE_REPORTS,
    PERMISSIONS.REPORTS.EXPORT_REPORTS,
    PERMISSIONS.REPORTS.VIEW_ANALYTICS,
    PERMISSIONS.REPORTS.VIEW_DASHBOARD,
    
    // Documents
    PERMISSIONS.DOCUMENTS.UPLOAD_DOCUMENTS,
    PERMISSIONS.DOCUMENTS.VIEW_DOCUMENTS,
    PERMISSIONS.DOCUMENTS.SHARE_DOCUMENTS,
    
    // Notifications
    PERMISSIONS.NOTIFICATIONS.VIEW_NOTIFICATIONS,
  ],
  
  [USER_ROLES.INVENTORY_MANAGER]: [
    // Inventory
    ...Object.values(PERMISSIONS.INVENTORY),
    
    // Procurement
    PERMISSIONS.PROCUREMENT.VIEW_PURCHASE_ORDERS,
    PERMISSIONS.PROCUREMENT.CREATE_PURCHASE_ORDERS,
    PERMISSIONS.PROCUREMENT.VIEW_REQUISITIONS,
    PERMISSIONS.PROCUREMENT.CREATE_REQUISITIONS,
    
    // Reports
    PERMISSIONS.REPORTS.VIEW_REPORTS,
    PERMISSIONS.REPORTS.GENERATE_REPORTS,
    PERMISSIONS.REPORTS.VIEW_ANALYTICS,
    PERMISSIONS.REPORTS.VIEW_DASHBOARD,
    
    // Documents
    PERMISSIONS.DOCUMENTS.UPLOAD_DOCUMENTS,
    PERMISSIONS.DOCUMENTS.VIEW_DOCUMENTS,
    
    // Notifications
    PERMISSIONS.NOTIFICATIONS.VIEW_NOTIFICATIONS,
  ],
  
  [USER_ROLES.SUPPLIER_MANAGER]: [
    // Suppliers
    ...Object.values(PERMISSIONS.SUPPLIERS),
    
    // Procurement
    PERMISSIONS.PROCUREMENT.VIEW_PURCHASE_ORDERS,
    PERMISSIONS.PROCUREMENT.VIEW_RFQS,
    
    // Bidding
    PERMISSIONS.BIDDING.VIEW_BIDS,
    PERMISSIONS.BIDDING.EVALUATE_BIDS,
    
    // Reports
    PERMISSIONS.REPORTS.VIEW_REPORTS,
    PERMISSIONS.REPORTS.GENERATE_REPORTS,
    PERMISSIONS.REPORTS.VIEW_ANALYTICS,
    
    // Documents
    PERMISSIONS.DOCUMENTS.UPLOAD_DOCUMENTS,
    PERMISSIONS.DOCUMENTS.VIEW_DOCUMENTS,
    
    // Notifications
    PERMISSIONS.NOTIFICATIONS.VIEW_NOTIFICATIONS,
  ],
  
  [USER_ROLES.BID_MANAGER]: [
    // Bidding
    ...Object.values(PERMISSIONS.BIDDING),
    
    // Suppliers
    PERMISSIONS.SUPPLIERS.VIEW_SUPPLIERS,
    PERMISSIONS.SUPPLIERS.VIEW_SUPPLIER_PERFORMANCE,
    
    // Procurement
    PERMISSIONS.PROCUREMENT.VIEW_PURCHASE_ORDERS,
    PERMISSIONS.PROCUREMENT.VIEW_RFQS,
    
    // Reports
    PERMISSIONS.REPORTS.VIEW_REPORTS,
    PERMISSIONS.REPORTS.GENERATE_REPORTS,
    PERMISSIONS.REPORTS.VIEW_ANALYTICS,
    
    // Documents
    ...Object.values(PERMISSIONS.DOCUMENTS),
    
    // Notifications
    PERMISSIONS.NOTIFICATIONS.VIEW_NOTIFICATIONS,
  ],
  
  [USER_ROLES.FINANCE_MANAGER]: [
    // Finance
    ...Object.values(PERMISSIONS.FINANCE),
    
    // Procurement
    PERMISSIONS.PROCUREMENT.VIEW_PURCHASE_ORDERS,
    PERMISSIONS.PROCUREMENT.APPROVE_PURCHASE_ORDERS,
    PERMISSIONS.PROCUREMENT.VIEW_REQUISITIONS,
    PERMISSIONS.PROCUREMENT.APPROVE_REQUISITIONS,
    
    // Bidding
    PERMISSIONS.BIDDING.VIEW_BIDS,
    PERMISSIONS.BIDDING.EVALUATE_BIDS,
    
    // Reports
    ...Object.values(PERMISSIONS.REPORTS),
    
    // Documents
    PERMISSIONS.DOCUMENTS.VIEW_DOCUMENTS,
    
    // Notifications
    PERMISSIONS.NOTIFICATIONS.VIEW_NOTIFICATIONS,
  ],
  
  [USER_ROLES.DEPARTMENT_MANAGER]: [
    // Procurement
    PERMISSIONS.PROCUREMENT.VIEW_PURCHASE_ORDERS,
    PERMISSIONS.PROCUREMENT.CREATE_PURCHASE_ORDERS,
    PERMISSIONS.PROCUREMENT.APPROVE_PURCHASE_ORDERS,
    PERMISSIONS.PROCUREMENT.VIEW_REQUISITIONS,
    PERMISSIONS.PROCUREMENT.CREATE_REQUISITIONS,
    PERMISSIONS.PROCUREMENT.APPROVE_REQUISITIONS,
    
    // Inventory
    PERMISSIONS.INVENTORY.VIEW_PRODUCTS,
    PERMISSIONS.INVENTORY.VIEW_INVENTORY_LEVELS,
    
    // Reports
    PERMISSIONS.REPORTS.VIEW_REPORTS,
    PERMISSIONS.REPORTS.VIEW_DASHBOARD,
    
    // Documents
    PERMISSIONS.DOCUMENTS.VIEW_DOCUMENTS,
    
    // Notifications
    PERMISSIONS.NOTIFICATIONS.VIEW_NOTIFICATIONS,
  ],
  
  [USER_ROLES.USER]: [
    // Procurement
    PERMISSIONS.PROCUREMENT.VIEW_PURCHASE_ORDERS,
    PERMISSIONS.PROCUREMENT.CREATE_PURCHASE_ORDERS,
    PERMISSIONS.PROCUREMENT.VIEW_REQUISITIONS,
    PERMISSIONS.PROCUREMENT.CREATE_REQUISITIONS,
    
    // Inventory
    PERMISSIONS.INVENTORY.VIEW_PRODUCTS,
    PERMISSIONS.INVENTORY.VIEW_INVENTORY_LEVELS,
    
    // Reports
    PERMISSIONS.REPORTS.VIEW_DASHBOARD,
    
    // Documents
    PERMISSIONS.DOCUMENTS.VIEW_DOCUMENTS,
    
    // Notifications
    PERMISSIONS.NOTIFICATIONS.VIEW_NOTIFICATIONS,
  ],
  
  [USER_ROLES.SUPPLIER_USER]: [
    // Bidding
    PERMISSIONS.BIDDING.VIEW_BIDS,
    PERMISSIONS.BIDDING.VIEW_BID_RESPONSES,
    
    // Limited supplier view
    PERMISSIONS.SUPPLIERS.VIEW_SUPPLIERS,
    
    // Documents (limited)
    PERMISSIONS.DOCUMENTS.VIEW_DOCUMENTS,
    PERMISSIONS.DOCUMENTS.UPLOAD_DOCUMENTS,
    
    // Notifications
    PERMISSIONS.NOTIFICATIONS.VIEW_NOTIFICATIONS,
  ],
  
  [USER_ROLES.VIEWER]: [
    // Read-only access
    PERMISSIONS.PROCUREMENT.VIEW_PURCHASE_ORDERS,
    PERMISSIONS.PROCUREMENT.VIEW_REQUISITIONS,
    PERMISSIONS.PROCUREMENT.VIEW_RFQS,
    
    PERMISSIONS.SUPPLIERS.VIEW_SUPPLIERS,
    PERMISSIONS.SUPPLIERS.VIEW_SUPPLIER_PERFORMANCE,
    
    PERMISSIONS.INVENTORY.VIEW_PRODUCTS,
    PERMISSIONS.INVENTORY.VIEW_INVENTORY_LEVELS,
    PERMISSIONS.INVENTORY.VIEW_STOCK_MOVEMENTS,
    
    PERMISSIONS.BIDDING.VIEW_BIDS,
    
    PERMISSIONS.REPORTS.VIEW_REPORTS,
    PERMISSIONS.REPORTS.VIEW_DASHBOARD,
    
    PERMISSIONS.DOCUMENTS.VIEW_DOCUMENTS,
    
    PERMISSIONS.NOTIFICATIONS.VIEW_NOTIFICATIONS,
  ],
  
  [USER_ROLES.AUDITOR]: [
    // Audit and reporting access
    PERMISSIONS.REPORTS.VIEW_REPORTS,
    PERMISSIONS.REPORTS.GENERATE_REPORTS,
    PERMISSIONS.REPORTS.EXPORT_REPORTS,
    PERMISSIONS.REPORTS.VIEW_ANALYTICS,
    PERMISSIONS.REPORTS.VIEW_AUDIT_LOGS,
    
    // Read-only system access
    PERMISSIONS.SYSTEM.VIEW_SYSTEM_LOGS,
    PERMISSIONS.SYSTEM.VIEW_SYSTEM_HEALTH,
    
    // View permissions for all modules
    PERMISSIONS.PROCUREMENT.VIEW_PURCHASE_ORDERS,
    PERMISSIONS.PROCUREMENT.VIEW_REQUISITIONS,
    PERMISSIONS.PROCUREMENT.VIEW_RFQS,
    
    PERMISSIONS.SUPPLIERS.VIEW_SUPPLIERS,
    PERMISSIONS.SUPPLIERS.VIEW_SUPPLIER_PERFORMANCE,
    
    PERMISSIONS.INVENTORY.VIEW_PRODUCTS,
    PERMISSIONS.INVENTORY.VIEW_INVENTORY_LEVELS,
    PERMISSIONS.INVENTORY.VIEW_STOCK_MOVEMENTS,
    
    PERMISSIONS.BIDDING.VIEW_BIDS,
    
    PERMISSIONS.DOCUMENTS.VIEW_DOCUMENTS,
    
    PERMISSIONS.NOTIFICATIONS.VIEW_NOTIFICATIONS,
  ],
};

// Role Hierarchy (higher roles inherit permissions from lower roles)
export const ROLE_HIERARCHY = {
  [USER_ROLES.ADMIN]: [
    USER_ROLES.PROCUREMENT_MANAGER,
    USER_ROLES.INVENTORY_MANAGER,
    USER_ROLES.SUPPLIER_MANAGER,
    USER_ROLES.BID_MANAGER,
    USER_ROLES.FINANCE_MANAGER,
    USER_ROLES.DEPARTMENT_MANAGER,
    USER_ROLES.USER,
    USER_ROLES.VIEWER,
    USER_ROLES.AUDITOR,
  ],
  [USER_ROLES.PROCUREMENT_MANAGER]: [USER_ROLES.DEPARTMENT_MANAGER, USER_ROLES.USER],
  [USER_ROLES.INVENTORY_MANAGER]: [USER_ROLES.USER],
  [USER_ROLES.SUPPLIER_MANAGER]: [USER_ROLES.USER],
  [USER_ROLES.BID_MANAGER]: [USER_ROLES.USER],
  [USER_ROLES.FINANCE_MANAGER]: [USER_ROLES.USER],
  [USER_ROLES.DEPARTMENT_MANAGER]: [USER_ROLES.USER],
};

// Role Display Names
export const ROLE_DISPLAY_NAMES = {
  [USER_ROLES.ADMIN]: 'System Administrator',
  [USER_ROLES.PROCUREMENT_MANAGER]: 'Procurement Manager',
  [USER_ROLES.INVENTORY_MANAGER]: 'Inventory Manager',
  [USER_ROLES.SUPPLIER_MANAGER]: 'Supplier Manager',
  [USER_ROLES.BID_MANAGER]: 'Bid Manager',
  [USER_ROLES.FINANCE_MANAGER]: 'Finance Manager',
  [USER_ROLES.DEPARTMENT_MANAGER]: 'Department Manager',
  [USER_ROLES.USER]: 'User',
  [USER_ROLES.SUPPLIER_USER]: 'Supplier User',
  [USER_ROLES.VIEWER]: 'Viewer',
  [USER_ROLES.AUDITOR]: 'Auditor',
};

// Role Descriptions
export const ROLE_DESCRIPTIONS = {
  [USER_ROLES.ADMIN]: 'Full system access with all permissions. Can manage users, system settings, and all procurement processes.',
  [USER_ROLES.PROCUREMENT_MANAGER]: 'Manages procurement processes including purchase orders, requisitions, and RFQs. Can approve transactions within defined limits.',
  [USER_ROLES.INVENTORY_MANAGER]: 'Manages inventory levels, product catalog, and stock movements. Handles stock adjustments and category management.',
  [USER_ROLES.SUPPLIER_MANAGER]: 'Manages supplier relationships, performance evaluation, and supplier onboarding. Handles supplier approvals and suspensions.',
  [USER_ROLES.BID_MANAGER]: 'Manages bidding processes from creation to award. Evaluates bids and manages bid responses.',
  [USER_ROLES.FINANCE_MANAGER]: 'Handles financial approvals, budget management, and cost analysis. Approves high-value procurement transactions.',
  [USER_ROLES.DEPARTMENT_MANAGER]: 'Department-level approvals and procurement initiation. Manages department-specific procurement needs.',
  [USER_ROLES.USER]: 'Basic system user. Can create requisitions and purchase orders, view inventory, and access personal dashboard.',
  [USER_ROLES.SUPPLIER_USER]: 'External supplier access. Can view relevant bids and submit responses. Limited system access.',
  [USER_ROLES.VIEWER]: 'Read-only access to view procurement data, reports, and analytics. Cannot make changes.',
  [USER_ROLES.AUDITOR]: 'Access to audit trails, reports, and system logs for compliance and auditing purposes.',
};

// Permission Utility Functions
export const PermissionUtils = {
  // Get all permissions for a role (including inherited permissions)
  getPermissionsForRole: (role) => {
    const directPermissions = ROLE_PERMISSIONS[role] || [];
    const inheritedRoles = ROLE_HIERARCHY[role] || [];
    
    const inheritedPermissions = inheritedRoles.flatMap(inheritedRole => 
      ROLE_PERMISSIONS[inheritedRole] || []
    );
    
    return [...new Set([...directPermissions, ...inheritedPermissions])];
  },
  
  // Check if a role has a specific permission
  hasPermission: (role, permission) => {
    const permissions = PermissionUtils.getPermissionsForRole(role);
    return permissions.includes(permission);
  },
  
  // Check if user has any of the required permissions
  hasAnyPermission: (role, requiredPermissions) => {
    const userPermissions = PermissionUtils.getPermissionsForRole(role);
    return requiredPermissions.some(permission => userPermissions.includes(permission));
  },
  
  // Check if user has all required permissions
  hasAllPermissions: (role, requiredPermissions) => {
    const userPermissions = PermissionUtils.getPermissionsForRole(role);
    return requiredPermissions.every(permission => userPermissions.includes(permission));
  },
  
  // Get display name for role
  getRoleDisplayName: (role) => {
    return ROLE_DISPLAY_NAMES[role] || role;
  },
  
  // Get description for role
  getRoleDescription: (role) => {
    return ROLE_DESCRIPTIONS[role] || 'No description available.';
  },
  
  // Get all available roles
  getAvailableRoles: () => {
    return Object.values(USER_ROLES);
  },
  
  // Check if role can be assigned (some roles are system-only)
  isAssignableRole: (role) => {
    const nonAssignable = [USER_ROLES.SUPPLIER_USER]; // Example: supplier users are created differently
    return !nonAssignable.includes(role);
  },
  
  // Get permission category
  getPermissionCategory: (permission) => {
    for (const [category, permissions] of Object.entries(PERMISSIONS)) {
      if (Object.values(permissions).includes(permission)) {
        return category;
      }
    }
    return 'other';
  },
  
  // Get permissions by category
  getPermissionsByCategory: (category) => {
    return PERMISSIONS[category] ? Object.values(PERMISSIONS[category]) : [];
  },
  
  // Validate role transition (prevent invalid role changes)
  isValidRoleTransition: (fromRole, toRole) => {
    const invalidTransitions = {
      [USER_ROLES.SUPPLIER_USER]: [USER_ROLES.ADMIN, USER_ROLES.PROCUREMENT_MANAGER],
      // Add other restrictions as needed
    };
    
    return !invalidTransitions[fromRole]?.includes(toRole);
  },
};

// Default role for new users
export const DEFAULT_USER_ROLE = USER_ROLES.USER;

// Role-based feature access
export const ROLE_FEATURE_ACCESS = {
  DASHBOARD: {
    [USER_ROLES.ADMIN]: 'full',
    [USER_ROLES.PROCUREMENT_MANAGER]: 'full',
    [USER_ROLES.INVENTORY_MANAGER]: 'full',
    [USER_ROLES.SUPPLIER_MANAGER]: 'full',
    [USER_ROLES.BID_MANAGER]: 'full',
    [USER_ROLES.FINANCE_MANAGER]: 'full',
    [USER_ROLES.DEPARTMENT_MANAGER]: 'standard',
    [USER_ROLES.USER]: 'basic',
    [USER_ROLES.SUPPLIER_USER]: 'limited',
    [USER_ROLES.VIEWER]: 'readonly',
    [USER_ROLES.AUDITOR]: 'analytics',
  },
  
  REPORTING: {
    [USER_ROLES.ADMIN]: 'all',
    [USER_ROLES.PROCUREMENT_MANAGER]: 'procurement',
    [USER_ROLES.INVENTORY_MANAGER]: 'inventory',
    [USER_ROLES.SUPPLIER_MANAGER]: 'supplier',
    [USER_ROLES.BID_MANAGER]: 'bidding',
    [USER_ROLES.FINANCE_MANAGER]: 'financial',
    [USER_ROLES.DEPARTMENT_MANAGER]: 'department',
    [USER_ROLES.USER]: 'personal',
    [USER_ROLES.SUPPLIER_USER]: 'none',
    [USER_ROLES.VIEWER]: 'readonly',
    [USER_ROLES.AUDITOR]: 'audit',
  },
};

export default USER_ROLES;