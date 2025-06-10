import React from 'react';
import classNames from 'classnames';
import { AlertCircle } from 'lucide-react';

const Input = React.forwardRef(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  leftIcon,
  rightIcon,
  helpText,
  className,
  inputClassName,
  ...props
}, ref) => {
  const inputClasses = classNames(
    'block w-full rounded-md border-salesforce-gray-300 shadow-sm transition-colors duration-200',
    'focus:border-salesforce-blue-500 focus:ring-salesforce-blue-500 focus:ring-1',
    'placeholder-salesforce-gray-400',
    {
      'pr-10': rightIcon || error,
      'pl-10': leftIcon,
      'border-red-300 focus:border-red-500 focus:ring-red-500': error,
      'bg-salesforce-gray-100 cursor-not-allowed': disabled,
    },
    inputClassName
  );

  const labelClasses = classNames(
    'block text-sm font-medium text-salesforce-gray-700 mb-1',
    {
      'text-red-700': error,
    }
  );

  return (
    <div className={classNames('space-y-1', className)}>
      {label && (
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-salesforce-gray-400 w-5 h-5">
              {leftIcon}
            </span>
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          {...props}
        />
        
        {(rightIcon || error) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {error ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : (
              <span className="text-salesforce-gray-400 w-5 h-5">
                {rightIcon}
              </span>
            )}
          </div>
        )}
      </div>
      
      {(error || helpText) && (
        <p className={classNames('text-sm', {
          'text-red-600': error,
          'text-salesforce-gray-500': !error && helpText,
        })}>
          {error || helpText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;