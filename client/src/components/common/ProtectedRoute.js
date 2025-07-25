import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
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
  // Use consistent property names - adjust based on your useAuth implementation
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Use loading instead of isLoading for consistency
  const isLoading = loading;
  // If user exists, we're authenticated
  const authenticated = isAuthenticated ?? !!user;

  // Additional permission check
  const hasRequiredPermissions = () => {
    if (!requiredPermissions.length) return true;
    if (!user?.permissions) return false;
    return requiredPermissions.every(perm => user.permissions.includes(perm));
  };

  // Effect for additional auth checks
  useEffect(() => {
    if (!isLoading && authenticated && user) {
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
  }, [isLoading, authenticated, user, navigate, onAuthCheck, onRoleCheck, requiredRole, unauthorizedRedirect]);

  if (isLoading) {
    return loadingComponent;
  }

  if (!authenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Add safety check for user.role
  if (requiredRole && (!user.role || user.role !== requiredRole)) {
    console.warn(`Access denied. Required role: ${requiredRole}, User role: ${user.role}`);
    return <Navigate to={unauthorizedRedirect} replace />;
  }

  if (!hasRequiredPermissions()) {
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