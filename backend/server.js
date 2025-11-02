import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createServer } from 'http';
import dotenv from 'dotenv';
import crypto from 'crypto';

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
    await db.collection('invitations').createIndex({ token: 1 }, { unique: true });
    await db.collection('invitations').createIndex({ email: 1, organization: 1 });
    await db.collection('invitations').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    
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

// Generate invitation token
function generateInvitationToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Route handlers

// User Registration Handler
async function handleUserRegister(req, res) {
  try {
    const body = await parseBody(req);
    const { firstName, lastName, email, password, organizationName } = body;

    console.log('User registration attempt:', email);

    // Validation
    if (!email?.trim() || !validateEmail(email)) {
      return sendResponse(res, 400, {
        success: false,
        message: 'Valid email is required'
      });
    }

    if (!password || password.length < 8) {
      return sendResponse(res, 400, {
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    if (!firstName?.trim() || !lastName?.trim()) {
      return sendResponse(res, 400, {
        success: false,
        message: 'First name and last name are required'
      });
    }

    // Check if user exists
    const existingUser = await db.collection('users').findOne({ 
      email: email.trim().toLowerCase() 
    });
    
    if (existingUser) {
      return sendResponse(res, 400, {
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if this is the first user (make them superadmin)
    const existingUserCount = await db.collection('users').countDocuments();
    const isFirstUser = existingUserCount === 0;

    // For first user, create a default organization
    let organizationId;
    if (isFirstUser) {
      // Create default organization for first user
      const organizationData = {
        name: organizationName?.trim() || `${firstName}'s Organization`,
        industry: 'General',
        size: 'small',
        contactEmail: email.trim().toLowerCase(),
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
      organizationId = orgResult.insertedId;
      console.log('Default organization created for first user:', organizationId);
    } else {
      // For subsequent users, they need to be invited or use organization registration
      return sendResponse(res, 400, {
        success: false,
        message: 'Please use organization registration or accept an invitation'
      });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const userRole = isFirstUser ? 'super_admin' : 'user';
    
    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: userRole,
      organization: organizationId,
      isVerified: true,
      isSuperAdmin: isFirstUser,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const userResult = await db.collection('users').insertOne(userData);
    const userId = userResult.insertedId;

    console.log('User created:', userId);

    // Generate auth token
    const authToken = jwt.sign(
      {
        userId: userId.toString(),
        email: userData.email,
        role: userData.role,
        organization: organizationId.toString(),
        isSuperAdmin: isFirstUser
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const successMessage = isFirstUser 
      ? 'Platform superadmin registered successfully! You now have platform-wide access.'
      : 'User registered successfully';

    sendResponse(res, 201, {
      success: true,
      message: successMessage,
      data: {
        user: {
          id: userId,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: userData.role,
          isVerified: userData.isVerified,
          isSuperAdmin: isFirstUser
        },
        organization: {
          id: organizationId,
          name: organizationName || `${firstName}'s Organization`
        },
        token: authToken
      }
    });

  } catch (error) {
    console.error('User registration error:', error);
    
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

async function handleOrganizationRegister(req, res) {
  try {
    const body = await parseBody(req);
    const { organization, admin, terms } = body;

    console.log('Registration attempt:', {
      orgName: organization?.name,
      adminEmail: admin?.email
    });

    // Validation
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

    // Check if user exists
    const existingUser = await db.collection('users').findOne({ 
      email: admin.email.trim().toLowerCase() 
    });
    
    if (existingUser) {
      return sendResponse(res, 400, {
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if this is the first organization (to make them superadmin)
    const existingOrgCount = await db.collection('organizations').countDocuments();
    const isFirstOrganization = existingOrgCount === 0;

    // Create organization
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
        trialEnds: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const orgResult = await db.collection('organizations').insertOne(organizationData);
    const organizationId = orgResult.insertedId;

    console.log('Organization created:', organizationId);

    // Create admin user - first organization becomes superadmin
    const hashedPassword = await bcrypt.hash(admin.password, 12);
    const userRole = isFirstOrganization ? 'super_admin' : 'admin';
    
    const userData = {
      firstName: admin.firstName.trim(),
      lastName: admin.lastName.trim(),
      email: admin.email.trim().toLowerCase(),
      password: hashedPassword,
      role: userRole,
      position: admin.position?.trim() || '',
      phone: admin.phone?.trim() || '',
      organization: organizationId,
      isVerified: true, // Auto-verify for now
      isSuperAdmin: isFirstOrganization, // Flag to identify superadmin
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const userResult = await db.collection('users').insertOne(userData);
    const userId = userResult.insertedId;

    console.log('User created:', userId);

    // Generate auth token
    const authToken = jwt.sign(
      {
        userId: userId.toString(),
        email: userData.email,
        role: userData.role,
        organization: organizationId.toString(),
        isSuperAdmin: isFirstOrganization
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const successMessage = isFirstOrganization 
      ? 'Platform superadmin and organization registered successfully! You now have platform-wide access.'
      : 'Organization registered successfully';

    sendResponse(res, 201, {
      success: true,
      message: successMessage,
      data: {
        user: {
          id: userId,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: userData.role,
          isVerified: userData.isVerified,
          isSuperAdmin: isFirstOrganization
        },
        organization: {
          id: organizationId,
          name: organizationData.name,
          isFirstOrganization: isFirstOrganization
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

    // Handle duplicate key errors (MongoDB unique constraint)
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

    // Find user
    const user = await db.collection('users').findOne({ 
      email: email.trim().toLowerCase() 
    });

    if (!user) {
      return sendResponse(res, 401, {
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendResponse(res, 401, {
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Get organization
    const organization = await db.collection('organizations').findOne({ 
      _id: new ObjectId(user.organization) 
    });

    if (!organization || organization.status !== 'active') {
      return sendResponse(res, 403, {
        success: false,
        message: 'Organization is not active'
      });
    }

    // Check if user is superadmin
    const isSuperAdmin = user.role === 'super_admin' || user.isSuperAdmin === true;

    // Generate token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        organization: user.organization.toString(),
        isSuperAdmin: isSuperAdmin
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove sensitive data
    const { password: _, ...userWithoutPassword } = user;

    sendResponse(res, 200, {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          ...userWithoutPassword,
          isSuperAdmin: isSuperAdmin
        },
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

    // Remove sensitive data
    const { password, ...userWithoutPassword } = userData;
    
    // Check if user is superadmin
    const isSuperAdmin = userData.role === 'super_admin' || userData.isSuperAdmin === true;

    sendResponse(res, 200, {
      success: true,
      data: {
        user: {
          ...userWithoutPassword,
          isSuperAdmin: isSuperAdmin
        },
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
    // Test database connection
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

// Handle send invitation
async function handleSendInvitation(req, res) {
  try {
    const user = authenticateToken(req);
    if (!user) {
      return sendResponse(res, 401, {
        success: false,
        message: 'Authentication required'
      });
    }

    // Only admin can send invitations
    const adminUser = await db.collection('users').findOne({ 
      _id: new ObjectId(user.userId) 
    });

    if (adminUser.role !== 'admin') {
      return sendResponse(res, 403, {
        success: false,
        message: 'Only admins can send invitations'
      });
    }

    const body = await parseBody(req);
    const { email, role, firstName, lastName } = body;

    if (!email?.trim() || !validateEmail(email)) {
      return sendResponse(res, 400, {
        success: false,
        message: 'Valid email is required'
      });
    }

    if (!role) {
      return sendResponse(res, 400, {
        success: false,
        message: 'Role is required'
      });
    }

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ 
      email: email.trim().toLowerCase() 
    });
    
    if (existingUser) {
      return sendResponse(res, 400, {
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if invitation already exists and is pending
    const existingInvitation = await db.collection('invitations').findOne({
      email: email.trim().toLowerCase(),
      status: 'pending',
      organization: new ObjectId(adminUser.organization)
    });

    if (existingInvitation) {
      return sendResponse(res, 400, {
        success: false,
        message: 'Invitation already sent to this email'
      });
    }

    // Create invitation
    const token = generateInvitationToken();
    const invitationData = {
      email: email.trim().toLowerCase(),
      role: role,
      firstName: firstName?.trim() || '',
      lastName: lastName?.trim() || '',
      token: token,
      organization: new ObjectId(adminUser.organization),
      invitedBy: new ObjectId(user.userId),
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('invitations').insertOne(invitationData);

    // Create invitation link
    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${token}`;

    sendResponse(res, 201, {
      success: true,
      message: 'Invitation sent successfully',
      data: {
        invitation: {
          id: result.insertedId,
          email: invitationData.email,
          role: invitationData.role,
          link: invitationLink,
          expiresAt: invitationData.expiresAt
        }
      }
    });

  } catch (error) {
    console.error('Send invitation error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Internal server error'
    });
  }
}

// Handle get invitation by token
async function handleGetInvitation(req, res) {
  try {
    const urlParts = req.url.split('/');
    const token = urlParts[urlParts.length - 1];

    if (!token) {
      return sendResponse(res, 400, {
        success: false,
        message: 'Invitation token is required'
      });
    }

    const invitation = await db.collection('invitations').findOne({ 
      token: token,
      status: 'pending'
    });

    if (!invitation) {
      return sendResponse(res, 404, {
        success: false,
        message: 'Invitation not found or expired'
      });
    }

    // Check if expired
    if (new Date() > new Date(invitation.expiresAt)) {
      return sendResponse(res, 400, {
        success: false,
        message: 'Invitation has expired'
      });
    }

    // Get organization and inviter details
    const organization = await db.collection('organizations').findOne({ 
      _id: new ObjectId(invitation.organization) 
    });

    const inviter = await db.collection('users').findOne({ 
      _id: new ObjectId(invitation.invitedBy) 
    });

    sendResponse(res, 200, {
      success: true,
      data: {
        invitation: {
          email: invitation.email,
          role: invitation.role,
          firstName: invitation.firstName,
          lastName: invitation.lastName,
          organization: {
            id: organization._id,
            name: organization.name
          },
          inviter: {
            name: `${inviter.firstName} ${inviter.lastName}`,
            email: inviter.email
          },
          expiresAt: invitation.expiresAt
        }
      }
    });

  } catch (error) {
    console.error('Get invitation error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Internal server error'
    });
  }
}

// Handle accept invitation
async function handleAcceptInvitation(req, res) {
  try {
    // URL format: /api/invitations/:token/accept
    const urlParts = req.url.split('/');
    const tokenIndex = urlParts.indexOf('invitations') + 1;
    const token = urlParts[tokenIndex];

    if (!token || token === 'accept') {
      return sendResponse(res, 400, {
        success: false,
        message: 'Invitation token is required'
      });
    }

    const invitation = await db.collection('invitations').findOne({ 
      token: token,
      status: 'pending'
    });

    if (!invitation) {
      return sendResponse(res, 404, {
        success: false,
        message: 'Invitation not found or already used'
      });
    }

    // Check if expired
    if (new Date() > new Date(invitation.expiresAt)) {
      return sendResponse(res, 400, {
        success: false,
        message: 'Invitation has expired'
      });
    }

    const body = await parseBody(req);
    const { firstName, lastName, password } = body;

    if (!firstName?.trim() || !lastName?.trim()) {
      return sendResponse(res, 400, {
        success: false,
        message: 'First name and last name are required'
      });
    }

    if (!password || password.length < 8) {
      return sendResponse(res, 400, {
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ 
      email: invitation.email 
    });
    
    if (existingUser) {
      return sendResponse(res, 400, {
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: invitation.email,
      password: hashedPassword,
      role: invitation.role,
      organization: invitation.organization,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const userResult = await db.collection('users').insertOne(userData);
    const userId = userResult.insertedId;

    // Update invitation status
    await db.collection('invitations').updateOne(
      { _id: invitation._id },
      { 
        $set: { 
          status: 'accepted',
          acceptedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    // Generate auth token
    const authToken = jwt.sign(
      {
        userId: userId.toString(),
        email: userData.email,
        role: userData.role,
        organization: invitation.organization.toString()
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    sendResponse(res, 201, {
      success: true,
      message: 'Invitation accepted successfully',
      data: {
        user: {
          id: userId,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: userData.role
        },
        token: authToken
      }
    });

  } catch (error) {
    console.error('Accept invitation error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Internal server error'
    });
  }
}

// Handle get dashboard data
async function handleGetDashboard(req, res) {
  try {
    const user = authenticateToken(req);
    if (!user) {
      return sendResponse(res, 401, {
        success: false,
        message: 'Authentication required'
      });
    }

    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const timeRange = urlObj.searchParams.get('timeRange') || 'monthly';

    // Get user data
    const userData = await db.collection('users').findOne({ 
      _id: new ObjectId(user.userId) 
    });

    if (!userData) {
      return sendResponse(res, 404, {
        success: false,
        message: 'User not found'
      });
    }

    // Get organization
    const organization = await db.collection('organizations').findOne({ 
      _id: new ObjectId(userData.organization) 
    });

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarterly':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'yearly':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get dashboard data based on role (for now return empty structure - will be populated when other collections exist)
    const dashboardData = {
      overview: {
        totalSpend: 0,
        totalOrders: 0,
        activeSuppliers: 0,
        costSavings: 0,
        pendingApprovals: 0,
        stockAlerts: 0,
        complianceRate: 0,
        spendChange: 0,
        ordersChange: 0,
        savingsChange: 0
      },
      recentActivities: [],
      quickStats: {
        pendingRequisitions: 0,
        openRFQs: 0,
        activeBids: 0,
        overdueDeliveries: 0,
        supplierEvaluations: 0,
        contractRenewals: 0
      },
      procurementMetrics: {
        avgProcessingTime: 0,
        approvalRate: 0,
        complianceRate: 0,
        supplierDiversity: 0,
        costAvoidance: 0,
        cycleTime: 0
      },
      supplierPerformance: [],
      stockAlerts: [],
      pendingApprovals: []
    };

    sendResponse(res, 200, {
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    sendResponse(res, 500, {
      success: false,
      message: 'Internal server error'
    });
  }
}

// Main request handler
async function handleRequest(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    sendResponse(res, 200, {});
    return;
  }

  const { method, url } = req;

  try {
    // Route mapping
    if (method === 'POST' && url === '/api/auth/register') {
      await handleUserRegister(req, res);
    } else if (method === 'POST' && url === '/api/organizations/register') {
      await handleOrganizationRegister(req, res);
    } else if (method === 'POST' && url === '/api/auth/login') {
      await handleLogin(req, res);
    } else if (method === 'GET' && url === '/api/auth/me') {
      await handleGetProfile(req, res);
    } else if (method === 'GET' && url === '/api/health') {
      await handleHealthCheck(req, res);
    } else if (method === 'POST' && url.endsWith('/accept') && url.startsWith('/api/invitations/')) {
      await handleAcceptInvitation(req, res);
    } else if (method === 'GET' && url.startsWith('/api/invitations/')) {
      await handleGetInvitation(req, res);
    } else if (method === 'POST' && url === '/api/invitations') {
      await handleSendInvitation(req, res);
    } else if (method === 'GET' && url.startsWith('/api/dashboard')) {
      await handleGetDashboard(req, res);
    } else {
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

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await client.close();
    server.close(() => {
      console.log('Process terminated');
    });
  });
}

startServer().catch(console.error);