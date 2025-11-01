const mongoose = require('mongoose');

const requisitionItemSchema = new mongoose.Schema({
  requisition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Requisition',
    required: [true, 'Requisition reference is required']
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.001, 'Quantity must be greater than 0'],
    validate: {
      validator: Number.isFinite,
      message: 'Quantity must be a valid number'
    }
  },
  estimatedUnitPrice: {
    type: Number,
    required: [true, 'Estimated unit price is required'],
    min: [0, 'Estimated unit price cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Estimated unit price must be a valid number'
    }
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
  actualUnitPrice: {
    type: Number,
    min: [0, 'Actual unit price cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Actual unit price must be a valid number'
    }
  },
  actualTotalCost: {
    type: Number,
    min: [0, 'Actual total cost cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Actual total cost must be a valid number'
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  specifications: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true,
    maxlength: [50, 'Unit cannot be more than 50 characters']
  },
  status: {
    type: String,
    enum: [
      'requested',
      'approved',
      'rejected',
      'partially_approved',
      'on_hold',
      'cancelled',
      'converted_to_po'
    ],
    default: 'requested'
  },
  approvalComments: {
    type: String,
    maxlength: [1000, 'Approval comments cannot be more than 1000 characters']
  },
  approvedQuantity: {
    type: Number,
    min: 0,
    default: 0,
    validate: {
      validator: function(value) {
        return value <= this.quantity;
      },
      message: 'Approved quantity cannot exceed requested quantity'
    }
  },
  approvedUnitPrice: {
    type: Number,
    min: 0,
    validate: {
      validator: Number.isFinite,
      message: 'Approved unit price must be a valid number'
    }
  },
  approvedTotalCost: {
    type: Number,
    min: 0,
    validate: {
      validator: Number.isFinite,
      message: 'Approved total cost must be a valid number'
    }
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot be more than 500 characters']
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: Date,
  budgetAllocation: {
    code: String,
    amount: Number,
    availableBalance: Number,
    isWithinBudget: {
      type: Boolean,
      default: true
    }
  },
  urgency: {
    type: String,
    enum: ['normal', 'urgent', 'critical'],
    default: 'normal'
  },
  intendedUse: {
    type: String,
    required: [true, 'Intended use is required'],
    trim: true,
    maxlength: [500, 'Intended use cannot be more than 500 characters']
  },
  technicalRequirements: {
    type: String,
    maxlength: [2000, 'Technical requirements cannot be more than 2000 characters']
  },
  qualityStandards: [{
    type: String,
    trim: true
  }],
  deliveryRequirements: {
    expectedDate: Date,
    location: String,
    specialInstructions: String
  },
  preferredSupplier: {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier'
    },
    reason: String,
    quotation: {
      reference: String,
      amount: Number,
      date: Date
    }
  },
  alternativeProducts: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    description: String,
    specifications: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    estimatedUnitPrice: Number,
    advantages: String,
    disadvantages: String
  }],
  sourcingRecommendation: {
    method: {
      type: String,
      enum: ['direct_purchase', 'rfq', 'tender', 'framework_agreement', 'spot_purchase']
    },
    reason: String,
    recommendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    recommendedAt: Date
  },
  purchaseOrderItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrderItem'
  },
  rfqItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFQItem'
  },
  inventoryStatus: {
    currentStock: Number,
    reorderLevel: Number,
    onOrder: Number,
    leadTime: Number, // in days
    stockStatus: {
      type: String,
      enum: ['adequate', 'low', 'out_of_stock', 'excess'],
      default: 'adequate'
    }
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
    }]
  },
  complianceRequirements: [{
    type: String,
    trim: true
  }],
  sustainabilityConsiderations: {
    type: String,
    maxlength: [1000, 'Sustainability considerations cannot be more than 1000 characters']
  },
  lifecycleCost: {
    acquisition: Number,
    maintenance: Number,
    operation: Number,
    disposal: Number,
    total: Number
  },
  attachments: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['quotation', 'specification', 'catalog', 'other']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  internalNotes: {
    type: String,
    maxlength: [1000, 'Internal notes cannot be more than 1000 characters']
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
requisitionItemSchema.index({ requisition: 1 });
requisitionItemSchema.index({ product: 1 });
requisitionItemSchema.index({ status: 1 });
requisitionItemSchema.index({ urgency: 1 });
requisitionItemSchema.index({ 'budgetAllocation.code': 1 });

// Compound indexes
requisitionItemSchema.index({ requisition: 1, status: 1 });
requisitionItemSchema.index({ product: 1, status: 1 });
requisitionItemSchema.index({ requisition: 1, product: 1 }, { unique: true });

// Virtual for approval percentage
requisitionItemSchema.virtual('approvalPercentage').get(function() {
  return this.quantity > 0 ? (this.approvedQuantity / this.quantity) * 100 : 0;
});

// Virtual for cost variance
requisitionItemSchema.virtual('costVariance').get(function() {
  if (!this.actualTotalCost || !this.totalEstimatedCost) return 0;
  return this.actualTotalCost - this.totalEstimatedCost;
});

// Virtual for cost variance percentage
requisitionItemSchema.virtual('costVariancePercentage').get(function() {
  if (!this.actualTotalCost || !this.totalEstimatedCost || this.totalEstimatedCost === 0) return 0;
  return ((this.actualTotalCost - this.totalEstimatedCost) / this.totalEstimatedCost) * 100;
});

// Virtual for stock status description
requisitionItemSchema.virtual('stockStatusDescription').get(function() {
  const status = this.inventoryStatus.stockStatus;
  const currentStock = this.inventoryStatus.currentStock || 0;
  const reorderLevel = this.inventoryStatus.reorderLevel || 0;
  
  switch (status) {
    case 'adequate':
      return `Adequate stock (${currentStock} available)`;
    case 'low':
      return `Low stock (${currentStock} available, reorder at ${reorderLevel})`;
    case 'out_of_stock':
      return 'Out of stock';
    case 'excess':
      return `Excess stock (${currentStock} available)`;
    default:
      return 'Stock status unknown';
  }
});

// Pre-save middleware to calculate totals
requisitionItemSchema.pre('save', function(next) {
  // Calculate total estimated cost
  this.totalEstimatedCost = this.quantity * this.estimatedUnitPrice;
  
  // Calculate approved total cost if approved
  if (this.approvedQuantity && this.approvedUnitPrice) {
    this.approvedTotalCost = this.approvedQuantity * this.approvedUnitPrice;
  }
  
  // Calculate actual total cost if actual unit price is set
  if (this.actualUnitPrice) {
    this.actualTotalCost = this.quantity * this.actualUnitPrice;
  }
  
  // Update budget status
  if (this.budgetAllocation.availableBalance !== undefined && this.budgetAllocation.availableBalance !== null) {
    this.budgetAllocation.isWithinBudget = this.totalEstimatedCost <= this.budgetAllocation.availableBalance;
  }
  
  next();
});

// Pre-save middleware to update inventory status
requisitionItemSchema.pre('save', async function(next) {
  if (this.isModified('product')) {
    const Product = mongoose.model('Product');
    const product = await Product.findById(this.product).select('currentStock reorderLevel');
    
    if (product) {
      this.inventoryStatus.currentStock = product.currentStock;
      this.inventoryStatus.reorderLevel = product.reorderLevel;
      
      // Determine stock status
      if (product.currentStock === 0) {
        this.inventoryStatus.stockStatus = 'out_of_stock';
      } else if (product.currentStock <= product.reorderLevel) {
        this.inventoryStatus.stockStatus = 'low';
      } else if (product.currentStock > product.reorderLevel * 2) {
        this.inventoryStatus.stockStatus = 'excess';
      } else {
        this.inventoryStatus.stockStatus = 'adequate';
      }
    }
  }
  next();
});

// Instance method to approve item
requisitionItemSchema.methods.approve = function(approvedBy, approvedQuantity = null, approvedUnitPrice = null, comments = '') {
  this.status = 'approved';
  this.approvedQuantity = approvedQuantity || this.quantity;
  this.approvedUnitPrice = approvedUnitPrice || this.estimatedUnitPrice;
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  this.approvalComments = comments;
  
  // Calculate approved total cost
  this.approvedTotalCost = this.approvedQuantity * this.approvedUnitPrice;
  
  return this;
};

// Instance method to partially approve item
requisitionItemSchema.methods.partiallyApprove = function(approvedBy, approvedQuantity, approvedUnitPrice = null, comments = '') {
  if (approvedQuantity >= this.quantity) {
    throw new Error('Partial approval quantity must be less than requested quantity');
  }
  
  this.status = 'partially_approved';
  this.approvedQuantity = approvedQuantity;
  this.approvedUnitPrice = approvedUnitPrice || this.estimatedUnitPrice;
  this.approvedBy = approvedBy;
  this.approvedAt = new Date();
  this.approvalComments = comments;
  
  // Calculate approved total cost
  this.approvedTotalCost = this.approvedQuantity * this.approvedUnitPrice;
  
  return this;
};

// Instance method to reject item
requisitionItemSchema.methods.reject = function(rejectedBy, reason = '') {
  this.status = 'rejected';
  this.rejectionReason = reason;
  this.rejectedBy = rejectedBy;
  this.rejectedAt = new Date();
  
  return this;
};

// Instance method to update actual costs
requisitionItemSchema.methods.updateActualCosts = function(actualUnitPrice, actualQuantity = null) {
  this.actualUnitPrice = actualUnitPrice;
  this.actualTotalCost = (actualQuantity || this.quantity) * actualUnitPrice;
  
  return this;
};

// Instance method to add alternative product
requisitionItemSchema.methods.addAlternativeProduct = function(product, description, specifications, estimatedUnitPrice, advantages = '', disadvantages = '') {
  this.alternativeProducts.push({
    product,
    description,
    specifications,
    estimatedUnitPrice,
    advantages,
    disadvantages
  });
  
  return this;
};

// Instance method to set sourcing recommendation
requisitionItemSchema.methods.setSourcingRecommendation = function(method, reason, recommendedBy) {
  this.sourcingRecommendation = {
    method,
    reason,
    recommendedBy,
    recommendedAt: new Date()
  };
  
  return this;
};

// Instance method to get item statistics
requisitionItemSchema.methods.getItemStats = function() {
  const variance = this.costVariance;
  const variancePercentage = this.costVariancePercentage;
  const approvalRate = this.approvalPercentage;
  
  return {
    requestedCost: this.totalEstimatedCost,
    approvedCost: this.approvedTotalCost || 0,
    actualCost: this.actualTotalCost || 0,
    costVariance: variance,
    costVariancePercentage: variancePercentage,
    approvalRate: approvalRate,
    budgetStatus: this.budgetAllocation.isWithinBudget ? 'within_budget' : 'over_budget',
    stockStatus: this.inventoryStatus.stockStatus
  };
};

// Static method to get items by requisition
requisitionItemSchema.statics.getItemsByRequisition = function(requisitionId) {
  return this.find({ requisition: requisitionId })
    .populate('product', 'name sku description unit category specifications currentStock reorderLevel')
    .populate('preferredSupplier.supplier', 'name contactPerson email')
    .populate('alternativeProducts.product', 'name sku description')
    .populate('approvedBy', 'name email')
    .populate('rejectedBy', 'name email')
    .sort({ createdAt: 1 });
};

// Static method to get items by status
requisitionItemSchema.statics.getItemsByStatus = function(status) {
  return this.find({ status })
    .populate('requisition', 'requisitionNumber title status department')
    .populate('product', 'name sku unit')
    .sort({ createdAt: -1 });
};

// Static method to get items over budget
requisitionItemSchema.statics.getItemsOverBudget = function() {
  return this.find({
    'budgetAllocation.isWithinBudget': false,
    status: { $in: ['requested', 'approved', 'partially_approved'] }
  })
  .populate('requisition', 'requisitionNumber title department')
  .populate('product', 'name sku unit')
  .sort({ totalEstimatedCost: -1 });
};

// Static method to get low stock items
requisitionItemSchema.statics.getLowStockItems = function() {
  return this.find({
    'inventoryStatus.stockStatus': { $in: ['low', 'out_of_stock'] },
    status: { $in: ['requested', 'approved', 'partially_approved'] }
  })
  .populate('requisition', 'requisitionNumber title department priority')
  .populate('product', 'name sku unit reorderLevel')
  .sort({ 'inventoryStatus.currentStock': 1 });
};

// Virtual populate for related entities
requisitionItemSchema.virtual('productDetails', {
  ref: 'Product',
  localField: 'product',
  foreignField: '_id',
  justOne: true
});

requisitionItemSchema.virtual('requisitionDetails', {
  ref: 'Requisition',
  localField: 'requisition',
  foreignField: '_id',
  justOne: true
});

// Method to check if item can be modified
requisitionItemSchema.methods.canBeModified = function() {
  return ['requested'].includes(this.status);
};

// Method to check if item is approved
requisitionItemSchema.methods.isApproved = function() {
  return ['approved', 'partially_approved'].includes(this.status);
};

module.exports = mongoose.model('RequisitionItem', requisitionItemSchema);