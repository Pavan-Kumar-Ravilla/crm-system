import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  TrendingUpIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  PhoneIcon,
  CalendarIcon
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Leads', href: '/leads', icon: UsersIcon },
    { name: 'Contacts', href: '/contacts', icon: UserGroupIcon },
    { name: 'Accounts', href: '/accounts', icon: BuildingOfficeIcon },
    { name: 'Opportunities', href: '/opportunities', icon: TrendingUpIcon },
    { name: 'Activities', href: '/activities', icon: CalendarIcon },
    { name: 'Tasks', href: '/tasks', icon: DocumentTextIcon },
    { name: 'Calls', href: '/calls', icon: PhoneIcon },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
  ];

  const isActiveLink = (href) => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 lg:hidden">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CRM</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">
                CRM System
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = isActiveLink(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon className={`
                    mr-3 h-5 w-5 flex-shrink-0
                    ${isActive ? 'text-primary-700' : 'text-gray-400 group-hover:text-gray-500'}
                  `} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-primary-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-primary-800">
                Need Help?
              </h4>
              <p className="text-xs text-primary-600 mt-1">
                Check out our documentation and support resources.
              </p>
              <Link
                to="/help"
                className="inline-flex items-center text-xs font-medium text-primary-700 hover:text-primary-800 mt-2"
              >
                Learn more →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;