/**
 * Supplier Status Enums
 * Defines all possible statuses and transitions for suppliers
 */

/**
 * Supplier Status Enum
 */
export const SUPPLIER_STATUS = {
  // New supplier application
  PENDING: 'pending',
  
  // Active and approved supplier
  ACTIVE: 'active',
  
  // Temporarily suspended
  SUSPENDED: 'suspended',
  
  // Permanently blocked
  BLACKLISTED: 'blacklisted',
  
  // No longer active but not blacklisted
  INACTIVE: 'inactive',
  
  // Under review for reactivation
  UNDER_REVIEW: 'under_review',
  
  // Awaiting documentation
  AWAITING_DOCUMENTATION: 'awaiting_documentation',
  
  // Contract expired
  CONTRACT_EXPIRED: 'contract_expired',
  
  // Being onboarded
  ONBOARDING: 'onboarding',
  
  // Limited access for testing
  TRIAL: 'trial',
};

/**
 * Supplier Status Display Names
 */
export const SUPPLIER_STATUS_DISPLAY = {
  [SUPPLIER_STATUS.PENDING]: 'Pending Approval',
  [SUPPLIER_STATUS.ACTIVE]: 'Active',
  [SUPPLIER_STATUS.SUSPENDED]: 'Suspended',
  [SUPPLIER_STATUS.BLACKLISTED]: 'Blacklisted',
  [SUPPLIER_STATUS.INACTIVE]: 'Inactive',
  [SUPPLIER_STATUS.UNDER_REVIEW]: 'Under Review',
  [SUPPLIER_STATUS.AWAITING_DOCUMENTATION]: 'Awaiting Documentation',
  [SUPPLIER_STATUS.CONTRACT_EXPIRED]: 'Contract Expired',
  [SUPPLIER_STATUS.ONBOARDING]: 'Onboarding',
  [SUPPLIER_STATUS.TRIAL]: 'Trial',
};

/**
 * Supplier Status Categories
 */
export const SUPPLIER_STATUS_CATEGORY = {
  [SUPPLIER_STATUS.PENDING]: 'pending',
  [SUPPLIER_STATUS.ACTIVE]: 'active',
  [SUPPLIER_STATUS.SUSPENDED]: 'suspended',
  [SUPPLIER_STATUS.BLACKLISTED]: 'blacklisted',
  [SUPPLIER_STATUS.INACTIVE]: 'inactive',
  [SUPPLIER_STATUS.UNDER_REVIEW]: 'pending',
  [SUPPLIER_STATUS.AWAITING_DOCUMENTATION]: 'pending',
  [SUPPLIER_STATUS.CONTRACT_EXPIRED]: 'inactive',
  [SUPPLIER_STATUS.ONBOARDING]: 'pending',
  [SUPPLIER_STATUS.TRIAL]: 'active',
};

/**
 * Supplier Status Colors
 */
export const SUPPLIER_STATUS_COLORS = {
  [SUPPLIER_STATUS.PENDING]: 'orange',
  [SUPPLIER_STATUS.ACTIVE]: 'green',
  [SUPPLIER_STATUS.SUSPENDED]: 'yellow',
  [SUPPLIER_STATUS.BLACKLISTED]: 'red',
  [SUPPLIER_STATUS.INACTIVE]: 'gray',
  [SUPPLIER_STATUS.UNDER_REVIEW]: 'blue',
  [SUPPLIER_STATUS.AWAITING_DOCUMENTATION]: 'yellow',
  [SUPPLIER_STATUS.CONTRACT_EXPIRED]: 'orange',
  [SUPPLIER_STATUS.ONBOARDING]: 'purple',
  [SUPPLIER_STATUS.TRIAL]: 'green',
};

/**
 * Supplier Status Icons
 */
export const SUPPLIER_STATUS_ICONS = {
  [SUPPLIER_STATUS.PENDING]: 'pending',
  [SUPPLIER_STATUS.ACTIVE]: 'check_circle',
  [SUPPLIER_STATUS.SUSPENDED]: 'pause',
  [SUPPLIER_STATUS.BLACKLISTED]: 'block',
  [SUPPLIER_STATUS.INACTIVE]: 'inactive',
  [SUPPLIER_STATUS.UNDER_REVIEW]: 'review',
  [SUPPLIER_STATUS.AWAITING_DOCUMENTATION]: 'description',
  [SUPPLIER_STATUS.CONTRACT_EXPIRED]: 'schedule',
  [SUPPLIER_STATUS.ONBOARDING]: 'person_add',
  [SUPPLIER_STATUS.TRIAL]: 'experiment',
};

/**
 * Supplier Status Descriptions
 */
export const SUPPLIER_STATUS_DESCRIPTIONS = {
  [SUPPLIER_STATUS.PENDING]: 'Supplier application is pending approval',
  [SUPPLIER_STATUS.ACTIVE]: 'Supplier is active and can receive orders',
  [SUPPLIER_STATUS.SUSPENDED]: 'Supplier is temporarily suspended from receiving orders',
  [SUPPLIER_STATUS.BLACKLISTED]: 'Supplier is permanently blocked from doing business',
  [SUPPLIER_STATUS.INACTIVE]: 'Supplier is no longer active but not blacklisted',
  [SUPPLIER_STATUS.UNDER_REVIEW]: 'Supplier is under review for performance or compliance',
  [SUPPLIER_STATUS.AWAITING_DOCUMENTATION]: 'Supplier needs to provide additional documentation',
  [SUPPLIER_STATUS.CONTRACT_EXPIRED]: 'Supplier contract has expired and needs renewal',
  [SUPPLIER_STATUS.ONBOARDING]: 'Supplier is currently being onboarded',
  [SUPPLIER_STATUS.TRIAL]: 'Supplier is in trial period with limited access',
};

/**
 * Supplier Status Transitions
 */
export const SUPPLIER_STATUS_TRANSITIONS = {
  [SUPPLIER_STATUS.PENDING]: {
    next: [
      SUPPLIER_STATUS.ACTIVE,
      SUPPLIER_STATUS.BLACKLISTED,
      SUPPLIER_STATUS.AWAITING_DOCUMENTATION,
    ],
    action: 'review',
    requiresApproval: true,
  },
  
  [SUPPLIER_STATUS.ACTIVE]: {
    next: [
      SUPPLIER_STATUS.SUSPENDED,
      SUPPLIER_STATUS.BLACKLISTED,
      SUPPLIER_STATUS.INACTIVE,
      SUPPLIER_STATUS.UNDER_REVIEW,
      SUPPLIER_STATUS.CONTRACT_EXPIRED,
    ],
    action: 'manage',
    canReceiveOrders: true,
  },
  
  [SUPPLIER_STATUS.SUSPENDED]: {
    next: [
      SUPPLIER_STATUS.ACTIVE,
      SUPPLIER_STATUS.BLACKLISTED,
      SUPPLIER_STATUS.INACTIVE,
    ],
    action: 'reactivate',
    requiresReview: true,
  },
  
  [SUPPLIER_STATUS.BLACKLISTED]: {
    next: [
      SUPPLIER_STATUS.UNDER_REVIEW,
    ],
    action: 'appeal',
    requiresExecutiveApproval: true,
    cannotReceiveOrders: true,
  },
  
  [SUPPLIER_STATUS.INACTIVE]: {
    next: [
      SUPPLIER_STATUS.ACTIVE,
      SUPPLIER_STATUS.UNDER_REVIEW,
      SUPPLIER_STATUS.BLACKLISTED,
    ],
    action: 'reactivate',
    requiresReview: true,
  },
  
  [SUPPLIER_STATUS.UNDER_REVIEW]: {
    next: [
      SUPPLIER_STATUS.ACTIVE,
      SUPPLIER_STATUS.SUSPENDED,
      SUPPLIER_STATUS.BLACKLISTED,
      SUPPLIER_STATUS.INACTIVE,
    ],
    action: 'complete_review',
    reviewPeriod: 30, // days
  },
  
  [SUPPLIER_STATUS.AWAITING_DOCUMENTATION]: {
    next: [
      SUPPLIER_STATUS.PENDING,
      SUPPLIER_STATUS.ACTIVE,
      SUPPLIER_STATUS.BLACKLISTED,
    ],
    action: 'submit_docs',
    documentationRequired: true,
  },
  
  [SUPPLIER_STATUS.CONTRACT_EXPIRED]: {
    next: [
      SUPPLIER_STATUS.ACTIVE,
      SUPPLIER_STATUS.INACTIVE,
      SUPPLIER_STATUS.UNDER_REVIEW,
    ],
    action: 'renew_contract',
    contractAction: 'renew',
  },
  
  [SUPPLIER_STATUS.ONBOARDING]: {
    next: [
      SUPPLIER_STATUS.ACTIVE,
      SUPPLIER_STATUS.TRIAL,
      SUPPLIER_STATUS.PENDING,
    ],
    action: 'complete_onboarding',
    onboardingComplete: false,
  },
  
  [SUPPLIER_STATUS.TRIAL]: {
    next: [
      SUPPLIER_STATUS.ACTIVE,
      SUPPLIER_STATUS.INACTIVE,
    ],
    action: 'evaluate_trial',
    trialPeriod: 90, // days
  },
};

/**
 * Supplier Risk Levels
 */
export const SUPPLIER_RISK_LEVEL = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/**
 * Supplier Risk Level Colors
 */
export const SUPPLIER_RISK_COLORS = {
  [SUPPLIER_RISK_LEVEL.LOW]: 'green',
  [SUPPLIER_RISK_LEVEL.MEDIUM]: 'yellow',
  [SUPPLIER_RISK_LEVEL.HIGH]: 'orange',
  [SUPPLIER_RISK_LEVEL.CRITICAL]: 'red',
};

/**
 * Supplier Performance Ratings
 */
export const SUPPLIER_PERFORMANCE_RATING = {
  EXCELLENT: 5,
  GOOD: 4,
  AVERAGE: 3,
  POOR: 2,
  VERY_POOR: 1,
};

/**
 * Supplier Performance Rating Labels
 */
export const SUPPLIER_PERFORMANCE_LABELS = {
  [SUPPLIER_PERFORMANCE_RATING.EXCELLENT]: 'Excellent',
  [SUPPLIER_PERFORMANCE_RATING.GOOD]: 'Good',
  [SUPPLIER_PERFORMANCE_RATING.AVERAGE]: 'Average',
  [SUPPLIER_PERFORMANCE_RATING.POOR]: 'Poor',
  [SUPPLIER_PERFORMANCE_RATING.VERY_POOR]: 'Very Poor',
};

/**
 * Supplier Status Utility Functions
 */
export const SupplierStatusUtils = {
  // Get display name for status
  getDisplayName: (status) => {
    return SUPPLIER_STATUS_DISPLAY[status] || 'Unknown Status';
  },

  // Get status category
  getCategory: (status) => {
    return SUPPLIER_STATUS_CATEGORY[status] || 'unknown';
  },

  // Get status color
  getColor: (status) => {
    return SUPPLIER_STATUS_COLORS[status] || 'gray';
  },

  // Get status icon
  getIcon: (status) => {
    return SUPPLIER_STATUS_ICONS[status] || 'help';
  },

  // Get status description
  getDescription: (status) => {
    return SUPPLIER_STATUS_DESCRIPTIONS[status] || 'No description available';
  },

  // Check if status transition is valid
  isValidTransition: (fromStatus, toStatus) => {
    const transitions = SUPPLIER_STATUS_TRANSITIONS[fromStatus];
    if (!transitions) return false;
    
    return transitions.next.includes(toStatus);
  },

  // Get available next statuses
  getNextStatuses: (currentStatus) => {
    const transitions = SUPPLIER_STATUS_TRANSITIONS[currentStatus];
    return transitions ? transitions.next : [];
  },

  // Check if supplier can receive orders
  canReceiveOrders: (status) => {
    return [
      SUPPLIER_STATUS.ACTIVE,
      SUPPLIER_STATUS.TRIAL,
    ].includes(status);
  },

  // Check if supplier requires approval
  requiresApproval: (status) => {
    return [
      SUPPLIER_STATUS.PENDING,
      SUPPLIER_STATUS.UNDER_REVIEW,
    ].includes(status);
  },

  // Check if supplier is in good standing
  isInGoodStanding: (status) => {
    return [
      SUPPLIER_STATUS.ACTIVE,
      SUPPLIER_STATUS.TRIAL,
    ].includes(status);
  },

  // Check if supplier is problematic
  isProblematic: (status) => {
    return [
      SUPPLIER_STATUS.SUSPENDED,
      SUPPLIER_STATUS.BLACKLISTED,
      SUPPLIER_STATUS.UNDER_REVIEW,
    ].includes(status);
  },

  // Calculate supplier risk level based on various factors
  calculateRiskLevel: (status, performanceRating, deliveryMetrics, financialHealth) => {
    let riskScore = 0;
    
    // Status impact
    const statusRisk = {
      [SUPPLIER_STATUS.ACTIVE]: 1,
      [SUPPLIER_STATUS.TRIAL]: 2,
      [SUPPLIER_STATUS.PENDING]: 3,
      [SUPPLIER_STATUS.ONBOARDING]: 2,
      [SUPPLIER_STATUS.INACTIVE]: 4,
      [SUPPLIER_STATUS.SUSPENDED]: 5,
      [SUPPLIER_STATUS.BLACKLISTED]: 10,
      [SUPPLIER_STATUS.UNDER_REVIEW]: 6,
      [SUPPLIER_STATUS.AWAITING_DOCUMENTATION]: 4,
      [SUPPLIER_STATUS.CONTRACT_EXPIRED]: 5,
    };
    
    riskScore += statusRisk[status] || 5;
    
    // Performance rating impact
    riskScore += (6 - performanceRating); // Inverse relationship
    
    // Delivery metrics impact (on-time delivery percentage)
    const deliveryRisk = deliveryMetrics < 80 ? 3 : deliveryMetrics < 90 ? 1 : 0;
    riskScore += deliveryRisk;
    
    // Financial health impact (1-5 scale, 1 being poor)
    riskScore += (6 - financialHealth);
    
    // Determine risk level
    if (riskScore <= 5) return SUPPLIER_RISK_LEVEL.LOW;
    if (riskScore <= 8) return SUPPLIER_RISK_LEVEL.MEDIUM;
    if (riskScore <= 12) return SUPPLIER_RISK_LEVEL.HIGH;
    return SUPPLIER_RISK_LEVEL.CRITICAL;
  },

  // Get risk level color
  getRiskColor: (riskLevel) => {
    return SUPPLIER_RISK_COLORS[riskLevel] || 'gray';
  },

  // Get performance rating label
  getPerformanceLabel: (rating) => {
    return SUPPLIER_PERFORMANCE_LABELS[rating] || 'Unknown';
  },

  // Validate supplier status change
  validateStatusChange: (currentStatus, newStatus, userRole, riskLevel) => {
    const errors = [];
    
    // Check if transition is valid
    if (!SupplierStatusUtils.isValidTransition(currentStatus, newStatus)) {
      errors.push(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
    
    // Check permissions for high-risk operations
    if (newStatus === SUPPLIER_STATUS.BLACKLISTED && !['director', 'vp', 'admin'].includes(userRole)) {
      errors.push('Insufficient permissions to blacklist suppliers');
    }
    
    if (newStatus === SUPPLIER_STATUS.ACTIVE && riskLevel === SUPPLIER_RISK_LEVEL.CRITICAL) {
      errors.push('Cannot activate supplier with critical risk level');
    }
    
    // Business rule: High-risk suppliers require additional approval
    if (
      [SUPPLIER_RISK_LEVEL.HIGH, SUPPLIER_RISK_LEVEL.CRITICAL].includes(riskLevel) &&
      [SUPPLIER_STATUS.ACTIVE, SUPPLIER_STATUS.ONBOARDING].includes(newStatus) &&
      !['director', 'vp', 'admin'].includes(userRole)
    ) {
      errors.push('High-risk suppliers require director-level approval');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Get suppliers that need attention
  getAttentionRequiredStatuses: () => {
    return [
      SUPPLIER_STATUS.PENDING,
      SUPPLIER_STATUS.AWAITING_DOCUMENTATION,
      SUPPLIER_STATUS.UNDER_REVIEW,
      SUPPLIER_STATUS.CONTRACT_EXPIRED,
      SUPPLIER_STATUS.SUSPENDED,
    ];
  },

  // Check if supplier needs contract renewal
  needsContractRenewal: (status, contractEndDate) => {
    if (!contractEndDate) return false;
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return (
      [SUPPLIER_STATUS.ACTIVE, SUPPLIER_STATUS.TRIAL].includes(status) &&
      new Date(contractEndDate) <= thirtyDaysFromNow
    );
  },
};

export default SUPPLIER_STATUS;