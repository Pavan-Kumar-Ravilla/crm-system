// src/components/common/Button.js
import React from 'react';
import Spinner from './Spinner';

/**
 * SLDS Button Component
 * @param {Object} props - Component props
 * @param {string} props.variant - Button variant: 'base', 'neutral', 'brand', 'outline-brand', 'destructive', 'text-destructive', 'success', 'inverse'
 * @param {string} props.size - Button size: 'small', 'medium', 'large'
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.loading - Whether button is in loading state
 * @param {React.ReactNode} props.icon - Icon element to display
 * @param {string} props.iconPosition - Icon position: 'left', 'right'
 * @param {boolean} props.iconOnly - Whether button only contains an icon
 * @param {string} props.type - Button type: 'button', 'submit', 'reset'
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Click handler
 * @param {React.ReactNode} props.children - Button content
 */
const Button = ({
  variant = 'neutral',
  size = 'medium',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  iconOnly = false,
  type = 'button',
  className = '',
  onClick,
  children,
  ...props
}) => {
  const baseClasses = 'slds-button';
  
  const variantClasses = {
    base: '',
    neutral: 'slds-button_neutral',
    brand: 'slds-button_brand',
    'outline-brand': 'slds-button_outline-brand',
    destructive: 'slds-button_destructive',
    'text-destructive': 'slds-button_text-destructive',
    success: 'slds-button_success',
    inverse: 'slds-button_inverse'
  };

  const sizeClasses = {
    small: 'slds-button_small',
    medium: '',
    large: 'slds-button_stretch'
  };

  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    iconOnly ? 'slds-button_icon' : '',
    iconOnly && size === 'small' ? 'slds-button_icon-small' : '',
    iconOnly && size === 'large' ? 'slds-button_icon-large' : '',
    className
  ].filter(Boolean).join(' ');

  const isDisabled = disabled || loading;

  const renderIcon = () => {
    if (loading) {
      return (
        <span className={`slds-button__icon ${iconPosition === 'right' ? 'slds-button__icon_right' : 'slds-button__icon_left'}`}>
          <div className="slds-spinner slds-spinner_x-small slds-spinner_inverse">
            <span className="slds-assistive-text">Loading</span>
            <div className="slds-spinner__dot-a"></div>
            <div className="slds-spinner__dot-b"></div>
          </div>
        </span>
      );
    }

    if (icon) {
      return (
        <span className={`slds-button__icon ${iconPosition === 'right' ? 'slds-button__icon_right' : 'slds-button__icon_left'}`}>
          {icon}
        </span>
      );
    }

    return null;
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {iconPosition === 'left' && renderIcon()}
      {!iconOnly && children}
      {iconPosition === 'right' && renderIcon()}
    </button>
  );
};

/**
 * Button Group Component
 */
export const ButtonGroup = ({ children, className = '' }) => {
  return (
    <div className={`slds-button-group ${className}`} role="group">
      {children}
    </div>
  );
};

/**
 * Icon Button Component
 */
export const IconButton = ({ 
  icon, 
  title, 
  variant = 'neutral',
  size = 'medium',
  ...props 
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      iconOnly={true}
      icon={icon}
      title={title}
      aria-label={title}
      {...props}
    />
  );
};

export default Button;