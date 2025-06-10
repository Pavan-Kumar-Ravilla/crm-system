// src/components/layout/AppLayout.js
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Navigation from './Navigation';
import Header from './Header';
import NotificationToast from './NotificationToast';

const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const { notifications } = useApp();
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="slds-scope">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/design-system/2.25.1/styles/salesforce-lightning-design-system.min.css" />
      
      <div className="slds-grid slds-grid_frame slds-grid_vertical">
        {/* Global Header */}
        <Header onToggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
        
        <div className="slds-grid slds-grid_frame">
          {/* Sidebar Navigation */}
          <Navigation collapsed={sidebarCollapsed} currentPath={location.pathname} />
          
          {/* Main Content Area */}
          <div className={`slds-col slds-grow slds-p-around_none ${sidebarCollapsed ? '' : 'slds-size_5-of-6'}`}>
            <main className="slds-grid slds-grid_vertical slds-grid_frame" style={{ minHeight: 'calc(100vh - 3.25rem)' }}>
              <div className="slds-col slds-grow slds-scrollable_y">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Notification Toasts */}
      <div className="slds-notify_container slds-is-fixed">
        {notifications.map((notification, index) => (
          <NotificationToast
            key={notification.id || index}
            notification={notification}
            style={{ bottom: `${index * 80 + 20}px` }}
          />
        ))}
      </div>
    </div>
  );
};