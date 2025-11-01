const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product reference is required']
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  reservedQuantity: {
    type: Number,
    min: 0,
    default: 0
  },
  minimumStockLevel: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  },
  maximumStockLevel: {
    type: Number,
    required: true,
    min: 0,
    default: 1000
  },
  reorderPoint: {
    type: Number,
    required: true,
    min: 0,
    default: 20
  },
  location: {
    warehouse: {
      type: String,
      required: [true, 'Warehouse name is required']
    },
    aisle: String,
    shelf: String,
    bin: String
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0
  },
  totalValue: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['in_stock', 'low_stock', 'out_of_stock', 'discontinued', 'on_order'],
    default: 'in_stock'
  },
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  batchNumber: String,
  expiryDate: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual for available quantity
inventorySchema.virtual('availableQuantity').get(function() {
  return Math.max(0, this.quantity - this.reservedQuantity);
});

// Pre-save middleware to update status and total value
inventorySchema.pre('save', function(next) {
  // Calculate total value
  this.totalValue = this.quantity * this.unitCost;
  
  // Update status based on quantity
  if (this.quantity <= 0) {
    this.status = 'out_of_stock';
  } else if (this.quantity <= this.reorderPoint) {
    this.status = 'low_stock';
  } else if (this.quantity > this.maximumStockLevel) {
    this.status = 'overstocked';
  } else {
    this.status = 'in_stock';
  }
  
  next();
});

// Indexes for performance
inventorySchema.index({ product: 1 });
inventorySchema.index({ sku: 1 });
inventorySchema.index({ status: 1 });
inventorySchema.index({ supplier: 1 });
inventorySchema.index({ 'location.warehouse': 1 });
inventorySchema.index({ expiryDate: 1 });

// Static Methods
inventorySchema.statics.findLowStock = function() {
  return this.find({
    $expr: { $lte: ['$quantity', '$reorderPoint'] },
    status: { $ne: 'discontinued' }
  }).populate('product supplier');
};

inventorySchema.statics.findByWarehouse = function(warehouseName) {
  return this.find({ 'location.warehouse': warehouseName })
    .populate('product supplier');
};

inventorySchema.statics.getInventoryValue = async function() {
  const result = await this.aggregate([
    { $match: { status: { $ne: 'discontinued' } } },
    { $group: { _id: null, totalValue: { $sum: '$totalValue' } } }
  ]);
  return result[0]?.totalValue || 0;
};

// Instance Methods
inventorySchema.methods.reserveQuantity = async function(quantity) {
  if (this.availableQuantity < quantity) {
    throw new Error(`Insufficient available quantity. Available: ${this.availableQuantity}, Requested: ${quantity}`);
  }
  this.reservedQuantity += quantity;
  return await this.save();
};

inventorySchema.methods.releaseQuantity = async function(quantity) {
  if (this.reservedQuantity < quantity) {
    throw new Error(`Cannot release more than reserved. Reserved: ${this.reservedQuantity}, Requested: ${quantity}`);
  }
  this.reservedQuantity -= quantity;
  return await this.save();
};

inventorySchema.methods.updateQuantity = async function(newQuantity, reason = 'adjustment', user = null) {
  const oldQuantity = this.quantity;
  this.quantity = newQuantity;
  
  if (reason === 'restock') {
    this.lastRestocked = new Date();
  }
  
  await this.save();
  
  // Log this action for audit trail
  const { AuditLog } = require('./index');
  await AuditLog.logAction({
    action: 'update',
    entity: 'Inventory',
    entityId: this._id,
    user: user,
    description: `Inventory quantity updated from ${oldQuantity} to ${newQuantity}. Reason: ${reason}`,
    changes: {
      before: { quantity: oldQuantity },
      after: { quantity: newQuantity }
    }
  });
  
  return this;
};

inventorySchema.methods.needsReorder = function() {
  return this.quantity <= this.reorderPoint && this.status !== 'discontinued';
};

inventorySchema.methods.getStockStatus = function() {
  if (this.quantity <= 0) return 'Out of Stock';
  if (this.quantity <= this.reorderPoint) return 'Low Stock';
  if (this.quantity > this.maximumStockLevel) return 'Overstocked';
  return 'In Stock';
};

module.exports = mongoose.model('Inventory', inventorySchema);