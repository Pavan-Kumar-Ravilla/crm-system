// src/components/dashboard/StatsCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  linkTo, 
  color = 'blue',
  subtitle,
  description 
}) => {
  const colorClasses = {
    blue: {
      bg: 'slds-theme_shade',
      border: 'slds-border_top slds-border_brand',
      icon: 'slds-icon-text-default',
      trend: trend > 0 ? 'slds-text-color_success' : 'slds-text-color_error'
    },
    green: {
      bg: 'slds-theme_shade',
      border: 'slds-border_top',
      borderColor: '#2e844a',
      icon: 'slds-icon-text-success',
      trend: trend > 0 ? 'slds-text-color_success' : 'slds-text-color_error'
    },
    purple: {
      bg: 'slds-theme_shade',
      border: 'slds-border_top',
      borderColor: '#8b46ff',
      icon: 'slds-icon-text-default',
      trend: trend > 0 ? 'slds-text-color_success' : 'slds-text-color_error'
    },
    orange: {
      bg: 'slds-theme_shade',
      border: 'slds-border_top',
      borderColor: '#ff8a3c',
      icon: 'slds-icon-text-warning',
      trend: trend > 0 ? 'slds-text-color_success' : 'slds-text-color_error'
    }
  };

  const colorClass = colorClasses[color] || colorClasses.blue;

  const formatValue = (val) => {
    if (typeof val === 'string' && val.startsWith('$')) {
      return val;
    }
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M';
      }
      if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'K';
      }
      return val.toLocaleString();
    }
    return val;
  };

  const CardContent = () => (
    <div 
      className={`slds-card ${colorClass.bg} ${colorClass.border}`}
      style={colorClass.borderColor ? { borderTopColor: colorClass.borderColor, borderTopWidth: '4px' } : {}}
    >
      <div className="slds-card__body slds-card__body_inner slds-p-around_medium">
        <div className="slds-grid slds-grid_align-spread slds-grid_vertical-align-center">
          <div className="slds-col">
            <div className="slds-grid slds-grid_vertical">
              <div className="slds-col">
                <h3 className="slds-text-heading_small slds-text-color_weak slds-m-bottom_x-small">
                  {title}
                </h3>
                <div className="slds-text-heading_large slds-text-color_default">
                  {formatValue(value)}
                </div>
                {subtitle && (
                  <p className="slds-text-body_small slds-text-color_weak slds-m-top_x-small">
                    {subtitle}
                  </p>
                )}
                {trend !== undefined && (
                  <div className={`slds-grid slds-grid_align-center slds-m-top_small ${colorClass.trend}`}>
                    {trend > 0 ? (
                      <TrendingUp size={16} className="slds-m-right_x-small" />
                    ) : (
                      <TrendingDown size={16} className="slds-m-right_x-small" />
                    )}
                    <span className="slds-text-body_small">
                      {Math.abs(trend)}% from last period
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="slds-col slds-no-flex">
            <div className={`slds-icon_container ${colorClass.icon}`}>
              {icon}
            </div>
          </div>
        </div>
        {description && (
          <div className="slds-m-top_small">
            <p className="slds-text-body_small slds-text-color_weak">
              {description}
            </p>
          </div>
        )}
      </div>
      {linkTo && (
        <div className="slds-card__footer">
          <div className="slds-text-align_center">
            <span className="slds-text-link slds-text-body_small">
              View Details →
            </span>
          </div>
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="slds-text-link_reset">
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
};

export default StatsCard;