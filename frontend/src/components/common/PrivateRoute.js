// src/components/common/PrivateRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from './Spinner';

/**
 * PrivateRoute component to protect routes that require authentication
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {Array<string>} props.requiredRoles - Optional array of roles required to access this route
 * @param {string} props.redirectTo - Optional custom redirect path (default: '/login')
 */
const PrivateRoute = ({ 
  children, 
  requiredRoles = [], 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, isLoading, user, canAccess } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="slds-scope">
        <div className="slds-grid slds-grid_align-center slds-grid_vertical-align-center" style={{ minHeight: '100vh' }}>
          <div className="slds-col">
            <Spinner size="large" />
            <div className="slds-text-align_center slds-m-top_medium">
              <p className="slds-text-body_regular">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access if required roles are specified
  if (requiredRoles.length > 0 && !canAccess(requiredRoles)) {
    return (
      <div className="slds-scope">
        <div className="slds-grid slds-grid_align-center slds-grid_vertical-align-center" style={{ minHeight: '100vh' }}>
          <div className="slds-col slds-size_1-of-2">
            <div className="slds-illustration slds-illustration_large">
              <div className="slds-text-align_center">
                <div className="slds-text-heading_large slds-m-bottom_medium">Access Denied</div>
                <div className="slds-text-body_regular slds-m-bottom_large">
                  You don't have permission to access this page. Required roles: {requiredRoles.join(', ')}
                </div>
                <div className="slds-text-body_small slds-text-color_weak">
                  Your current role: {user?.role || 'Unknown'}
                </div>
                <div className="slds-m-top_large">
                  <button 
                    className="slds-button slds-button_brand"
                    onClick={() => window.history.back()}
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render children if authenticated and authorized
  return children;
};

/**
 * Higher-order component version of PrivateRoute
 * @param {React.Component} Component - Component to wrap
 * @param {Array<string>} requiredRoles - Optional array of roles required
 */
export const withAuth = (Component, requiredRoles = []) => {
  return function AuthenticatedComponent(props) {
    return (
      <PrivateRoute requiredRoles={requiredRoles}>
        <Component {...props} />
      </PrivateRoute>
    );
  };
};

/**
 * Hook to check if user has specific permissions
 */
export const usePermissions = () => {
  const { user, canAccess, hasRole, hasAnyRole } = useAuth();

  return {
    user,
    canAccess,
    hasRole,
    hasAnyRole,
    isAdmin: hasRole('admin'),
    isManager: hasRole('manager') || hasRole('admin'),
    isSalesRep: hasAnyRole(['sales_rep', 'manager', 'admin']),
    canManageUsers: hasAnyRole(['admin', 'manager']),
    canBulkEdit: hasAnyRole(['admin', 'manager']),
    canDeleteRecords: hasAnyRole(['admin', 'manager']),
    canViewAllRecords: hasAnyRole(['admin', 'manager']),
    canExportData: hasAnyRole(['admin', 'manager', 'sales_rep']),
    canManageSettings: hasRole('admin')
  };
};

/**
 * Component to conditionally render content based on user roles
 * @param {Object} props - Component props
 * @param {Array<string>} props.roles - Required roles to show content
 * @param {React.ReactNode} props.children - Content to show if user has required roles
 * @param {React.ReactNode} props.fallback - Optional fallback content if user doesn't have access
 */
export const RoleBasedAccess = ({ roles = [], children, fallback = null }) => {
  const { canAccess } = useAuth();

  if (roles.length === 0 || canAccess(roles)) {
    return children;
  }

  return fallback;
};

/**
 * Component to show content only to specific roles
 */
export const AdminOnly = ({ children, fallback = null }) => (
  <RoleBasedAccess roles={['admin']} fallback={fallback}>
    {children}
  </RoleBasedAccess>
);

export const ManagerOnly = ({ children, fallback = null }) => (
  <RoleBasedAccess roles={['admin', 'manager']} fallback={fallback}>
    {children}
  </RoleBasedAccess>
);

export const SalesOnly = ({ children, fallback = null }) => (
  <RoleBasedAccess roles={['admin', 'manager', 'sales_rep']} fallback={fallback}>
    {children}
  </RoleBasedAccess>
);

export default PrivateRoute;