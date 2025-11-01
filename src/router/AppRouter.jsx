// src/router/AppRouter.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const Login = lazy(() => import('../pages/Auth/Login/Login'));
const Register = lazy(() => import('../pages/Auth/Register/Register'));
const ForgotPassword = lazy(() => import('../pages/Auth/ForgotPassword/ForgotPassword'));

// Procurement Pages
const PurchaseOrders = lazy(() => import('../pages/Procurement/PurchaseOrders/PurchaseOrders'));
const CreatePurchaseOrder = lazy(() => import('../pages/Procurement/CreatePurchaseOrder/CreatePurchaseOrder'));
const ViewPurchaseOrder = lazy(() => import('../pages/Procurement/ViewPurchaseOrder/ViewPurchaseOrder'));
const RFQ = lazy(() => import('../pages/Procurement/RFQ/RFQ'));

// Supplier Pages
const SupplierDirectory = lazy(() => import('../pages/Suppliers/SupplierDirectory/SupplierDirectory'));
const AddSupplier = lazy(() => import('../pages/Suppliers/AddSupplier/AddSupplier'));
const SupplierProfile = lazy(() => import('../pages/Suppliers/SupplierProfile/SupplierProfile'));
const SupplierPerformance = lazy(() => import('../pages/Suppliers/SupplierPerformance/SupplierPerformance'));

// Inventory Pages
const InventoryManagement = lazy(() => import('../pages/Inventory/InventoryManagement/InventoryManagement'));
const AddProduct = lazy(() => import('../pages/Inventory/AddProduct/AddProduct'));
const Categories = lazy(() => import('../pages/Inventory/Categories/Categories'));

// Bidding Pages
const BidManagement = lazy(() => import('../pages/Bidding/BidManagement/BidManagement'));
const CreateBid = lazy(() => import('../pages/Bidding/CreateBid/CreateBid'));

// Reports Pages
const ProcurementReports = lazy(() => import('../pages/Reports/ProcurementReports/ProcurementReports'));
const SupplierReports = lazy(() => import('../pages/Reports/SupplierReports/SupplierReports'));
const AnalyticsDashboard = lazy(() => import('../pages/Reports/AnalyticsDashboard/AnalyticsDashboard'));

// Settings Pages
const UserSettings = lazy(() => import('../pages/Settings/UserSettings/UserSettings'));
const SystemSettings = lazy(() => import('../pages/Settings/SystemSettings/SystemSettings'));
const NotificationSettings = lazy(() => import('../pages/Settings/NotificationSettings/NotificationSettings'));

// SuperAdmin Pages
const SuperAdminDashboard = lazy(() => import('../pages/SuperAdmin/Dashboard/Dashboard'));
const newLocal = '../pages/SuperAdmin/Billingmanagment/BillingManagement';
const BillingManagement = lazy(() => import(newLocal));
const OrganizationsList = lazy(() => import('../pages/SuperAdmin/OrganazationsList/OrganizationsList'));
const PlatformAnalytics = lazy(() => import('../pages/SuperAdmin/PlatformAnalytics,/PlatformAnalytics'));
const SuperAdminSystemSettings = lazy(() => import('../pages/SuperAdmin/SystemSetting/SystemSettings'));

// Error Pages
const NotFound = lazy(() => import('../pages/Errors/NotFound/notfound'));
const Unauthorized = lazy(() => import('../pages/Errors/Unauthorized/Unauthorized'));

const AppRouter = () => {
  // ✅ FIXED: Use "loading" (not "isLoading") — matches AuthContext
  const { loading: authLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" text="Authenticating..." />
      </div>
    );
  }

  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <LoadingSpinner size="large" text="Loading page..." />
        </div>
      }
    >
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } 
        />

        {/* Authentication Routes */}
        <Route 
          path="/auth/*" 
          element={
            <PublicRoute>
              <Routes>
                <Route path="reset-password" element={<div>Reset Password Page</div>} />
                <Route path="verify-email" element={<div>Verify Email Page</div>} />
              </Routes>
            </PublicRoute>
          } 
        />

        {/* ✅ Redirect root to /dashboard (which is protected) */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ✅ Protected Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />

        {/* Procurement Routes */}
        <Route 
          path="/procurement/*" 
          element={
            <PrivateRoute requiredRoles={['admin', 'procurement_manager', 'purchasing_agent']}>
              <Routes>
                <Route path="purchase-orders" element={<PurchaseOrders />} />
                <Route path="purchase-orders/create" element={<CreatePurchaseOrder />} />
                <Route path="purchase-orders/:id" element={<ViewPurchaseOrder />} />
                <Route path="purchase-orders/:id/edit" element={<CreatePurchaseOrder />} />
                <Route path="rfq" element={<RFQ />} />
                <Route path="requisitions" element={<div>Requisitions Page</div>} />
                <Route index element={<Navigate to="/procurement/purchase-orders" replace />} />
              </Routes>
            </PrivateRoute>
          } 
        />

        {/* Supplier Management Routes */}
        <Route 
          path="/suppliers/*" 
          element={
            <PrivateRoute requiredRoles={['admin', 'procurement_manager', 'supplier_manager']}>
              <Routes>
                <Route path="directory" element={<SupplierDirectory />} />
                <Route path="add" element={<AddSupplier />} />
                <Route path=":id" element={<SupplierProfile />} />
                <Route path=":id/edit" element={<AddSupplier />} />
                <Route path="performance" element={<SupplierPerformance />} />
                <Route index element={<Navigate to="/suppliers/directory" replace />} />
              </Routes>
            </PrivateRoute>
          } 
        />

        {/* Inventory Management Routes */}
        <Route 
          path="/inventory/*" 
          element={
            <PrivateRoute requiredRoles={['admin', 'inventory_manager', 'procurement_manager']}>
              <Routes>
                <Route path="management" element={<InventoryManagement />} />
                <Route path="add-product" element={<AddProduct />} />
                <Route path="products/:id/edit" element={<AddProduct />} />
                <Route path="categories" element={<Categories />} />
                <Route path="stock-alerts" element={<div>Stock Alerts Page</div>} />
                <Route index element={<Navigate to="/inventory/management" replace />} />
              </Routes>
            </PrivateRoute>
          } 
        />

        {/* Bidding Routes */}
        <Route 
          path="/bidding/*" 
          element={
            <PrivateRoute requiredRoles={['admin', 'procurement_manager', 'bid_manager']}>
              <Routes>
                <Route path="management" element={<BidManagement />} />
                <Route path="create" element={<CreateBid />} />
                <Route path=":id" element={<div>Bid Detail Page</div>} />
                <Route path=":id/edit" element={<CreateBid />} />
                <Route path="evaluation" element={<div>Bid Evaluation Page</div>} />
                <Route index element={<Navigate to="/bidding/management" replace />} />
              </Routes>
            </PrivateRoute>
          } 
        />

        {/* Reports & Analytics Routes */}
        <Route 
          path="/reports/*" 
          element={
            <PrivateRoute requiredRoles={['admin', 'procurement_manager', 'reports_viewer']}>
              <Routes>
                <Route path="procurement" element={<ProcurementReports />} />
                <Route path="supplier" element={<SupplierReports />} />
                <Route path="analytics" element={<AnalyticsDashboard />} />
                <Route index element={<Navigate to="/reports/procurement" replace />} />
              </Routes>
            </PrivateRoute>
          } 
        />

        {/* Settings Routes */}
        <Route 
          path="/settings/*" 
          element={
            <PrivateRoute>
              <Routes>
                <Route path="profile" element={<UserSettings />} />
                <Route path="notifications" element={<NotificationSettings />} />
                <Route 
                  path="system" 
                  element={
                    <PrivateRoute requiredRoles={['admin']}>
                      <SystemSettings />
                    </PrivateRoute>
                  } 
                />
                <Route index element={<Navigate to="/settings/profile" replace />} />
              </Routes>
            </PrivateRoute>
          } 
        />

        {/* SuperAdmin Routes */}
        <Route 
          path="/super-admin/*" 
          element={
            <PrivateRoute requiredRoles={['super_admin', 'admin']}>
              <Routes>
                <Route path="dashboard" element={<SuperAdminDashboard />} />
                <Route path="billing" element={<BillingManagement />} />
                <Route path="organizations" element={<OrganizationsList />} />
                <Route path="analytics" element={<PlatformAnalytics />} />
                <Route path="settings" element={<SuperAdminSystemSettings />} />
                <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
              </Routes>
            </PrivateRoute>
          } 
        />

        {/* Error Routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/404" element={<NotFound />} />
        
        {/* Catch all route - redirect to 404 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;