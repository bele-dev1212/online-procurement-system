/**
 * Bid Status Enums
 * Defines all possible statuses and transitions for bidding processes
 */

/**
 * Bid Status Enum
 */
export const BID_STATUS = {
  // Initial draft state
  DRAFT: 'draft',
  
  // Published and visible to suppliers
  PUBLISHED: 'published',
  
  // Open for bid submissions
  OPEN: 'open',
  
  // Closed for submissions, under evaluation
  UNDER_EVALUATION: 'under_evaluation',
  
  // Evaluation completed, awarded to winner
  AWARDED: 'awarded',
  
  // Bid rejected or cancelled
  REJECTED: 'rejected',
  
  // Bid cancelled before completion
  CANCELLED: 'cancelled',
  
  // Bid completed successfully
  COMPLETED: 'completed',
  
  // Bid extended for more time
  EXTENDED: 'extended',
  
  // Awaiting clarification
  AWAITING_CLARIFICATION: 'awaiting_clarification',
  
  // Under legal review
  UNDER_LEGAL_REVIEW: 'under_legal_review',
  
  // Negotiation phase
  NEGOTIATION: 'negotiation',
  
  // On hold temporarily
  ON_HOLD: 'on_hold',
};

/**
 * Bid Status Display Names
 */
export const BID_STATUS_DISPLAY = {
  [BID_STATUS.DRAFT]: 'Draft',
  [BID_STATUS.PUBLISHED]: 'Published',
  [BID_STATUS.OPEN]: 'Open for Bids',
  [BID_STATUS.UNDER_EVALUATION]: 'Under Evaluation',
  [BID_STATUS.AWARDED]: 'Awarded',
  [BID_STATUS.REJECTED]: 'Rejected',
  [BID_STATUS.CANCELLED]: 'Cancelled',
  [BID_STATUS.COMPLETED]: 'Completed',
  [BID_STATUS.EXTENDED]: 'Extended',
  [BID_STATUS.AWAITING_CLARIFICATION]: 'Awaiting Clarification',
  [BID_STATUS.UNDER_LEGAL_REVIEW]: 'Under Legal Review',
  [BID_STATUS.NEGOTIATION]: 'Negotiation',
  [BID_STATUS.ON_HOLD]: 'On Hold',
};

/**
 * Bid Status Categories
 */
export const BID_STATUS_CATEGORY = {
  [BID_STATUS.DRAFT]: 'draft',
  [BID_STATUS.PUBLISHED]: 'preparation',
  [BID_STATUS.OPEN]: 'active',
  [BID_STATUS.UNDER_EVALUATION]: 'evaluation',
  [BID_STATUS.AWARDED]: 'awarded',
  [BID_STATUS.REJECTED]: 'rejected',
  [BID_STATUS.CANCELLED]: 'cancelled',
  [BID_STATUS.COMPLETED]: 'completed',
  [BID_STATUS.EXTENDED]: 'active',
  [BID_STATUS.AWAITING_CLARIFICATION]: 'pending',
  [BID_STATUS.UNDER_LEGAL_REVIEW]: 'review',
  [BID_STATUS.NEGOTIATION]: 'active',
  [BID_STATUS.ON_HOLD]: 'pending',
};

/**
 * Bid Status Colors
 */
export const BID_STATUS_COLORS = {
  [BID_STATUS.DRAFT]: 'gray',
  [BID_STATUS.PUBLISHED]: 'blue',
  [BID_STATUS.OPEN]: 'green',
  [BID_STATUS.UNDER_EVALUATION]: 'orange',
  [BID_STATUS.AWARDED]: 'purple',
  [BID_STATUS.REJECTED]: 'red',
  [BID_STATUS.CANCELLED]: 'red',
  [BID_STATUS.COMPLETED]: 'green',
  [BID_STATUS.EXTENDED]: 'yellow',
  [BID_STATUS.AWAITING_CLARIFICATION]: 'yellow',
  [BID_STATUS.UNDER_LEGAL_REVIEW]: 'blue',
  [BID_STATUS.NEGOTIATION]: 'purple',
  [BID_STATUS.ON_HOLD]: 'orange',
};

/**
 * Bid Status Icons
 */
export const BID_STATUS_ICONS = {
  [BID_STATUS.DRAFT]: 'draft',
  [BID_STATUS.PUBLISHED]: 'publish',
  [BID_STATUS.OPEN]: 'event_available',
  [BID_STATUS.UNDER_EVALUATION]: 'assessment',
  [BID_STATUS.AWARDED]: 'emoji_events',
  [BID_STATUS.REJECTED]: 'cancel',
  [BID_STATUS.CANCELLED]: 'block',
  [BID_STATUS.COMPLETED]: 'check_circle',
  [BID_STATUS.EXTENDED]: 'schedule',
  [BID_STATUS.AWAITING_CLARIFICATION]: 'help',
  [BID_STATUS.UNDER_LEGAL_REVIEW]: 'gavel',
  [BID_STATUS.NEGOTIATION]: 'handshake',
  [BID_STATUS.ON_HOLD]: 'pause',
};

/**
 * Bid Status Descriptions
 */
export const BID_STATUS_DESCRIPTIONS = {
  [BID_STATUS.DRAFT]: 'Bid is in draft mode and not yet published',
  [BID_STATUS.PUBLISHED]: 'Bid has been published and is visible to suppliers',
  [BID_STATUS.OPEN]: 'Bid is open for submissions from suppliers',
  [BID_STATUS.UNDER_EVALUATION]: 'Bid submissions are being evaluated',
  [BID_STATUS.AWARDED]: 'Bid has been awarded to a winning supplier',
  [BID_STATUS.REJECTED]: 'Bid has been rejected or no winner selected',
  [BID_STATUS.CANCELLED]: 'Bid has been cancelled before completion',
  [BID_STATUS.COMPLETED]: 'Bid process has been completed successfully',
  [BID_STATUS.EXTENDED]: 'Bid submission deadline has been extended',
  [BID_STATUS.AWAITING_CLARIFICATION]: 'Awaiting clarification from suppliers',
  [BID_STATUS.UNDER_LEGAL_REVIEW]: 'Bid is under legal department review',
  [BID_STATUS.NEGOTIATION]: 'In negotiation phase with potential suppliers',
  [BID_STATUS.ON_HOLD]: 'Bid process is temporarily on hold',
};

/**
 * Bid Status Transitions
 */
export const BID_STATUS_TRANSITIONS = {
  [BID_STATUS.DRAFT]: {
    next: [
      BID_STATUS.PUBLISHED,
      BID_STATUS.CANCELLED,
    ],
    action: 'publish',
    editable: true,
  },
  
  [BID_STATUS.PUBLISHED]: {
    next: [
      BID_STATUS.OPEN,
      BID_STATUS.CANCELLED,
      BID_STATUS.ON_HOLD,
    ],
    action: 'open',
    requiresApproval: true,
  },
  
  [BID_STATUS.OPEN]: {
    next: [
      BID_STATUS.UNDER_EVALUATION,
      BID_STATUS.EXTENDED,
      BID_STATUS.CANCELLED,
      BID_STATUS.ON_HOLD,
      BID_STATUS.AWAITING_CLARIFICATION,
    ],
    action: 'close',
    canReceiveBids: true,
  },
  
  [BID_STATUS.UNDER_EVALUATION]: {
    next: [
      BID_STATUS.AWARDED,
      BID_STATUS.REJECTED,
      BID_STATUS.NEGOTIATION,
      BID_STATUS.UNDER_LEGAL_REVIEW,
      BID_STATUS.AWAITING_CLARIFICATION,
      BID_STATUS.ON_HOLD,
    ],
    action: 'evaluate',
    evaluationPeriod: 30, // days
  },
  
  [BID_STATUS.AWARDED]: {
    next: [
      BID_STATUS.COMPLETED,
      BID_STATUS.UNDER_LEGAL_REVIEW,
      BID_STATUS.NEGOTIATION,
      BID_STATUS.ON_HOLD,
    ],
    action: 'complete',
    hasWinner: true,
  },
  
  [BID_STATUS.REJECTED]: {
    next: [
      BID_STATUS.CANCELLED,
    ],
    action: 'close',
    requiresReason: true,
  },
  
  [BID_STATUS.CANCELLED]: {
    next: [],
    action: 'none',
    final: true,
  },
  
  [BID_STATUS.COMPLETED]: {
    next: [],
    action: 'none',
    final: true,
  },
  
  [BID_STATUS.EXTENDED]: {
    next: [
      BID_STATUS.OPEN,
      BID_STATUS.UNDER_EVALUATION,
      BID_STATUS.CANCELLED,
    ],
    action: 'reopen',
    extendedDeadline: true,
  },
  
  [BID_STATUS.AWAITING_CLARIFICATION]: {
    next: [
      BID_STATUS.OPEN,
      BID_STATUS.UNDER_EVALUATION,
      BID_STATUS.CANCELLED,
    ],
    action: 'clarify',
    clarificationRequired: true,
  },
  
  [BID_STATUS.UNDER_LEGAL_REVIEW]: {
    next: [
      BID_STATUS.AWARDED,
      BID_STATUS.REJECTED,
      BID_STATUS.NEGOTIATION,
      BID_STATUS.ON_HOLD,
    ],
    action: 'legal_approve',
    legalApprovalRequired: true,
  },
  
  [BID_STATUS.NEGOTIATION]: {
    next: [
      BID_STATUS.AWARDED,
      BID_STATUS.REJECTED,
      BID_STATUS.UNDER_LEGAL_REVIEW,
      BID_STATUS.ON_HOLD,
    ],
    action: 'finalize_negotiation',
    negotiationActive: true,
  },
  
  [BID_STATUS.ON_HOLD]: {
    next: [
      BID_STATUS.OPEN,
      BID_STATUS.UNDER_EVALUATION,
      BID_STATUS.CANCELLED,
    ],
    action: 'resume',
    requiresReason: true,
  },
};

/**
 * Bid Types
 */
export const BID_TYPE = {
  OPEN_TENDER: 'open_tender',
  LIMITED_TENDER: 'limited_tender',
  SINGLE_SOURCE: 'single_source',
  REQUEST_FOR_PROPOSAL: 'request_for_proposal',
  REQUEST_FOR_QUOTATION: 'request_for_quotation',
  EXPRESSION_OF_INTEREST: 'expression_of_interest',
};

/**
 * Bid Type Display Names
 */
export const BID_TYPE_DISPLAY = {
  [BID_TYPE.OPEN_TENDER]: 'Open Tender',
  [BID_TYPE.LIMITED_TENDER]: 'Limited Tender',
  [BID_TYPE.SINGLE_SOURCE]: 'Single Source',
  [BID_TYPE.REQUEST_FOR_PROPOSAL]: 'Request for Proposal',
  [BID_TYPE.REQUEST_FOR_QUOTATION]: 'Request for Quotation',
  [BID_TYPE.EXPRESSION_OF_INTEREST]: 'Expression of Interest',
};

/**
 * Bid Evaluation Criteria
 */
export const BID_EVALUATION_CRITERIA = {
  PRICE: 'price',
  QUALITY: 'quality',
  DELIVERY_TIME: 'delivery_time',
  TECHNICAL_SPECS: 'technical_specs',
  PAST_PERFORMANCE: 'past_performance',
  FINANCIAL_STABILITY: 'financial_stability',
  ENVIRONMENTAL_COMPLIANCE: 'environmental_compliance',
  SOCIAL_RESPONSIBILITY: 'social_responsibility',
  INNOVATION: 'innovation',
  SUPPORT_SERVICES: 'support_services',
};

/**
 * Bid Evaluation Criteria Weights
 */
export const BID_EVALUATION_WEIGHTS = {
  [BID_EVALUATION_CRITERIA.PRICE]: 0.3,
  [BID_EVALUATION_CRITERIA.QUALITY]: 0.25,
  [BID_EVALUATION_CRITERIA.DELIVERY_TIME]: 0.15,
  [BID_EVALUATION_CRITERIA.TECHNICAL_SPECS]: 0.1,
  [BID_EVALUATION_CRITERIA.PAST_PERFORMANCE]: 0.1,
  [BID_EVALUATION_CRITERIA.FINANCIAL_STABILITY]: 0.05,
  [BID_EVALUATION_CRITERIA.ENVIRONMENTAL_COMPLIANCE]: 0.025,
  [BID_EVALUATION_CRITERIA.SOCIAL_RESPONSIBILITY]: 0.025,
  [BID_EVALUATION_CRITERIA.INNOVATION]: 0.025,
  [BID_EVALUATION_CRITERIA.SUPPORT_SERVICES]: 0.025,
};

/**
 * Bid Status Utility Functions
 */
export const BidStatusUtils = {
  // Get display name for status
  getDisplayName: (status) => {
    return BID_STATUS_DISPLAY[status] || 'Unknown Status';
  },

  // Get status category
  getCategory: (status) => {
    return BID_STATUS_CATEGORY[status] || 'unknown';
  },

  // Get status color
  getColor: (status) => {
    return BID_STATUS_COLORS[status] || 'gray';
  },

  // Get status icon
  getIcon: (status) => {
    return BID_STATUS_ICONS[status] || 'help';
  },

  // Get status description
  getDescription: (status) => {
    return BID_STATUS_DESCRIPTIONS[status] || 'No description available';
  },

  // Check if status transition is valid
  isValidTransition: (fromStatus, toStatus) => {
    const transitions = BID_STATUS_TRANSITIONS[fromStatus];
    if (!transitions) return false;
    
    return transitions.next.includes(toStatus);
  },

  // Get available next statuses
  getNextStatuses: (currentStatus) => {
    const transitions = BID_STATUS_TRANSITIONS[currentStatus];
    return transitions ? transitions.next : [];
  },

  // Check if bid is active (accepting submissions)
  isActive: (status) => {
    return [
      BID_STATUS.OPEN,
      BID_STATUS.EXTENDED,
    ].includes(status);
  },

  // Check if bid is in evaluation phase
  isUnderEvaluation: (status) => {
    return [
      BID_STATUS.UNDER_EVALUATION,
      BID_STATUS.UNDER_LEGAL_REVIEW,
      BID_STATUS.NEGOTIATION,
      BID_STATUS.AWAITING_CLARIFICATION,
    ].includes(status);
  },

  // Check if bid is completed
  isCompleted: (status) => {
    return [
      BID_STATUS.AWARDED,
      BID_STATUS.REJECTED,
      BID_STATUS.COMPLETED,
      BID_STATUS.CANCELLED,
    ].includes(status);
  },

  // Check if bid is editable
  isEditable: (status) => {
    return [
      BID_STATUS.DRAFT,
    ].includes(status);
  },

  // Check if bid can receive submissions
  canReceiveSubmissions: (status) => {
    return [
      BID_STATUS.OPEN,
      BID_STATUS.EXTENDED,
    ].includes(status);
  },

  // Check if bid requires approval for next step
  requiresApproval: (status, nextStatus) => {
    const approvalTransitions = {
      [BID_STATUS.DRAFT]: [BID_STATUS.PUBLISHED],
      [BID_STATUS.PUBLISHED]: [BID_STATUS.OPEN],
      [BID_STATUS.UNDER_EVALUATION]: [BID_STATUS.AWARDED],
      [BID_STATUS.UNDER_LEGAL_REVIEW]: [BID_STATUS.AWARDED],
    };
    
    return approvalTransitions[status]?.includes(nextStatus) || false;
  },

  // Get bid type display name
  getBidTypeDisplay: (bidType) => {
    return BID_TYPE_DISPLAY[bidType] || 'Unknown Type';
  },

  // Calculate bid evaluation score
  calculateEvaluationScore: (scores, customWeights = null) => {
    const weights = customWeights || BID_EVALUATION_WEIGHTS;
    let totalScore = 0;
    let totalWeight = 0;
    
    Object.keys(weights).forEach(criteria => {
      if (scores[criteria] !== undefined) {
        totalScore += scores[criteria] * weights[criteria];
        totalWeight += weights[criteria];
      }
    });
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  },

  // Validate bid status change
  validateStatusChange: (currentStatus, newStatus, userRole, bidAmount = 0) => {
    const errors = [];
    
    // Check if transition is valid
    if (!BidStatusUtils.isValidTransition(currentStatus, newStatus)) {
      errors.push(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
    
    // Check permissions for critical operations
    if (newStatus === BID_STATUS.AWARDED && !['manager', 'director', 'admin'].includes(userRole)) {
      errors.push('Insufficient permissions to award bids');
    }
    
    if (newStatus === BID_STATUS.CANCELLED && !['manager', 'director', 'admin'].includes(userRole)) {
      errors.push('Insufficient permissions to cancel bids');
    }
    
    // Check amount thresholds for approval
    if (newStatus === BID_STATUS.AWARDED) {
      if (bidAmount > 50000 && !['director', 'admin'].includes(userRole)) {
        errors.push('Bid amount exceeds approval limit for your role');
      }
      
      if (bidAmount > 200000 && !['vp', 'admin'].includes(userRole)) {
        errors.push('Bid amount requires VP approval');
      }
    }
    
    // Legal review requirement for high-value bids
    if (
      newStatus === BID_STATUS.AWARDED && 
      bidAmount > 100000 && 
      newStatus !== BID_STATUS.UNDER_LEGAL_REVIEW
    ) {
      errors.push('High-value bids require legal department review');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Get recommended next status based on context
  getRecommendedNextStatus: (currentStatus, context = {}) => {
    const { 
      hasSubmissions = false, 
      evaluationComplete = false, 
      legalApproved = false,
      negotiationComplete = false,
      clarificationProvided = false,
    } = context;
    
    switch (currentStatus) {
      case BID_STATUS.DRAFT:
        return BID_STATUS.PUBLISHED;
        
      case BID_STATUS.PUBLISHED:
        return BID_STATUS.OPEN;
        
      case BID_STATUS.OPEN:
        return hasSubmissions ? BID_STATUS.UNDER_EVALUATION : currentStatus;
        
      case BID_STATUS.UNDER_EVALUATION:
        if (evaluationComplete) {
          return context.requiresLegalReview ? BID_STATUS.UNDER_LEGAL_REVIEW : BID_STATUS.AWARDED;
        }
        return currentStatus;
        
      case BID_STATUS.UNDER_LEGAL_REVIEW:
        return legalApproved ? BID_STATUS.AWARDED : currentStatus;
        
      case BID_STATUS.NEGOTIATION:
        return negotiationComplete ? BID_STATUS.AWARDED : currentStatus;
        
      case BID_STATUS.AWAITING_CLARIFICATION:
        return clarificationProvided ? BID_STATUS.UNDER_EVALUATION : currentStatus;
        
      case BID_STATUS.AWARDED:
        return BID_STATUS.COMPLETED;
        
      default:
        return currentStatus;
    }
  },

  // Get statuses that need attention
  getAttentionRequiredStatuses: () => {
    return [
      BID_STATUS.UNDER_EVALUATION,
      BID_STATUS.AWAITING_CLARIFICATION,
      BID_STATUS.UNDER_LEGAL_REVIEW,
      BID_STATUS.NEGOTIATION,
      BID_STATUS.ON_HOLD,
    ];
  },

  // Check if bid deadline is approaching
  isDeadlineApproaching: (status, deadline, thresholdHours = 24) => {
    if (!BidStatusUtils.isActive(status)) return false;
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate - now;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    return hoursDiff <= thresholdHours && hoursDiff > 0;
  },

  // Get evaluation criteria weight
  getEvaluationWeight: (criteria, customWeights = null) => {
    const weights = customWeights || BID_EVALUATION_WEIGHTS;
    return weights[criteria] || 0;
  },
};

export default BID_STATUS;