const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  bidNumber: {
    type: String,
    required: [true, 'Bid number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [50, 'Bid number cannot be more than 50 characters']
  },
  rfq: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFQ',
    required: [true, 'RFQ reference is required']
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Supplier is required']
  },
  status: {
    type: String,
    enum: [
      'draft',
      'submitted',
      'under_review',
      'qualified',
      'disqualified',
      'recommended',
      'awarded',
      'rejected',
      'withdrawn',
      'expired'
    ],
    default: 'draft'
  },
  items: [{
    rfqItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RFQItem',
      required: true
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
    deliveryTime: {
      type: Number, // in days
      required: [true, 'Delivery time is required'],
      min: [0, 'Delivery time cannot be negative']
    },
    specificationsCompliance: {
      type: String,
      enum: ['fully_compliant', 'partially_compliant', 'non_compliant', 'alternative_offered'],
      default: 'fully_compliant'
    },
    complianceNotes: {
      type: String,
      maxlength: [1000, 'Compliance notes cannot be more than 1000 characters']
    },
    alternativeOffered: {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      description: String,
      specifications: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
      },
      advantages: String,
      disadvantages: String,
      priceComparison: String
    },
    warranty: {
      period: Number, // in months
      terms: String
    },
    afterSalesSupport: {
      included: {
        type: Boolean,
        default: false
      },
      duration: Number, // in months
      responseTime: Number, // in hours
      terms: String
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot be more than 500 characters']
    }
  }],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Total amount must be a valid number'
    }
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
    maxlength: [3, 'Currency code must be 3 characters']
  },
  validityPeriod: {
    type: Number, // in days
    required: [true, 'Validity period is required'],
    min: [1, 'Validity period must be at least 1 day']
  },
  validityExpiry: {
    type: Date,
    required: [true, 'Validity expiry date is required']
  },
  deliveryTime: {
    type: Number, // in days
    required: [true, 'Overall delivery time is required'],
    min: [0, 'Delivery time cannot be negative']
  },
  paymentTerms: {
    type: String,
    enum: ['net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt', 'custom'],
    default: 'net_30'
  },
  customPaymentTerms: String,
  incoterms: {
    type: String,
    enum: ['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DPU', 'DAP', 'DDP'],
    default: 'FOB'
  },
  bidSecurity: {
    provided: {
      type: Boolean,
      default: false
    },
    amount: {
      type: Number,
      min: 0
    },
    type: {
      type: String,
      enum: ['bid_bond', 'bank_guarantee', 'cash', 'other']
    },
    reference: String,
    expiryDate: Date,
    document: String // URL to bid security document
  },
  performanceSecurity: {
    offered: {
      type: Boolean,
      default: false
    },
    amount: {
      type: Number,
      min: 0
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100
    },
    type: {
      type: String,
      enum: ['bank_guarantee', 'insurance_bond', 'cash', 'other']
    }
  },
  technicalProposal: {
    document: String, // URL to technical proposal
    executiveSummary: String,
    methodology: String,
    teamComposition: [{
      name: String,
      role: String,
      experience: Number, // in years
      qualifications: [String]
    }],
    implementationPlan: String,
    qualityAssurance: String,
    riskManagement: String
  },
  financialProposal: {
    document: String, // URL to financial proposal
    costBreakdown: {
      materialCost: Number,
      laborCost: Number,
      overheadCost: Number,
      profitMargin: Number,
      contingency: Number,
      taxes: Number
    },
    paymentSchedule: [{
      milestone: String,
      percentage: Number,
      amount: Number,
      dueDate: Date
    }]
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
    type: {
      type: String,
      enum: ['company_profile', 'financial_statement', 'certificate', 'license', 'reference', 'other'],
      required: true
    },
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  evaluationResults: [{
    criterion: {
      type: String,
      required: true,
      trim: true
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    weight: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    weightedScore: {
      type: Number,
      min: 0,
      max: 100
    },
    comments: String,
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    evaluatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    validate: {
      validator: Number.isFinite,
      message: 'Overall score must be a valid number'
    }
  },
  rank: {
    type: Number,
    min: 1
  },
  awardAmount: {
    type: Number,
    min: [0, 'Award amount cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Award amount must be a valid number'
    }
  },
  awardedAt: Date,
  awardedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  contractTerms: {
    type: String,
    maxlength: [5000, 'Contract terms cannot be more than 5000 characters']
  },
  withdrawalReason: {
    type: String,
    maxlength: [1000, 'Withdrawal reason cannot be more than 1000 characters']
  },
  withdrawnAt: Date,
  disqualifiedReason: {
    type: String,
    maxlength: [1000, 'Disqualification reason cannot be more than 1000 characters']
  },
  disqualifiedAt: Date,
  disqualifiedBy: {
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
  submittedAt: Date,
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedAt: Date,
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
bidSchema.index({ bidNumber: 1 });
bidSchema.index({ rfq: 1 });
bidSchema.index({ supplier: 1 });
bidSchema.index({ status: 1 });
bidSchema.index({ overallScore: -1 });
bidSchema.index({ totalAmount: 1 });
bidSchema.index({ validityExpiry: 1 });
bidSchema.index({ createdAt: -1 });

// Compound indexes
bidSchema.index({ rfq: 1, supplier: 1 }, { unique: true });
bidSchema.index({ rfq: 1, status: 1 });
bidSchema.index({ supplier: 1, status: 1 });
bidSchema.index({ rfq: 1, overallScore: -1 });

// Virtual for days until expiry
bidSchema.virtual('daysUntilExpiry').get(function() {
  const now = new Date();
  const diffTime = this.validityExpiry - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for bid age in days
bidSchema.virtual('bidAgeInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for compliance rate
bidSchema.virtual('complianceRate').get(function() {
  if (this.items.length === 0) return 0;
  
  const compliantItems = this.items.filter(
    item => item.specificationsCompliance === 'fully_compliant'
  ).length;
  
  return (compliantItems / this.items.length) * 100;
});

// Virtual for average delivery time
bidSchema.virtual('averageDeliveryTime').get(function() {
  if (this.items.length === 0) return 0;
  
  const totalDeliveryTime = this.items.reduce((sum, item) => sum + item.deliveryTime, 0);
  return totalDeliveryTime / this.items.length;
});

// Virtual for total weighted score
bidSchema.virtual('calculatedScore').get(function() {
  if (this.evaluationResults.length === 0) return 0;
  
  const totalWeightedScore = this.evaluationResults.reduce(
    (sum, result) => sum + (result.score * (result.weight / 100)), 
    0
  );
  
  return totalWeightedScore;
});

// Pre-save middleware to calculate totals and validate data
bidSchema.pre('save', function(next) {
  // Calculate item totals and overall total
  let totalAmount = 0;
  
  this.items.forEach(item => {
    item.total = item.unitPrice * this.getRFQItemQuantity(item.rfqItem);
    totalAmount += item.total;
  });
  
  this.totalAmount = totalAmount;
  
  // Calculate validity expiry
  if (this.submittedAt && !this.validityExpiry) {
    const expiryDate = new Date(this.submittedAt);
    expiryDate.setDate(expiryDate.getDate() + this.validityPeriod);
    this.validityExpiry = expiryDate;
  }
  
  // Calculate overall score from evaluation results
  if (this.evaluationResults.length > 0) {
    this.overallScore = this.calculatedScore;
  }
  
  // Auto-expire bids past their validity
  if (this.validityExpiry && new Date() > this.validityExpiry && this.status === 'submitted') {
    this.status = 'expired';
  }
  
  next();
});

// Pre-save middleware to update last modified date
bidSchema.pre('save', function(next) {
  this.lastModifiedAt = new Date();
  next();
});

// Instance method to get RFQ item quantity (would need to be populated or fetched)
bidSchema.methods.getRFQItemQuantity = function(rfqItemId) {
  // This is a placeholder - in practice, you'd want to populate RFQ items
  // or fetch the quantity from the RFQItem model
  const item = this.items.find(i => i.rfqItem.equals(rfqItemId));
  return item ? 1 : 0; // Default to 1 for calculation
};

// Instance method to submit bid
bidSchema.methods.submit = function(submittedBy) {
  if (this.status !== 'draft') {
    throw new Error('Only draft bids can be submitted');
  }
  
  if (this.items.length === 0) {
    throw new Error('Cannot submit bid without items');
  }
  
  this.status = 'submitted';
  this.submittedAt = new Date();
  this.submittedBy = submittedBy;
  
  // Set validity expiry
  const expiryDate = new Date(this.submittedAt);
  expiryDate.setDate(expiryDate.getDate() + this.validityPeriod);
  this.validityExpiry = expiryDate;
  
  return this;
};

// Instance method to withdraw bid
bidSchema.methods.withdraw = function(reason = '') {
  if (!['submitted', 'under_review'].includes(this.status)) {
    throw new Error('Bid cannot be withdrawn in current status');
  }
  
  this.status = 'withdrawn';
  this.withdrawalReason = reason;
  this.withdrawnAt = new Date();
  
  return this;
};

// Instance method to add evaluation result
bidSchema.methods.addEvaluationResult = function(criterion, score, weight, evaluatedBy, comments = '') {
  // Remove existing evaluation for this criterion by this evaluator
  this.evaluationResults = this.evaluationResults.filter(
    result => !(result.criterion === criterion && result.evaluatedBy.equals(evaluatedBy))
  );
  
  // Add new evaluation
  this.evaluationResults.push({
    criterion,
    score,
    weight,
    weightedScore: score * (weight / 100),
    comments,
    evaluatedBy,
    evaluatedAt: new Date()
  });
  
  // Recalculate overall score
  this.overallScore = this.calculatedScore;
  
  return this;
};

// Instance method to disqualify bid
bidSchema.methods.disqualify = function(disqualifiedBy, reason = '') {
  this.status = 'disqualified';
  this.disqualifiedReason = reason;
  this.disqualifiedBy = disqualifiedBy;
  this.disqualifiedAt = new Date();
  
  return this;
};

// Instance method to award bid
bidSchema.methods.award = function(awardedBy, awardAmount, contractTerms = '') {
  if (this.status !== 'recommended') {
    throw new Error('Only recommended bids can be awarded');
  }
  
  this.status = 'awarded';
  this.awardAmount = awardAmount;
  this.awardedBy = awardedBy;
  this.awardedAt = new Date();
  this.contractTerms = contractTerms;
  
  return this;
};

// Instance method to add attachment
bidSchema.methods.addAttachment = function(name, url, type, description = '') {
  this.attachments.push({
    name,
    url,
    type,
    description,
    uploadedAt: new Date()
  });
  
  return this;
};

// Instance method to get bid statistics
bidSchema.methods.getBidStats = function() {
  const compliantItems = this.items.filter(
    item => item.specificationsCompliance === 'fully_compliant'
  ).length;
  
  const itemsWithWarranty = this.items.filter(
    item => item.warranty && item.warranty.period > 0
  ).length;
  
  const itemsWithSupport = this.items.filter(
    item => item.afterSalesSupport && item.afterSalesSupport.included
  ).length;
  
  return {
    totalItems: this.items.length,
    compliantItems,
    complianceRate: this.complianceRate,
    itemsWithWarranty,
    itemsWithSupport,
    averageDeliveryTime: this.averageDeliveryTime,
    evaluationScore: this.overallScore || 0,
    rank: this.rank || 'Not ranked'
  };
};

// Static method to generate next bid number
bidSchema.statics.generateBidNumber = async function() {
  const currentYear = new Date().getFullYear();
  const prefix = `BID-${currentYear}-`;
  
  const lastBid = await this.findOne(
    { bidNumber: new RegExp(`^${prefix}`) },
    { bidNumber: 1 },
    { sort: { bidNumber: -1 } }
  );
  
  let sequence = 1;
  if (lastBid && lastBid.bidNumber) {
    const lastSequence = parseInt(lastBid.bidNumber.split('-')[2]) || 0;
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(4, '0')}`;
};

// Static method to get bids by RFQ
bidSchema.statics.getBidsByRFQ = function(rfqId) {
  return this.find({ rfq: rfqId })
    .populate('supplier', 'name contactPerson email rating')
    .populate('items.rfqItem', 'product specifications')
    .populate('items.alternativeOffered.product', 'name sku')
    .populate('evaluationResults.evaluatedBy', 'name email')
    .sort({ overallScore: -1, totalAmount: 1 });
};

// Static method to get bids by supplier
bidSchema.statics.getBidsBySupplier = function(supplierId) {
  return this.find({ supplier: supplierId })
    .populate('rfq', 'rfqNumber title deadline status')
    .populate('items.rfqItem')
    .sort({ submittedAt: -1 });
};

// Static method to get awarded bids
bidSchema.statics.getAwardedBids = function() {
  return this.find({ status: 'awarded' })
    .populate('rfq', 'rfqNumber title')
    .populate('supplier', 'name contactPerson')
    .sort({ awardedAt: -1 });
};

// Static method to get expiring bids
bidSchema.statics.getExpiringBids = function(days = 7) {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() + days);
  
  return this.find({
    status: 'submitted',
    validityExpiry: { $lte: thresholdDate, $gt: new Date() }
  })
  .populate('rfq', 'rfqNumber title')
  .populate('supplier', 'name contactPerson email')
  .sort({ validityExpiry: 1 });
};

// Virtual populate for related entities
bidSchema.virtual('rfqDetails', {
  ref: 'RFQ',
  localField: 'rfq',
  foreignField: '_id',
  justOne: true
});

bidSchema.virtual('supplierDetails', {
  ref: 'Supplier',
  localField: 'supplier',
  foreignField: '_id',
  justOne: true
});

bidSchema.virtual('awardedByDetails', {
  ref: 'User',
  localField: 'awardedBy',
  foreignField: '_id',
  justOne: true
});

// Method to check if bid can be modified
bidSchema.methods.canBeModified = function() {
  return this.status === 'draft';
};

// Method to check if bid is still valid
bidSchema.methods.isValid = function() {
  return this.validityExpiry && new Date() < this.validityExpiry;
};

// Method to check if bid is compliant
bidSchema.methods.isCompliant = function() {
  return this.complianceRate >= 80; // 80% compliance threshold
};

module.exports = mongoose.model('Bid', bidSchema);