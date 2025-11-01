/**
 * Purchase Order Status Enums
 * Defines all possible statuses and transitions for purchase orders
 */

/**
 * Purchase Order Status Enum
 */
export const PURCHASE_ORDER_STATUS = {
  // Initial draft state
  DRAFT: 'draft',
  
  // Submitted for approval
  PENDING_APPROVAL: 'pending_approval',
  
  // Under review by approvers
  UNDER_REVIEW: 'under_review',
  
  // Approved and ready for processing
  APPROVED: 'approved',
  
  // Rejected by approvers
  REJECTED: 'rejected',
  
  // Sent to supplier
  ORDERED: 'ordered',
  
  // Partially received from supplier
  PARTIALLY_RECEIVED: 'partially_received',
  
  // Fully received from supplier
  RECEIVED: 'received',
  
  // Cancelled before completion
  CANCELLED: 'cancelled',
  
  // Completed and closed
  CLOSED: 'closed',
  
  // On hold temporarily
  ON_HOLD: 'on_hold',
  
  // Awaiting additional information
  AWAITING_INFO: 'awaiting_info',
  
  // Being amended
  AMENDING: 'amending',
};

/**
 * Purchase Order Status Display Names
 */
export const PURCHASE_ORDER_STATUS_DISPLAY = {
  [PURCHASE_ORDER_STATUS.DRAFT]: 'Draft',
  [PURCHASE_ORDER_STATUS.PENDING_APPROVAL]: 'Pending Approval',
  [PURCHASE_ORDER_STATUS.UNDER_REVIEW]: 'Under Review',
  [PURCHASE_ORDER_STATUS.APPROVED]: 'Approved',
  [PURCHASE_ORDER_STATUS.REJECTED]: 'Rejected',
  [PURCHASE_ORDER_STATUS.ORDERED]: 'Ordered',
  [PURCHASE_ORDER_STATUS.PARTIALLY_RECEIVED]: 'Partially Received',
  [PURCHASE_ORDER_STATUS.RECEIVED]: 'Received',
  [PURCHASE_ORDER_STATUS.CANCELLED]: 'Cancelled',
  [PURCHASE_ORDER_STATUS.CLOSED]: 'Closed',
  [PURCHASE_ORDER_STATUS.ON_HOLD]: 'On Hold',
  [PURCHASE_ORDER_STATUS.AWAITING_INFO]: 'Awaiting Information',
  [PURCHASE_ORDER_STATUS.AMENDING]: 'Amending',
};

/**
 * Purchase Order Status Categories
 */
export const PURCHASE_ORDER_STATUS_CATEGORY = {
  [PURCHASE_ORDER_STATUS.DRAFT]: 'draft',
  [PURCHASE_ORDER_STATUS.PENDING_APPROVAL]: 'pending',
  [PURCHASE_ORDER_STATUS.UNDER_REVIEW]: 'pending',
  [PURCHASE_ORDER_STATUS.APPROVED]: 'approved',
  [PURCHASE_ORDER_STATUS.REJECTED]: 'rejected',
  [PURCHASE_ORDER_STATUS.ORDERED]: 'active',
  [PURCHASE_ORDER_STATUS.PARTIALLY_RECEIVED]: 'active',
  [PURCHASE_ORDER_STATUS.RECEIVED]: 'completed',
  [PURCHASE_ORDER_STATUS.CANCELLED]: 'cancelled',
  [PURCHASE_ORDER_STATUS.CLOSED]: 'completed',
  [PURCHASE_ORDER_STATUS.ON_HOLD]: 'pending',
  [PURCHASE_ORDER_STATUS.AWAITING_INFO]: 'pending',
  [PURCHASE_ORDER_STATUS.AMENDING]: 'pending',
};

/**
 * Purchase Order Status Colors
 */
export const PURCHASE_ORDER_STATUS_COLORS = {
  [PURCHASE_ORDER_STATUS.DRAFT]: 'gray',
  [PURCHASE_ORDER_STATUS.PENDING_APPROVAL]: 'orange',
  [PURCHASE_ORDER_STATUS.UNDER_REVIEW]: 'blue',
  [PURCHASE_ORDER_STATUS.APPROVED]: 'green',
  [PURCHASE_ORDER_STATUS.REJECTED]: 'red',
  [PURCHASE_ORDER_STATUS.ORDERED]: 'purple',
  [PURCHASE_ORDER_STATUS.PARTIALLY_RECEIVED]: 'yellow',
  [PURCHASE_ORDER_STATUS.RECEIVED]: 'green',
  [PURCHASE_ORDER_STATUS.CANCELLED]: 'red',
  [PURCHASE_ORDER_STATUS.CLOSED]: 'gray',
  [PURCHASE_ORDER_STATUS.ON_HOLD]: 'orange',
  [PURCHASE_ORDER_STATUS.AWAITING_INFO]: 'yellow',
  [PURCHASE_ORDER_STATUS.AMENDING]: 'blue',
};

/**
 * Purchase Order Status Icons
 */
export const PURCHASE_ORDER_STATUS_ICONS = {
  [PURCHASE_ORDER_STATUS.DRAFT]: 'draft',
  [PURCHASE_ORDER_STATUS.PENDING_APPROVAL]: 'pending',
  [PURCHASE_ORDER_STATUS.UNDER_REVIEW]: 'review',
  [PURCHASE_ORDER_STATUS.APPROVED]: 'check_circle',
  [PURCHASE_ORDER_STATUS.REJECTED]: 'cancel',
  [PURCHASE_ORDER_STATUS.ORDERED]: 'shopping_cart',
  [PURCHASE_ORDER_STATUS.PARTIALLY_RECEIVED]: 'inventory_2',
  [PURCHASE_ORDER_STATUS.RECEIVED]: 'inventory',
  [PURCHASE_ORDER_STATUS.CANCELLED]: 'block',
  [PURCHASE_ORDER_STATUS.CLOSED]: 'archive',
  [PURCHASE_ORDER_STATUS.ON_HOLD]: 'pause',
  [PURCHASE_ORDER_STATUS.AWAITING_INFO]: 'help',
  [PURCHASE_ORDER_STATUS.AMENDING]: 'edit',
};

/**
 * Purchase Order Status Descriptions
 */
export const PURCHASE_ORDER_STATUS_DESCRIPTIONS = {
  [PURCHASE_ORDER_STATUS.DRAFT]: 'Purchase order is in draft mode and not yet submitted',
  [PURCHASE_ORDER_STATUS.PENDING_APPROVAL]: 'Purchase order is submitted and waiting for approval',
  [PURCHASE_ORDER_STATUS.UNDER_REVIEW]: 'Purchase order is currently being reviewed by approvers',
  [PURCHASE_ORDER_STATUS.APPROVED]: 'Purchase order has been approved and is ready for processing',
  [PURCHASE_ORDER_STATUS.REJECTED]: 'Purchase order has been rejected by approvers',
  [PURCHASE_ORDER_STATUS.ORDERED]: 'Purchase order has been sent to the supplier',
  [PURCHASE_ORDER_STATUS.PARTIALLY_RECEIVED]: 'Some items from the purchase order have been received',
  [PURCHASE_ORDER_STATUS.RECEIVED]: 'All items from the purchase order have been received',
  [PURCHASE_ORDER_STATUS.CANCELLED]: 'Purchase order has been cancelled',
  [PURCHASE_ORDER_STATUS.CLOSED]: 'Purchase order is completed and closed',
  [PURCHASE_ORDER_STATUS.ON_HOLD]: 'Purchase order is temporarily on hold',
  [PURCHASE_ORDER_STATUS.AWAITING_INFO]: 'Purchase order is waiting for additional information',
  [PURCHASE_ORDER_STATUS.AMENDING]: 'Purchase order is being amended or modified',
};

/**
 * Purchase Order Status Transitions
 * Defines valid status transitions and required actions
 */
export const PURCHASE_ORDER_STATUS_TRANSITIONS = {
  [PURCHASE_ORDER_STATUS.DRAFT]: {
    next: [
      PURCHASE_ORDER_STATUS.PENDING_APPROVAL,
      PURCHASE_ORDER_STATUS.CANCELLED,
    ],
    action: 'submit',
    requiredFields: ['supplierId', 'items', 'totalAmount'],
  },
  
  [PURCHASE_ORDER_STATUS.PENDING_APPROVAL]: {
    next: [
      PURCHASE_ORDER_STATUS.UNDER_REVIEW,
      PURCHASE_ORDER_STATUS.APPROVED,
      PURCHASE_ORDER_STATUS.REJECTED,
      PURCHASE_ORDER_STATUS.CANCELLED,
      PURCHASE_ORDER_STATUS.ON_HOLD,
    ],
    action: 'review',
    requiredApprovals: 1,
  },
  
  [PURCHASE_ORDER_STATUS.UNDER_REVIEW]: {
    next: [
      PURCHASE_ORDER_STATUS.APPROVED,
      PURCHASE_ORDER_STATUS.REJECTED,
      PURCHASE_ORDER_STATUS.PENDING_APPROVAL,
      PURCHASE_ORDER_STATUS.ON_HOLD,
      PURCHASE_ORDER_STATUS.AWAITING_INFO,
    ],
    action: 'approve',
    approverLevel: 'manager',
  },
  
  [PURCHASE_ORDER_STATUS.APPROVED]: {
    next: [
      PURCHASE_ORDER_STATUS.ORDERED,
      PURCHASE_ORDER_STATUS.CANCELLED,
      PURCHASE_ORDER_STATUS.ON_HOLD,
    ],
    action: 'order',
    canEdit: false,
  },
  
  [PURCHASE_ORDER_STATUS.REJECTED]: {
    next: [
      PURCHASE_ORDER_STATUS.DRAFT,
      PURCHASE_ORDER_STATUS.CANCELLED,
    ],
    action: 'revise',
    requiresReason: true,
  },
  
  [PURCHASE_ORDER_STATUS.ORDERED]: {
    next: [
      PURCHASE_ORDER_STATUS.PARTIALLY_RECEIVED,
      PURCHASE_ORDER_STATUS.RECEIVED,
      PURCHASE_ORDER_STATUS.CANCELLED,
      PURCHASE_ORDER_STATUS.ON_HOLD,
    ],
    action: 'receive',
    expectedDelivery: true,
  },
  
  [PURCHASE_ORDER_STATUS.PARTIALLY_RECEIVED]: {
    next: [
      PURCHASE_ORDER_STATUS.RECEIVED,
      PURCHASE_ORDER_STATUS.ON_HOLD,
    ],
    action: 'receive',
    partialDelivery: true,
  },
  
  [PURCHASE_ORDER_STATUS.RECEIVED]: {
    next: [
      PURCHASE_ORDER_STATUS.CLOSED,
    ],
    action: 'close',
    autoClose: true,
  },
  
  [PURCHASE_ORDER_STATUS.CANCELLED]: {
    next: [],
    action: 'none',
    final: true,
  },
  
  [PURCHASE_ORDER_STATUS.CLOSED]: {
    next: [],
    action: 'none',
    final: true,
  },
  
  [PURCHASE_ORDER_STATUS.ON_HOLD]: {
    next: [
      PURCHASE_ORDER_STATUS.PENDING_APPROVAL,
      PURCHASE_ORDER_STATUS.ORDERED,
      PURCHASE_ORDER_STATUS.CANCELLED,
    ],
    action: 'resume',
    requiresReason: true,
  },
  
  [PURCHASE_ORDER_STATUS.AWAITING_INFO]: {
    next: [
      PURCHASE_ORDER_STATUS.PENDING_APPROVAL,
      PURCHASE_ORDER_STATUS.CANCELLED,
    ],
    action: 'provide_info',
    informationRequired: true,
  },
  
  [PURCHASE_ORDER_STATUS.AMENDING]: {
    next: [
      PURCHASE_ORDER_STATUS.PENDING_APPROVAL,
      PURCHASE_ORDER_STATUS.CANCELLED,
    ],
    action: 'complete_amendment',
    canEdit: true,
  },
};

/**
 * Purchase Order Status Workflow
 */
export const PURCHASE_ORDER_WORKFLOW = {
  // Initial workflow states
  INITIAL: [
    PURCHASE_ORDER_STATUS.DRAFT,
  ],
  
  // Approval workflow states
  APPROVAL: [
    PURCHASE_ORDER_STATUS.PENDING_APPROVAL,
    PURCHASE_ORDER_STATUS.UNDER_REVIEW,
  ],
  
  // Active workflow states
  ACTIVE: [
    PURCHASE_ORDER_STATUS.APPROVED,
    PURCHASE_ORDER_STATUS.ORDERED,
    PURCHASE_ORDER_STATUS.PARTIALLY_RECEIVED,
  ],
  
  // Completion workflow states
  COMPLETION: [
    PURCHASE_ORDER_STATUS.RECEIVED,
    PURCHASE_ORDER_STATUS.CLOSED,
  ],
  
  // Problem workflow states
  PROBLEM: [
    PURCHASE_ORDER_STATUS.REJECTED,
    PURCHASE_ORDER_STATUS.CANCELLED,
    PURCHASE_ORDER_STATUS.ON_HOLD,
    PURCHASE_ORDER_STATUS.AWAITING_INFO,
  ],
  
  // Editable states
  EDITABLE: [
    PURCHASE_ORDER_STATUS.DRAFT,
    PURCHASE_ORDER_STATUS.AMENDING,
  ],
};

/**
 * Purchase Order Status Utility Functions
 */
export const PurchaseOrderStatusUtils = {
  // Get display name for status
  getDisplayName: (status) => {
    return PURCHASE_ORDER_STATUS_DISPLAY[status] || 'Unknown Status';
  },

  // Get status category
  getCategory: (status) => {
    return PURCHASE_ORDER_STATUS_CATEGORY[status] || 'unknown';
  },

  // Get status color
  getColor: (status) => {
    return PURCHASE_ORDER_STATUS_COLORS[status] || 'gray';
  },

  // Get status icon
  getIcon: (status) => {
    return PURCHASE_ORDER_STATUS_ICONS[status] || 'help';
  },

  // Get status description
  getDescription: (status) => {
    return PURCHASE_ORDER_STATUS_DESCRIPTIONS[status] || 'No description available';
  },

  // Check if status transition is valid
  isValidTransition: (fromStatus, toStatus) => {
    const transitions = PURCHASE_ORDER_STATUS_TRANSITIONS[fromStatus];
    if (!transitions) return false;
    
    return transitions.next.includes(toStatus);
  },

  // Get available next statuses
  getNextStatuses: (currentStatus) => {
    const transitions = PURCHASE_ORDER_STATUS_TRANSITIONS[currentStatus];
    return transitions ? transitions.next : [];
  },

  // Check if status is final
  isFinalStatus: (status) => {
    const transitions = PURCHASE_ORDER_STATUS_TRANSITIONS[status];
    return transitions ? transitions.final || false : false;
  },

  // Check if status requires approval
  requiresApproval: (status) => {
    return [
      PURCHASE_ORDER_STATUS.PENDING_APPROVAL,
      PURCHASE_ORDER_STATUS.UNDER_REVIEW,
    ].includes(status);
  },

  // Check if status is active
  isActive: (status) => {
    return PURCHASE_ORDER_WORKFLOW.ACTIVE.includes(status);
  },

  // Check if status is completed
  isCompleted: (status) => {
    return PURCHASE_ORDER_WORKFLOW.COMPLETION.includes(status);
  },

  // Check if status is problematic
  isProblematic: (status) => {
    return PURCHASE_ORDER_WORKFLOW.PROBLEM.includes(status);
  },

  // Check if purchase order is editable
  isEditable: (status) => {
    return PURCHASE_ORDER_WORKFLOW.EDITABLE.includes(status);
  },

  // Get all statuses in a workflow stage
  getStatusesByWorkflow: (workflow) => {
    return PURCHASE_ORDER_WORKFLOW[workflow] || [];
  },

  // Get status progression percentage
  getProgressPercentage: (status) => {
    const progressMap = {
      [PURCHASE_ORDER_STATUS.DRAFT]: 0,
      [PURCHASE_ORDER_STATUS.PENDING_APPROVAL]: 25,
      [PURCHASE_ORDER_STATUS.UNDER_REVIEW]: 40,
      [PURCHASE_ORDER_STATUS.APPROVED]: 60,
      [PURCHASE_ORDER_STATUS.ORDERED]: 75,
      [PURCHASE_ORDER_STATUS.PARTIALLY_RECEIVED]: 90,
      [PURCHASE_ORDER_STATUS.RECEIVED]: 95,
      [PURCHASE_ORDER_STATUS.CLOSED]: 100,
      [PURCHASE_ORDER_STATUS.CANCELLED]: 100,
      [PURCHASE_ORDER_STATUS.ON_HOLD]: 50,
      [PURCHASE_ORDER_STATUS.AWAITING_INFO]: 30,
      [PURCHASE_ORDER_STATUS.AMENDING]: 20,
    };
    
    return progressMap[status] || 0;
  },

  // Validate status change with business rules
  validateStatusChange: (currentStatus, newStatus, userRole, amount = 0) => {
    const errors = [];
    
    // Check if transition is valid
    if (!PurchaseOrderStatusUtils.isValidTransition(currentStatus, newStatus)) {
      errors.push(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
    
    // Check user permissions for specific transitions
    if (newStatus === PURCHASE_ORDER_STATUS.APPROVED && !['manager', 'director', 'admin'].includes(userRole)) {
      errors.push('Insufficient permissions to approve purchase orders');
    }
    
    if (newStatus === PURCHASE_ORDER_STATUS.REJECTED && !['manager', 'director', 'admin'].includes(userRole)) {
      errors.push('Insufficient permissions to reject purchase orders');
    }
    
    // Check amount thresholds for approval
    if (newStatus === PURCHASE_ORDER_STATUS.APPROVED) {
      if (amount > 10000 && !['director', 'admin'].includes(userRole)) {
        errors.push('Amount exceeds approval limit for your role');
      }
      
      if (amount > 50000 && !['vp', 'admin'].includes(userRole)) {
        errors.push('Amount requires VP approval');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Get recommended next status based on current state
  getRecommendedNextStatus: (currentStatus, context = {}) => {
    const { hasReceipts = false, isFullyReceived = false, hasIssues = false } = context;
    
    switch (currentStatus) {
      case PURCHASE_ORDER_STATUS.DRAFT:
        return PURCHASE_ORDER_STATUS.PENDING_APPROVAL;
        
      case PURCHASE_ORDER_STATUS.APPROVED:
        return PURCHASE_ORDER_STATUS.ORDERED;
        
      case PURCHASE_ORDER_STATUS.ORDERED:
        return hasReceipts ? PURCHASE_ORDER_STATUS.PARTIALLY_RECEIVED : currentStatus;
        
      case PURCHASE_ORDER_STATUS.PARTIALLY_RECEIVED:
        return isFullyReceived ? PURCHASE_ORDER_STATUS.RECEIVED : currentStatus;
        
      case PURCHASE_ORDER_STATUS.RECEIVED:
        return PURCHASE_ORDER_STATUS.CLOSED;
        
      case PURCHASE_ORDER_STATUS.ON_HOLD:
        return hasIssues ? PURCHASE_ORDER_STATUS.AWAITING_INFO : PURCHASE_ORDER_STATUS.PENDING_APPROVAL;
        
      default:
        return currentStatus;
    }
  },
};

export default PURCHASE_ORDER_STATUS;