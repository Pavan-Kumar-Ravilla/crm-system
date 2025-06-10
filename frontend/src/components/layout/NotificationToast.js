// src/components/layout/NotificationToast.js
import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationToast = ({ notification, style }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { removeNotification } = useApp();

  useEffect(() => {
    // Show animation
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-hide timer
    const autoHideTimer = setTimeout(() => {
      handleClose();
    }, notification.duration || 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(autoHideTimer);
    };
  }, [notification.duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      removeNotification(notification.id);
    }, 300);
  };

  const getToastConfig = () => {
    const type = notification.type || 'info';
    
    const configs = {
      success: {
        theme: 'slds-notify_toast slds-theme_success',
        icon: <CheckCircle size={16} />,
        iconClass: 'slds-icon-utility-success'
      },
      error: {
        theme: 'slds-notify_toast slds-theme_error',
        icon: <AlertCircle size={16} />,
        iconClass: 'slds-icon-utility-error'
      },
      warning: {
        theme: 'slds-notify_toast slds-theme_warning',
        icon: <AlertTriangle size={16} />,
        iconClass: 'slds-icon-utility-warning'
      },
      info: {
        theme: 'slds-notify_toast slds-theme_info',
        icon: <Info size={16} />,
        iconClass: 'slds-icon-utility-info'
      }
    };

    return configs[type] || configs.info;
  };

  const config = getToastConfig();

  return (
    <div 
      className={`slds-notify_container slds-is-fixed ${isVisible ? 'slds-show' : ''} ${isClosing ? 'slds-hide' : ''}`}
      style={{ 
        position: 'fixed',
        top: 'auto',
        right: '1rem',
        bottom: '1rem',
        zIndex: 9999,
        maxWidth: '400px',
        transition: 'all 0.3s ease-in-out',
        transform: `translateX(${isVisible && !isClosing ? '0' : '100%'})`,
        opacity: isVisible && !isClosing ? 1 : 0,
        ...style
      }}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className={config.theme}>
        <div className="slds-notify__content">
          <div className="slds-grid slds-grid_align-spread">
            <div className="slds-col slds-align-middle">
              <div className="slds-grid slds-grid_align-center">
                <span className={`slds-icon_container ${config.iconClass} slds-m-right_small`}>
                  {config.icon}
                </span>
                <div>
                  {notification.title && (
                    <h2 className="slds-text-heading_small">
                      {notification.title}
                    </h2>
                  )}
                  <div className="slds-text-body_regular">
                    {notification.message}
                  </div>
                </div>
              </div>
            </div>
            <div className="slds-col slds-col_bump-left">
              <button
                className="slds-button slds-button_icon slds-notify__close"
                title="Close"
                onClick={handleClose}
              >
                <X size={16} />
                <span className="slds-assistive-text">Close</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;