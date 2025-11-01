const mongoose = require('mongoose');

// Import all models
const User = require('./User');
const Supplier = require('./Supplier');
const Product = require('./Product');
const Category = require('./Category');
const PurchaseOrder = require('./PurchaseOrder');
const RFQ = require('./RFQ');
const Bid = require('./Bid');
const Requisition = require('./Requisition');
const Inventory = require('./Inventory');
const Notification = require('./Notification');
const AuditLog = require('./AuditLog');

// Export all models
module.exports = {
  User,
  Supplier,
  Product,
  Category,
  PurchaseOrder,
  RFQ,
  Bid,
  Requisition,
  Inventory,
  Notification,
  AuditLog
};

// Database connection with enhanced configuration
module.exports.connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Set up connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('✅ Mongoose connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

// Health check function
module.exports.checkDBHealth = async () => {
  try {
    await mongoose.connection.db.admin().ping();
    return {
      status: 'healthy',
      timestamp: new Date(),
      connectionState: mongoose.connection.readyState
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date(),
      error: error.message,
      connectionState: mongoose.connection.readyState
    };
  }
};

// Utility function to clear test database
module.exports.clearTestDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  }
};