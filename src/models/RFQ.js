const mongoose = require('mongoose');

const rfqSchema = new mongoose.Schema({
  rfqNumber: {
    type: String,
    required: [true, 'RFQ number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [50, 'RFQ number cannot be more than 50 characters']
  },
  title: {
    type: String,
    required: [true, 'RFQ title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'RFQ description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFQItem'
  }],
  suppliers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  }],
  status: {
    type: String,
    enum: [
      'draft',
      'published',
      'open',
      'closed',
      'under_evaluation',
      'awarded',
      'cancelled',
      'expired'
    ],
    default: 'draft'
  },
  estimatedBudget: {
    type: Number,
    required: [true, 'Estimated budget is required'],
    min: [0, 'Estimated budget cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Estimated budget must be a valid number'
    }
  },
  actualAwardAmount: {
    type: Number,
    min: [0, 'Actual award amount cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Actual award amount must be a valid number'
    }
  },
  costSavings: {
    type: Number,
    min: [0, 'Cost savings cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Cost savings must be a valid number'
    }
  },
  savingsPercentage: {
    type: Number,
    min: [0, 'Savings percentage cannot be negative'],
    max: [100, 'Savings percentage cannot exceed 100%'],
    validate: {
      validator: Number.isFinite,
      message: 'Savings percentage must be a valid number'
    }
  },
  deadline: {
    type: Date,
    required: [true, 'Bidding deadline is required'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Deadline must be in the future'
    }
  },
  deliveryDate: {
    type: Date,
    required: [true, 'Delivery date is required'],
    validate: {
      validator: function(date) {
        return date > this.deadline;
      },
      message: 'Delivery date must be after the deadline'
    }
  },
  bidOpeningDate: {
    type: Date,
    validate: {
      validator: function(date) {
        return !date || date >= this.deadline;
      },
      message: 'Bid opening date must be on or after the deadline'
    }
  },
  evaluationCriteria: {
    technicalWeight: {
      type: Number,
      min: 0,
      max: 100,
      default: 40
    },
    financialWeight: {
      type: Number,
      min: 0,
      max: 100,
      default: 60
    },
    deliveryWeight: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    qualityWeight: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    specificCriteria: [{
      criterion: {
        type: String,
        required: true,
        trim: true
      },
      weight: {
        type: Number,
        min: 0,
        max: 100,
        required: true
      },
      description: String
    }]
  },
  termsAndConditions: {
    type: String,
    required: [true, 'Terms and conditions are required'],
    maxlength: [5000, 'Terms and conditions cannot be more than 5000 characters']
  },
  specialInstructions: {
    type: String,
    maxlength: [2000, 'Special instructions cannot be more than 2000 characters']
  },
  attachment: {
    type: String // URL to RFQ document
  },
  additionalAttachments: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true
    },
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required']
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  publishedAt: Date,
  closedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  closedAt: Date,
  awardedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  awardedBid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  },
  awardedAt: Date,
  awardedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  evaluationCommittee: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['chairperson', 'member', 'technical_expert', 'financial_expert'],
      default: 'member'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    }
  }],
  evaluationResults: [{
    bid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
      required: true
    },
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
    overallScore: {
      type: Number,
      min: 0,
      max: 100
    },
    rank: {
      type: Number,
      min: 1
    },
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    evaluatedAt: {
      type: Date,
      default: Date.now
    },
    comments: String
  }],
  bidSecurity: {
    required: {
      type: Boolean,
      default: false
    },
    amount: {
      type: Number,
      min: 0
    },
    type: {
      type: String,
      enum: ['bid_bond', 'bank_guarantee', 'cash', 'other'],
      default: 'bid_bond'
    },
    validityPeriod: Number // in days
  },
  performanceSecurity: {
    required: {
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
    }
  },
  validityPeriod: {
    type: Number, // in days
    required: [true, 'Validity period is required'],
    min: [1, 'Validity period must be at least 1 day']
  },
  preBidMeeting: {
    required: {
      type: Boolean,
      default: false
    },
    date: Date,
    location: String,
    minutes: String // URL to meeting minutes
  },
  siteVisit: {
    required: {
      type: Boolean,
      default: false
    },
    date: Date,
    location: String,
    contactPerson: String
  },
  questions: [{
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true
    },
    question: {
      type: String,
      required: true,
      trim: true
    },
    askedAt: {
      type: Date,
      default: Date.now
    },
    answer: {
      type: String,
      trim: true
    },
    answeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    answeredAt: Date,
    isPublic: {
      type: Boolean,
      default: false
    }
  }],
  amendments: [{
    number: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    document: String, // URL to amendment document
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    issuedAt: {
      type: Date,
      default: Date.now
    },
    effectiveDate: Date
  }],
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
rfqSchema.index({ rfqNumber: 1 });
rfqSchema.index({ status: 1 });
rfqSchema.index({ category: 1 });
rfqSchema.index({ deadline: 1 });
rfqSchema.index({ createdBy: 1 });
rfqSchema.index({ createdAt: -1 });
rfqSchema.index({ awardedTo: 1 });

// Compound indexes
rfqSchema.index({ status: 1, deadline: 1 });
rfqSchema.index({ category: 1, status: 1 });
rfqSchema.index({ createdBy: 1, createdAt: -1 });

// Virtual for days remaining until deadline
rfqSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const diffTime = this.deadline - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for bidding status
rfqSchema.virtual('biddingStatus').get(function() {
  const now = new Date();
  
  if (this.status === 'draft') return 'draft';
  if (this.status === 'cancelled') return 'cancelled';
  if (this.status === 'awarded') return 'awarded';
  if (this.status === 'expired') return 'expired';
  
  if (now < this.deadline) {
    return this.status === 'published' ? 'open' : 'upcoming';
  } else {
    return 'closed';
  }
});

// Virtual for total number of bids
rfqSchema.virtual('bidCount', {
  ref: 'Bid',
  localField: '_id',
  foreignField: 'rfq',
  count: true
});

// Virtual for number of participating suppliers
rfqSchema.virtual('participatingSuppliersCount', {
  ref: 'Bid',
  localField: '_id',
  foreignField: 'rfq',
  count: true
});

// Virtual for evaluation progress
rfqSchema.virtual('evaluationProgress').get(function() {
  if (!this.evaluationResults || this.evaluationResults.length === 0) {
    return 0;
  }
  
  const totalBids = this.bidCount || 0;
  if (totalBids === 0) return 0;
  
  const evaluatedBids = new Set(this.evaluationResults.map(r => r.bid.toString())).size;
  return (evaluatedBids / totalBids) * 100;
});

// Virtual for cost savings calculation
rfqSchema.virtual('calculatedSavings').get(function() {
  if (!this.actualAwardAmount || !this.estimatedBudget) {
    return null;
  }
  
  const savings = this.estimatedBudget - this.actualAwardAmount;
  const percentage = (savings / this.estimatedBudget) * 100;
  
  return {
    amount: savings,
    percentage: percentage
  };
});

// Pre-save middleware to update status based on dates
rfqSchema.pre('save', function(next) {
  const now = new Date();
  
  // Auto-expire RFQs past their deadline
  if (this.status === 'open' && now > this.deadline) {
    this.status = 'closed';
    this.closedAt = now;
  }
  
  // Auto-expire RFQs past their validity period
  if (this.status === 'closed' && this.closedAt) {
    const expiryDate = new Date(this.closedAt);
    expiryDate.setDate(expiryDate.getDate() + this.validityPeriod);
    
    if (now > expiryDate && this.status !== 'awarded' && this.status !== 'cancelled') {
      this.status = 'expired';
    }
  }
  
  // Calculate cost savings if awarded
  if (this.status === 'awarded' && this.actualAwardAmount && this.estimatedBudget) {
    this.costSavings = this.estimatedBudget - this.actualAwardAmount;
    this.savingsPercentage = (this.costSavings / this.estimatedBudget) * 100;
  }
  
  next();
});

// Pre-save middleware to validate evaluation criteria weights
rfqSchema.pre('save', function(next) {
  const criteria = this.evaluationCriteria;
  const totalWeight = criteria.technicalWeight + criteria.financialWeight + 
                     criteria.deliveryWeight + criteria.qualityWeight +
                     (criteria.specificCriteria?.reduce((sum, crit) => sum + crit.weight, 0) || 0);
  
  if (Math.abs(totalWeight - 100) > 0.01) { // Allow for floating point precision
    return next(new Error('Evaluation criteria weights must sum to 100%'));
  }
  
  next();
});

// Instance method to publish RFQ
rfqSchema.methods.publish = function(publishedBy) {
  if (this.status !== 'draft') {
    throw new Error('Only draft RFQs can be published');
  }
  
  if (this.suppliers.length === 0) {
    throw new Error('Cannot publish RFQ without suppliers');
  }
  
  if (this.items.length === 0) {
    throw new Error('Cannot publish RFQ without items');
  }
  
  this.status = 'published';
  this.publishedBy = publishedBy;
  this.publishedAt = new Date();
  
  return this;
};

// Instance method to close RFQ
rfqSchema.methods.close = function(closedBy) {
  if (this.status !== 'published' && this.status !== 'open') {
    throw new Error('Only published/open RFQs can be closed');
  }
  
  this.status = 'closed';
  this.closedBy = closedBy;
  this.closedAt = new Date();
  
  return this;
};

// Instance method to award RFQ
rfqSchema.methods.award = function(supplier, bid, awardedBy, awardAmount) {
  if (this.status !== 'closed' && this.status !== 'under_evaluation') {
    throw new Error('Only closed or under evaluation RFQs can be awarded');
  }
  
  if (!this.suppliers.includes(supplier)) {
    throw new Error('Supplier was not invited to this RFQ');
  }
  
  this.status = 'awarded';
  this.awardedTo = supplier;
  this.awardedBid = bid;
  this.actualAwardAmount = awardAmount;
  this.awardedBy = awardedBy;
  this.awardedAt = new Date();
  
  // Calculate savings
  if (this.estimatedBudget && awardAmount) {
    this.costSavings = this.estimatedBudget - awardAmount;
    this.savingsPercentage = (this.costSavings / this.estimatedBudget) * 100;
  }
  
  return this;
};

// Instance method to add evaluation result
rfqSchema.methods.addEvaluationResult = function(bid, scores, evaluatedBy, comments = '') {
  const { technicalScore, financialScore, deliveryScore, qualityScore } = scores;
  
  // Calculate overall score based on weights
  const criteria = this.evaluationCriteria;
  let overallScore = 0;
  
  if (technicalScore) overallScore += technicalScore * (criteria.technicalWeight / 100);
  if (financialScore) overallScore += financialScore * (criteria.financialWeight / 100);
  if (deliveryScore) overallScore += deliveryScore * (criteria.deliveryWeight / 100);
  if (qualityScore) overallScore += qualityScore * (criteria.qualityWeight / 100);
  
  // Remove existing evaluation for this bid by this evaluator
  this.evaluationResults = this.evaluationResults.filter(
    result => !(result.bid.equals(bid) && result.evaluatedBy.equals(evaluatedBy))
  );
  
  // Add new evaluation
  this.evaluationResults.push({
    bid,
    technicalScore,
    financialScore,
    deliveryScore,
    qualityScore,
    overallScore,
    evaluatedBy,
    evaluatedAt: new Date(),
    comments
  });
  
  // Update ranks
  this.updateEvaluationRanks();
  
  return this;
};

// Instance method to update evaluation ranks
rfqSchema.methods.updateEvaluationRanks = function() {
  // Group evaluations by bid and calculate average scores
  const bidScores = {};
  
  this.evaluationResults.forEach(result => {
    const bidId = result.bid.toString();
    if (!bidScores[bidId]) {
      bidScores[bidId] = {
        bid: result.bid,
        technicalScores: [],
        financialScores: [],
        deliveryScores: [],
        qualityScores: [],
        overallScores: []
      };
    }
    
    if (result.technicalScore) bidScores[bidId].technicalScores.push(result.technicalScore);
    if (result.financialScore) bidScores[bidId].financialScores.push(result.financialScore);
    if (result.deliveryScore) bidScores[bidId].deliveryScores.push(result.deliveryScore);
    if (result.qualityScore) bidScores[bidId].qualityScores.push(result.qualityScore);
    if (result.overallScore) bidScores[bidId].overallScores.push(result.overallScore);
  });
  
  // Calculate average scores for each bid
  const rankedBids = Object.values(bidScores).map(bidData => {
    const avgTechnical = bidData.technicalScores.length > 0 ? 
      bidData.technicalScores.reduce((a, b) => a + b, 0) / bidData.technicalScores.length : 0;
    
    const avgFinancial = bidData.financialScores.length > 0 ? 
      bidData.financialScores.reduce((a, b) => a + b, 0) / bidData.financialScores.length : 0;
    
    const avgDelivery = bidData.deliveryScores.length > 0 ? 
      bidData.deliveryScores.reduce((a, b) => a + b, 0) / bidData.deliveryScores.length : 0;
    
    const avgQuality = bidData.qualityScores.length > 0 ? 
      bidData.qualityScores.reduce((a, b) => a + b, 0) / bidData.qualityScores.length : 0;
    
    const avgOverall = bidData.overallScores.length > 0 ? 
      bidData.overallScores.reduce((a, b) => a + b, 0) / bidData.overallScores.length : 0;
    
    return {
      bid: bidData.bid,
      averageTechnical: avgTechnical,
      averageFinancial: avgFinancial,
      averageDelivery: avgDelivery,
      averageQuality: avgQuality,
      averageOverall: avgOverall
    };
  });
  
  // Sort by overall score descending
  rankedBids.sort((a, b) => b.averageOverall - a.averageOverall);
  
  // Update ranks in evaluation results
  rankedBids.forEach((bid, index) => {
    this.evaluationResults.forEach(result => {
      if (result.bid.equals(bid.bid)) {
        result.rank = index + 1;
      }
    });
  });
};

// Instance method to add question
rfqSchema.methods.addQuestion = function(supplier, question) {
  this.questions.push({
    supplier,
    question,
    askedAt: new Date()
  });
  
  return this;
};

// Instance method to answer question
rfqSchema.methods.answerQuestion = function(questionId, answer, answeredBy, isPublic = false) {
  const question = this.questions.id(questionId);
  if (question) {
    question.answer = answer;
    question.answeredBy = answeredBy;
    question.answeredAt = new Date();
    question.isPublic = isPublic;
  }
  
  return this;
};

// Instance method to get RFQ statistics
rfqSchema.methods.getRFQStats = async function() {
  const Bid = mongoose.model('Bid');
  
  const [totalBids, bidsByStatus] = await Promise.all([
    Bid.countDocuments({ rfq: this._id }),
    Bid.aggregate([
      { $match: { rfq: this._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);
  
  const participatingSuppliers = new Set(
    this.evaluationResults.map(r => r.bid.supplier?.toString())
  ).size;
  
  return {
    totalBids,
    bidsByStatus: bidsByStatus.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    participatingSuppliers,
    evaluationProgress: this.evaluationProgress,
    questionsCount: this.questions.length,
    answeredQuestions: this.questions.filter(q => q.answer).length
  };
};

// Static method to generate next RFQ number
rfqSchema.statics.generateRFQNumber = async function() {
  const currentYear = new Date().getFullYear();
  const prefix = `RFQ-${currentYear}-`;
  
  const lastRFQ = await this.findOne(
    { rfqNumber: new RegExp(`^${prefix}`) },
    { rfqNumber: 1 },
    { sort: { rfqNumber: -1 } }
  );
  
  let sequence = 1;
  if (lastRFQ && lastRFQ.rfqNumber) {
    const lastSequence = parseInt(lastRFQ.rfqNumber.split('-')[2]) || 0;
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${sequence.toString().padStart(4, '0')}`;
};

// Static method to get RFQs by status
rfqSchema.statics.getRFQsByStatus = function(status) {
  return this.find({ status })
    .populate('category', 'name')
    .populate('createdBy', 'name email')
    .populate('suppliers', 'name contactPerson')
    .sort({ createdAt: -1 });
};

// Static method to get open RFQs
rfqSchema.statics.getOpenRFQs = function() {
  const now = new Date();
  return this.find({
    status: { $in: ['published', 'open'] },
    deadline: { $gt: now }
  })
  .populate('category', 'name')
  .populate('createdBy', 'name email')
  .populate('suppliers', 'name contactPerson')
  .sort({ deadline: 1 });
};

// Static method to get RFQs needing attention
rfqSchema.statics.getRFQsNeedingAttention = function() {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return this.find({
    status: { $in: ['published', 'open'] },
    deadline: { $lte: sevenDaysFromNow, $gt: now }
  })
  .populate('category', 'name')
  .populate('createdBy', 'name email')
  .sort({ deadline: 1 });
};

// Virtual populate for related entities
rfqSchema.virtual('bids', {
  ref: 'Bid',
  localField: '_id',
  foreignField: 'rfq'
});

rfqSchema.virtual('categoryDetails', {
  ref: 'Category',
  localField: 'category',
  foreignField: '_id',
  justOne: true
});

rfqSchema.virtual('awardedSupplier', {
  ref: 'Supplier',
  localField: 'awardedTo',
  foreignField: '_id',
  justOne: true
});

// Method to check if RFQ can be modified
rfqSchema.methods.canBeModified = function() {
  return ['draft', 'published'].includes(this.status);
};

// Method to check if bidding is open
rfqSchema.methods.isBiddingOpen = function() {
  const now = new Date();
  return this.status === 'open' && now < this.deadline;
};

module.exports = mongoose.model('RFQ', rfqSchema);