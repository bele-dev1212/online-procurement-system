const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
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
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['procurement_manager', 'supplier', 'admin', 'viewer', 'approver'],
    default: 'viewer'
  },
  department: {
    type: String,
    required: [true, 'Please add a department'],
    trim: true,
    maxlength: [50, 'Department cannot be more than 50 characters']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot be more than 20 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      lowStockAlerts: { type: Boolean, default: true },
      poApprovals: { type: Boolean, default: true },
      bidUpdates: { type: Boolean, default: true },
      rfqDeadlines: { type: Boolean, default: true },
      systemMaintenance: { type: Boolean, default: true }
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'es', 'fr', 'de']
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    dashboardLayout: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  jobTitle: {
    type: String,
    trim: true,
    maxlength: [100, 'Job title cannot be more than 100 characters']
  },
  signature: {
    type: String, // URL to signature image
    default: null
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  loginAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  lockUntil: {
    type: Date,
    select: false
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  emailVerificationToken: String,
  emailVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for user activity status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  // Only run if password was modified
  if (!this.isModified('password')) {
    next();
    return;
  }

  // Hash password with cost of 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  
  next();
});

// Update passwordChangedAt when password is modified
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) {
    next();
    return;
  }
  
  this.passwordChangedAt = Date.now() - 1000; // 1 second in past to ensure token is created after
  next();
});

// Cascade delete related data when user is deleted
userSchema.pre('remove', async function(next) {
  try {
    // Remove user's purchase orders, requisitions, etc.
    await this.model('PurchaseOrder').deleteMany({ requestedBy: this._id });
    await this.model('Requisition').deleteMany({ requestedBy: this._id });
    await this.model('Notification').deleteMany({ 
      $or: [
        { sender: this._id },
        { recipient: this._id }
      ]
    });
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check if password matches
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

// Instance method to create password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expiry to 10 minutes
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Instance method to create email verification token
userSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  return verificationToken;
};

// Instance method to increment login attempts
userSchema.methods.incrementLoginAttempts = async function() {
  // If previous lock has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  // Otherwise increment
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock the account if reached max attempts and not already locked
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Static method to find by email and include password
userSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email }).select('+password');
};

// Static method to get active users
userSchema.statics.getActiveUsers = function() {
  return this.find({ isActive: true });
};

// Static method to get users by role
userSchema.statics.getUsersByRole = function(role) {
  return this.find({ role, isActive: true });
};

// Static method to get procurement team
userSchema.statics.getProcurementTeam = function() {
  return this.find({ 
    role: { $in: ['procurement_manager', 'admin', 'approver'] },
    isActive: true 
  });
};

// Virtual populate for related entities
userSchema.virtual('purchaseOrders', {
  ref: 'PurchaseOrder',
  localField: '_id',
  foreignField: 'requestedBy'
});

userSchema.virtual('requisitions', {
  ref: 'Requisition',
  localField: '_id',
  foreignField: 'requestedBy'
});

userSchema.virtual('notifications', {
  ref: 'Notification',
  localField: '_id',
  foreignField: 'recipient'
});

// Method to get user statistics
userSchema.methods.getUserStats = async function() {
  const PurchaseOrder = mongoose.model('PurchaseOrder');
  const Requisition = mongoose.model('Requisition');
  
  const [purchaseOrders, requisitions] = await Promise.all([
    PurchaseOrder.countDocuments({ requestedBy: this._id }),
    Requisition.countDocuments({ requestedBy: this._id })
  ]);
  
  return {
    purchaseOrders,
    requisitions,
    lastActivity: this.lastLogin
  };
};

// Middleware to update last login
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  await this.save();
};

module.exports = mongoose.model('User', userSchema);