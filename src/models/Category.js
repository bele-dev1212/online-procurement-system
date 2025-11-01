const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Category name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Category description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  code: {
    type: String,
    required: [true, 'Category code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [20, 'Category code cannot be more than 20 characters']
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    required: [true, 'Category level is required'],
    min: [1, 'Category level must be at least 1'],
    validate: {
      validator: Number.isInteger,
      message: 'Category level must be a whole number'
    }
  },
  path: {
    type: String,
    trim: true,
    maxlength: [500, 'Category path cannot be more than 500 characters']
  },
  image: {
    type: String, // URL to category image
    default: null
  },
  icon: {
    type: String,
    trim: true,
    maxlength: [50, 'Icon cannot be more than 50 characters']
  },
  color: {
    type: String,
    trim: true,
    maxlength: [7, 'Color must be a valid hex code'],
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color must be a valid hex color code']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
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
  sortOrder: {
    type: Number,
    min: 0,
    default: 0
  },
  specificationsTemplate: {
    type: Map,
    of: {
      type: {
        type: String,
        enum: ['text', 'number', 'boolean', 'select', 'multiselect'],
        required: true
      },
      label: {
        type: String,
        required: true
      },
      required: {
        type: Boolean,
        default: false
      },
      options: [String],
      validation: {
        min: Number,
        max: Number,
        pattern: String
      },
      unit: String,
      description: String
    },
    default: {}
  },
  procurementSettings: {
    defaultSourcingMethod: {
      type: String,
      enum: ['direct_purchase', 'rfq', 'tender', 'framework_agreement', 'spot_purchase'],
      default: 'direct_purchase'
    },
    approvalWorkflow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ApprovalWorkflow'
    },
    budgetThreshold: {
      type: Number,
      min: 0
    },
    requiredApprovals: [{
      role: {
        type: String,
        required: true
      },
      threshold: {
        type: Number,
        min: 0
      }
    }]
  },
  inventorySettings: {
    defaultReorderLevel: {
      type: Number,
      min: 0,
      default: 10
    },
    defaultMinimumStock: {
      type: Number,
      min: 0,
      default: 5
    },
    defaultMaximumStock: {
      type: Number,
      min: 0
    },
    leadTime: {
      type: Number, // in days
      min: 0,
      default: 7
    },
    storageRequirements: {
      type: String,
      maxlength: [1000, 'Storage requirements cannot be more than 1000 characters']
    }
  },
  qualityStandards: [{
    standard: {
      type: String,
      required: true,
      trim: true
    },
    requirement: {
      type: String,
      required: true,
      trim: true
    },
    mandatory: {
      type: Boolean,
      default: false
    }
  }],
  complianceRequirements: [{
    regulation: {
      type: String,
      required: true,
      trim: true
    },
    requirement: {
      type: String,
      required: true,
      trim: true
    },
    applicable: {
      type: Boolean,
      default: true
    }
  }],
  sustainabilityCriteria: {
    environmentalImpact: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    recyclability: {
      type: Number,
      min: 0,
      max: 100
    },
    energyEfficiency: {
      type: Boolean,
      default: false
    },
    certifications: [{
      name: String,
      required: {
        type: Boolean,
        default: false
      }
    }]
  },
  riskAssessment: {
    level: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    factors: [{
      factor: String,
      risk: String,
      mitigation: String
    }]
  },
  performanceMetrics: {
    totalProducts: {
      type: Number,
      default: 0,
      min: 0
    },
    activeProducts: {
      type: Number,
      default: 0,
      min: 0
    },
    totalValue: {
      type: Number,
      default: 0,
      min: 0
    },
    monthlyUsage: {
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
  suppliers: [{
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true
    },
    isPreferred: {
      type: Boolean,
      default: false
    },
    performanceRating: {
      type: Number,
      min: 1,
      max: 5
    },
    specialization: String
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot be more than 50 characters']
  }],
  seo: {
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [60, 'Meta title cannot be more than 60 characters']
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'Meta description cannot be more than 160 characters']
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [100, 'Slug cannot be more than 100 characters']
    },
    keywords: [String]
  },
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
categorySchema.index({ name: 1 });
categorySchema.index({ code: 1 });
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ status: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ sortOrder: 1 });
categorySchema.index({ path: 1 });

// Compound indexes
categorySchema.index({ parentCategory: 1, status: 1 });
categorySchema.index({ level: 1, status: 1 });
categorySchema.index({ parentCategory: 1, sortOrder: 1 });

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory'
});

// Virtual for products count
categorySchema.virtual('productsCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Virtual for active products count
categorySchema.virtual('activeProductsCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  match: { isActive: true },
  count: true
});

// Virtual for full category path
categorySchema.virtual('fullPath').get(function() {
  return this.path || this.name;
});

// Virtual for hierarchy level name
categorySchema.virtual('levelName').get(function() {
  const levels = {
    1: 'Main Category',
    2: 'Subcategory',
    3: 'Sub-subcategory'
  };
  return levels[this.level] || `Level ${this.level}`;
});

// Pre-save middleware to set level and path
categorySchema.pre('save', async function(next) {
  // Set level based on parent category
  if (this.parentCategory) {
    const parent = await mongoose.model('Category').findById(this.parentCategory);
    if (parent) {
      this.level = parent.level + 1;
      this.path = parent.path ? `${parent.path} > ${this.name}` : `${parent.name} > ${this.name}`;
    }
  } else {
    this.level = 1;
    this.path = this.name;
  }
  
  // Validate level doesn't exceed maximum
  if (this.level > 5) {
    return next(new Error('Category hierarchy cannot exceed 5 levels'));
  }
  
  next();
});

// Pre-save middleware to update performance metrics
categorySchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('isActive')) {
    const Product = mongoose.model('Product');
    
    const [totalProducts, activeProducts, valueResult] = await Promise.all([
      Product.countDocuments({ category: this._id }),
      Product.countDocuments({ category: this._id, isActive: true }),
      Product.aggregate([
        { $match: { category: this._id } },
        {
          $group: {
            _id: null,
            totalValue: { $sum: { $multiply: ['$currentStock', '$costPrice'] } }
          }
        }
      ])
    ]);
    
    this.performanceMetrics.totalProducts = totalProducts;
    this.performanceMetrics.activeProducts = activeProducts;
    this.performanceMetrics.totalValue = valueResult[0]?.totalValue || 0;
  }
  next();
});

// Instance method to add subcategory
categorySchema.methods.addSubcategory = async function(subcategoryData) {
  const Category = mongoose.model('Category');
  
  const subcategory = new Category({
    ...subcategoryData,
    parentCategory: this._id
  });
  
  await subcategory.save();
  return subcategory;
};

// Instance method to add preferred supplier
categorySchema.methods.addPreferredSupplier = function(supplier, isPreferred = false, performanceRating = null, specialization = '') {
  // Remove existing entry for this supplier
  this.suppliers = this.suppliers.filter(s => !s.supplier.equals(supplier));
  
  this.suppliers.push({
    supplier,
    isPreferred,
    performanceRating,
    specialization
  });
  
  return this;
};

// Instance method to add quality standard
categorySchema.methods.addQualityStandard = function(standard, requirement, mandatory = false) {
  this.qualityStandards.push({
    standard,
    requirement,
    mandatory
  });
  
  return this;
};

// Instance method to add compliance requirement
categorySchema.methods.addComplianceRequirement = function(regulation, requirement, applicable = true) {
  this.complianceRequirements.push({
    regulation,
    requirement,
    applicable
  });
  
  return this;
};

// Instance method to get category statistics
categorySchema.methods.getCategoryStats = async function() {
  const Product = mongoose.model('Product');
  
  const [products, lowStockProducts, outOfStockProducts] = await Promise.all([
    Product.find({ category: this._id }),
    Product.find({ 
      category: this._id, 
      currentStock: { $lte: '$reorderLevel' },
      isActive: true 
    }),
    Product.find({ 
      category: this._id, 
      currentStock: 0,
      isActive: true 
    })
  ]);
  
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + (product.currentStock * product.costPrice), 0);
  const averageCost = totalProducts > 0 ? products.reduce((sum, product) => sum + product.costPrice, 0) / totalProducts : 0;
  
  return {
    totalProducts,
    activeProducts: products.filter(p => p.isActive).length,
    lowStockProducts: lowStockProducts.length,
    outOfStockProducts: outOfStockProducts.length,
    totalValue,
    averageCost,
    supplierCount: this.suppliers.length,
    preferredSupplierCount: this.suppliers.filter(s => s.isPreferred).length
  };
};

// Instance method to get category hierarchy
categorySchema.methods.getHierarchy = async function() {
  const Category = mongoose.model('Category');
  
  const hierarchy = [];
  let currentCategory = this;
  
  // Get ancestors
  while (currentCategory.parentCategory) {
    const parent = await Category.findById(currentCategory.parentCategory);
    if (parent) {
      hierarchy.unshift(parent);
      currentCategory = parent;
    } else {
      break;
    }
  }
  
  // Add current category
  hierarchy.push(this);
  
  return hierarchy;
};

// Static method to get main categories
categorySchema.statics.getMainCategories = function() {
  return this.find({
    parentCategory: null,
    isActive: true
  })
  .sort({ sortOrder: 1, name: 1 });
};

// Static method to get subcategories
categorySchema.statics.getSubcategories = function(parentCategoryId) {
  return this.find({
    parentCategory: parentCategoryId,
    isActive: true
  })
  .populate('parentCategory', 'name code')
  .sort({ sortOrder: 1, name: 1 });
};

// Static method to get category tree
categorySchema.statics.getCategoryTree = async function() {
  const buildTree = async (parentId = null) => {
    const categories = await this.find({
      parentCategory: parentId,
      isActive: true
    })
    .sort({ sortOrder: 1, name: 1 });
    
    const tree = [];
    
    for (const category of categories) {
      const children = await buildTree(category._id);
      tree.push({
        ...category.toObject(),
        children
      });
    }
    
    return tree;
  };
  
  return buildTree();
};

// Static method to get categories with low stock
categorySchema.statics.getCategoriesWithLowStock = function() {
  return this.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'category',
        as: 'products'
      }
    },
    {
      $project: {
        name: 1,
        code: 1,
        totalProducts: { $size: '$products' },
        lowStockProducts: {
          $size: {
            $filter: {
              input: '$products',
              as: 'product',
              cond: {
                $and: [
                  { $eq: ['$$product.isActive', true] },
                  { $lte: ['$$product.currentStock', '$$product.reorderLevel'] },
                  { $gt: ['$$product.currentStock', 0] }
                ]
              }
            }
          }
        },
        outOfStockProducts: {
          $size: {
            $filter: {
              input: '$products',
              as: 'product',
              cond: {
                $and: [
                  { $eq: ['$$product.isActive', true] },
                  { $eq: ['$$product.currentStock', 0] }
                ]
              }
            }
          }
        }
      }
    },
    {
      $match: {
        $or: [
          { lowStockProducts: { $gt: 0 } },
          { outOfStockProducts: { $gt: 0 } }
        ]
      }
    },
    { $sort: { lowStockProducts: -1, outOfStockProducts: -1 } }
  ]);
};

// Virtual populate for related entities
categorySchema.virtual('parentCategoryDetails', {
  ref: 'Category',
  localField: 'parentCategory',
  foreignField: '_id',
  justOne: true
});

categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category'
});

// Method to check if category has subcategories
categorySchema.methods.hasSubcategories = async function() {
  const count = await mongoose.model('Category').countDocuments({
    parentCategory: this._id,
    isActive: true
  });
  return count > 0;
};

// Method to check if category can be deleted
categorySchema.methods.canBeDeleted = async function() {
  const [productsCount, subcategoriesCount] = await Promise.all([
    mongoose.model('Product').countDocuments({ category: this._id }),
    mongoose.model('Category').countDocuments({ parentCategory: this._id })
  ]);
  
  return productsCount === 0 && subcategoriesCount === 0;
};

// Method to get all descendant categories
categorySchema.methods.getDescendantCategories = async function() {
  const getAllDescendants = async (categoryId) => {
    const children = await mongoose.model('Category').find({ parentCategory: categoryId });
    let descendants = [...children];
    
    for (const child of children) {
      const childDescendants = await getAllDescendants(child._id);
      descendants = descendants.concat(childDescendants);
    }
    
    return descendants;
  };
  
  return getAllDescendants(this._id);
};

module.exports = mongoose.model('Category', categorySchema);