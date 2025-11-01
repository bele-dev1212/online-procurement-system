const mongoose = require('mongoose');

const purchaseOrderItemSchema = new mongoose.Schema({
  purchaseOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder',
    required: [true, 'Purchase order reference is required']
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
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Unit price must be a valid number'
    }
  },
  total: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Total must be a valid number'
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
  receivedQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Received quantity cannot be negative'],
    validate: {
      validator: function(value) {
        return value <= this.quantity;
      },
      message: 'Received quantity cannot exceed ordered quantity'
    }
  },
  rejectedQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Rejected quantity cannot be negative']
  },
  acceptedQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Accepted quantity cannot be negative']
  },
  taxRate: {
    type: Number,
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%'],
    default: 0,
    validate: {
      validator: Number.isFinite,
      message: 'Tax rate must be a valid number'
    }
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: [0, 'Tax amount cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Tax amount must be a valid number'
    }
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Discount must be a valid number'
    }
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed', 'none'],
    default: 'none'
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: [0, 'Discount amount cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Discount amount must be a valid number'
    }
  },
  netAmount: {
    type: Number,
    required: true,
    min: [0, 'Net amount cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Net amount must be a valid number'
    }
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'partially_received', 'fully_received', 'over_received', 'cancelled'],
    default: 'pending'
  },
  qualityStatus: {
    type: String,
    enum: ['pending', 'passed', 'failed', 'partial'],
    default: 'pending'
  },
  expectedDeliveryDate: {
    type: Date,
    validate: {
      validator: function(date) {
        return !date || date > new Date();
      },
      message: 'Expected delivery date must be in the future'
    }
  },
  actualDeliveryDate: Date,
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  receivedAt: Date,
  qualityCheck: {
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedAt: Date,
    notes: {
      type: String,
      maxlength: [500, 'Quality check notes cannot be more than 500 characters']
    },
    defects: [{
      type: {
        type: String,
        required: true,
        trim: true
      },
      description: String,
      severity: {
        type: String,
        enum: ['minor', 'major', 'critical'],
        default: 'minor'
      },
      quantity: {
        type: Number,
        min: 0,
        default: 0
      }
    }],
    inspectionReport: String // URL to inspection report document
  },
  inventoryUpdates: [{
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    updateType: {
      type: String,
      enum: ['receipt', 'return', 'adjustment'],
      required: true
    },
    notes: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    inventoryLocation: String
  }],
  returnHistory: [{
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    condition: {
      type: String,
      enum: ['damaged', 'defective', 'wrong_item', 'excess', 'other'],
      required: true
    },
    returnDate: {
      type: Date,
      default: Date.now
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    creditNote: String,
    notes: String
  }],
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  lineItemStatus: {
    type: String,
    enum: ['active', 'cancelled', 'closed'],
    default: 'active'
  },
  cancellationReason: {
    type: String,
    maxlength: [500, 'Cancellation reason cannot be more than 500 characters']
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
purchaseOrderItemSchema.index({ purchaseOrder: 1 });
purchaseOrderItemSchema.index({ product: 1 });
purchaseOrderItemSchema.index({ deliveryStatus: 1 });
purchaseOrderItemSchema.index({ qualityStatus: 1 });
purchaseOrderItemSchema.index({ expectedDeliveryDate: 1 });
purchaseOrderItemSchema.index({ createdAt: -1 });
purchaseOrderItemSchema.index({ lineItemStatus: 1 });

// Compound indexes
purchaseOrderItemSchema.index({ purchaseOrder: 1, product: 1 }, { unique: true });
purchaseOrderItemSchema.index({ purchaseOrder: 1, deliveryStatus: 1 });
purchaseOrderItemSchema.index({ product: 1, deliveryStatus: 1 });

// Virtual for remaining quantity to receive
purchaseOrderItemSchema.virtual('remainingQuantity').get(function() {
  return Math.max(0, this.quantity - this.receivedQuantity);
});

// Virtual for receipt percentage
purchaseOrderItemSchema.virtual('receiptPercentage').get(function() {
  return this.quantity > 0 ? (this.receivedQuantity / this.quantity) * 100 : 0;
});

// Virtual for acceptance rate
purchaseOrderItemSchema.virtual('acceptanceRate').get(function() {
  return this.receivedQuantity > 0 ? (this.acceptedQuantity / this.receivedQuantity) * 100 : 0;
});

// Virtual for rejection rate
purchaseOrderItemSchema.virtual('rejectionRate').get(function() {
  return this.receivedQuantity > 0 ? (this.rejectedQuantity / this.receivedQuantity) * 100 : 0;
});

// Virtual for delivery status based on dates
purchaseOrderItemSchema.virtual('deliveryTimeliness').get(function() {
  if (!this.actualDeliveryDate || !this.expectedDeliveryDate) {
    return 'unknown';
  }
  
  const diffTime = this.actualDeliveryDate - this.expectedDeliveryDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return 'early';
  if (diffDays <= 2) return 'on_time';
  if (diffDays <= 7) return 'slightly_late';
  return 'very_late';
});

// Virtual for item value breakdown
purchaseOrderItemSchema.virtual('valueBreakdown').get(function() {
  const subtotal = this.quantity * this.unitPrice;
  let discountAmount = 0;
  
  if (this.discountType === 'percentage') {
    discountAmount = subtotal * (this.discount / 100);
  } else if (this.discountType === 'fixed') {
    discountAmount = this.discount;
  }
  
  const amountAfterDiscount = subtotal - discountAmount;
  const taxAmount = amountAfterDiscount * (this.taxRate / 100);
  const netAmount = amountAfterDiscount + taxAmount;
  
  return {
    subtotal,
    discountAmount,
    amountAfterDiscount,
    taxAmount,
    netAmount
  };
});

// Pre-save middleware to calculate totals and validate data
purchaseOrderItemSchema.pre('save', function(next) {
  // Calculate base amount
  const subtotal = this.quantity * this.unitPrice;
  
  // Calculate discount
  let discountAmount = 0;
  if (this.discountType === 'percentage') {
    discountAmount = subtotal * (this.discount / 100);
  } else if (this.discountType === 'fixed') {
    discountAmount = this.discount;
  }
  
  // Calculate amount after discount
  const amountAfterDiscount = subtotal - discountAmount;
  
  // Calculate tax
  this.taxAmount = amountAfterDiscount * (this.taxRate / 100);
  
  // Calculate net amount
  this.netAmount = amountAfterDiscount + this.taxAmount;
  
  // Set total (backward compatibility)
  this.total = this.netAmount;
  
  // Update discount amount field
  this.discountAmount = discountAmount;
  
  // Validate received quantities
  if (this.receivedQuantity > this.quantity) {
    this.deliveryStatus = 'over_received';
  } else if (this.receivedQuantity === this.quantity) {
    this.deliveryStatus = 'fully_received';
  } else if (this.receivedQuantity > 0) {
    this.deliveryStatus = 'partially_received';
  } else {
    this.deliveryStatus = 'pending';
  }
  
  // Calculate accepted quantity
  this.acceptedQuantity = this.receivedQuantity - this.rejectedQuantity;
  
  next();
});

// Pre-save middleware to update delivery date if not set
purchaseOrderItemSchema.pre('save', async function(next) {
  if (!this.expectedDeliveryDate) {
    const PurchaseOrder = mongoose.model('PurchaseOrder');
    const po = await PurchaseOrder.findById(this.purchaseOrder).select('deliveryDate');
    if (po && po.deliveryDate) {
      this.expectedDeliveryDate = po.deliveryDate;
    }
  }
  next();
});

// Instance method to receive items
purchaseOrderItemSchema.methods.receiveItems = function(quantity, receivedBy, notes = '', location = null) {
  if (quantity <= 0) {
    throw new Error('Receipt quantity must be greater than 0');
  }
  
  if (this.receivedQuantity + quantity > this.quantity) {
    throw new Error('Cannot receive more than ordered quantity');
  }
  
  this.receivedQuantity += quantity;
  this.receivedBy = receivedBy;
  this.receivedAt = new Date();
  
  // Add to inventory updates
  this.inventoryUpdates.push({
    quantity,
    updateType: 'receipt',
    notes,
    updatedBy: receivedBy,
    inventoryLocation: location
  });
  
  return this;
};

// Instance method to return items
purchaseOrderItemSchema.methods.returnItems = function(quantity, reason, condition, processedBy, notes = '') {
  if (quantity <= 0) {
    throw new Error('Return quantity must be greater than 0');
  }
  
  if (quantity > this.receivedQuantity) {
    throw new Error('Cannot return more than received quantity');
  }
  
  this.receivedQuantity -= quantity;
  this.rejectedQuantity += quantity;
  
  // Add to return history
  this.returnHistory.push({
    quantity,
    reason,
    condition,
    processedBy,
    notes,
    returnDate: new Date()
  });
  
  // Add to inventory updates
  this.inventoryUpdates.push({
    quantity,
    updateType: 'return',
    notes: `Return: ${reason}`,
    updatedBy: processedBy
  });
  
  return this;
};

// Instance method to perform quality check
purchaseOrderItemSchema.methods.performQualityCheck = function(performedBy, status, notes = '', defects = []) {
  this.qualityStatus = status;
  this.qualityCheck = {
    performedBy,
    performedAt: new Date(),
    notes,
    defects
  };
  
  return this;
};

// Instance method to cancel line item
purchaseOrderItemSchema.methods.cancelLineItem = function(cancelledBy, reason = '') {
  if (this.receivedQuantity > 0) {
    throw new Error('Cannot cancel line item with received quantities');
  }
  
  this.lineItemStatus = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledBy = cancelledBy;
  this.cancelledAt = new Date();
  
  return this;
};

// Instance method to get item statistics
purchaseOrderItemSchema.methods.getItemStats = function() {
  const totalInventoryUpdates = this.inventoryUpdates.reduce((sum, update) => {
    if (update.updateType === 'receipt') return sum + update.quantity;
    if (update.updateType === 'return') return sum - update.quantity;
    return sum;
  }, 0);
  
  const totalReturns = this.returnHistory.reduce((sum, returnItem) => sum + returnItem.quantity, 0);
  
  return {
    orderedQuantity: this.quantity,
    receivedQuantity: this.receivedQuantity,
    acceptedQuantity: this.acceptedQuantity,
    rejectedQuantity: this.rejectedQuantity,
    remainingQuantity: this.remainingQuantity,
    receiptPercentage: this.receiptPercentage,
    acceptanceRate: this.acceptanceRate,
    rejectionRate: this.rejectionRate,
    totalInventoryUpdates,
    totalReturns,
    netReceived: this.receivedQuantity - totalReturns
  };
};

// Static method to get items by purchase order
purchaseOrderItemSchema.statics.getItemsByPurchaseOrder = function(purchaseOrderId) {
  return this.find({ purchaseOrder: purchaseOrderId })
    .populate('product', 'name sku description unit category')
    .populate('receivedBy', 'name email')
    .populate('qualityCheck.performedBy', 'name email')
    .sort({ createdAt: 1 });
};

// Static method to get items by product
purchaseOrderItemSchema.statics.getItemsByProduct = function(productId, options = {}) {
  const { startDate, endDate, status } = options;
  const match = { product: productId };
  
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }
  
  if (status) {
    match.deliveryStatus = status;
  }
  
  return this.find(match)
    .populate('purchaseOrder', 'poNumber status supplier deliveryDate')
    .populate('product', 'name sku unit')
    .sort({ createdAt: -1 });
};

// Static method to get pending receipts
purchaseOrderItemSchema.statics.getPendingReceipts = function() {
  return this.find({
    deliveryStatus: { $in: ['pending', 'partially_received'] },
    lineItemStatus: 'active'
  })
  .populate('purchaseOrder', 'poNumber supplier deliveryDate')
  .populate('product', 'name sku unit reorderLevel')
  .sort({ expectedDeliveryDate: 1 });
};

// Static method to get quality issues
purchaseOrderItemSchema.statics.getQualityIssues = function() {
  return this.find({
    qualityStatus: { $in: ['failed', 'partial'] },
    lineItemStatus: 'active'
  })
  .populate('purchaseOrder', 'poNumber supplier')
  .populate('product', 'name sku unit')
  .populate('qualityCheck.performedBy', 'name email')
  .sort({ 'qualityCheck.performedAt': -1 });
};

// Virtual populate for related entities
purchaseOrderItemSchema.virtual('productDetails', {
  ref: 'Product',
  localField: 'product',
  foreignField: '_id',
  justOne: true
});

purchaseOrderItemSchema.virtual('purchaseOrderDetails', {
  ref: 'PurchaseOrder',
  localField: 'purchaseOrder',
  foreignField: '_id',
  justOne: true
});

// Method to check if item can be modified
purchaseOrderItemSchema.methods.canBeModified = function() {
  return this.receivedQuantity === 0 && this.lineItemStatus === 'active';
};

// Method to check if item can be received
purchaseOrderItemSchema.methods.canBeReceived = function() {
  return this.lineItemStatus === 'active' && this.remainingQuantity > 0;
};

module.exports = mongoose.model('PurchaseOrderItem', purchaseOrderItemSchema);