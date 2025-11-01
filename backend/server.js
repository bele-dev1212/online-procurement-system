import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/procurement_db';
const JWT_SECRET = process.env.JWT_SECRET || 'procurement_secret_2024';

let db;
let client;

// Connect to MongoDB
async function connectDB() {
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db();
    console.log('✅ MongoDB connected successfully');
    
    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('organizations').createIndex({ name: 1 });
    await db.collection('subscriptions').createIndex({ organization: 1 });
    await db.collection('payment_methods').createIndex({ organization: 1 });
    await db.collection('billing_history').createIndex({ organization: 1 });
    await db.collection('activities').createIndex({ organization: 1 });
    await db.collection('suppliers').createIndex({ organization: 1 });
    await db.collection('purchase_orders').createIndex({ organization: 1 });
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Utility functions
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function sendResponse(res, statusCode, data) {
  res.writeHead(statusCode, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function authenticateToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  
  const token = authHeader.split(' ')[1];
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function extractOrganizationId(url) {
  const match = url.match(/\/api\/organizations\/([^\/]+)/);
  return match ? match[1] : null;
}

// Dashboard API
async function handleGetDashboard(req, res) {
  try {
    const user = authenticateToken(req);
    if (!user) {
      return sendResponse(res, 401, {
        success: false,
        message: 'Authentication required'
      });
    }

    const organizationId = user.organization;
    
    const organization = await db.collection('organizations').findOne({ 
      _id: new ObjectId(organizationId) 
    });

    if (!organization) {
      return sendResponse(res, 404, {
        success: false,
        message: 'Organization not found'
      });
    }

    const teamMembers = await db.collection('users').find({ 
      organization: new ObjectId(organizationId) 
    }).toArray();

    const suppliersCount = await db.collection('suppliers').countDocuments({ 
      organization: new ObjectId(organizationId) 
    });

    const purchaseOrdersCount = await db.collection('purchase_orders').countDocuments({ 
      organization: new ObjectId(organizationId) 
    });

    const recentActivities = await db.collection('activities')
      .find({ organization: new ObjectId(organizationId) })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    const subscription = await db.collection('subscriptions').findOne({ 
      organization: new ObjectId(organizationId) 
    });

    const pendingApprovalsCount = await db.collection('purchase_orders').countDocuments({ 
      organization: new ObjectId(organizationId),
      status: 'pending_approval'
    });

    const stockAlertsCount = await db.collection('inventory').countDocuments({ 
      organization: new ObjectId(organizationId),
      stockLevel: { $lte: '$minStock' }
    });

    const totalSpendResult = await db.collection('purchase_orders').aggregate([
      { $match: { organization: new ObjectId(organizationId), status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]).toArray();

    const totalSpend = totalSpendResult[0]?.total || 0;

    sendResponse(res, 200, {
      success: true,
      data: {
        overview: {
          totalSpend: totalSpend,
          totalOrders: purchaseOrdersCount,
          activeSuppliers: suppliersCount,
          costSavings: subscription?.costSavings || 0,
          pendingApprovals: pendingApprovalsCount,
          stockAlerts: stockAlertsCount,
          complianceRate: organization.complianceRate || 100,
          spendChange: subscription?.spendChange || 0,
          ordersChange: subscription?.ordersChange || 0,
          savingsChange: subscription?.savingsChange || 0
        },
        recentActivities: recentActivities.map(activity => ({
          id: activity._id,
          type: activity.type,
          title: activity.title,
          description: activity.description,
          timestamp: activity.createdAt,
          user: activity.user,
          status: activity.status
        })),
        quickStats: {
          pendingRequisitions: await db.collection('requisitions').countDocuments({ 
            organization: new ObjectId(organizationId),
            status: 'pending'
          }),
          openRFQs: await db.collection('rfqs').countDocuments({ 
            organization: new ObjectId(organizationId),
            status: 'open'
          }),
          activeBids: await db.collection('bids').countDocuments({ 
            organization: new ObjectId(organizationId),
            status: 'active'
          }),
          overdueDeliveries: await db.collection('purchase_orders').countDocuments({ 
            organization: new ObjectId(organizationId),
            deliveryDate: { $lt: new Date() },
            status: { $in: ['shipped', 'processing'] }
          }),
          supplierEvaluations: await db.collection('supplier_evaluations').countDocuments({ 
            organization: new ObjectId(organizationId),
            status: 'pending'
          }),
          contractRenewals: await db.collection('contracts').countDocuments({ 
            organization: new ObjectId(organizationId),
            endDate: { $lt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
          })
        },
        procurementMetrics: {
          avgProcessingTime: await calculateAverageProcessingTime(organizationId),
          approvalRate: await calculateApprovalRate(organizationId),
          complianceRate: organization.complianceRate || 100,
          supplierDiversity: await calculateSupplierDiversity(organizationId),
          costAvoidance: subscription?.costAvoidance || 0,
          cycleTime: await calculateCycleTime(organizationId)
        },
        supplierPerformance: await getSupplierPerformance(organizationId),
        stockAlerts: await getStockAlerts(organizationId),
        pendingApprovals: await getPendingApprovals(organizationId),
        teamMembers: teamMembers.map(member => ({
          id: member._id,
          name: `${member.firstName} ${member.lastName}`,
          email: member.email,
          role: member.role,
          department: member.department || '',
          status: member.status || 'active',
          lastActive: member.lastActive || member.updatedAt
        }))
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Internal server error'
    });
  }
}

// Helper functions for dashboard metrics
async function calculateAverageProcessingTime(organizationId) {
  const result = await db.collection('purchase_orders').aggregate([
    { $match: { organization: new ObjectId(organizationId), status: 'completed' } },
    { $project: { processingTime: { $divide: [{ $subtract: ['$completedAt', '$createdAt'] }, 1000 * 60 * 60 * 24] } } },
    { $group: { _id: null, avgTime: { $avg: '$processingTime' } } }
  ]).toArray();
  return result[0]?.avgTime || 1.5;
}

async function calculateApprovalRate(organizationId) {
  const total = await db.collection('purchase_orders').countDocuments({ 
    organization: new ObjectId(organizationId) 
  });
  const approved = await db.collection('purchase_orders').countDocuments({ 
    organization: new ObjectId(organizationId),
    status: 'approved'
  });
  return total > 0 ? Math.round((approved / total) * 100) : 100;
}

async function calculateSupplierDiversity(organizationId) {
  const totalSuppliers = await db.collection('suppliers').countDocuments({ 
    organization: new ObjectId(organizationId) 
  });
  const diverseSuppliers = await db.collection('suppliers').countDocuments({ 
    organization: new ObjectId(organizationId),
    category: { $in: ['small_business', 'women_owned', 'minority_owned'] }
  });
  return totalSuppliers > 0 ? Math.round((diverseSuppliers / totalSuppliers) * 100) : 0;
}

async function calculateCycleTime(organizationId) {
  const result = await db.collection('purchase_orders').aggregate([
    { $match: { organization: new ObjectId(organizationId), status: 'completed' } },
    { $project: { cycleTime: { $divide: [{ $subtract: ['$completedAt', '$createdAt'] }, 1000 * 60 * 60 * 24] } } },
    { $group: { _id: null, avgCycleTime: { $avg: '$cycleTime' } } }
  ]).toArray();
  return result[0]?.avgCycleTime || 2.1;
}

async function getSupplierPerformance(organizationId) {
  const suppliers = await db.collection('suppliers').find({ 
    organization: new ObjectId(organizationId) 
  }).toArray();

  return suppliers.map(supplier => ({
    id: supplier._id,
    name: supplier.name,
    rating: supplier.performance?.rating || 0,
    delivery: supplier.performance?.onTimeDelivery || 0,
    quality: supplier.performance?.qualityScore || 0,
    compliance: supplier.performance?.complianceRate || 0,
    spend: supplier.totalSpend || 0,
    trend: supplier.performance?.trend || 'stable'
  }));
}

async function getStockAlerts(organizationId) {
  const alerts = await db.collection('inventory').find({ 
    organization: new ObjectId(organizationId),
    $expr: { $lte: ['$currentStock', '$minStock'] }
  }).toArray();

  return alerts.map(item => ({
    id: item._id,
    product: item.name,
    sku: item.sku,
    currentStock: item.currentStock,
    minStock: item.minStock,
    status: item.currentStock === 0 ? 'out_of_stock' : item.currentStock <= item.minStock * 0.5 ? 'critical' : 'low'
  }));
}

async function getPendingApprovals(organizationId) {
  const approvals = await db.collection('purchase_orders').find({ 
    organization: new ObjectId(organizationId),
    status: 'pending_approval'
  }).toArray();

  return approvals.map(approval => ({
    id: approval._id,
    type: 'purchase_order',
    reference: approval.poNumber,
    amount: approval.totalAmount,
    requester: approval.requester,
    department: approval.department,
    daysPending: Math.floor((new Date() - approval.createdAt) / (1000 * 60 * 60 * 24)),
    priority: approval.priority || 'medium'
  }));
}

// Organization Settings APIs
async function handleGetOrganization(req, res) {
  try {
    const user = authenticateToken(req);
    if (!user) {
      return sendResponse(res, 401, {
        success: false,
        message: 'Authentication required'
      });
    }

    const organizationId = extractOrganizationId(req.url) || user.organization;
    
    const organization = await db.collection('organizations').findOne({ 
      _id: new ObjectId(organizationId) 
    });

    if (!organization) {
      return sendResponse(res, 404, {
        success: false,
        message: 'Organization not found'
      });
    }

    const { subscription, ...orgData } = organization;

    sendResponse(res, 200, {
      success: true,
      data: orgData
    });

  } catch (error) {
    console.error('Get organization error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Internal server error'
    });
  }
}

async function handleUpdateOrganization(req, res) {
  try {
    const user = authenticateToken(req);
    if (!user) {
      return sendResponse(res, 401, {
        success: false,
        message: 'Authentication required'
      });
    }

    const organizationId = extractOrganizationId(req.url) || user.organization;
    const body = await parseBody(req);

    if (!body.name?.trim()) {
      return sendResponse(res, 400, {
        success: false,
        message: 'Organization name is required'
      });
    }

    if (!body.email?.trim() || !validateEmail(body.email)) {
      return sendResponse(res, 400, {
        success: false,
        message: 'Valid email is required'
      });
    }

    const updateData = {
      name: body.name.trim(),
      industry: body.industry?.trim() || '',
      size: body.size || '',
      address: body.address?.trim() || '',
      phone: body.phone?.trim() || '',
      email: body.email.trim().toLowerCase(),
      website: body.website?.trim() || '',
      currency: body.currency || 'ETB',
      language: body.language || 'en',
      timezone: body.timezone || 'Africa/Addis_Ababa',
      taxId: body.taxId?.trim() || '',
      registrationNumber: body.registrationNumber?.trim() || '',
      updatedAt: new Date()
    };

    const result = await db.collection('organizations').updateOne(
      { _id: new ObjectId(organizationId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return sendResponse(res, 404, {
        success: false,
        message: 'Organization not found'
      });
    }

    sendResponse(res, 200, {
      success: true,
      message: 'Organization updated successfully',
      data: updateData
    });

  } catch (error) {
    console.error('Update organization error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Internal server error'
    });
  }
}

// Team Management APIs
async function handleGetTeamMembers(req, res) {
  try {
    const user = authenticateToken(req);
    if (!user) {
      return sendResponse(res, 401, {
        success: false,
        message: 'Authentication required'
      });
    }

    const organizationId = extractOrganizationId(req.url) || user.organization;
    
    const teamMembers = await db.collection('users').find({ 
      organization: new ObjectId(organizationId) 
    }).toArray();

    const teamData = teamMembers.map(member => ({
      id: member._id,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      role: member.role,
      department: member.department || '',
      status: member.status || 'active',
      lastActive: member.lastActive || member.updatedAt,
      createdAt: member.createdAt
    }));

    sendResponse(res, 200, {
      success: true,
      data: teamData
    });

  } catch (error) {
    console.error('Get team members error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Internal server error'
    });
  }
}

async function handleInviteTeamMember(req, res) {
  try {
    const user = authenticateToken(req);
    if (!user) {
      return sendResponse(res, 401, {
        success: false,
        message: 'Authentication required'
      });
    }

    const organizationId = extractOrganizationId(req.url) || user.organization;
    const body = await parseBody(req);

    if (!body.email?.trim() || !validateEmail(body.email)) {
      return sendResponse(res, 400, {
        success: false,
        message: 'Valid email is required'
      });
    }

    const existingUser = await db.collection('users').findOne({ 
      email: body.email.trim().toLowerCase() 
    });

    if (existingUser) {
      return sendResponse(res, 400, {
        success: false,
        message: 'User with this email already exists'
      });
    }

    const newUser = {
      firstName: body.firstName?.trim() || '',
      lastName: body.lastName?.trim() || '',
      email: body.email.trim().toLowerCase(),
      role: body.role || 'user',
      department: body.department?.trim() || '',
      organization: new ObjectId(organizationId),
      status: 'pending',
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('users').insertOne(newUser);

    await db.collection('activities').insertOne({
      type: 'user_invitation',
      title: 'Team Member Invited',
      description: `Invited ${newUser.email} to join the organization`,
      organization: new ObjectId(organizationId),
      user: user.userId,
      createdAt: new Date(),
      status: 'completed'
    });

    sendResponse(res, 201, {
      success: true,
      message: 'Team member invited successfully'
    });

  } catch (error) {
    console.error('Invite team member error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Internal server error'
    });
  }
}

// Billing & Subscription APIs
async function handleGetSubscription(req, res) {
  try {
    const user = authenticateToken(req);
    if (!user) {
      return sendResponse(res, 401, {
        success: false,
        message: 'Authentication required'
      });
    }

    const organizationId = extractOrganizationId(req.url) || user.organization;
    
    let subscription = await db.collection('subscriptions').findOne({ 
      organization: new ObjectId(organizationId) 
    });

    if (!subscription) {
      subscription = {
        organization: new ObjectId(organizationId),
        plan: {
          id: 'starter',
          name: 'Starter Plan'
        },
        status: 'active',
        amount: 0,
        currency: 'USD',
        users: 5,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('subscriptions').insertOne(subscription);
    }

    sendResponse(res, 200, {
      success: true,
      data: subscription
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Internal server error'
    });
  }
}

async function handleGetPaymentMethods(req, res) {
  try {
    const user = authenticateToken(req);
    if (!user) {
      return sendResponse(res, 401, {
        success: false,
        message: 'Authentication required'
      });
    }

    const organizationId = extractOrganizationId(req.url) || user.organization;
    
    const paymentMethods = await db.collection('payment_methods').find({ 
      organization: new ObjectId(organizationId) 
    }).toArray();

    sendResponse(res, 200, {
      success: true,
      data: paymentMethods
    });

  } catch (error) {
    console.error('Get payment methods error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Internal server error'
    });
  }
}

async function handleGetBillingHistory(req, res) {
  try {
    const user = authenticateToken(req);
    if (!user) {
      return sendResponse(res, 401, {
        success: false,
        message: 'Authentication required'
      });
    }

    const organizationId = extractOrganizationId(req.url) || user.organization;
    
    const billingHistory = await db.collection('billing_history').find({ 
      organization: new ObjectId(organizationId) 
    })
    .sort({ date: -1 })
    .limit(10)
    .toArray();

    sendResponse(res, 200, {
      success: true,
      data: billingHistory
    });

  } catch (error) {
    console.error('Get billing history error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Internal server error'
    });
  }
}

async function handleGetPlans(req, res) {
  try {
    const user = authenticateToken(req);
    if (!user) {
      return sendResponse(res, 401, {
        success: false,
        message: 'Authentication required'
      });
    }

    const plans = [
      {
        id: 'starter',
        name: 'Starter',
        price: 0,
        currency: 'USD',
        users: 5,
        features: [
          'Basic Procurement',
          '5 Team Members',
          'Email Support',
          'Basic Reports',
          'Supplier Management'
        ]
      },
      {
        id: 'professional',
        name: 'Professional',
        price: 2499,
        currency: 'USD',
        users: 20,
        features: [
          'Advanced Procurement',
          '20 Team Members',
          'Priority Support',
          'Advanced Analytics',
          'Supplier Performance',
          'Custom Workflows'
        ]
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 4999,
        currency: 'USD',
        users: 100,
        features: [
          'Full Platform Access',
          'Unlimited Team Members',
          '24/7 Support',
          'Custom Reports',
          'API Access',
          'Dedicated Manager',
          'Advanced Security'
        ]
      }
    ];

    sendResponse(res, 200, {
      success: true,
      data: plans
    });

  } catch (error) {
    console.error('Get plans error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Internal server error'
    });
  }
}

async function handleUpdateSubscription(req, res) {
  try {
    const user = authenticateToken(req);
    if (!user) {
      return sendResponse(res, 401, {
        success: false,
        message: 'Authentication required'
      });
    }

    const organizationId = extractOrganizationId(req.url) || user.organization;
    const body = await parseBody(req);

    if (!body.planId) {
      return sendResponse(res, 400, {
        success: false,
        message: 'Plan ID is required'
      });
    }

    const plans = [
      { id: 'starter', name: 'Starter', price: 0, users: 5 },
      { id: 'professional', name: 'Professional', price: 2499, users: 20 },
      { id: 'enterprise', name: 'Enterprise', price: 4999, users: 100 }
    ];

    const selectedPlan = plans.find(plan => plan.id === body.planId);
    
    if (!selectedPlan) {
      return sendResponse(res, 400, {
        success: false,
        message: 'Invalid plan ID'
      });
    }

    const updateData = {
      plan: {
        id: selectedPlan.id,
        name: selectedPlan.name
      },
      amount: selectedPlan.price,
      users: selectedPlan.users,
      updatedAt: new Date()
    };

    const result = await db.collection('subscriptions').updateOne(
      { organization: new ObjectId(organizationId) },
      { $set: updateData },
      { upsert: true }
    );

    sendResponse(res, 200, {
      success: true,
      message: 'Subscription updated successfully',
      data: updateData
    });

  } catch (error) {
    console.error('Update subscription error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Internal server error'
    });
  }
}

// Existing route handlers
async function handleOrganizationRegister(req, res) {
  try {
    const body = await parseBody(req);
    const { organization, admin, terms } = body;

    console.log('Registration attempt:', {
      orgName: organization?.name,
      adminEmail: admin?.email
    });

    if (!organization?.name?.trim()) {
      return sendResponse(res, 400, {
        success: false,
        message: 'Organization name is required'
      });
    }

    if (!admin?.email?.trim() || !validateEmail(admin.email)) {
      return sendResponse(res, 400, {
        success: false,
        message: 'Valid email is required'
      });
    }

    if (!admin?.password || admin.password.length < 8) {
      return sendResponse(res, 400, {
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    if (!admin?.firstName?.trim() || !admin?.lastName?.trim()) {
      return sendResponse(res, 400, {
        success: false,
        message: 'First name and last name are required'
      });
    }

    const existingUser = await db.collection('users').findOne({ 
      email: admin.email.trim().toLowerCase() 
    });
    
    if (existingUser) {
      return sendResponse(res, 400, {
        success: false,
        message: 'User with this email already exists'
      });
    }

    const organizationData = {
      name: organization.name.trim(),
      industry: organization.industry?.trim() || '',
      size: organization.size || '',
      contactEmail: organization.contactEmail?.trim() || admin.email.trim().toLowerCase(),
      address: organization.address?.trim() || '',
      phone: organization.phone?.trim() || '',
      website: organization.website?.trim() || '',
      status: 'active',
      subscription: {
        plan: 'trial',
        status: 'active',
        trialEnds: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const orgResult = await db.collection('organizations').insertOne(organizationData);
    const organizationId = orgResult.insertedId;

    console.log('Organization created:', organizationId);

    const hashedPassword = await bcrypt.hash(admin.password, 12);
    const userData = {
      firstName: admin.firstName.trim(),
      lastName: admin.lastName.trim(),
      email: admin.email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'admin',
      position: admin.position?.trim() || '',
      phone: admin.phone?.trim() || '',
      organization: organizationId,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const userResult = await db.collection('users').insertOne(userData);
    const userId = userResult.insertedId;

    console.log('User created:', userId);

    const authToken = jwt.sign(
      {
        userId: userId.toString(),
        email: userData.email,
        role: userData.role,
        organization: organizationId.toString()
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    sendResponse(res, 201, {
      success: true,
      message: 'Organization registered successfully',
      data: {
        user: {
          id: userId,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: userData.role,
          isVerified: userData.isVerified
        },
        organization: {
          id: organizationId,
          name: organizationData.name
        },
        token: authToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.message === 'Invalid JSON body') {
      return sendResponse(res, 400, {
        success: false,
        message: 'Invalid JSON in request body'
      });
    }

    if (error.code === 11000) {
      return sendResponse(res, 400, {
        success: false,
        message: 'User with this email already exists'
      });
    }

    sendResponse(res, 500, {
      success: false,
      message: 'Internal server error during registration'
    });
  }
}

async function handleLogin(req, res) {
  try {
    const body = await parseBody(req);
    const { email, password } = body;

    if (!email?.trim() || !password) {
      return sendResponse(res, 400, {
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await db.collection('users').findOne({ 
      email: email.trim().toLowerCase() 
    });

    if (!user) {
      return sendResponse(res, 401, {
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendResponse(res, 401, {
        success: false,
        message: 'Invalid email or password'
      });
    }

    const organization = await db.collection('organizations').findOne({ 
      _id: new ObjectId(user.organization) 
    });

    if (!organization || organization.status !== 'active') {
      return sendResponse(res, 403, {
        success: false,
        message: 'Organization is not active'
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        organization: user.organization.toString()
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    sendResponse(res, 200, {
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        organization,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Internal server error during login'
    });
  }
}

async function handleGetProfile(req, res) {
  try {
    const user = authenticateToken(req);
    if (!user) {
      return sendResponse(res, 401, {
        success: false,
        message: 'Authentication required'
      });
    }

    const userData = await db.collection('users').findOne({ 
      _id: new ObjectId(user.userId) 
    });

    if (!userData) {
      return sendResponse(res, 404, {
        success: false,
        message: 'User not found'
      });
    }

    const organization = await db.collection('organizations').findOne({ 
      _id: new ObjectId(userData.organization) 
    });

    const { password, ...userWithoutPassword } = userData;

    sendResponse(res, 200, {
      success: true,
      data: {
        user: userWithoutPassword,
        organization
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Internal server error'
    });
  }
}

async function handleHealthCheck(req, res) {
  try {
    await db.command({ ping: 1 });
    
    sendResponse(res, 200, {
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    sendResponse(res, 503, {
      success: false,
      message: 'Server unhealthy - database connection failed',
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    });
  }
}

// Main request handler
async function handleRequest(req, res) {
  if (req.method === 'OPTIONS') {
    sendResponse(res, 200, {});
    return;
  }

  const { method, url } = req;

  try {
    // Dashboard
    if (method === 'GET' && url.startsWith('/api/dashboard/')) {
      await handleGetDashboard(req, res);
    }
    // Organization Management
    else if (method === 'GET' && url.startsWith('/api/organizations/') && !url.includes('/register')) {
      await handleGetOrganization(req, res);
    }
    else if (method === 'PUT' && url.startsWith('/api/organizations/')) {
      await handleUpdateOrganization(req, res);
    }
    // Team Management
    else if (method === 'GET' && url.includes('/team-members')) {
      await handleGetTeamMembers(req, res);
    }
    else if (method === 'POST' && url.includes('/invite')) {
      await handleInviteTeamMember(req, res);
    }
    // Billing & Subscription
    else if (method === 'GET' && url.includes('/subscription')) {
      await handleGetSubscription(req, res);
    }
    else if (method === 'GET' && url.includes('/payment-methods')) {
      await handleGetPaymentMethods(req, res);
    }
    else if (method === 'GET' && url.includes('/billing-history')) {
      await handleGetBillingHistory(req, res);
    }
    else if (method === 'GET' && url.includes('/plans')) {
      await handleGetPlans(req, res);
    }
    else if ((method === 'PUT' || method === 'POST') && url.includes('/subscription')) {
      await handleUpdateSubscription(req, res);
    }
    // Existing routes
    else if (method === 'POST' && url === '/api/organizations/register') {
      await handleOrganizationRegister(req, res);
    }
    else if (method === 'POST' && url === '/api/auth/login') {
      await handleLogin(req, res);
    }
    else if (method === 'GET' && url === '/api/auth/me') {
      await handleGetProfile(req, res);
    }
    else if (method === 'GET' && url === '/api/health') {
      await handleHealthCheck(req, res);
    }
    else {
      sendResponse(res, 404, {
        success: false,
        message: `Route ${url} not found`
      });
    }
  } catch (error) {
    console.error('Request handling error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Internal server error'
    });
  }
}

// Start server
async function startServer() {
  await connectDB();
  
  const server = createServer(handleRequest);
  
  server.listen(PORT, () => {
    console.log(`🚀 Procurement API Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });

  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await client.close();
    server.close(() => {
      console.log('Process terminated');
    });
  });
}

startServer().catch(console.error);