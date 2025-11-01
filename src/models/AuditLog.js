const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      'create',
      'read', 
      'update',
      'delete',
      'login',
      'logout',
      'approve',
      'reject',
      'export',
      'import',
      'system'
    ]
  },
  entity: {
    type: String,
    required: [true, 'Entity type is required'],
    enum: [
      'User',
      'Supplier',
      'PurchaseOrder',
      'RFQ',
      'Bid',
      'Product',
      'Inventory',
      'Category',
      'Requisition',
      'Notification'
    ]
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Entity ID is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: 500
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  userAgent: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  changes: {
    before: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    after: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'pending'],
    default: 'success'
  },
  errorMessage: {
    type: String,
    trim: true
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ user: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ severity: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ entity: 1, createdAt: -1 });

// Static Methods
auditLogSchema.statics.logAction = async function(logData) {
  try {
    const auditLog = new this(logData);
    return await auditLog.save();
  } catch (error) {
    console.error('Failed to log audit action:', error);
    // Don't throw to avoid breaking main operations
  }
};

auditLogSchema.statics.getEntityLogs = function(entity, entityId, options = {}) {
  const { limit = 100, skip = 0, startDate, endDate } = options;
  
  let query = { entity, entityId };
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'firstName lastName email role')
    .lean();
};

auditLogSchema.statics.getUserActivity = function(userId, options = {}) {
  const { limit = 50, skip = 0, days = 30 } = options;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    user: userId,
    createdAt: { $gte: startDate }
  })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate('user', 'firstName lastName email role')
  .lean();
};

auditLogSchema.statics.getActivityReport = async function(startDate, endDate, entity = null) {
  const matchStage = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
  
  if (entity) {
    matchStage.entity = entity;
  }
  
  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: {
          entity: '$entity',
          action: '$action',
          date: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          }
        },
        count: { $sum: 1 },
        users: { $addToSet: '$user' }
      }
    },
    {
      $project: {
        _id: 0,
        entity: '$_id.entity',
        action: '$_id.action',
        date: '$_id.date',
        count: 1,
        uniqueUsers: { $size: '$users' }
      }
    },
    { $sort: { date: -1, entity: 1, action: 1 } }
  ];
  
  return this.aggregate(pipeline);
};

auditLogSchema.statics.cleanupOldLogs = async function(retentionDays = 365) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  const result = await this.deleteMany({
    createdAt: { $lt: cutoffDate },
    severity: { $ne: 'critical' } // Keep critical logs forever
  });
  
  return result;
};

// Automated audit logging helpers
auditLogSchema.statics.logCreate = async function(entity, entityId, user, description, metadata = {}) {
  return await this.logAction({
    action: 'create',
    entity,
    entityId,
    user,
    description,
    changes: {
      after: metadata
    },
    metadata
  });
};

auditLogSchema.statics.logUpdate = async function(entity, entityId, user, description, changes, metadata = {}) {
  return await this.logAction({
    action: 'update',
    entity,
    entityId,
    user,
    description,
    changes,
    metadata
  });
};

auditLogSchema.statics.logDelete = async function(entity, entityId, user, description, beforeState = {}) {
  return await this.logAction({
    action: 'delete',
    entity,
    entityId,
    user,
    description,
    changes: {
      before: beforeState
    },
    severity: 'high'
  });
};

// Instance method
auditLogSchema.methods.getFormattedEntry = function() {
  return {
    id: this._id,
    action: this.action,
    entity: this.entity,
    entityId: this.entityId,
    description: this.description,
    user: this.user,
    timestamp: this.createdAt,
    severity: this.severity,
    status: this.status,
    changes: this.changes
  };
};

module.exports = mongoose.model('AuditLog', auditLogSchema);