// src/components/layout/Header.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  ChevronDown,
  Plus,
  Grid3X3
} from 'lucide-react';

const Header = ({ onToggleSidebar, sidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const { notifications } = useApp();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <header className="slds-global-header_container">
      <div className="slds-global-header slds-grid slds-grid_align-spread">
        {/* Left side */}
        <div className="slds-global-header__item">
          <div className="slds-grid slds-grid_vertical-align-center">
            {/* Menu toggle */}
            <button
              className="slds-button slds-button_icon slds-global-header__button_icon"
              title={sidebarCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
              onClick={onToggleSidebar}
            >
              <Menu size={16} />
              <span className="slds-assistive-text">Toggle Navigation</span>
            </button>

            {/* Logo/Brand */}
            <div className="slds-global-header__logo">
              <Link to="/dashboard" className="slds-text-link_reset">
                <div className="slds-grid slds-grid_vertical-align-center">
                  <Grid3X3 size={24} className="slds-m-right_small" />
                  <span className="slds-text-heading_small">CRM System</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Center - Search */}
        <div className="slds-global-header__item slds-global-header__item_search">
          <div className="slds-form-element">
            <div className="slds-form-element__control slds-input-has-icon slds-input-has-icon_left-right">
              <span className="slds-icon_container slds-icon-utility-search slds-input__icon slds-input__icon_left">
                <Search size={16} />
              </span>
              <input
                type="search"
                className="slds-input"
                placeholder="Search accounts, contacts, opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ minWidth: '400px' }}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="slds-button slds-button_icon slds-input__icon slds-input__icon_right"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <span className="slds-icon_container">×</span>
                  <span className="slds-assistive-text">Clear search</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="slds-global-header__item">
          <div className="slds-grid slds-grid_vertical-align-center">
            {/* Create new button */}
            <div className="slds-dropdown-trigger slds-dropdown-trigger_click slds-m-right_small">
              <button
                className="slds-button slds-button_icon slds-button_icon-brand slds-global-header__button_icon"
                title="Create New"
              >
                <Plus size={16} />
                <span className="slds-assistive-text">Create New</span>
              </button>
            </div>

            {/* Notifications */}
            <div className="slds-dropdown-trigger slds-dropdown-trigger_click slds-m-right_small">
              <button
                className="slds-button slds-button_icon slds-global-header__button_icon"
                title="Notifications"
                onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
              >
                <Bell size={16} />
                {unreadNotifications > 0 && (
                  <span className="slds-notification-badge">
                    {unreadNotifications}
                  </span>
                )}
                <span className="slds-assistive-text">Notifications</span>
              </button>

              {notificationMenuOpen && (
                <div className="slds-dropdown slds-dropdown_right slds-dropdown_actions">
                  <div className="slds-dropdown__header">
                    <h3 className="slds-text-heading_small">Notifications ({unreadNotifications})</h3>
                  </div>
                  <ul className="slds-dropdown__list" role="menu">
                    {notifications.length === 0 ? (
                      <li className="slds-dropdown__item" role="presentation">
                        <span className="slds-truncate slds-p-horizontal_medium slds-p-vertical_small">
                          No notifications
                        </span>
                      </li>
                    ) : (
                      notifications.slice(0, 5).map((notification, index) => (
                        <li key={index} className="slds-dropdown__item" role="presentation">
                          <div className="slds-p-horizontal_medium slds-p-vertical_small">
                            <div className="slds-grid slds-grid_align-spread">
                              <div className="slds-col">
                                <p className="slds-text-body_small">{notification.title}</p>
                                <p className="slds-text-body_small slds-text-color_weak">
                                  {notification.message}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="slds-col slds-no-flex">
                                  <span className="slds-icon_container slds-icon_xx-small">
                                    <div className="slds-badge slds-badge_inverse">New</div>
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                  {notifications.length > 5 && (
                    <div className="slds-dropdown__footer">
                      <Link to="/notifications" className="slds-text-link">
                        View All Notifications
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="slds-m-right_small">
              <Link to="/settings">
                <button
                  className="slds-button slds-button_icon slds-global-header__button_icon"
                  title="Settings"
                >
                  <Settings size={16} />
                  <span className="slds-assistive-text">Settings</span>
                </button>
              </Link>
            </div>

            {/* User menu */}
            <div className="slds-dropdown-trigger slds-dropdown-trigger_click">
              <button
                className="slds-button slds-button_icon slds-global-header__button_icon"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                title="User Menu"
              >
                <User size={16} />
                <ChevronDown size={12} className="slds-m-left_xx-small" />
                <span className="slds-assistive-text">User Menu</span>
              </button>

              {userMenuOpen && (
                <div className="slds-dropdown slds-dropdown_right slds-dropdown_actions">
                  <div className="slds-dropdown__header">
                    <div className="slds-grid slds-grid_vertical-align-center">
                      <div className="slds-avatar slds-avatar_circle slds-avatar_medium slds-m-right_small">
                        <User size={20} />
                      </div>
                      <div>
                        <h3 className="slds-text-heading_small">
                          {user?.firstName} {user?.lastName}
                        </h3>
                        <p className="slds-text-body_small slds-text-color_weak">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <ul className="slds-dropdown__list" role="menu">
                    <li className="slds-dropdown__item" role="presentation">
                      <Link 
                        to="/profile" 
                        className="slds-dropdown__link" 
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <span className="slds-truncate">
                          <User size={16} className="slds-m-right_small" />
                          My Profile
                        </span>
                      </Link>
                    </li>
                    <li className="slds-dropdown__item" role="presentation">
                      <Link 
                        to="/settings" 
                        className="slds-dropdown__link" 
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <span className="slds-truncate">
                          <Settings size={16} className="slds-m-right_small" />
                          Settings
                        </span>
                      </Link>
                    </li>
                    <li className="slds-dropdown__item" role="presentation">
                      <div className="slds-dropdown__link slds-dropdown__link_divider"></div>
                    </li>
                    <li className="slds-dropdown__item" role="presentation">
                      <button 
                        className="slds-dropdown__link" 
                        role="menuitem"
                        onClick={handleLogout}
                      >
                        <span className="slds-truncate">
                          <LogOut size={16} className="slds-m-right_small" />
                          Logout
                        </span>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;