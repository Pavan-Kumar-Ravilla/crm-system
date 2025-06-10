import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import classNames from 'classnames';
import { 
  Target, 
  Users, 
  Building2, 
  Briefcase, 
  Calendar,
  BarChart3,
  Settings,
  Home,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { selectedApp, sidebarCollapsed, toggleSidebar, setCurrentModule } = useApp();

  const getNavigationItems = () => {
    if (!selectedApp) return [];

    const baseItems = [
      {
        name: 'Home',
        path: selectedApp.path,
        icon: Home,
        exact: true
      }
    ];

    switch (selectedApp.id) {
      case 'sales':
        return [
          ...baseItems,
          {
            name: 'Leads',
            path: `${selectedApp.path}/leads`,
            icon: Target,
            badge: '23'
          },
          {
            name: 'Contacts',
            path: `${selectedApp.path}/contacts`,
            icon: Users
          },
          {
            name: 'Accounts',
            path: `${selectedApp.path}/accounts`,
            icon: Building2
          },
          {
            name: 'Opportunities',
            path: `${selectedApp.path}/opportunities`,
            icon: Briefcase,
            badge: '8'
          },
          {
            name: 'Activities',
            path: `${selectedApp.path}/activities`,
            icon: Calendar
          },
          {
            name: 'Reports',
            path: `${selectedApp.path}/reports`,
            icon: BarChart3
          }
        ];
      
      case 'marketing':
        return [
          ...baseItems,
          {
            name: 'Campaigns',
            path: `${selectedApp.path}/campaigns`,
            icon: Target
          },
          {
            name: 'Leads',
            path: `${selectedApp.path}/leads`,
            icon: Users
          },
          {
            name: 'Analytics',
            path: `${selectedApp.path}/analytics`,
            icon: BarChart3
          }
        ];
      
      case 'service':
        return [
          ...baseItems,
          {
            name: 'Cases',
            path: `${selectedApp.path}/cases`,
            icon: Briefcase
          },
          {
            name: 'Knowledge',
            path: `${selectedApp.path}/knowledge`,
            icon: Users
          },
          {
            name: 'Activities',
            path: `${selectedApp.path}/activities`,
            icon: Calendar
          }
        ];
      
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  if (!selectedApp) {
    return null;
  }

  return (
    <div className={classNames(
      'fixed left-0 top-0 h-full bg-white border-r border-salesforce-gray-200 transition-all duration-300 z-40',
      sidebarCollapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-salesforce-gray-200">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <div className={`${selectedApp.color} p-2 rounded-lg`}>
                <selectedApp.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-salesforce-gray-900">
                  {selectedApp.name}
                </h2>
              </div>
            </div>
          )}
          
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-salesforce-gray-100 text-salesforce-gray-500"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.path, item.exact);
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setCurrentModule(item.name.toLowerCase())}
                className={classNames(
                  'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150',
                  {
                    'bg-salesforce-blue-50 text-salesforce-blue-700 border-r-2 border-salesforce-blue-600': active,
                    'text-salesforce-gray-600 hover:bg-salesforce-gray-100 hover:text-salesforce-gray-900': !active,
                  }
                )}
              >
                <IconComponent className={classNames(
                  'flex-shrink-0 h-5 w-5',
                  sidebarCollapsed ? '' : 'mr-3'
                )} />
                
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-salesforce-blue-100 text-salesforce-blue-600 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-salesforce-gray-200">
          <NavLink
            to="/app/settings"
            className={classNames(
              'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150',
              {
                'bg-salesforce-blue-50 text-salesforce-blue-700': isActive('/app/settings'),
                'text-salesforce-gray-600 hover:bg-salesforce-gray-100 hover:text-salesforce-gray-900': !isActive('/app/settings'),
              }
            )}
          >
            <Settings className={classNames(
              'flex-shrink-0 h-5 w-5',
              sidebarCollapsed ? '' : 'mr-3'
            )} />
            {!sidebarCollapsed && <span>Settings</span>}
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;