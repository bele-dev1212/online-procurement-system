const mongoose = require('mongoose');

const requisitionSchema = new mongoose.Schema({
  requisitionNumber: {
    type: String,
    required: [true, 'Requisition number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [50, 'Requisition number cannot be more than 50 characters']
  },
  title: {
    type: String,
    required: [true, 'Requisition title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Requisition description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requested by user is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
    maxlength: [100, 'Department cannot be more than 100 characters']
  },
  costCenter: {
    type: String,
    trim: true,
    maxlength: [50, 'Cost center cannot be more than 50 characters']
  },
  projectCode: {
    type: String,
    trim: true,
    maxlength: [50, 'Project code cannot be more than 50 characters']
  },
  budgetCode: {
    type: String,
    trim: true,
    maxlength: [50, 'Budget code cannot be more than 50 characters']
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RequisitionItem'
  }],
  status: {
    type: String,
    enum: [
      'draft',
      'submitted',
      'under_review',
      'approved',
      'partially_approved',
      'rejected',
      'cancelled',
      'converted_to_po',
      'on_hold',
      'pending_budget_approval'
    ],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  totalEstimatedCost: {
    type: Number,
    required: [true, 'Total estimated cost is required'],
    min: [0, 'Total estimated cost cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Total estimated cost must be a valid number'
    }
  },
  actualCost: {
    type: Number,
    min: [0, 'Actual cost cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Actual cost must be a valid number'
    }
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
    maxlength: [3, 'Currency code must be 3 characters']
  },
  neededBy: {
    type: Date,
    required: [true, 'Needed by date is required'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Needed by date must be in the future'
    }
  },
  justification: {
    type: String,
    required: [true, 'Justification is required'],
    trim: true,
    maxlength: [2000, 'Justification cannot be more than 2000 characters']
  },
  intendedUse: {
    type: String,
    required: [true, 'Intended use is required'],
    trim: true,
    maxlength: [1000, 'Intended use cannot be more than 1000 characters']
  },
  approvalHistory: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      enum: ['submitted', 'reviewed', 'approved', 'rejected', 'cancelled', 'commented', 'returned', 'escalated'],
      required: true
    },
    level: {
      type: Number,
      min: 1,
      required: true
    },
    comments: {
      type: String,
      maxlength: [1000, 'Comments cannot be more than 1000 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    previousStatus: String,
    newStatus: String,
    attachments: [{
      name: String,
      url: String
    }]
  }],
  approvalWorkflow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApprovalWorkflow'
  },
  currentApprovalLevel: {
    type: Number,
    min: 0,
    default: 0
  },
  totalApprovalLevels: {
    type: Number,
    min: 0,
    default: 0
  },
  approvers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    level: {
      type: Number,
      min: 1,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'escalated', 'bypassed'],
      default: 'pending'
    },
    comments: String,
    actionDate: Date,
    dueDate: Date,
    isMandatory: {
      type: Boolean,
      default: true
    }
  }],
  attachments: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['quotation', 'specification', 'budget', 'justification', 'other'],
      default: 'other'
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  budgetStatus: {
    type: String,
    enum: ['within_budget', 'over_budget', 'budget_approved', 'budget_rejected', 'pending_budget_review'],
    default: 'within_budget'
  },
  budgetApproval: {
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    comments: String,
    approvedAmount: Number,
    budgetLineItem: String
  },
  sourcingMethod: {
    type: String,
    enum: ['direct_purchase', 'rfq', 'tender', 'framework_agreement', 'spot_purchase', 'not_specified'],
    default: 'not_specified'
  },
  preferredSuppliers: [{
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier'
    },
    reason: String,
    isRecommended: {
      type: Boolean,
      default: false
    }
  }],
  technicalSpecifications: {
    type: String,
    maxlength: [5000, 'Technical specifications cannot be more than 5000 characters']
  },
  deliveryRequirements: {
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    contactPerson: String,
    phone: String,
    specialInstructions: String
  },
  environmentalConsiderations: [{
    type: String,
    trim: true
  }],
  sustainabilityRequirements: {
    type: String,
    maxlength: [1000, 'Sustainability requirements cannot be more than 1000 characters']
  },
  riskAssessment: {
    level: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    factors: [{
      factor: String,
      impact: String,
      mitigation: String
    }],
    assessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assessedAt: Date
  },
  complianceRequirements: [{
    type: String,
    trim: true
  }],
  purchaseOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder'
  },
  rfq: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFQ'
  },
  convertedToPOAt: Date,
  convertedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  closure: {
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    closedAt: Date,
    closureNotes: String,
    closureReason: {
      type: String,
      enum: ['fulfilled', 'cancelled', 'superseded', 'expired', 'other']
    }
  },
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot be more than 2000 characters']
  },
  internalNotes: {
    type: String,
    maxlength: [2000, 'Internal notes cannot be more than 2000 characters']
  },
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
requisitionSchema.index({ requisitionNumber: 1 });
requisitionSchema.index({ requestedBy: 1 });
requisitionSchema.index({ department: 1 });
requisitionSchema.index({ status: 1 });
requisitionSchema.index({ priority: 1 });
requisitionSchema.index({ neededBy: 1 });
requisitionSchema.index({ createdAt: -1 });
requisitionSchema.index({ projectCode: 1 });
requisitionSchema.index({ budgetCode: 1 });

// Compound indexes
requisitionSchema.index({ status: 1, neededBy: 1 });
requisitionSchema.index({ department: 1, status: 1 });
requisitionSchema.index({ requestedBy: 1, createdAt: -1 });
requisitionSchema.index({ status: 1, priority: 1 });

// Virtual for requisition age in days
requisitionSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for days until needed
requisitionSchema.virtual('daysUntilNeeded').get(function() {
  const now = new Date();
  const diffTime = this.neededBy - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for urgency level
requisitionSchema.virtual('urgencyLevel').get(function() {
  const daysUntilNeeded = this.daysUntilNeeded;
  
  if (daysUntilNeeded < 0) return 'overdue';
  if (daysUntilNeeded <= 3) return 'critical';
  if (daysUntilNeeded <= 7) return 'high';
  if (daysUntilNeeded <= 14) return 'medium';
  return 'low';
});

// Virtual for approval progress
requisitionSchema.virtual('approvalProgress').get(function() {
  if (this.totalApprovalLevels === 0) return 0;
  return (this.currentApprovalLevel / this.totalApprovalLevels) * 100;
});

// Virtual for current approvers
requisitionSchema.virtual('currentApprovers').get(function() {
  return this.approvers.filter(approver => 
    approver.level === this.currentApprovalLevel + 1 && 
    approver.status === 'pending'
  );
});

// Virtual for approved items count
requisitionSchema.virtual('approvedItemsCount', {
  ref: 'RequisitionItem',
  localField: '_id',
  foreignField: 'requisition',
  match: { status: 'approved' },
  count: true
});

// Pre-save middleware to update status based on approval progress
requisitionSchema.pre('save', function(next) {
  // Update status based on current approval level
  if (this.currentApprovalLevel === 0 && this.status === 'draft') {
    this.status = 'submitted';
  } else if (this.currentApprovalLevel > 0 && this.currentApprovalLevel < this.totalApprovalLevels) {
    this.status = 'under_review';
  } else if (this.currentApprovalLevel === this.totalApprovalLevels) {
    this.status = 'approved';
  }
  
  // Check if requisition is overdue
  if (this.neededBy < new Date() && 
      ['draft', 'submitted', 'under_review', 'pending_budget_approval'].includes(this.status)) {
    this.priority = 'urgent';
  }
  
  next();
});

// Instance method to submit requisition
requisitionSchema.methods.submit = function() {
  if (this.status !== 'draft') {
    throw new Error('Only draft requisitions can be submitted');
  }
  
  if (this.items.length === 0) {
    throw new Error('Cannot submit requisition without items');
  }
  
  this.status = 'submitted';
  this.currentApprovalLevel = 1;
  
  // Add to approval history
  this.addApprovalHistory(
    this.requestedBy,
    'submitted',
    'Requisition submitted for approval',
    0,
    1
  );
  
  return this;
};

// Instance method to add approval history entry
requisitionSchema.methods.addApprovalHistory = function(user, action, comments, previousLevel = null, newLevel = null) {
  this.approvalHistory.push({
    user,
    action,
    level: this.currentApprovalLevel,
    comments,
    previousStatus: this.status,
    newStatus: this.status,
    previousLevel,
    newLevel,
    timestamp: new Date()
  });
};

// Instance method to approve at current level
requisitionSchema.methods.approve = function(user, comments = '', attachments = []) {
  const currentApprovers = this.approvers.filter(approver => 
    approver.level === this.currentApprovalLevel && 
    approver.status === 'pending'
  );
  
  const userApproval = currentApprovers.find(approver => approver.user.equals(user));
  
  if (!userApproval) {
    throw new Error('User is not authorized to approve at this level');
  }
  
  // Update approver status
  userApproval.status = 'approved';
  userApproval.comments = comments;
  userApproval.actionDate = new Date();
  
  // Check if all mandatory approvers at this level have approved
  const pendingMandatoryApprovers = currentApprovers.filter(approver => 
    approver.status === 'pending' && approver.isMandatory
  );
  
  if (pendingMandatoryApprovers.length === 0) {
    // Move to next level or complete approval
    if (this.currentApprovalLevel < this.totalApprovalLevels) {
      this.currentApprovalLevel++;
      this.status = 'under_review';
    } else {
      this.status = 'approved';
    }
  }
  
  // Add to approval history
  this.addApprovalHistory(
    user,
    'approved',
    comments,
    this.currentApprovalLevel - 1,
    this.currentApprovalLevel
  );
  
  return this;
};

// Instance method to reject requisition
requisitionSchema.methods.reject = function(user, comments = '') {
  this.status = 'rejected';
  
  // Update all pending approvers
  this.approvers.forEach(approver => {
    if (approver.status === 'pending') {
      approver.status = 'rejected';
      approver.comments = comments;
      approver.actionDate = new Date();
    }
  });
  
  // Add to approval history
  this.addApprovalHistory(user, 'rejected', comments);
  
  return this;
};

// Instance method to cancel requisition
requisitionSchema.methods.cancel = function(user, reason = '') {
  if (!['draft', 'submitted', 'under_review'].includes(this.status)) {
    throw new Error('Cannot cancel requisition in current status');
  }
  
  this.status = 'cancelled';
  
  // Add to approval history
  this.addApprovalHistory(user, 'cancelled', reason);
  
  return this;
};

// Instance method to convert to purchase order
requisitionSchema.methods.convertToPO = function(convertedBy, poReference) {
  if (this.status !== 'approved') {
    throw new Error('Only approved requisitions can be converted to purchase orders');
  }
  
  this.status = 'converted_to_po';
  this.purchaseOrder = poReference;
  this.convertedToPOAt = new Date();
  this.convertedBy = convertedBy;
  
  // Add to approval history
  this.addApprovalHistory(convertedBy, 'converted_to_po', 'Converted to purchase order');
  
  return this;
};

// Instance method to add attachment
requisitionSchema.methods.addAttachment = function(name, url, type, uploadedBy, description = '') {
  this.attachments.push({
    name,
    url,
    type,
    uploadedBy,
    description,
    uploadedAt: new Date()
  });
  
  return this;
};

// Instance method to get requisition statistics
requisitionSchema.methods.getRequisitionStats = async function() {
  const RequisitionItem = mongoose.model('RequisitionItem');
  
  const [items, approvedItems, rejectedItems] = await Promise.all([
    RequisitionItem.find({ requisition: this._id }),
    RequisitionItem.find({ requisition: this._id, status: 'approved' }),
    RequisitionItem.find({ requisition: this._id, status: 'rejected' })
  ]);
  
  const totalItems = items.length;
  const approvedCost = approvedItems.reduce((sum, item) => sum + item.totalEstimatedCost, 0);
  const rejectedCost = rejectedItems.reduce((sum, item) => sum + item.totalEstimatedCost, 0);
  
  return {
    totalItems,
    approvedItems: approvedItems.length,
    rejectedItems: rejectedItems.length,
    approvedCost,
    rejectedCost,
    approvalRate: totalItems > 0 ? (approvedItems.length / totalItems) * 100 : 0
  };
};

// Static method to generate next requisition number
requisitionSchema.statics.generateRequisitionNumber = async function() {
  const currentYear = new Date().getFullYear();
  const prefix = `REQ-${currentYear}-`;
  
  const lastRequisition = await this.findOne(
    { requisitionNumber: new RegExp(`^${prefix}`) },
    { requisitionNumber: 1 },
    { sort: { requisitionNumber: -1 } }
  );
  
  let sequence = 1;
  if (lastRequisition && lastRequisition.requisitionNumber) {
    const lastSequence = parseInt(lastRequisition.requisitionNumber.split('-')[2]) || 0;
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(4, '0')}`;
};

// Static method to get requisitions by status
requisitionSchema.statics.getRequisitionsByStatus = function(status) {
  return this.find({ status })
    .populate('requestedBy', 'name email department')
    .populate('items')
    .sort({ createdAt: -1 });
};

// Static method to get overdue requisitions
requisitionSchema.statics.getOverdueRequisitions = function() {
  const now = new Date();
  return this.find({
    neededBy: { $lt: now },
    status: { $in: ['submitted', 'under_review', 'pending_budget_approval'] }
  })
  .populate('requestedBy', 'name email department')
  .sort({ neededBy: 1 });
};

// Static method to get requisitions needing approval
requisitionSchema.statics.getRequisitionsNeedingApproval = function(userId) {
  return this.find({
    status: { $in: ['submitted', 'under_review'] },
    'approvers.user': userId,
    'approvers.status': 'pending',
    'approvers.level': { $lte: '$currentApprovalLevel' }
  })
  .populate('requestedBy', 'name email department')
  .populate('items')
  .sort({ priority: -1, neededBy: 1 });
};

// Static method to get department requisitions
requisitionSchema.statics.getDepartmentRequisitions = function(department, options = {}) {
  const { status, startDate, endDate } = options;
  const match = { department };
  
  if (status) match.status = status;
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }
  
  return this.find(match)
    .populate('requestedBy', 'name email')
    .sort({ createdAt: -1 });
};

// Virtual populate for related entities
requisitionSchema.virtual('requisitionItems', {
  ref: 'RequisitionItem',
  localField: '_id',
  foreignField: 'requisition'
});

requisitionSchema.virtual('purchaseOrderDetails', {
  ref: 'PurchaseOrder',
  localField: 'purchaseOrder',
  foreignField: '_id',
  justOne: true
});

requisitionSchema.virtual('rfqDetails', {
  ref: 'RFQ',
  localField: 'rfq',
  foreignField: '_id',
  justOne: true
});

// Method to check if requisition can be modified
requisitionSchema.methods.canBeModified = function() {
  return ['draft', 'submitted'].includes(this.status);
};

// Method to check if requisition is urgent
requisitionSchema.methods.isUrgent = function() {
  return this.priority === 'urgent' || this.urgencyLevel === 'critical' || this.urgencyLevel === 'overdue';
};

module.exports = mongoose.model('Requisition', requisitionSchema);