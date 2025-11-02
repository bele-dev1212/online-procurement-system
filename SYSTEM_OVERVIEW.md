# Online Procurement System - How It Works

## 🏗️ System Architecture

### Frontend (React)
- **Port**: 3000 (development)
- **Framework**: React with React Router
- **State Management**: Context API (AuthContext)
- **API Communication**: Fetch API with proxy configuration

### Backend (Node.js)
- **Port**: 5000
- **Database**: MongoDB (`procurement_db`)
- **Authentication**: JWT tokens
- **API Base**: `/api`

---

## 📋 System Flow Overview

### 1. **Organization Registration Flow**

```
User visits → /organization/register
    ↓
Fill organization details + Admin info
    ↓
POST /api/organizations/register
    ↓
Backend creates:
    - Organization document in MongoDB
    - Admin user with role='admin'
    - Returns JWT token
    ↓
Admin automatically logged in
    ↓
Redirected to Dashboard
```

**What Happens:**
- Organization is created with subscription (trial, 30 days)
- Admin user is automatically created with `role: 'admin'`
- Admin gets immediate access to their dashboard
- Each organization is isolated (multi-tenant)

---

### 2. **Admin Dashboard & Role-Based Access**

#### **Admin Role (`role: 'admin'`)**
- **Full Access**: Can manage everything in their organization
- **Dashboard**: Shows all organization metrics
- **Can Invite**: Send invitations to team members
- **Can Manage**: Users, settings, procurement, suppliers, inventory

#### **Dashboard Features (Role-Based)**
- **Admin Dashboard**: Full metrics, team management, organization settings
- **Manager Dashboard**: Department/function-specific metrics
- **User Dashboard**: Personal view with limited metrics
- **Data is filtered** based on user's role and organization

---

### 3. **Invitation System Flow**

```
Admin → Team Management → Invite User
    ↓
Enter email, role, optional name
    ↓
POST /api/invitations
    ↓
Backend creates invitation:
    - Generates unique token
    - Sets expiry (7 days)
    - Links to organization
    - Returns invitation link
    ↓
Admin sends link to user
    ↓
User clicks link → /invite/:token
    ↓
GET /api/invitations/:token
    ↓
Shows invitation details
    ↓
User fills form (firstName, lastName, password)
    ↓
POST /api/invitations/:token/accept
    ↓
Backend creates user account:
    - Creates user with assigned role
    - Links to organization
    - Marks invitation as accepted
    - Returns JWT token
    ↓
User automatically logged in
    ↓
Redirected to Dashboard (based on role)
```

**Invitation Features:**
- ✅ Token-based (secure, unique per invitation)
- ✅ Expires after 7 days
- ✅ One-time use (marked as 'accepted' after use)
- ✅ Role-based (admin assigns role during invitation)
- ✅ Organization-scoped (only works for specific organization)

---

### 4. **Login Flow**

```
User → /login
    ↓
Enter email & password
    ↓
POST /api/auth/login
    ↓
Backend verifies:
    - User exists
    - Password matches
    - Organization is active
    ↓
Returns:
    - JWT token
    - User data (including role, organization)
    ↓
Frontend stores:
    - Token in localStorage
    - User info in AuthContext
    ↓
Redirect to Dashboard
    ↓
Dashboard loads data based on:
    - User role
    - Organization ID
```

---

### 5. **Dashboard Data Loading**

```
User logs in → Dashboard loads
    ↓
GET /api/dashboard?timeRange=monthly
    ↓
Backend:
    - Verifies JWT token
    - Gets user's organization
    - Filters data by organization
    - Returns role-appropriate metrics
    ↓
Frontend displays:
    - Overview metrics (spend, orders, suppliers)
    - Recent activities
    - Pending approvals
    - Stock alerts
    - Supplier performance
```

**Data Isolation:**
- All data is filtered by `organization` field
- Users only see data from their organization
- Role determines what data is visible

---

## 🗄️ Database Structure

### Collections:

1. **`organizations`**
   ```javascript
   {
     _id: ObjectId,
     name: "Company Name",
     industry: "Technology",
     status: "active",
     subscription: { plan: "trial", status: "active" },
     createdAt: Date
   }
   ```

2. **`users`**
   ```javascript
   {
     _id: ObjectId,
     email: "user@company.com",
     password: "hashed",
     firstName: "John",
     lastName: "Doe",
     role: "admin" | "procurement_manager" | "user",
     organization: ObjectId,  // Links to organization
     isVerified: true,
     createdAt: Date
   }
   ```

3. **`invitations`**
   ```javascript
   {
     _id: ObjectId,
     email: "newuser@company.com",
     token: "unique-token",
     role: "procurement_manager",
     organization: ObjectId,
     invitedBy: ObjectId,  // Admin user ID
     status: "pending" | "accepted" | "expired",
     expiresAt: Date,
     createdAt: Date
   }
   ```

---

## 🔐 Authentication & Authorization

### JWT Token Structure
```javascript
{
  userId: "user_id",
  email: "user@email.com",
  role: "admin",
  organization: "org_id"
}
```

### Token Storage
- Stored in localStorage: `procurement_access_token`
- Included in API requests: `Authorization: Bearer <token>`
- Valid for 7 days

### Authorization Flow
1. **Private Routes**: Protected by `PrivateRoute` component
2. **Role-Based Access**: Routes check user role
3. **Organization Isolation**: All queries filtered by organization ID

---

## 🛣️ API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Organization
- `POST /api/organizations/register` - Register new organization + admin

### Invitations
- `POST /api/invitations` - Send invitation (admin only)
- `GET /api/invitations/:token` - Get invitation details
- `POST /api/invitations/:token/accept` - Accept invitation

### Dashboard
- `GET /api/dashboard?timeRange=monthly` - Get dashboard data (role-based)

---

## 📊 Role-Based Dashboard Access

### Admin Dashboard
- Full organization metrics
- Team management
- All procurement data
- System settings access

### Manager Dashboard (procurement_manager, etc.)
- Department-specific metrics
- Manage department operations
- View relevant reports

### User Dashboard
- Personal metrics
- Submit requests
- View assigned tasks

---

## 🔄 Key Workflows

### Workflow 1: New Organization Setup
1. Admin registers organization
2. Admin account created automatically
3. Admin logs into dashboard
4. Admin invites team members
5. Team members join via invitation links

### Workflow 2: Team Member Addition
1. Admin creates invitation
2. System generates unique link
3. Admin shares link with new member
4. Member clicks link and registers
5. Member gets access based on assigned role

### Workflow 3: Daily Operations
1. Users log in with credentials
2. Dashboard loads based on role
3. Users perform actions within their permissions
4. All data scoped to their organization

---

## 🔒 Security Features

1. **Password Hashing**: bcrypt with 12 rounds
2. **JWT Authentication**: Secure token-based auth
3. **Organization Isolation**: Data separated by organization
4. **Role-Based Access Control**: Permissions based on role
5. **Invitation Expiry**: Invitations expire after 7 days
6. **Token Expiry**: JWT tokens expire after 7 days

---

## 📱 Frontend Structure

```
src/
├── pages/
│   ├── Auth/
│   │   ├── Login/          # Login page
│   │   ├── Register/       # User registration
│   │   ├── Invitation/     # Accept invitation
│   │   └── OrganizationRegister/  # Org + Admin registration
│   ├── Dashboard/          # Main dashboard (role-based)
│   └── ...
├── contexts/
│   └── AuthContext.jsx     # Global auth state
├── services/
│   ├── api/                # API service files
│   └── auth/               # Auth utilities
└── router/
    ├── AppRouter.jsx       # Route definitions
    ├── PrivateRoute.jsx    # Protected routes
    └── PublicRoute.jsx     # Public routes
```

---

## 🎯 Current Implementation Status

✅ **Implemented:**
- Organization registration
- Admin account creation
- User login/logout
- JWT authentication
- Invitation system (backend + frontend)
- Dashboard structure
- Role-based routing

⚠️ **Needs Completion:**
- Remove mock data from Dashboard
- Connect Dashboard to real API
- Implement role-based dashboard variants
- Complete invitation frontend integration
- Add more API endpoints for procurement data

---

## 🚀 How to Use

### For Admin:
1. Register organization at `/organization/register`
2. Login to dashboard
3. Go to Team Management
4. Click "Invite Team Member"
5. Enter email, select role
6. Copy invitation link and share

### For Team Members:
1. Click invitation link
2. Fill registration form
3. Set password
4. Automatically logged in
5. Access dashboard based on role

---

This system follows a **multi-tenant architecture** where each organization has:
- Isolated data
- Own admin
- Team members with different roles
- Role-based access control

