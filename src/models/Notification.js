const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: 1000
  },
  type: {
    type: String,
    required: true,
    enum: [
      'purchase_order',
      'rfq',
      'bid',
      'inventory',
      'supplier',
      'system',
      'approval',
      'alert',
      'reminder'
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['PurchaseOrder', 'RFQ', 'Bid', 'Supplier', 'Product', 'Inventory', 'Requisition']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedEntity.entityType'
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  actionUrl: String,
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days default
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
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  if (this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Static Methods
notificationSchema.statics.createNotification = async function(notificationData) {
  try {
    const notification = new this(notificationData);
    await notification.save();
    
    // Emit real-time notification if socket is available
    if (global.io) {
      global.io.to(notificationData.user.toString()).emit('new-notification', notification);
    }
    
    return notification;
  } catch (error) {
    throw new Error(`Failed to create notification: ${error.message}`);
  }
};

notificationSchema.statics.createBulkNotifications = async function(users, notificationData) {
  const notifications = users.map(userId => ({
    ...notificationData,
    user: userId
  }));
  
  return await this.insertMany(notifications);
};

notificationSchema.statics.getUserNotifications = function(userId, options = {}) {
  const { limit = 50, skip = 0, unreadOnly = false, type = null } = options;
  
  let query = { user: userId };
  if (unreadOnly) query.isRead = false;
  if (type) query.type = type;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'firstName lastName email')
    .populate('relatedEntity.entityId');
};

notificationSchema.statics.markAllAsRead = async function(userId) {
  const result = await this.updateMany(
    { user: userId, isRead: false },
    { 
      $set: { 
        isRead: true,
        readAt: new Date()
      }
    }
  );
  
  return result.modifiedCount;
};

notificationSchema.statics.cleanupExpired = async function() {
  const result = await this.deleteMany({ 
    expiresAt: { $lt: new Date() } 
  });
  return result.deletedCount;
};

notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ 
    user: userId, 
    isRead: false 
  });
};

// Instance Methods
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  return await this.save();
};

notificationSchema.methods.markAsUnread = async function() {
  this.isRead = false;
  this.readAt = null;
  return await this.save();
};

notificationSchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

// Automated notification creators
notificationSchema.statics.createLowStockAlert = async function(inventoryItem, user) {
  return await this.createNotification({
    user: user,
    title: 'Low Stock Alert',
    message: `Product ${inventoryItem.product?.name || 'Unknown'} is running low. Current stock: ${inventoryItem.quantity}`,
    type: 'inventory',
    priority: 'high',
    relatedEntity: {
      entityType: 'Inventory',
      entityId: inventoryItem._id
    },
    actionUrl: `/inventory/${inventoryItem._id}`
  });
};

notificationSchema.statics.createPurchaseOrderNotification = async function(purchaseOrder, users, action) {
  return await this.createBulkNotifications(users, {
    title: `Purchase Order ${action}`,
    message: `Purchase Order #${purchaseOrder.poNumber} has been ${action}`,
    type: 'purchase_order',
    priority: 'medium',
    relatedEntity: {
      entityType: 'PurchaseOrder',
      entityId: purchaseOrder._id
    },
    actionUrl: `/procurement/purchase-orders/${purchaseOrder._id}`
  });
};

module.exports = mongoose.model('Notification', notificationSchema);