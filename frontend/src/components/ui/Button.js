import React from 'react';
import classNames from 'classnames';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  onClick,
  type = 'button',
  className,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 border';

  const variantClasses = {
    primary: 'bg-salesforce-blue-600 hover:bg-salesforce-blue-700 text-white border-salesforce-blue-600 focus:ring-salesforce-blue-500',
    secondary: 'bg-white hover:bg-salesforce-gray-50 text-salesforce-gray-700 border-salesforce-gray-300 focus:ring-salesforce-blue-500',
    success: 'bg-green-600 hover:bg-green-700 text-white border-green-600 focus:ring-green-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600 focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600 focus:ring-yellow-500',
    ghost: 'bg-transparent hover:bg-salesforce-gray-100 text-salesforce-gray-700 border-transparent focus:ring-salesforce-blue-500',
    link: 'bg-transparent hover:underline text-salesforce-blue-600 border-transparent focus:ring-salesforce-blue-500 p-0',
  };

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed';
  const fullWidthClasses = 'w-full';

  const classes = classNames(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    {
      [disabledClasses]: disabled || loading,
      [fullWidthClasses]: fullWidth,
    },
    className
  );

  const iconClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <Loader2 className={classNames('animate-spin', iconClasses[size], { 'mr-2': children })} />
      )}
      {!loading && leftIcon && (
        <span className={classNames(iconClasses[size], { 'mr-2': children })}>
          {leftIcon}
        </span>
      )}
      {children}
      {!loading && rightIcon && (
        <span className={classNames(iconClasses[size], { 'ml-2': children })}>
          {rightIcon}
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;