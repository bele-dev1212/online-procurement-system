import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Sidebar from './components/common/Sidebar/Sidebar';
import './App.css';

// Import existing pages
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Features from './pages/Features/Features';
import Pricing from './pages/Pricing/Pricing';
import Contact from './pages/Contact/Contact';
import Login from './pages/Auth/Login/Login';
import Register from './pages/Auth/Register/Register';
import ForgotPassword from './pages/Auth/ForgotPassword/ForgotPassword';
import OrganizationRegister from './pages/Auth/OrganizationRegister/OrganizationRegister';
import NotFound from './pages/Errors/NotFound/notfound';
import Unauthorized from './pages/Errors/Unauthorized/Unauthorized';

// Import Supplier Pages
import SupplierDashboard from './pages/Suppliers/SupplierDashboard/SupplierDashboard';
import SupplierDirectory from './pages/Suppliers/SupplierDirectory/SupplierDirectory';
import AddSupplier from './pages/Suppliers/AddSupplier/AddSupplier';
import SupplierProfile from './pages/Suppliers/SupplierProfile/SupplierProfile';
import SupplierPerformance from './pages/Suppliers/SupplierPerformance/SupplierPerformance';
import RFQOpportunities from './pages/Suppliers/RFQOpportunities/RFQOpportunities';
import BidManagement from './pages/Suppliers/BidManagement/BidManagement';
import OrderFulfillment from './pages/Suppliers/OrderFulfillment/OrderFulfillment';
import ProductCatalog from './pages/Suppliers/ProductCatalog/ProductCatalog';

// Layout Component with Sidebar
const AppLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading, hasRole } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <AppLayout>{children}</AppLayout>;
};

// Simple Dashboard (temporary)
const SimpleDashboard = () => (
  <div style={{ padding: '20px' }}>
    <h1>Procurement Dashboard</h1>
    <p>Welcome to your dashboard! Registration was successful.</p>
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(3, 1fr)', 
      gap: '20px', 
      marginTop: '20px' 
    }}>
      <div style={{ background: '#f0f8ff', padding: '20px', borderRadius: '8px' }}>
        <h3>Purchase Requests</h3>
        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>0</p>
      </div>
      <div style={{ background: '#f0fff0', padding: '20px', borderRadius: '8px' }}>
        <h3>Suppliers</h3>
        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>0</p>
      </div>
      <div style={{ background: '#fff8f0', padding: '20px', borderRadius: '8px' }}>
        <h3>Open POs</h3>
        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>0</p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* 🏠 Marketing Pages (Public) */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />

            {/* 🔐 Auth Pages (Public) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/organization/register" element={<OrganizationRegister />} />

            {/* 🏢 Application Pages (Protected) */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <SimpleDashboard />
              </ProtectedRoute>
            } />

            {/* 👥 SUPPLIER MANAGEMENT ROUTES (Admin/Procurement Manager) */}
            <Route path="/suppliers" element={
              <ProtectedRoute requiredRole="admin">
                <SupplierDirectory />
              </ProtectedRoute>
            } />
            <Route path="/suppliers/directory" element={
              <ProtectedRoute requiredRole="admin">
                <SupplierDirectory />
              </ProtectedRoute>
            } />
            <Route path="/suppliers/create" element={
              <ProtectedRoute requiredRole="admin">
                <AddSupplier />
              </ProtectedRoute>
            } />
            <Route path="/suppliers/performance" element={
              <ProtectedRoute requiredRole="admin">
                <SupplierPerformance />
              </ProtectedRoute>
            } />
            <Route path="/suppliers/profile/:id" element={
              <ProtectedRoute requiredRole="admin">
                <SupplierProfile />
              </ProtectedRoute>
            } />

            {/* 🏪 SUPPLIER PORTAL ROUTES (Supplier Role) */}
            <Route path="/supplier/dashboard" element={
              <ProtectedRoute requiredRole="supplier">
                <SupplierDashboard />
              </ProtectedRoute>
            } />
            <Route path="/supplier/rfq-opportunities" element={
              <ProtectedRoute requiredRole="supplier">
                <RFQOpportunities />
              </ProtectedRoute>
            } />
            <Route path="/supplier/bid-management" element={
              <ProtectedRoute requiredRole="supplier">
                <BidManagement />
              </ProtectedRoute>
            } />
            <Route path="/supplier/order-fulfillment" element={
              <ProtectedRoute requiredRole="supplier">
                <OrderFulfillment />
              </ProtectedRoute>
            } />
            <Route path="/supplier/product-catalog" element={
              <ProtectedRoute requiredRole="supplier">
                <ProductCatalog />
              </ProtectedRoute>
            } />
            <Route path="/supplier/profile" element={
              <ProtectedRoute requiredRole="supplier">
                <SupplierProfile />
              </ProtectedRoute>
            } />

            {/* ❌ Error Pages */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;