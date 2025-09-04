import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Fixed import path
import Loading from './Loading';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null,
  requiredPermissions = [],
  redirectTo = '/login',
  unauthorizedRedirect = '/unauthorized',
  loadingComponent = <Loading />,
  onAuthCheck,
  onRoleCheck
}) => {
  const { user, loading, isAuthenticated } = useAuth(); // Use consistent naming
  const location = useLocation();
  const navigate = useNavigate();

  // Additional permission check
  const hasRequiredPermissions = () => {
    if (!requiredPermissions.length) return true;
    if (!user?.permissions) return false;
    return requiredPermissions.every(perm => user.permissions.includes(perm));
  };

  // Effect for additional auth checks
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // Custom auth check callback
      if (onAuthCheck && !onAuthCheck(user)) {
        navigate(unauthorizedRedirect, { replace: true });
        return;
      }

      // Custom role check callback
      if (requiredRole && onRoleCheck && !onRoleCheck(user, requiredRole)) {
        navigate(unauthorizedRedirect, { replace: true });
        return;
      }
    }
  }, [loading, isAuthenticated, user, navigate, onAuthCheck, onRoleCheck, requiredRole, unauthorizedRedirect]);

  // Show loading spinner while checking authentication
  if (loading) {
    return loadingComponent;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRole && (!user.role || user.role !== requiredRole)) {
    console.warn(`Access denied. Required role: ${requiredRole}, User role: ${user.role}`);
    return <Navigate to={unauthorizedRedirect} replace />;
  }

  // Check permission requirements
  if (!hasRequiredPermissions()) {
    console.warn(`Access denied. Required permissions: ${requiredPermissions.join(', ')}`);
    return <Navigate to={unauthorizedRedirect} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string,
  requiredPermissions: PropTypes.arrayOf(PropTypes.string),
  redirectTo: PropTypes.string,
  unauthorizedRedirect: PropTypes.string,
  loadingComponent: PropTypes.node,
  onAuthCheck: PropTypes.func,
  onRoleCheck: PropTypes.func
};

export default ProtectedRoute;