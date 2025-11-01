// src/router/PrivateRoute.jsx - WORKING VERSION
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';

const PrivateRoute = ({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [], 
  requireEmailVerification = false 
}) => {
  const { 
    user, 
    loading, 
    permissions 
  } = useAuth();
  
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" text="Checking authentication..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    const redirectUrl = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?redirect=${redirectUrl}`} replace />;
  }

  // Check role-based access control
  if (requiredRoles.length > 0) {
    const userRole = user?.role;
    if (!requiredRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check permission-based access control
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(permission => 
      permissions.includes(permission)
    );
    
    if (!hasRequiredPermissions) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is authenticated and has required roles/permissions
  return children;
};

export default PrivateRoute;