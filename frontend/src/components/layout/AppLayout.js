import React from 'react';
import { Outlet } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import Sidebar from './Sidebar';
import Header from './Header';
import Breadcrumbs from './Breadcrumbs';

const AppLayout = () => {
  const { sidebarCollapsed } = useApp();

  return (
    <div className="h-screen flex bg-salesforce-gray-50">
      <Sidebar />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <Header />
        
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <Breadcrumbs />
            
            <main className="flex-1 overflow-y-auto bg-salesforce-gray-50 px-6 py-4">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;