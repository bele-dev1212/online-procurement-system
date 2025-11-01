// src/router/PublicRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';

/**
 * PublicRoute Component
 * Redirects authenticated users away from public pages (like login, register)
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Child components to render if not authenticated
 * @param {boolean} props.restricted - Whether the route is restricted for authenticated users
 * @param {string} props.redirectTo - Where to redirect authenticated users
 */
const PublicRoute = ({ 
  children, 
  restricted = false, 
  redirectTo = '/dashboard' 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Get redirect URL from query params or use default
  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const redirectPath = redirectParam || redirectTo;

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" text="Checking authentication..." />
      </div>
    );
  }

  // If route is restricted and user is authenticated, redirect them
  if (restricted && isAuthenticated && user) {
    // Prevent redirect loop by checking if we're already on the target page
    const isSamePath = location.pathname === redirectPath;
    
    if (!isSamePath) {
      console.log(`Redirecting authenticated user from ${location.pathname} to ${redirectPath}`);
      return <Navigate to={redirectPath} replace />;
    }
  }

  // User is not authenticated or route is not restricted, show the public page
  return children;
};

export default PublicRoute;