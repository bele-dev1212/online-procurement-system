import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import './App.css';

// Import Marketing Pages
import Home from './pages/Home/Home';
import About from './pages/About/About';
import Features from './pages/Features/Features';
import Pricing from './pages/Pricing/Pricing';
import Contact from './pages/Contact/Contact';

// Import Auth Pages
import Login from './pages/Auth/Login/Login';
import Register from './pages/Auth/Register/Register';
import ForgotPassword from './pages/Auth/ForgotPassword/ForgotPassword';

// Import Organization Registration
import OrganizationRegister from './pages/Auth/OrganizationRegister/OrganizationRegister';

// Import Error Pages
import NotFound from './pages/Errors/NotFound/notfound';
import Unauthorized from './pages/Errors/Unauthorized/Unauthorized';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && user.role !== 'super_admin') {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

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

            {/* 🏢 Application Pages (Protected) - Commented out until files exist */}
            {/* <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } /> */}
            
            {/* <Route path="/suppliers/*" element={
              <ProtectedRoute>
                <Suppliers />
              </ProtectedRoute>
            } /> */}
            
            {/* <Route path="/inventory/*" element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            } /> */}
            
            {/* <Route path="/bidding/*" element={
              <ProtectedRoute>
                <Bidding />
              </ProtectedRoute>
            } /> */}
            
            {/* <Route path="/reports/*" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } /> */}
            
            {/* <Route path="/settings/*" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } /> */}

            {/* ⚙️ Organization Management (Protected) - Commented out until files exist */}
            {/* <Route path="/organization/settings" element={
              <ProtectedRoute>
                <OrganizationSettings />
              </ProtectedRoute>
            } /> */}
            
            {/* <Route path="/organization/team" element={
              <ProtectedRoute>
                <TeamManagement />
              </ProtectedRoute>
            } /> */}
            
            {/* <Route path="/organization/billing" element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            } /> */}

            {/* Temporary dashboard route for testing */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <div style={{ padding: '20px' }}>
                  <h1>Dashboard</h1>
                  <p>Welcome to your dashboard! This is a temporary page.</p>
                  <p>Create the actual component files to replace this.</p>
                </div>
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