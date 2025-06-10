import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { 
  Search, 
  Bell, 
  Settings, 
  LogOut, 
  User, 
  Menu,
  Grid3X3,
  ChevronDown
} from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { 
    selectedApp, 
    toggleSidebar, 
    globalSearch, 
    setGlobalSearch,
    notifications 
  } = useApp();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleGlobalSearch = (e) => {
    if (e.key === 'Enter' && globalSearch.trim()) {
      navigate(`/app/search?q=${encodeURIComponent(globalSearch)}`);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className="bg-white border-b border-salesforce-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app-manager')}
              className="p-1"
            >
              <Grid3X3 className="h-5 w-5 text-salesforce-blue-600" />
            </Button>
            
            {selectedApp && (
              <>
                <span className="text-salesforce-gray-400">/</span>
                <span className="text-lg font-semibold text-salesforce-gray-900">
                  {selectedApp.name}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-salesforce-gray-400" />
            <input
              type="text"
              placeholder="Search across all apps..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onKeyPress={handleGlobalSearch}
              className="w-full pl-10 pr-4 py-2 border border-salesforce-gray-300 rounded-md focus:ring-salesforce-blue-500 focus:border-salesforce-blue-500 bg-salesforce-gray-50"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app/notifications')}
              className="p-2"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettingsModal(true)}
            className="p-2"
          >
            <Settings className="h-5 w-5" />
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 p-2"
            >
              <div className="h-8 w-8 bg-salesforce-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-salesforce-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-salesforce-gray-200">
                  <p className="text-sm font-medium text-salesforce-gray-900">
                    {user?.fullName}
                  </p>
                  <p className="text-xs text-salesforce-gray-500">
                    {user?.email}
                  </p>
                  <p className="text-xs text-salesforce-gray-500">
                    {user?.role}
                  </p>
                </div>
                
                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate('/app/profile');
                      setShowProfileMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-salesforce-gray-700 hover:bg-salesforce-gray-100"
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profile Settings
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowSettingsModal(true);
                      setShowProfileMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-salesforce-gray-700 hover:bg-salesforce-gray-100"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    App Settings
                  </button>
                  
                  <div className="border-t border-salesforce-gray-200 my-1"></div>
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowProfileMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Settings"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-salesforce-gray-900 mb-2">
              Theme Preference
            </h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  className="text-salesforce-blue-600 focus:ring-salesforce-blue-500"
                />
                <span className="ml-2 text-sm text-salesforce-gray-700">Light</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  className="text-salesforce-blue-600 focus:ring-salesforce-blue-500"
                />
                <span className="ml-2 text-sm text-salesforce-gray-700">Dark</span>
              </label>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-salesforce-gray-900 mb-2">
              Notifications
            </h4>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-salesforce-gray-300 text-salesforce-blue-600 focus:ring-salesforce-blue-500"
                />
                <span className="ml-2 text-sm text-salesforce-gray-700">
                  Email notifications
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-salesforce-gray-300 text-salesforce-blue-600 focus:ring-salesforce-blue-500"
                />
                <span className="ml-2 text-sm text-salesforce-gray-700">
                  Browser notifications
                </span>
              </label>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Header;