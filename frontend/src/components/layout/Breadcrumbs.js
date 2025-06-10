import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import classNames from 'classnames';

const Breadcrumbs = () => {
  const location = useLocation();
  const { selectedApp } = useApp();

  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    if (pathSegments[0] === 'app-manager') {
      breadcrumbs.push({
        label: 'App Manager',
        path: '/app-manager',
        icon: Home
      });
      return breadcrumbs;
    }

    if (pathSegments[0] === 'app' && selectedApp) {
      breadcrumbs.push({
        label: 'App Manager',
        path: '/app-manager',
        icon: Home
      });

      if (pathSegments.length === 2) {
        breadcrumbs.push({
          label: selectedApp.name,
          path: selectedApp.path,
          current: true
        });
      } else if (pathSegments.length > 2) {
        breadcrumbs.push({
          label: selectedApp.name,
          path: selectedApp.path
        });

        for (let i = 2; i < pathSegments.length; i++) {
          const segment = pathSegments[i];
          const path = '/' + pathSegments.slice(0, i + 1).join('/');
          const isLast = i === pathSegments.length - 1;
          
          let label = segment.charAt(0).toUpperCase() + segment.slice(1);
          
          if (segment === 'new') {
            label = 'New';
          } else if (segment === 'edit') {
            label = 'Edit';
          } else if (segment.length > 10) {
            label = segment.slice(0, 8) + '...';
          }

          breadcrumbs.push({
            label,
            path,
            current: isLast
          });
        }
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-salesforce-gray-200 px-6 py-3">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const IconComponent = breadcrumb.icon;

          return (
            <li key={breadcrumb.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-salesforce-gray-400 mx-2" />
              )}
              
              {isLast || breadcrumb.current ? (
                <span className={classNames(
                  'flex items-center text-sm font-medium',
                  'text-salesforce-gray-900'
                )}>
                  {IconComponent && <IconComponent className="h-4 w-4 mr-1" />}
                  {breadcrumb.label}
                </span>
              ) : (
                <Link
                  to={breadcrumb.path}
                  className={classNames(
                    'flex items-center text-sm font-medium transition-colors duration-150',
                    'text-salesforce-gray-500 hover:text-salesforce-gray-700'
                  )}
                >
                  {IconComponent && <IconComponent className="h-4 w-4 mr-1" />}
                  {breadcrumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;