const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot be more than 200 characters']
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [50, 'SKU cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Short description cannot be more than 500 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [100, 'Brand cannot be more than 100 characters']
  },
  model: {
    type: String,
    trim: true,
    maxlength: [100, 'Model cannot be more than 100 characters']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true,
    maxlength: [50, 'Unit cannot be more than 50 characters']
  },
  costPrice: {
    type: Number,
    required: [true, 'Cost price is required'],
    min: [0, 'Cost price cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Cost price must be a valid number'
    }
  },
  sellingPrice: {
    type: Number,
    min: [0, 'Selling price cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Selling price must be a valid number'
    }
  },
  margin: {
    type: Number,
    min: [0, 'Margin cannot be negative'],
    max: [100, 'Margin cannot exceed 100%'],
    validate: {
      validator: Number.isFinite,
      message: 'Margin must be a valid number'
    }
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
    maxlength: [3, 'Currency code must be 3 characters']
  },
  reorderLevel: {
    type: Number,
    required: [true, 'Reorder level is required'],
    min: [0, 'Reorder level cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Reorder level must be a valid number'
    }
  },
  currentStock: {
    type: Number,
    required: [true, 'Current stock is required'],
    min: [0, 'Current stock cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Current stock must be a valid number'
    }
  },
  minimumStock: {
    type: Number,
    min: [0, 'Minimum stock cannot be negative'],
    default: 0,
    validate: {
      validator: Number.isFinite,
      message: 'Minimum stock must be a valid number'
    }
  },
  maximumStock: {
    type: Number,
    min: [0, 'Maximum stock cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Maximum stock must be a valid number'
    }
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  preferredSuppliers: [{
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true
    },
    preferenceLevel: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    leadTime: {
      type: Number, // in days
      min: 0
    },
    unitPrice: {
      type: Number,
      min: 0
    },
    lastOrderDate: Date,
    performanceRating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  specifications: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  technicalSpecifications: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  dimensions: {
    length: {
      type: Number,
      min: 0
    },
    width: {
      type: Number,
      min: 0
    },
    height: {
      type: Number,
      min: 0
    },
    weight: {
      type: Number,
      min: 0
    },
    unit: {
      type: String,
      default: 'cm'
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [200, 'Image caption cannot be more than 200 characters']
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  documents: [{
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
      enum: ['manual', 'specification', 'certificate', 'safety', 'warranty', 'other'],
      required: true
    },
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued', 'out_of_stock', 'coming_soon'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'internal'],
    default: 'public'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot be more than 50 characters']
  }],
  barcode: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  qrCode: {
    type: String, // URL to QR code image
    trim: true
  },
  hsnCode: {
    type: String,
    trim: true,
    maxlength: [10, 'HSN code cannot be more than 10 characters']
  },
  taxCode: {
    type: String,
    trim: true,
    maxlength: [20, 'Tax code cannot be more than 20 characters']
  },
  taxRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  warranty: {
    period: {
      type: Number, // in months
      min: 0,
      default: 0
    },
    terms: {
      type: String,
      maxlength: [1000, 'Warranty terms cannot be more than 1000 characters']
    },
    provider: {
      type: String,
      trim: true,
      maxlength: [100, 'Warranty provider cannot be more than 100 characters']
    }
  },
  shelfLife: {
    type: Number, // in days
    min: 0
  },
  storageConditions: {
    temperature: {
      min: Number,
      max: Number,
      unit: {
        type: String,
        default: 'Celsius'
      }
    },
    humidity: {
      min: Number,
      max: Number,
      unit: {
        type: String,
        default: 'percentage'
      }
    },
    specialRequirements: {
      type: String,
      maxlength: [500, 'Special requirements cannot be more than 500 characters']
    }
  },
  handlingInstructions: {
    type: String,
    maxlength: [1000, 'Handling instructions cannot be more than 1000 characters']
  },
  safetyPrecautions: {
    type: String,
    maxlength: [1000, 'Safety precautions cannot be more than 1000 characters']
  },
  environmentalImpact: {
    carbonFootprint: {
      type: Number, // in kg CO2 equivalent
      min: 0
    },
    recyclability: {
      type: Number,
      min: 0,
      max: 100
    },
    energyEfficiency: {
      type: String,
      enum: ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'not_rated']
    },
    certifications: [{
      name: String,
      issuingBody: String,
      certificateNumber: String,
      validity: Date
    }]
  },
  compliance: {
    standards: [{
      standard: String,
      complianceLevel: {
        type: String,
        enum: ['fully_compliant', 'partially_compliant', 'non_compliant']
      },
      certificate: String // URL to certificate
    }],
    regulatoryRequirements: [{
      requirement: String,
      status: {
        type: String,
        enum: ['met', 'pending', 'not_applicable']
      },
      notes: String
    }]
  },
  usageStatistics: {
    totalPurchased: {
      type: Number,
      default: 0,
      min: 0
    },
    totalSold: {
      type: Number,
      default: 0,
      min: 0
    },
    lastPurchaseDate: Date,
    lastSaleDate: Date,
    averageMonthlyUsage: {
      type: Number,
      default: 0,
      min: 0
    },
    turnoverRate: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  performanceMetrics: {
    customerRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 0
    },
    returnRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    defectRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    supplierPerformance: {
      type: Number,
      min: 1,
      max: 5,
      default: 0
    }
  },
  relatedProducts: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    relationship: {
      type: String,
      enum: ['complementary', 'alternative', 'upgrade', 'downgrade', 'accessory']
    },
    notes: String
  }],
  alternativeProducts: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    compatibility: {
      type: String,
      enum: ['fully_compatible', 'partially_compatible', 'requires_modification']
    },
    advantages: String,
    disadvantages: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
productSchema.index({ sku: 1 });
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ status: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ currentStock: 1 });
productSchema.index({ costPrice: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'usageStatistics.totalSold': -1 });

// Compound indexes
productSchema.index({ category: 1, status: 1 });
productSchema.index({ brand: 1, status: 1 });
productSchema.index({ currentStock: 1, reorderLevel: 1 });
productSchema.index({ category: 1, brand: 1 });

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.currentStock === 0) return 'out_of_stock';
  if (this.currentStock <= this.reorderLevel) return 'low_stock';
  if (this.maximumStock && this.currentStock > this.maximumStock) return 'over_stock';
  return 'in_stock';
});

// Virtual for margin calculation
productSchema.virtual('calculatedMargin').get(function() {
  if (!this.costPrice || this.costPrice === 0) return 0;
  if (!this.sellingPrice) return 0;
  
  return ((this.sellingPrice - this.costPrice) / this.costPrice) * 100;
});

// Virtual for stock value
productSchema.virtual('stockValue').get(function() {
  return this.currentStock * this.costPrice;
});

// Virtual for stock turnover ratio
productSchema.virtual('stockTurnoverRatio').get(function() {
  if (this.currentStock === 0) return 0;
  return this.usageStatistics.totalSold / this.currentStock;
});

// Virtual for days of inventory
productSchema.virtual('daysOfInventory').get(function() {
  if (this.usageStatistics.averageMonthlyUsage === 0) return 0;
  return (this.currentStock / this.usageStatistics.averageMonthlyUsage) * 30;
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images.length > 0 ? this.images[0].url : null);
});

// Pre-save middleware to calculate margin and validate data
productSchema.pre('save', function(next) {
  // Calculate margin if selling price is set
  if (this.sellingPrice && this.costPrice && this.costPrice > 0) {
    this.margin = ((this.sellingPrice - this.costPrice) / this.costPrice) * 100;
  }
  
  // Ensure selling price is not less than cost price
  if (this.sellingPrice && this.sellingPrice < this.costPrice) {
    return next(new Error('Selling price cannot be less than cost price'));
  }
  
  // Update status based on stock
  if (this.currentStock === 0 && this.status !== 'discontinued') {
    this.status = 'out_of_stock';
  } else if (this.currentStock > 0 && this.status === 'out_of_stock') {
    this.status = 'active';
  }
  
  // Calculate average monthly usage if not set
  if (this.usageStatistics.totalSold > 0 && !this.usageStatistics.averageMonthlyUsage) {
    const monthsSinceCreation = Math.max(1, (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24 * 30));
    this.usageStatistics.averageMonthlyUsage = this.usageStatistics.totalSold / monthsSinceCreation;
  }
  
  next();
});

// Instance method to update stock
productSchema.methods.updateStock = function(quantity, type, notes = '') {
  // type: 'add', 'remove', 'set'
  switch (type) {
    case 'add':
      this.currentStock += quantity;
      break;
    case 'remove':
      if (this.currentStock < quantity) {
        throw new Error('Insufficient stock');
      }
      this.currentStock -= quantity;
      break;
    case 'set':
      this.currentStock = quantity;
      break;
    default:
      throw new Error('Invalid stock update type');
  }
  
  // Update stock status
  if (this.currentStock === 0) {
    this.status = 'out_of_stock';
  } else if (this.currentStock <= this.reorderLevel) {
    this.status = 'active'; // Ensure it's active if there's stock
  }
  
  return this;
};

// Instance method to add preferred supplier
productSchema.methods.addPreferredSupplier = function(supplier, preferenceLevel = 5, leadTime = 0, unitPrice = null) {
  // Remove existing entry for this supplier
  this.preferredSuppliers = this.preferredSuppliers.filter(ps => !ps.supplier.equals(supplier));
  
  this.preferredSuppliers.push({
    supplier,
    preferenceLevel,
    leadTime,
    unitPrice: unitPrice || this.costPrice
  });
  
  return this;
};

// Instance method to record sale
productSchema.methods.recordSale = function(quantity) {
  this.usageStatistics.totalSold += quantity;
  this.usageStatistics.lastSaleDate = new Date();
  
  // Update average monthly usage
  const monthsSinceCreation = Math.max(1, (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24 * 30));
  this.usageStatistics.averageMonthlyUsage = this.usageStatistics.totalSold / monthsSinceCreation;
  
  return this;
};

// Instance method to record purchase
productSchema.methods.recordPurchase = function(quantity) {
  this.usageStatistics.totalPurchased += quantity;
  this.usageStatistics.lastPurchaseDate = new Date();
  
  return this;
};

// Instance method to add image
productSchema.methods.addImage = function(url, caption = '', isPrimary = false) {
  // If setting as primary, unset other primary images
  if (isPrimary) {
    this.images.forEach(img => { img.isPrimary = false; });
  }
  
  this.images.push({
    url,
    caption,
    isPrimary,
    uploadedAt: new Date()
  });
  
  return this;
};

// Instance method to get product analytics
productSchema.methods.getProductAnalytics = function() {
  const stockValue = this.stockValue;
  const turnoverRatio = this.stockTurnoverRatio;
  const daysOfInventory = this.daysOfInventory;
  const margin = this.calculatedMargin;
  
  return {
    stockStatus: this.stockStatus,
    stockValue,
    turnoverRatio,
    daysOfInventory,
    margin,
    performance: {
      rating: this.performanceMetrics.customerRating,
      returnRate: this.performanceMetrics.returnRate,
      defectRate: this.performanceMetrics.defectRate
    },
    usage: {
      totalSold: this.usageStatistics.totalSold,
      totalPurchased: this.usageStatistics.totalPurchased,
      averageMonthlyUsage: this.usageStatistics.averageMonthlyUsage
    }
  };
};

// Static method to get low stock products
productSchema.statics.getLowStockProducts = function() {
  return this.find({
    currentStock: { $lte: '$reorderLevel' },
    isActive: true,
    status: { $ne: 'discontinued' }
  })
  .populate('category', 'name')
  .populate('supplier', 'name contactPerson')
  .sort({ currentStock: 1 });
};

// Static method to get out of stock products
productSchema.statics.getOutOfStockProducts = function() {
  return this.find({
    currentStock: 0,
    isActive: true,
    status: { $ne: 'discontinued' }
  })
  .populate('category', 'name')
  .populate('supplier', 'name contactPerson')
  .sort({ 'usageStatistics.averageMonthlyUsage': -1 });
};

// Static method to get products by category
productSchema.statics.getProductsByCategory = function(categoryId) {
  return this.find({
    category: categoryId,
    isActive: true
  })
  .populate('category', 'name')
  .populate('supplier', 'name')
  .sort({ name: 1 });
};

// Static method to get best selling products
productSchema.statics.getBestSellingProducts = function(limit = 10) {
  return this.find({
    isActive: true,
    'usageStatistics.totalSold': { $gt: 0 }
  })
  .populate('category', 'name')
  .sort({ 'usageStatistics.totalSold': -1 })
  .limit(limit);
};

// Static method to search products
productSchema.statics.searchProducts = function(query, options = {}) {
  const { category, brand, minPrice, maxPrice, inStock } = options;
  const searchCriteria = {
    $and: [
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { brand: { $regex: query, $options: 'i' } },
          { sku: { $regex: query, $options: 'i' } }
        ]
      },
      { isActive: true }
    ]
  };
  
  if (category) searchCriteria.$and.push({ category });
  if (brand) searchCriteria.$and.push({ brand: { $regex: brand, $options: 'i' } });
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceFilter = {};
    if (minPrice !== undefined) priceFilter.$gte = minPrice;
    if (maxPrice !== undefined) priceFilter.$lte = maxPrice;
    searchCriteria.$and.push({ costPrice: priceFilter });
  }
  if (inStock) searchCriteria.$and.push({ currentStock: { $gt: 0 } });
  
  return this.find(searchCriteria)
    .populate('category', 'name')
    .populate('supplier', 'name')
    .sort({ 'usageStatistics.totalSold': -1 });
};

// Virtual populate for related entities
productSchema.virtual('categoryDetails', {
  ref: 'Category',
  localField: 'category',
  foreignField: '_id',
  justOne: true
});

productSchema.virtual('supplierDetails', {
  ref: 'Supplier',
  localField: 'supplier',
  foreignField: '_id',
  justOne: true
});

productSchema.virtual('inventoryRecords', {
  ref: 'Inventory',
  localField: '_id',
  foreignField: 'product'
});

productSchema.virtual('purchaseOrderItems', {
  ref: 'PurchaseOrderItem',
  localField: '_id',
  foreignField: 'product'
});

// Method to check if product needs reordering
productSchema.methods.needsReorder = function() {
  return this.currentStock <= this.reorderLevel && this.isActive && this.status !== 'discontinued';
};

// Method to check if product is available
productSchema.methods.isAvailable = function() {
  return this.isActive && this.currentStock > 0 && this.status !== 'discontinued';
};

// Method to get best supplier
productSchema.methods.getBestSupplier = function() {
  if (this.preferredSuppliers.length === 0) return this.supplier;
  
  const bestSupplier = this.preferredSuppliers.reduce((best, current) => {
    const bestScore = best.preferenceLevel * (1 / (best.leadTime + 1));
    const currentScore = current.preferenceLevel * (1 / (current.leadTime + 1));
    return currentScore > bestScore ? current : best;
  });
  
  return bestSupplier.supplier;
};

module.exports = mongoose.model('Product', productSchema);