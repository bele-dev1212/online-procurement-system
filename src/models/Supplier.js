const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a supplier name'],
    trim: true,
    maxlength: [200, 'Supplier name cannot be more than 200 characters']
  },
  contactPerson: {
    type: String,
    required: [true, 'Please add a contact person'],
    trim: true,
    maxlength: [100, 'Contact person name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    trim: true,
    maxlength: [20, 'Phone number cannot be more than 20 characters']
  },
  alternatePhone: {
    type: String,
    trim: true,
    maxlength: [20, 'Alternate phone cannot be more than 20 characters']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Please add street address'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'Please add city'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'Please add state'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Please add country'],
      trim: true,
      default: 'United States'
    },
    zipCode: {
      type: String,
      required: [true, 'Please add zip code'],
      trim: true
    }
  },
  taxId: {
    type: String,
    trim: true,
    maxlength: [50, 'Tax ID cannot be more than 50 characters']
  },
  businessRegistration: {
    number: String,
    issueDate: Date,
    expiryDate: Date
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending', 'blacklisted'],
    default: 'pending'
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
    default: 3
  },
  ratingHistory: [{
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    review: String,
    ratedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    ratedAt: {
      type: Date,
      default: Date.now
    },
    purchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PurchaseOrder'
    }
  }],
  documents: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['certificate', 'license', 'insurance', 'contract', 'financial', 'other'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    expiryDate: Date,
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date
  }],
  paymentTerms: {
    type: String,
    enum: ['net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt', 'custom'],
    default: 'net_30'
  },
  customPaymentTerms: {
    type: String,
    trim: true,
    maxlength: [100, 'Custom payment terms cannot be more than 100 characters']
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    routingNumber: String,
    swiftCode: String,
    iban: String
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  website: {
    type: String,
    trim: true,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
      'Please add a valid URL'
    ]
  },
  logo: {
    type: String, // URL to logo image
    default: null
  },
  leadTime: {
    type: Number, // in days
    min: [0, 'Lead time cannot be negative'],
    default: 7
  },
  minimumOrderValue: {
    type: Number,
    min: [0, 'Minimum order value cannot be negative'],
    default: 0
  },
  shippingMethods: [{
    type: String,
    enum: ['ground', 'air', 'sea', 'express', 'pickup']
  }],
  certifications: [{
    name: String,
    issuingBody: String,
    issueDate: Date,
    expiryDate: Date,
    certificateNumber: String
  }],
  performanceMetrics: {
    onTimeDelivery: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    qualityRating: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    responseTime: {
      type: Number, // in hours
      min: 0,
      default: 0
    },
    complianceRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  contactPreferences: {
    preferredContactMethod: {
      type: String,
      enum: ['email', 'phone', 'in_person'],
      default: 'email'
    },
    contactHours: {
      start: String, // "09:00"
      end: String    // "17:00"
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastOrderDate: Date,
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpend: {
    type: Number,
    default: 0
  },
  averageOrderValue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
supplierSchema.index({ email: 1 });
supplierSchema.index({ status: 1 });
supplierSchema.index({ categories: 1 });
supplierSchema.index({ rating: -1 });
supplierSchema.index({ name: 'text', contactPerson: 'text' });
supplierSchema.index({ createdAt: -1 });
supplierSchema.index({ 'address.country': 1, 'address.state': 1 });

// Virtual for full address
supplierSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Virtual for supplier performance score
supplierSchema.virtual('performanceScore').get(function() {
  const metrics = this.performanceMetrics;
  const weights = {
    onTimeDelivery: 0.4,
    qualityRating: 0.3,
    responseTime: 0.2,
    complianceRate: 0.1
  };
  
  let score = 0;
  
  // Calculate weighted score for on-time delivery
  score += metrics.onTimeDelivery * weights.onTimeDelivery;
  
  // Calculate weighted score for quality rating
  score += metrics.qualityRating * weights.qualityRating;
  
  // Calculate weighted score for response time (inverse relationship)
  const maxResponseTime = 48; // 48 hours
  const responseScore = Math.max(0, 100 - (metrics.responseTime / maxResponseTime * 100));
  score += responseScore * weights.responseTime;
  
  // Calculate weighted score for compliance rate
  score += metrics.complianceRate * weights.complianceRate;
  
  return Math.round(score);
});

// Virtual for supplier tier based on performance and spend
supplierSchema.virtual('tier').get(function() {
  const score = this.performanceScore;
  const spend = this.totalSpend;
  
  if (score >= 90 && spend > 100000) return 'platinum';
  if (score >= 80 && spend > 50000) return 'gold';
  if (score >= 70 && spend > 10000) return 'silver';
  return 'bronze';
});

// Cascade delete related data when supplier is deleted
supplierSchema.pre('remove', async function(next) {
  try {
    // Update related purchase orders
    await mongoose.model('PurchaseOrder').updateMany(
      { supplier: this._id },
      { $set: { supplier: null } }
    );
    
    // Remove from RFQs
    await mongoose.model('RFQ').updateMany(
      { suppliers: this._id },
      { $pull: { suppliers: this._id } }
    );
    
    // Remove supplier's bids
    await mongoose.model('Bid').deleteMany({ supplier: this._id });
    
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware to update performance metrics when new rating is added
supplierSchema.pre('save', function(next) {
  if (this.isModified('ratingHistory') && this.ratingHistory.length > 0) {
    const ratings = this.ratingHistory.map(r => r.rating);
    this.rating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  }
  next();
});

// Instance method to add a rating
supplierSchema.methods.addRating = function(rating, review, ratedBy, purchaseOrder = null) {
  this.ratingHistory.push({
    rating,
    review,
    ratedBy,
    purchaseOrder,
    ratedAt: new Date()
  });
};

// Instance method to add a document
supplierSchema.methods.addDocument = function(name, type, url, expiryDate = null) {
  this.documents.push({
    name,
    type,
    url,
    uploadedAt: new Date(),
    expiryDate,
    verified: false
  });
};

// Instance method to verify a document
supplierSchema.methods.verifyDocument = function(documentId, verifiedBy) {
  const document = this.documents.id(documentId);
  if (document) {
    document.verified = true;
    document.verifiedBy = verifiedBy;
    document.verifiedAt = new Date();
  }
};

// Instance method to update performance metrics
supplierSchema.methods.updatePerformanceMetrics = function(
  onTimeDelivery = null,
  qualityRating = null,
  responseTime = null,
  complianceRate = null
) {
  if (onTimeDelivery !== null) {
    this.performanceMetrics.onTimeDelivery = onTimeDelivery;
  }
  if (qualityRating !== null) {
    this.performanceMetrics.qualityRating = qualityRating;
  }
  if (responseTime !== null) {
    this.performanceMetrics.responseTime = responseTime;
  }
  if (complianceRate !== null) {
    this.performanceMetrics.complianceRate = complianceRate;
  }
};

// Instance method to get supplier statistics
supplierSchema.methods.getSupplierStats = async function() {
  const PurchaseOrder = mongoose.model('PurchaseOrder');
  const Bid = mongoose.model('Bid');
  
  const [totalOrders, totalSpend, activeBids, awardedBids] = await Promise.all([
    PurchaseOrder.countDocuments({ supplier: this._id }),
    PurchaseOrder.aggregate([
      { $match: { supplier: this._id } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Bid.countDocuments({ supplier: this._id, status: 'submitted' }),
    Bid.countDocuments({ supplier: this._id, status: 'awarded' })
  ]);
  
  const spend = totalSpend[0] ? totalSpend[0].total : 0;
  const averageOrderValue = totalOrders > 0 ? spend / totalOrders : 0;
  
  return {
    totalOrders,
    totalSpend: spend,
    averageOrderValue,
    activeBids,
    awardedBids,
    winRate: totalOrders > 0 ? (awardedBids / totalOrders) * 100 : 0
  };
};

// Static method to get active suppliers
supplierSchema.statics.getActiveSuppliers = function() {
  return this.find({ status: 'active' });
};

// Static method to get suppliers by category
supplierSchema.statics.getSuppliersByCategory = function(categoryId) {
  return this.find({ 
    categories: categoryId,
    status: 'active'
  });
};

// Static method to get top performing suppliers
supplierSchema.statics.getTopSuppliers = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ rating: -1, 'performanceMetrics.onTimeDelivery': -1 })
    .limit(limit);
};

// Static method to get suppliers needing document verification
supplierSchema.statics.getSuppliersNeedingVerification = function() {
  return this.find({
    $or: [
      { 'documents.verified': false },
      { 'documents.expiryDate': { $lt: new Date() } }
    ],
    status: 'active'
  });
};

// Virtual populate for related entities
supplierSchema.virtual('purchaseOrders', {
  ref: 'PurchaseOrder',
  localField: '_id',
  foreignField: 'supplier'
});

supplierSchema.virtual('bids', {
  ref: 'Bid',
  localField: '_id',
  foreignField: 'supplier'
});

supplierSchema.virtual('rfqs', {
  ref: 'RFQ',
  localField: '_id',
  foreignField: 'suppliers'
});

supplierSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'supplier'
});

module.exports = mongoose.model('Supplier', supplierSchema);