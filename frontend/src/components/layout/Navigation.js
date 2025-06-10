// src/components/layout/Navigation.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { usePermissions } from '../common/PrivateRoute';
import { 
  Home, 
  Target, 
  Users, 
  Building, 
  DollarSign, 
  Activity,
  BarChart3,
  FileText,
  Settings,
  User
} from 'lucide-react';

const Navigation = ({ collapsed, currentPath }) => {
  const { canAccess, isAdmin, isManager } = usePermissions();

  const navigationItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <Home size={16} />,
      description: 'Overview and analytics',
      requiredRoles: []
    },
    {
      path: '/leads',
      label: 'Leads',
      icon: <Target size={16} />,
      description: 'Manage prospects',
      requiredRoles: ['sales_rep', 'manager', 'admin']
    },
    {
      path: '/contacts',
      label: 'Contacts',
      icon: <Users size={16} />,
      description: 'Customer contacts',
      requiredRoles: ['sales_rep', 'manager', 'admin']
    },
    {
      path: '/accounts',
      label: 'Accounts',
      icon: <Building size={16} />,
      description: 'Company accounts',
      requiredRoles: ['sales_rep', 'manager', 'admin']
    },
    {
      path: '/opportunities',
      label: 'Opportunities',
      icon: <DollarSign size={16} />,
      description: 'Sales pipeline',
      requiredRoles: ['sales_rep', 'manager', 'admin']
    },
    {
      path: '/activities',
      label: 'Activities',
      icon: <Activity size={16} />,
      description: 'Tasks and events',
      requiredRoles: ['sales_rep', 'manager', 'admin']
    }
  ];

  const adminItems = [
    {
      path: '/reports',
      label: 'Reports',
      icon: <BarChart3 size={16} />,
      description: 'Analytics and reports',
      requiredRoles: ['manager', 'admin']
    },
    {
      path: '/users',
      label: 'Users',
      icon: <User size={16} />,
      description: 'User management',
      requiredRoles: ['admin']
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: <Settings size={16} />,
      description: 'System settings',
      requiredRoles: ['admin']
    }
  ];

  const renderNavItem = (item) => {
    // Check if user has access to this route
    if (item.requiredRoles.length > 0 && !canAccess(item.requiredRoles)) {
      return null;
    }

    const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');

    return (
      <li key={item.path} className="slds-nav-vertical__item">
        <NavLink
          to={item.path}
          className={({ isActive }) => 
            `slds-nav-vertical__action ${isActive ? 'slds-is-active' : ''}`
          }
          title={collapsed ? item.label : ''}
        >
          <span className="slds-nav-vertical__action-icon">
            {item.icon}
          </span>
          {!collapsed && (
            <>
              <span className="slds-nav-vertical__action-text">
                {item.label}
              </span>
              <span className="slds-nav-vertical__action-description slds-text-color_weak">
                {item.description}
              </span>
            </>
          )}
        </NavLink>
      </li>
    );
  };

  return (
    <nav 
      className={`slds-nav-vertical slds-nav-vertical_shade ${collapsed ? 'slds-nav-vertical_compact' : ''}`}
      style={{
        width: collapsed ? '4rem' : '15rem',
        transition: 'width 0.3s ease-in-out',
        backgroundColor: '#f3f2f2',
        borderRight: '1px solid #e5e5e5',
        height: 'calc(100vh - 3.25rem)',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="slds-nav-vertical__section">
        {!collapsed && (
          <h2 className="slds-nav-vertical__title slds-text-title_caps slds-p-horizontal_medium slds-p-top_medium">
            Main Menu
          </h2>
        )}
        <ul className="slds-nav-vertical__action-list">
          {navigationItems.map(renderNavItem)}
        </ul>
      </div>

      {/* Admin Section */}
      {(isManager || isAdmin) && (
        <div className="slds-nav-vertical__section">
          {!collapsed && (
            <h2 className="slds-nav-vertical__title slds-text-title_caps slds-p-horizontal_medium slds-p-top_medium">
              Administration
            </h2>
          )}
          <ul className="slds-nav-vertical__action-list">
            {adminItems.map(renderNavItem)}
          </ul>
        </div>
      )}

      {/* Collapsed state help */}
      {collapsed && (
        <div className="slds-p-around_small slds-text-align_center" style={{ position: 'absolute', bottom: '1rem', left: '0', right: '0' }}>
          <div 
            className="slds-tooltip slds-nubbin_left" 
            role="tooltip"
            style={{ display: 'none' }}
          >
            <div className="slds-tooltip__body">
              Click on any icon to expand the menu
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;