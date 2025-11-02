import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Import only the pages that actually exist
import Home from '../pages/Home/Home';
import About from '../pages/About/About';
import Features from '../pages/Features/Features';
import Pricing from '../pages/Pricing/Pricing';
import Contact from '../pages/Contact/Contact';
import Login from '../pages/Auth/Login/Login';
import Register from '../pages/Auth/Register/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword/ForgotPassword';
import OrganizationRegister from '../pages/Auth/OrganizationRegister/OrganizationRegister';
import NotFound from '../pages/Errors/NotFound/notfound';
import Unauthorized from '../pages/Errors/Unauthorized/Unauthorized';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Simple Dashboard component (temporary)
const SimpleDashboard = () => (
  <div style={{ padding: '20px' }}>
    <h1>Procurement Dashboard</h1>
    <p>Welcome to your procurement system!</p>
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

function AppRouter() {
  return (
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

      {/* ❌ Error Pages */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default AppRouter;
