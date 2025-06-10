import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import { 
  Users, 
  Building2, 
  Target, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut,
  Grid3X3,
  Search,
  Bell
} from 'lucide-react';

const AppManager = () => {
  const navigate = useNavigate();
  const { setSelectedApp } = useApp();
  const { user, logout } = useAuth();

  const apps = [
    {
      id: 'sales',
      name: 'Sales Cloud',
      description: 'Manage leads, contacts, accounts, and opportunities',
      icon: Target,
      color: 'bg-blue-500',
      path: '/app/sales',
      modules: ['leads', 'contacts', 'accounts', 'opportunities']
    },
    {
      id: 'marketing',
      name: 'Marketing Cloud',
      description: 'Create and manage marketing campaigns',
      icon: BarChart3,
      color: 'bg-purple-500',
      path: '/app/marketing',
      modules: ['campaigns', 'leads', 'analytics']
    },
    {
      id: 'service',
      name: 'Service Cloud',
      description: 'Provide exceptional customer service',
      icon: Users,
      color: 'bg-green-500',
      path: '/app/service',
      modules: ['cases', 'knowledge', 'activities']
    },
    {
      id: 'analytics',
      name: 'Analytics Cloud',
      description: 'Get insights from your data',
      icon: BarChart3,
      color: 'bg-orange-500',
      path: '/app/analytics',
      modules: ['dashboards', 'reports']
    }
  ];

  const handleAppSelect = (app) => {
    setSelectedApp(app);
    navigate(app.path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-salesforce-gray-50">
      <header className="bg-white border-b border-salesforce-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Grid3X3 className="h-8 w-8 text-salesforce-blue-600" />
              <h1 className="text-xl font-semibold text-salesforce-gray-900">App Manager</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-salesforce-gray-400" />
              <input
                type="text"
                placeholder="Search apps..."
                className="pl-10 pr-4 py-2 border border-salesforce-gray-300 rounded-md focus:ring-salesforce-blue-500 focus:border-salesforce-blue-500"
              />
            </div>
            
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-salesforce-gray-900">{user?.fullName}</p>
                <p className="text-xs text-salesforce-gray-500">{user?.role}</p>
              </div>
              <div className="h-8 w-8 bg-salesforce-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-salesforce-gray-500 hover:text-salesforce-gray-700"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-salesforce-gray-900 mb-2">
            Welcome back, {user?.firstName}!
          </h2>
          <p className="text-salesforce-gray-600">
            Choose an app to get started with your CRM tasks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {apps.map((app) => {
            const IconComponent = app.icon;
            return (
              <div
                key={app.id}
                className="bg-white rounded-lg border border-salesforce-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleAppSelect(app)}
              >
                <div className="flex items-center mb-4">
                  <div className={`${app.color} p-3 rounded-lg`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-salesforce-gray-900 mb-2 group-hover:text-salesforce-blue-600">
                  {app.name}
                </h3>
                
                <p className="text-salesforce-gray-600 text-sm mb-4">
                  {app.description}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {app.modules.map((module) => (
                    <span
                      key={module}
                      className="px-2 py-1 bg-salesforce-gray-100 text-salesforce-gray-600 text-xs rounded-full"
                    >
                      {module}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-white rounded-lg border border-salesforce-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-salesforce-gray-900">Quick Actions</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="secondary"
              className="justify-start h-12"
              onClick={() => navigate('/app/sales/leads/new')}
            >
              <Target className="h-5 w-5 mr-2" />
              Create New Lead
            </Button>
            
            <Button
              variant="secondary"
              className="justify-start h-12"
              onClick={() => navigate('/app/sales/contacts/new')}
            >
              <Users className="h-5 w-5 mr-2" />
              Add New Contact
            </Button>
            
            <Button
              variant="secondary"
              className="justify-start h-12"
              onClick={() => navigate('/app/sales/accounts/new')}
            >
              <Building2 className="h-5 w-5 mr-2" />
              Create Account
            </Button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-salesforce-gray-200 p-6">
            <h3 className="text-lg font-semibold text-salesforce-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-salesforce-gray-50 rounded-lg">
                <div className="h-8 w-8 bg-salesforce-blue-500 rounded-full flex items-center justify-center">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-salesforce-gray-900">New lead created</p>
                  <p className="text-xs text-salesforce-gray-500">2 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-salesforce-gray-50 rounded-lg">
                <div className="h-8 w-8 bg-salesforce-green-500 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-salesforce-gray-900">Contact updated</p>
                  <p className="text-xs text-salesforce-gray-500">15 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-salesforce-gray-50 rounded-lg">
                <div className="h-8 w-8 bg-salesforce-orange-500 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-salesforce-gray-900">Meeting scheduled</p>
                  <p className="text-xs text-salesforce-gray-500">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-salesforce-gray-200 p-6">
            <h3 className="text-lg font-semibold text-salesforce-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-salesforce-gray-50 rounded-lg">
                <span className="text-sm font-medium text-salesforce-gray-900">Sales Cloud</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Operational
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-salesforce-gray-50 rounded-lg">
                <span className="text-sm font-medium text-salesforce-gray-900">Marketing Cloud</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Operational
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-salesforce-gray-50 rounded-lg">
                <span className="text-sm font-medium text-salesforce-gray-900">Service Cloud</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );