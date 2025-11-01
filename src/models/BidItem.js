const mongoose = require('mongoose');

const bidItemSchema = new mongoose.Schema({
  bid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid',
    required: [true, 'Bid reference is required']
  },
  rfqItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFQItem',
    required: [true, 'RFQ item reference is required']
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
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
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.001, 'Quantity must be greater than 0'],
    validate: {
      validator: Number.isFinite,
      message: 'Quantity must be a valid number'
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
    min: [0, 'Delivery time cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Delivery time must be a whole number'
    }
  },
  specificationsCompliance: {
    type: String,
    enum: ['fully_compliant', 'partially_compliant', 'non_compliant', 'alternative_offered'],
    default: 'fully_compliant',
    required: true
  },
  complianceDetails: {
    technicalCompliance: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    qualityCompliance: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    documentationCompliance: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    overallCompliance: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    }
  },
  complianceNotes: {
    type: String,
    maxlength: [2000, 'Compliance notes cannot be more than 2000 characters']
  },
  deviations: [{
    aspect: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    impact: {
      type: String,
      enum: ['minor', 'moderate', 'major', 'critical'],
      default: 'minor'
    },
    justification: String,
    proposedSolution: String
  }],
  alternativeOffered: {
    isAlternative: {
      type: Boolean,
      default: false
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productDescription: {
      type: String,
      trim: true,
      maxlength: [1000, 'Product description cannot be more than 1000 characters']
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
    specifications: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    advantages: {
      type: String,
      maxlength: [1000, 'Advantages cannot be more than 1000 characters']
    },
    disadvantages: {
      type: String,
      maxlength: [1000, 'Disadvantages cannot be more than 1000 characters']
    },
    technicalComparison: {
      type: String,
      maxlength: [2000, 'Technical comparison cannot be more than 2000 characters']
    },
    priceComparison: {
      originalProductPrice: Number,
      alternativeProductPrice: Number,
      priceDifference: Number,
      priceDifferencePercentage: Number
    }
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
    coverage: [{
      type: String,
      trim: true
    }],
    exclusions: [{
      type: String,
      trim: true
    }],
    serviceResponseTime: {
      type: Number, // in hours
      min: 0
    }
  },
  afterSalesSupport: {
    included: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number, // in months
      min: 0,
      default: 0
    },
    responseTime: {
      type: Number, // in hours
      min: 0
    },
    supportTypes: [{
      type: String,
      enum: ['technical_support', 'maintenance', 'spare_parts', 'training', 'onsite_support', 'remote_support']
    }],
    terms: {
      type: String,
      maxlength: [1000, 'Support terms cannot be more than 1000 characters']
    },
    additionalCost: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  spareParts: {
    availability: {
      type: String,
      enum: ['readily_available', 'available_with_lead_time', 'limited_availability', 'not_available'],
      default: 'readily_available'
    },
    leadTime: {
      type: Number, // in days
      min: 0
    },
    costGuarantee: {
      type: Number, // in years
      min: 0
    },
    commonParts: [{
      partName: String,
      partNumber: String,
      unitPrice: Number,
      leadTime: Number
    }]
  },
  training: {
    included: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number, // in hours
      min: 0
    },
    participants: {
      type: Number,
      min: 0
    },
    location: {
      type: String,
      enum: ['supplier_premises', 'customer_premises', 'online', 'hybrid']
    },
    materialsIncluded: {
      type: Boolean,
      default: false
    },
    additionalCost: {
      type: Number,
      min: 0,
      default: 0
    },
    description: {
      type: String,
      maxlength: [1000, 'Training description cannot be more than 1000 characters']
    }
  },
  deliveryTerms: {
    packaging: {
      type: String,
      maxlength: [500, 'Packaging requirements cannot be more than 500 characters']
    },
    labeling: {
      type: String,
      maxlength: [500, 'Labeling requirements cannot be more than 500 characters']
    },
    documentation: [{
      type: String,
      trim: true
    }],
    insurance: {
      type: Boolean,
      default: false
    },
    insuranceValue: {
      type: Number,
      min: 0
    },
    specialHandling: {
      type: String,
      maxlength: [1000, 'Special handling instructions cannot be more than 1000 characters']
    }
  },
  qualityAssurance: {
    certifications: [{
      name: String,
      issuingBody: String,
      validity: Date
    }],
    testingReports: [{
      name: String,
      conductedBy: String,
      date: Date,
      result: String,
      document: String // URL to test report
    }],
    qualityControlProcess: {
      type: String,
      maxlength: [2000, 'Quality control process cannot be more than 2000 characters']
    },
    inspectionRequirements: {
      type: String,
      maxlength: [1000, 'Inspection requirements cannot be more than 1000 characters']
    }
  },
  environmentalCompliance: {
    rohsCompliant: {
      type: Boolean,
      default: false
    },
    reachCompliant: {
      type: Boolean,
      default: false
    },
    energyEfficiency: {
      type: String,
      enum: ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'not_rated']
    },
    recyclability: {
      type: Number,
      min: 0,
      max: 100
    },
    environmentalCertifications: [{
      name: String,
      issuingBody: String,
      certificateNumber: String
    }]
  },
  evaluationScores: {
    technicalScore: {
      type: Number,
      min: 0,
      max: 100
    },
    financialScore: {
      type: Number,
      min: 0,
      max: 100
    },
    deliveryScore: {
      type: Number,
      min: 0,
      max: 100
    },
    qualityScore: {
      type: Number,
      min: 0,
      max: 100
    },
    complianceScore: {
      type: Number,
      min: 0,
      max: 100
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100
    },
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    evaluatedAt: Date,
    evaluationNotes: String
  },
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot be more than 2000 characters']
  },
  supplierNotes: {
    type: String,
    maxlength: [2000, 'Supplier notes cannot be more than 2000 characters']
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
      enum: ['specification', 'certificate', 'test_report', 'catalog', 'quotation', 'other'],
      required: true
    },
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
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
bidItemSchema.index({ bid: 1 });
bidItemSchema.index({ rfqItem: 1 });
bidItemSchema.index({ product: 1 });
bidItemSchema.index({ specificationsCompliance: 1 });
bidItemSchema.index({ 'evaluationScores.overallScore': -1 });

// Compound indexes
bidItemSchema.index({ bid: 1, rfqItem: 1 }, { unique: true });
bidItemSchema.index({ bid: 1, product: 1 });
bidItemSchema.index({ rfqItem: 1, specificationsCompliance: 1 });

// Virtual for price competitiveness score
bidItemSchema.virtual('priceCompetitiveness').get(function() {
  // This would typically compare against other bids for the same RFQ item
  // For now, return a placeholder calculation
  if (this.unitPrice <= 0) return 0;
  
  // Lower price gets higher score (simplified calculation)
  const baseScore = 100 - (this.unitPrice / 1000 * 10); // Adjust divisor based on your price ranges
  return Math.max(0, Math.min(100, baseScore));
});

// Virtual for delivery competitiveness score
bidItemSchema.virtual('deliveryCompetitiveness').get(function() {
  if (this.deliveryTime <= 0) return 0;
  
  // Shorter delivery time gets higher score
  const baseScore = 100 - (this.deliveryTime * 2); // Adjust multiplier based on your delivery time ranges
  return Math.max(0, Math.min(100, baseScore));
});

// Virtual for total value score (combination of price and delivery)
bidItemSchema.virtual('totalValueScore').get(function() {
  const priceWeight = 0.6;
  const deliveryWeight = 0.4;
  
  return (this.priceCompetitiveness * priceWeight) + (this.deliveryCompetitiveness * deliveryWeight);
});

// Virtual for risk assessment
bidItemSchema.virtual('riskLevel').get(function() {
  let riskScore = 0;
  
  // Compliance risk
  if (this.specificationsCompliance !== 'fully_compliant') riskScore += 30;
  if (this.deviations.length > 0) riskScore += this.deviations.length * 10;
  
  // Delivery risk
  if (this.deliveryTime > 30) riskScore += 20;
  
  // Alternative product risk
  if (this.alternativeOffered.isAlternative) riskScore += 25;
  
  // Warranty risk
  if (this.warranty.period === 0) riskScore += 15;
  
  if (riskScore >= 60) return 'high';
  if (riskScore >= 30) return 'medium';
  return 'low';
});

// Pre-save middleware to calculate totals and compliance scores
bidItemSchema.pre('save', function(next) {
  // Calculate total
  this.total = this.unitPrice * this.quantity;
  
  // Calculate compliance scores if not set
  if (!this.complianceDetails.overallCompliance) {
    const { technicalCompliance, qualityCompliance, documentationCompliance } = this.complianceDetails;
    this.complianceDetails.overallCompliance = (technicalCompliance + qualityCompliance + documentationCompliance) / 3;
  }
  
  // Calculate price comparison for alternatives
  if (this.alternativeOffered.isAlternative && 
      this.alternativeOffered.priceComparison.originalProductPrice && 
      this.alternativeOffered.priceComparison.alternativeProductPrice) {
    
    const originalPrice = this.alternativeOffered.priceComparison.originalProductPrice;
    const alternativePrice = this.alternativeOffered.priceComparison.alternativeProductPrice;
    const difference = alternativePrice - originalPrice;
    const differencePercentage = (difference / originalPrice) * 100;
    
    this.alternativeOffered.priceComparison.priceDifference = difference;
    this.alternativeOffered.priceComparison.priceDifferencePercentage = differencePercentage;
  }
  
  next();
});

// Instance method to add deviation
bidItemSchema.methods.addDeviation = function(aspect, description, impact = 'minor', justification = '', proposedSolution = '') {
  this.deviations.push({
    aspect,
    description,
    impact,
    justification,
    proposedSolution
  });
  
  // Update compliance status based on deviations
  if (this.deviations.length > 0) {
    this.specificationsCompliance = 'partially_compliant';
  }
  
  return this;
};

// Instance method to set alternative product
bidItemSchema.methods.setAlternativeProduct = function(product, description, brand, model, specifications, advantages = '', disadvantages = '', technicalComparison = '') {
  this.alternativeOffered = {
    isAlternative: true,
    product,
    productDescription: description,
    brand,
    model,
    specifications,
    advantages,
    disadvantages,
    technicalComparison
  };
  
  this.specificationsCompliance = 'alternative_offered';
  
  return this;
};

// Instance method to set evaluation scores
bidItemSchema.methods.setEvaluationScores = function(scores, evaluatedBy, notes = '') {
  const { technicalScore, financialScore, deliveryScore, qualityScore, complianceScore } = scores;
  
  // Calculate overall score (weighted average)
  const weights = {
    technical: 0.25,
    financial: 0.35,
    delivery: 0.20,
    quality: 0.15,
    compliance: 0.05
  };
  
  const overallScore = 
    (technicalScore * weights.technical) +
    (financialScore * weights.financial) +
    (deliveryScore * weights.delivery) +
    (qualityScore * weights.quality) +
    (complianceScore * weights.compliance);
  
  this.evaluationScores = {
    technicalScore,
    financialScore,
    deliveryScore,
    qualityScore,
    complianceScore,
    overallScore,
    evaluatedBy,
    evaluatedAt: new Date(),
    evaluationNotes: notes
  };
  
  return this;
};

// Instance method to add attachment
bidItemSchema.methods.addAttachment = function(name, url, type, description = '') {
  this.attachments.push({
    name,
    url,
    type,
    description,
    uploadedAt: new Date()
  });
  
  return this;
};

// Instance method to get item analysis
bidItemSchema.methods.getItemAnalysis = function() {
  const complianceStatus = this.specificationsCompliance;
  const riskLevel = this.riskLevel;
  const valueScore = this.totalValueScore;
  const hasDeviations = this.deviations.length > 0;
  const hasAlternative = this.alternativeOffered.isAlternative;
  const hasWarranty = this.warranty.period > 0;
  const hasSupport = this.afterSalesSupport.included;
  
  return {
    complianceStatus,
    riskLevel,
    valueScore,
    hasDeviations,
    hasAlternative,
    hasWarranty,
    hasSupport,
    deliveryCompetitiveness: this.deliveryCompetitiveness,
    priceCompetitiveness: this.priceCompetitiveness,
    evaluationScore: this.evaluationScores.overallScore || 0
  };
};

// Static method to get items by bid
bidItemSchema.statics.getItemsByBid = function(bidId) {
  return this.find({ bid: bidId })
    .populate('product', 'name sku description unit specifications')
    .populate('rfqItem', 'specifications technicalRequirements')
    .populate('alternativeOffered.product', 'name sku description')
    .populate('evaluationScores.evaluatedBy', 'name email')
    .sort({ createdAt: 1 });
};

// Static method to get items by RFQ item
bidItemSchema.statics.getItemsByRFQItem = function(rfqItemId) {
  return this.find({ rfqItem: rfqItemId })
    .populate('bid', 'supplier status totalAmount')
    .populate('product', 'name sku unit')
    .populate('bid.supplier', 'name contactPerson rating')
    .sort({ total: 1 }); // Sort by price ascending
};

// Static method to get non-compliant items
bidItemSchema.statics.getNonCompliantItems = function() {
  return this.find({
    specificationsCompliance: { $in: ['partially_compliant', 'non_compliant'] }
  })
  .populate('bid', 'supplier rfq')
  .populate('product', 'name sku')
  .populate('bid.supplier', 'name')
  .populate('bid.rfq', 'rfqNumber title')
  .sort({ createdAt: -1 });
};

// Static method to get items with alternatives
bidItemSchema.statics.getItemsWithAlternatives = function() {
  return this.find({
    'alternativeOffered.isAlternative': true
  })
  .populate('bid', 'supplier rfq')
  .populate('product', 'name sku')
  .populate('alternativeOffered.product', 'name sku')
  .populate('bid.supplier', 'name')
  .populate('bid.rfq', 'rfqNumber title')
  .sort({ createdAt: -1 });
};

// Virtual populate for related entities
bidItemSchema.virtual('bidDetails', {
  ref: 'Bid',
  localField: 'bid',
  foreignField: '_id',
  justOne: true
});

bidItemSchema.virtual('productDetails', {
  ref: 'Product',
  localField: 'product',
  foreignField: '_id',
  justOne: true
});

bidItemSchema.virtual('rfqItemDetails', {
  ref: 'RFQItem',
  localField: 'rfqItem',
  foreignField: '_id',
  justOne: true
});

// Method to check if item is fully compliant
bidItemSchema.methods.isFullyCompliant = function() {
  return this.specificationsCompliance === 'fully_compliant' && this.deviations.length === 0;
};

// Method to check if item has competitive price
bidItemSchema.methods.hasCompetitivePrice = function(threshold = 80) {
  return this.priceCompetitiveness >= threshold;
};

// Method to check if item has good delivery time
bidItemSchema.methods.hasGoodDeliveryTime = function(threshold = 80) {
  return this.deliveryCompetitiveness >= threshold;
};

module.exports = mongoose.model('BidItem', bidItemSchema);