const mongoose = require('mongoose');

const rfqItemSchema = new mongoose.Schema({
  rfq: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFQ',
    required: [true, 'RFQ reference is required']
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
    min: [0, 'Estimated unit price cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Estimated unit price must be a valid number'
    }
  },
  estimatedTotal: {
    type: Number,
    min: [0, 'Estimated total cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Estimated total must be a valid number'
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
  technicalRequirements: {
    type: String,
    maxlength: [2000, 'Technical requirements cannot be more than 2000 characters']
  },
  qualityStandards: [{
    type: String,
    trim: true
  }],
  deliveryRequirements: {
    packaging: String,
    labeling: String,
    documentation: String,
    inspectionRequired: {
      type: Boolean,
      default: false
    },
    specialHandling: String
  },
  samplesRequired: {
    type: Boolean,
    default: false
  },
  sampleQuantity: {
    type: Number,
    min: 0,
    default: 0
  },
  sampleDeliveryDate: Date,
  testingRequirements: [{
    type: String,
    trim: true
  }],
  certificationRequirements: [{
    type: String,
    trim: true
  }],
  warranty: {
    required: {
      type: Boolean,
      default: false
    },
    period: Number, // in months
    terms: String
  },
  spareParts: {
    required: {
      type: Boolean,
      default: false
    },
    list: [{
      part: String,
      quantity: Number,
      deliveryTime: Number // in days
    }]
  },
  training: {
    required: {
      type: Boolean,
      default: false
    },
    duration: Number, // in hours
    description: String
  },
  afterSalesSupport: {
    required: {
      type: Boolean,
      default: false
    },
    duration: Number, // in months
    responseTime: Number, // in hours
    description: String
  },
  evaluationWeight: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  mandatory: {
    type: Boolean,
    default: true
  },
  alternativesAllowed: {
    type: Boolean,
    default: false
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
    }
  }],
  bidResponses: [{
    bid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
      required: true
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    deliveryTime: Number, // in days
    notes: String,
    specificationsCompliance: {
      type: String,
      enum: ['fully_compliant', 'partially_compliant', 'non_compliant', 'alternative_offered'],
      default: 'fully_compliant'
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
      disadvantages: String
    }
  }],
  awardedBidResponse: {
    bid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid'
    },
    unitPrice: {
      type: Number,
      min: 0
    },
    total: {
      type: Number,
      min: 0
    },
    deliveryTime: Number,
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier'
    }
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
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
rfqItemSchema.index({ rfq: 1 });
rfqItemSchema.index({ product: 1 });
rfqItemSchema.index({ 'bidResponses.bid': 1 });

// Compound indexes
rfqItemSchema.index({ rfq: 1, product: 1 }, { unique: true });

// Virtual for number of bid responses
rfqItemSchema.virtual('bidResponseCount').get(function() {
  return this.bidResponses.length;
});

// Virtual for average bid price
rfqItemSchema.virtual('averageBidPrice').get(function() {
  if (this.bidResponses.length === 0) return 0;
  
  const total = this.bidResponses.reduce((sum, response) => sum + response.unitPrice, 0);
  return total / this.bidResponses.length;
});

// Virtual for lowest bid price
rfqItemSchema.virtual('lowestBidPrice').get(function() {
  if (this.bidResponses.length === 0) return 0;
  
  return Math.min(...this.bidResponses.map(response => response.unitPrice));
});

// Virtual for highest bid price
rfqItemSchema.virtual('highestBidPrice').get(function() {
  if (this.bidResponses.length === 0) return 0;
  
  return Math.max(...this.bidResponses.map(response => response.unitPrice));
});

// Virtual for compliance rate
rfqItemSchema.virtual('complianceRate').get(function() {
  if (this.bidResponses.length === 0) return 0;
  
  const compliantBids = this.bidResponses.filter(
    response => response.specificationsCompliance === 'fully_compliant'
  ).length;
  
  return (compliantBids / this.bidResponses.length) * 100;
});

// Pre-save middleware to calculate estimated total
rfqItemSchema.pre('save', function(next) {
  if (this.estimatedUnitPrice && this.quantity) {
    this.estimatedTotal = this.estimatedUnitPrice * this.quantity;
  }
  next();
});

// Instance method to add bid response
rfqItemSchema.methods.addBidResponse = function(bid, unitPrice, deliveryTime = null, notes = '', compliance = 'fully_compliant', alternative = null) {
  // Remove existing response from this bid
  this.bidResponses = this.bidResponses.filter(response => !response.bid.equals(bid));
  
  // Add new response
  this.bidResponses.push({
    bid,
    unitPrice,
    total: unitPrice * this.quantity,
    deliveryTime,
    notes,
    specificationsCompliance: compliance,
    alternativeOffered: alternative
  });
  
  return this;
};

// Instance method to set awarded bid
rfqItemSchema.methods.setAwardedBid = function(bidResponse) {
  this.awardedBidResponse = {
    bid: bidResponse.bid,
    unitPrice: bidResponse.unitPrice,
    total: bidResponse.total,
    deliveryTime: bidResponse.deliveryTime,
    supplier: bidResponse.bid.supplier // This would be populated
  };
  
  return this;
};

// Instance method to get bid statistics
rfqItemSchema.methods.getBidStatistics = function() {
  if (this.bidResponses.length === 0) {
    return {
      count: 0,
      averagePrice: 0,
      lowestPrice: 0,
      highestPrice: 0,
      priceRange: 0,
      complianceRate: 0
    };
  }
  
  const prices = this.bidResponses.map(response => response.unitPrice);
  const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const lowestPrice = Math.min(...prices);
  const highestPrice = Math.max(...prices);
  
  const compliantBids = this.bidResponses.filter(
    response => response.specificationsCompliance === 'fully_compliant'
  ).length;
  
  const complianceRate = (compliantBids / this.bidResponses.length) * 100;
  
  return {
    count: this.bidResponses.length,
    averagePrice,
    lowestPrice,
    highestPrice,
    priceRange: highestPrice - lowestPrice,
    complianceRate,
    standardDeviation: this.calculateStandardDeviation(prices)
  };
};

// Instance method to calculate standard deviation
rfqItemSchema.methods.calculateStandardDeviation = function(prices) {
  const n = prices.length;
  const mean = prices.reduce((a, b) => a + b, 0) / n;
  const variance = prices.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
  return Math.sqrt(variance);
};

// Instance method to get compliance analysis
rfqItemSchema.methods.getComplianceAnalysis = function() {
  const complianceCounts = {
    fully_compliant: 0,
    partially_compliant: 0,
    non_compliant: 0,
    alternative_offered: 0
  };
  
  this.bidResponses.forEach(response => {
    complianceCounts[response.specificationsCompliance]++;
  });
  
  return complianceCounts;
};

// Static method to get items by RFQ
rfqItemSchema.statics.getItemsByRFQ = function(rfqId) {
  return this.find({ rfq: rfqId })
    .populate('product', 'name sku description unit category specifications')
    .populate('bidResponses.bid', 'supplier status totalAmount')
    .populate('bidResponses.alternativeOffered.product', 'name sku')
    .populate('awardedBidResponse.bid', 'supplier')
    .populate('awardedBidResponse.supplier', 'name contactPerson')
    .sort({ createdAt: 1 });
};

// Static method to get items with low compliance
rfqItemSchema.statics.getItemsWithLowCompliance = function(threshold = 50) {
  return this.aggregate([
    {
      $addFields: {
        complianceRate: {
          $cond: {
            if: { $gt: [{ $size: '$bidResponses' }, 0] },
            then: {
              $multiply: [
                {
                  $divide: [
                    {
                      $size: {
                        $filter: {
                          input: '$bidResponses',
                          as: 'response',
                          cond: { $eq: ['$$response.specificationsCompliance', 'fully_compliant'] }
                        }
                      }
                    },
                    { $size: '$bidResponses' }
                  ]
                },
                100
              ]
            },
            else: 0
          }
        }
      }
    },
    {
      $match: {
        complianceRate: { $lt: threshold },
        'bidResponses.0': { $exists: true } // Has at least one bid response
      }
    },
    {
      $lookup: {
        from: 'rfqs',
        localField: 'rfq',
        foreignField: '_id',
        as: 'rfq'
      }
    },
    { $unwind: '$rfq' },
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $project: {
        'rfq.rfqNumber': 1,
        'rfq.title': 1,
        'product.name': 1,
        'product.sku': 1,
        complianceRate: 1,
        bidResponseCount: { $size: '$bidResponses' }
      }
    }
  ]);
};

// Virtual populate for related entities
rfqItemSchema.virtual('productDetails', {
  ref: 'Product',
  localField: 'product',
  foreignField: '_id',
  justOne: true
});

rfqItemSchema.virtual('rfqDetails', {
  ref: 'RFQ',
  localField: 'rfq',
  foreignField: '_id',
  justOne: true
});

// Method to check if item has bids
rfqItemSchema.methods.hasBids = function() {
  return this.bidResponses.length > 0;
};

// Method to check if item is awarded
rfqItemSchema.methods.isAwarded = function() {
  return !!this.awardedBidResponse && !!this.awardedBidResponse.bid;
};

module.exports = mongoose.model('RFQItem', rfqItemSchema);