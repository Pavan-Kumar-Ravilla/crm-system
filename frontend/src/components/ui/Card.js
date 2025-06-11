import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle, 
  header, 
  footer, 
  className = '', 
  padding = 'default',
  shadow = 'default'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    default: 'shadow-sm',
    lg: 'shadow-lg'
  };
  
  const cardClasses = `
    bg-white rounded-lg border border-gray-200 
    ${shadowClasses[shadow]} 
    ${paddingClasses[padding]}
    ${className}
  `.trim();

  return (
    <div className={cardClasses}>
      {(title || subtitle || header) && (
        <div className="mb-4">
          {header}
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      
      <div className="flex-1">
        {children}
      </div>
      
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;