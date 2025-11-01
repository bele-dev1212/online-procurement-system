const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: {
    type: String,
    required: [true, 'Purchase order number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [50, 'PO number cannot be more than 50 characters']
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Supplier is required']
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requested by user is required']
  },
  status: {
    type: String,
    enum: [
      'draft',
      'pending_approval',
      'approved',
      'rejected',
      'ordered',
      'partially_received',
      'received',
      'cancelled',
      'closed'
    ],
    default: 'draft'
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required for each item']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.001, 'Quantity must be greater than 0']
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative']
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    specifications: {
      type: Map,
      of: String,
      default: {}
    },
    receivedQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Received quantity cannot be negative']
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true
    },
    taxRate: {
      type: Number,
      min: [0, 'Tax rate cannot be negative'],
      max: [100, 'Tax rate cannot exceed 100%'],
      default: 0
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: [0, 'Tax amount cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    }
  }],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: [0, 'Tax amount cannot be negative']
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: [0, 'Discount amount cannot be negative']
  },
  grandTotal: {
    type: Number,
    required: [true, 'Grand total is required'],
    min: [0, 'Grand total cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
    maxlength: [3, 'Currency code must be 3 characters']
  },
  deliveryDate: {
    type: Date,
    required: [true, 'Delivery date is required'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Delivery date must be in the future'
    }
  },
  actualDeliveryDate: Date,
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    contactPerson: String,
    phone: String
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  termsAndConditions: {
    type: String,
    maxlength: [2000, 'Terms and conditions cannot be more than 2000 characters']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  internalNotes: {
    type: String,
    maxlength: [1000, 'Internal notes cannot be more than 1000 characters']
  },
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
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['quotation', 'specification', 'contract', 'other'],
      default: 'other'
    }
  }],
  approvalHistory: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      enum: ['submitted', 'approved', 'rejected', 'cancelled', 'commented'],
      required: true
    },
    comments: {
      type: String,
      maxlength: [500, 'Comments cannot be more than 500 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    previousStatus: String,
    newStatus: String
  }],
  requisition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Requisition'
  },
  rfq: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFQ'
  },
  bid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  },
  projectCode: {
    type: String,
    trim: true,
    maxlength: [50, 'Project code cannot be more than 50 characters']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  costCenter: {
    type: String,
    trim: true,
    maxlength: [50, 'Cost center cannot be more than 50 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  paymentTerms: {
    type: String,
    enum: ['net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt', 'custom'],
    default: 'net_30'
  },
  customPaymentTerms: String,
  shippingMethod: {
    type: String,
    enum: ['ground', 'air', 'sea', 'express', 'pickup', 'other'],
    default: 'ground'
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cost cannot be negative']
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  carrier: {
    type: String,
    trim: true
  },
  expectedShipDate: Date,
  actualShipDate: Date,
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
    status: {
      type: String,
      enum: ['passed', 'failed', 'partial', 'pending'],
      default: 'pending'
    },
    notes: String
  },
  invoiceNumber: {
    type: String,
    trim: true
  },
  invoiceDate: Date,
  invoiceAmount: {
    type: Number,
    min: [0, 'Invoice amount cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'overdue'],
    default: 'pending'
  },
  paymentHistory: [{
    amount: {
      type: Number,
      required: true,
      min: [0, 'Payment amount cannot be negative']
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'check', 'credit_card', 'cash', 'other']
    },
    reference: String,
    notes: String,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  closure: {
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    closedAt: Date,
    closureNotes: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
purchaseOrderSchema.index({ poNumber: 1 });
purchaseOrderSchema.index({ supplier: 1 });
purchaseOrderSchema.index({ requestedBy: 1 });
purchaseOrderSchema.index({ status: 1 });
purchaseOrderSchema.index({ deliveryDate: 1 });
purchaseOrderSchema.index({ createdAt: -1 });
purchaseOrderSchema.index({ department: 1 });
purchaseOrderSchema.index({ 'items.product': 1 });
purchaseOrderSchema.index({ projectCode: 1 });

// Compound indexes
purchaseOrderSchema.index({ status: 1, deliveryDate: 1 });
purchaseOrderSchema.index({ supplier: 1, status: 1 });
purchaseOrderSchema.index({ requestedBy: 1, createdAt: -1 });

// Virtual for PO age in days
purchaseOrderSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for delivery status
purchaseOrderSchema.virtual('deliveryStatus').get(function() {
  if (!this.actualDeliveryDate) {
    const today = new Date();
    if (today > this.deliveryDate) return 'overdue';
    if (today.toDateString() === this.deliveryDate.toDateString()) return 'due_today';
    return 'pending';
  }
  
  if (this.actualDeliveryDate <= this.deliveryDate) return 'on_time';
  return 'delayed';
});

// Virtual for received percentage
purchaseOrderSchema.virtual('receivedPercentage').get(function() {
  if (this.items.length === 0) return 0;
  
  const totalOrdered = this.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalReceived = this.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
  
  return totalOrdered > 0 ? (totalReceived / totalOrdered) * 100 : 0;
});

// Virtual for payment percentage
purchaseOrderSchema.virtual('paymentPercentage').get(function() {
  if (this.grandTotal === 0) return 0;
  
  const totalPaid = this.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
  return (totalPaid / this.grandTotal) * 100;
});

// Pre-save middleware to calculate totals
purchaseOrderSchema.pre('save', function(next) {
  // Calculate item totals
  this.items.forEach(item => {
    // Calculate item total before tax and discount
    let itemTotal = item.quantity * item.unitPrice;
    
    // Apply discount
    if (item.discount > 0) {
      if (item.discountType === 'percentage') {
        itemTotal -= itemTotal * (item.discount / 100);
      } else {
        itemTotal -= item.discount;
      }
    }
    
    // Calculate tax
    item.taxAmount = itemTotal * (item.taxRate / 100);
    
    // Final item total
    item.total = itemTotal + item.taxAmount;
  });
  
  // Calculate order totals
  const subtotal = this.items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    let discountedTotal = itemTotal;
    
    // Apply discount to item
    if (item.discount > 0) {
      if (item.discountType === 'percentage') {
        discountedTotal -= itemTotal * (item.discount / 100);
      } else {
        discountedTotal -= item.discount;
      }
    }
    
    return sum + discountedTotal;
  }, 0);
  
  this.totalAmount = subtotal;
  this.taxAmount = this.items.reduce((sum, item) => sum + item.taxAmount, 0);
  this.discountAmount = this.items.reduce((sum, item) => {
    if (item.discount > 0) {
      if (item.discountType === 'percentage') {
        return sum + (item.quantity * item.unitPrice * (item.discount / 100));
      } else {
        return sum + item.discount;
      }
    }
    return sum;
  }, 0);
  
  this.grandTotal = this.totalAmount + this.taxAmount + this.shippingCost;
  
  next();
});

// Pre-save middleware to update status based on received quantity
purchaseOrderSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    const totalOrdered = this.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalReceived = this.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
    
    if (totalReceived === 0) {
      this.status = 'ordered';
    } else if (totalReceived > 0 && totalReceived < totalOrdered) {
      this.status = 'partially_received';
    } else if (totalReceived === totalOrdered) {
      this.status = 'received';
    }
  }
  next();
});

// Instance method to add approval history entry
purchaseOrderSchema.methods.addApprovalHistory = function(user, action, comments, previousStatus = null, newStatus = null) {
  this.approvalHistory.push({
    user,
    action,
    comments,
    previousStatus: previousStatus || this.status,
    newStatus: newStatus || this.status,
    timestamp: new Date()
  });
};

// Instance method to receive items
purchaseOrderSchema.methods.receiveItems = function(itemReceipts, receivedBy, notes = '') {
  itemReceipts.forEach(receipt => {
    const item = this.items.id(receipt.itemId);
    if (item) {
      item.receivedQuantity += receipt.quantity;
    }
  });
  
  this.receivedBy = receivedBy;
  this.receivedAt = new Date();
  
  // Add to approval history
  this.addApprovalHistory(receivedBy, 'received', notes);
};

// Instance method to add payment
purchaseOrderSchema.methods.addPayment = function(amount, paymentMethod, reference = '', notes = '', processedBy) {
  this.paymentHistory.push({
    amount,
    paymentMethod,
    reference,
    notes,
    processedBy,
    paymentDate: new Date()
  });
  
  // Update payment status
  const totalPaid = this.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
  
  if (totalPaid === 0) {
    this.paymentStatus = 'pending';
  } else if (totalPaid < this.grandTotal) {
    this.paymentStatus = 'partial';
  } else if (totalPaid >= this.grandTotal) {
    this.paymentStatus = 'paid';
  }
};

// Instance method to close PO
purchaseOrderSchema.methods.close = function(closedBy, closureNotes = '') {
  this.status = 'closed';
  this.closure = {
    closedBy,
    closedAt: new Date(),
    closureNotes
  };
};

// Instance method to get PO statistics
purchaseOrderSchema.methods.getPOStats = function() {
  const totalOrdered = this.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalReceived = this.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
  const totalPaid = this.paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
  
  return {
    totalOrdered,
    totalReceived,
    receivedPercentage: totalOrdered > 0 ? (totalReceived / totalOrdered) * 100 : 0,
    totalPaid,
    paymentPercentage: this.grandTotal > 0 ? (totalPaid / this.grandTotal) * 100 : 0,
    balanceDue: this.grandTotal - totalPaid
  };
};

// Static method to generate next PO number
purchaseOrderSchema.statics.generatePONumber = async function() {
  const currentYear = new Date().getFullYear();
  const prefix = `PO-${currentYear}-`;
  
  const lastPO = await this.findOne(
    { poNumber: new RegExp(`^${prefix}`) },
    { poNumber: 1 },
    { sort: { poNumber: -1 } }
  );
  
  let sequence = 1;
  if (lastPO && lastPO.poNumber) {
    const lastSequence = parseInt(lastPO.poNumber.split('-')[2]) || 0;
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(4, '0')}`;
};

// Static method to get POs by status
purchaseOrderSchema.statics.getPOsByStatus = function(status) {
  return this.find({ status }).populate('supplier requestedBy');
};

// Static method to get overdue POs
purchaseOrderSchema.statics.getOverduePOs = function() {
  const today = new Date();
  return this.find({
    deliveryDate: { $lt: today },
    status: { $in: ['ordered', 'partially_received'] }
  }).populate('supplier requestedBy');
};

// Static method to get POs needing approval
purchaseOrderSchema.statics.getPOsNeedingApproval = function() {
  return this.find({ status: 'pending_approval' }).populate('supplier requestedBy');
};

// Static method to get monthly PO statistics
purchaseOrderSchema.statics.getMonthlyStats = async function(year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$grandTotal' },
        averageAmount: { $avg: '$grandTotal' }
      }
    }
  ]);
};

// Virtual populate for related entities
purchaseOrderSchema.virtual('inventoryUpdates', {
  ref: 'InventoryUpdate',
  localField: '_id',
  foreignField: 'purchaseOrder'
});

purchaseOrderSchema.virtual('qualityChecks', {
  ref: 'QualityCheck',
  localField: '_id',
  foreignField: 'purchaseOrder'
});

// Method to check if PO can be modified
purchaseOrderSchema.methods.canBeModified = function() {
  const modifiableStatuses = ['draft', 'pending_approval', 'rejected'];
  return modifiableStatuses.includes(this.status);
};

// Method to check if PO can be cancelled
purchaseOrderSchema.methods.canBeCancelled = function() {
  const cancellableStatuses = ['draft', 'pending_approval', 'approved', 'ordered'];
  return cancellableStatuses.includes(this.status);
};

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);