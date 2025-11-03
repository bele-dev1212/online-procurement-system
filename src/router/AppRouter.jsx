// src/router/AppRouter.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SuperAdminProvider } from '../contexts/SuperAdminContext';

// Import route components
import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';

// Import working pages
import Home from '../pages/Home/Home';
import About from '../pages/About/About';
import Features from '../pages/Features/Features';
import Pricing from '../pages/Pricing/Pricing';
import Contact from '../pages/Contact/Contact';
import Login from '../pages/Auth/Login/Login';
import Register from '../pages/Auth/Register/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword/ForgotPassword';
import SupplierRegister from '../pages/Auth/OtherAuthFlows/SupplierRegister/SupplierRegister';
import OrganizationRegister from '../pages/Auth/OrganizationRegister/OrganizationRegister';
import EmailVerification from '../pages/Auth/EmailVerification/EmailVerification';
import NotFound from '../pages/Errors/NotFound/NotFound';
import Unauthorized from '../pages/Errors/Unauthorized/Unauthorized';

// Import SuperAdmin pages
import SuperAdminDashboard from '../pages/SuperAdmin/Dashboard/Dashboard';
import OrganizationsList from '../pages/SuperAdmin/OrganizationsList/OrganizationsList';
import PlatformAnalytics from '../pages/SuperAdmin/PlatformAnalytics/PlatformAnalytics';
import SystemSettings from '../pages/SuperAdmin/SystemSettings/SystemSettings';
import BillingManagement from '../pages/SuperAdmin/BillingManagement/BillingManagement';

// Import Role-Specific Dashboard pages (with fallbacks for missing ones)
import AdminDashboard from '../pages/Dashboard/AdminDashboard/AdminDashboard';
import ProcurementDashboard from '../pages/Dashboard/ProcurementDashboard/ProcurementDashboard';
import InventoryDashboard from '../pages/Dashboard/InventoryDashboard/InventoryDashboard';
import BidDashboard from '../pages/Dashboard/BidDashboard/BidDashboard';
import FinanceDashboard from '../pages/Dashboard/FinanceDashboard/FinanceDashboard';
import DepartmentDashboard from '../pages/Dashboard/DepartmentDashboard/DepartmentDashboard';
import ViewerDashboard from '../pages/Dashboard/ViewerDashboard/ViewerDashboard';
import AuditorDashboard from '../pages/Dashboard/AuditorDashboard/AuditorDashboard';

// Import regular user pages
import Dashboard from '../pages/Dashboard/Dashboard';
import InventoryManagement from '../pages/Inventory/InventoryManagement/InventoryManagement';
import AddProduct from '../pages/Inventory/AddProduct/AddProduct';
import Categories from '../pages/Inventory/Categories/Categories';
import PurchaseOrders from '../pages/Procurement/PurchaseOrders/PurchaseOrders';
import CreatePurchaseOrder from '../pages/Procurement/CreatePurchaseOrder/CreatePurchaseOrder';
import ViewPurchaseOrder from '../pages/Procurement/ViewPurchaseOrder/ViewPurchaseOrder';
import RFQ from '../pages/Procurement/RFQ/RFQ';
import SupplierDirectory from '../pages/Suppliers/SupplierDirectory/SupplierDirectory';
import AddSupplier from '../pages/Suppliers/AddSupplier/AddSupplier';
import SupplierProfile from '../pages/Suppliers/SupplierProfile/SupplierProfile';
import SupplierPerformance from '../pages/Suppliers/SupplierPerformance/SupplierPerformance';
import AnalyticsDashboard from '../pages/Reports/AnalyticsDashboard/AnalyticsDashboard';
import ProcurementReports from '../pages/Reports/ProcurementReports/ProcurementReports';
import SupplierReports from '../pages/Reports/SupplierReports/SupplierReports';

// Import layouts
import SuperAdminLayout from '../layouts/SuperAdminLayout';

// Import common components
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';

// Simple Home component that always shows the Home page
const SmartHome = () => {
  const { loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // Always show the Home page
  return <Home />;
};

// SuperAdmin Route Wrapper Component
const SuperAdminRouteWrapper = ({ children }) => {
  return (
    <SuperAdminProvider>
      {children}
    </SuperAdminProvider>
  );
};

// Fallback components for missing dashboards
const SupplierDashboardFallback = () => (
  <div className="dashboard-fallback">
    <h1>Supplier Dashboard</h1>
    <p>Supplier dashboard component is being developed.</p>
    <div className="placeholder-content">
      <p>This will contain supplier management features.</p>
    </div>
  </div>
);

const SupplierUserDashboardFallback = () => (
  <div className="dashboard-fallback">
    <h1>Supplier User Dashboard</h1>
    <p>Supplier user dashboard component is being developed.</p>
    <div className="placeholder-content">
      <p>This will contain supplier user portal features.</p>
    </div>
  </div>
);

function AppRouter() {
  const { loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* 🏠 Root path - Always shows Home page */}
      <Route path="/" element={<SmartHome />} />

      {/* 🏠 Marketing Pages (Public - not restricted) */}
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/features" element={<Features />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/contact" element={<Contact />} />

      {/* 🔐 Auth Pages (Public - restricted for authenticated users) */}
      <Route path="/login" element={
        <PublicRoute restricted={true}>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute restricted={true}>
          <Register />
        </PublicRoute>
      } />
      
      {/* ✅ SUPPLIER REGISTER - MOVED HERE */}
      <Route path="/supplier-register" element={
        <PublicRoute restricted={true}>
          <SupplierRegister />
        </PublicRoute>
      } />
      
      <Route path="/forgot-password" element={
        <PublicRoute restricted={true}>
          <ForgotPassword />
        </PublicRoute>
      } />
      <Route path="/organization/register" element={
        <PublicRoute restricted={true}>
          <OrganizationRegister />
        </PublicRoute>
      } />
      
      {/* ✅ Email Verification Route */}
      <Route path="/verify-email" element={
        <PublicRoute restricted={true}>
          <EmailVerification />
        </PublicRoute>
      } />

      {/* 👑 SuperAdmin Routes (Protected with super_admin role) */}
      <Route path="/super-admin" element={
        <PrivateRoute requiredRoles={['super_admin']}>
          <SuperAdminRouteWrapper>
            <SuperAdminLayout />
          </SuperAdminRouteWrapper>
        </PrivateRoute>
      }>
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="organizations" element={<OrganizationsList />} />
        <Route path="analytics" element={<PlatformAnalytics />} />
        <Route path="billing" element={<BillingManagement />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* 👥 Role-Specific Dashboard Routes (Protected) */}
      <Route path="/admin/dashboard" element={
        <PrivateRoute requiredRoles={['admin']}>
          <AdminDashboard />
        </PrivateRoute>
      } />
      <Route path="/procurement/dashboard" element={
        <PrivateRoute requiredRoles={['procurement_manager']}>
          <ProcurementDashboard />
        </PrivateRoute>
      } />
      <Route path="/inventory/dashboard" element={
        <PrivateRoute requiredRoles={['inventory_manager']}>
          <InventoryDashboard />
        </PrivateRoute>
      } />
      <Route path="/supplier/dashboard" element={
        <PrivateRoute requiredRoles={['supplier_manager']}>
          <SupplierDashboardFallback />
        </PrivateRoute>
      } />
      <Route path="/bid/dashboard" element={
        <PrivateRoute requiredRoles={['bid_manager']}>
          <BidDashboard />
        </PrivateRoute>
      } />
      <Route path="/finance/dashboard" element={
        <PrivateRoute requiredRoles={['finance_manager']}>
          <FinanceDashboard />
        </PrivateRoute>
      } />
      <Route path="/department/dashboard" element={
        <PrivateRoute requiredRoles={['department_manager']}>
          <DepartmentDashboard />
        </PrivateRoute>
      } />
      <Route path="/viewer/dashboard" element={
        <PrivateRoute requiredRoles={['viewer']}>
          <ViewerDashboard />
        </PrivateRoute>
      } />
      <Route path="/auditor/dashboard" element={
        <PrivateRoute requiredRoles={['auditor']}>
          <AuditorDashboard />
        </PrivateRoute>
      } />
      <Route path="/supplier-user/dashboard" element={
        <PrivateRoute requiredRoles={['supplier_user']}>
          <SupplierUserDashboardFallback />
        </PrivateRoute>
      } />

      {/* 🏢 Main Dashboard Route (Protected) */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />

      {/* 📦 Inventory Routes (Protected) */}
      <Route path="/inventory" element={
        <PrivateRoute>
          <InventoryManagement />
        </PrivateRoute>
      } />
      <Route path="/inventory/products/add" element={
        <PrivateRoute>
          <AddProduct />
        </PrivateRoute>
      } />
      <Route path="/inventory/categories" element={
        <PrivateRoute>
          <Categories />
        </PrivateRoute>
      } />

      {/* 📋 Procurement Routes (Protected) */}
      <Route path="/procurement/purchase-orders" element={
        <PrivateRoute>
          <PurchaseOrders />
        </PrivateRoute>
      } />
      <Route path="/procurement/create-purchase-order" element={
        <PrivateRoute>
          <CreatePurchaseOrder />
        </PrivateRoute>
      } />
      <Route path="/procurement/purchase-orders/:id" element={
        <PrivateRoute>
          <ViewPurchaseOrder />
        </PrivateRoute>
      } />
      <Route path="/procurement/purchase-orders/:id/edit" element={
        <PrivateRoute>
          <CreatePurchaseOrder />
        </PrivateRoute>
      } />
      <Route path="/procurement/rfq" element={
        <PrivateRoute>
          <RFQ />
        </PrivateRoute>
      } />

      {/* 🏢 Supplier Routes (Protected) */}
      <Route path="/suppliers" element={
        <PrivateRoute>
          <SupplierDirectory />
        </PrivateRoute>
      } />
      <Route path="/suppliers/add" element={
        <PrivateRoute>
          <AddSupplier />
        </PrivateRoute>
      } />
      <Route path="/suppliers/:id" element={
        <PrivateRoute>
          <SupplierProfile />
        </PrivateRoute>
      } />
      <Route path="/suppliers/:id/edit" element={
        <PrivateRoute>
          <AddSupplier />
        </PrivateRoute>
      } />
      <Route path="/suppliers/performance" element={
        <PrivateRoute>
          <SupplierPerformance />
        </PrivateRoute>
      } />

      {/* 📊 Reports & Analytics Routes (Protected) */}
      <Route path="/reports/analytics" element={
        <PrivateRoute>
          <AnalyticsDashboard />
        </PrivateRoute>
      } />
      <Route path="/reports/procurement" element={
        <PrivateRoute>
          <ProcurementReports />
        </PrivateRoute>
      } />
      <Route path="/reports/suppliers" element={
        <PrivateRoute>
          <SupplierReports />
        </PrivateRoute>
      } />

      {/* ❌ Error Pages */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/404" element={<NotFound />} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default AppRouter;