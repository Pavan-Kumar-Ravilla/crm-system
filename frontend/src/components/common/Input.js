// src/components/common/Input.js
import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * SLDS Input Component
 * @param {Object} props - Component props
 * @param {string} props.label - Input label
 * @param {string} props.type - Input type
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - Input placeholder
 * @param {boolean} props.required - Whether input is required
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {boolean} props.readOnly - Whether input is read-only
 * @param {string} props.error - Error message
 * @param {string} props.helpText - Help text
 * @param {React.ReactNode} props.leftIcon - Left icon element
 * @param {React.ReactNode} props.rightIcon - Right icon element
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Input size: 'small', 'medium', 'large'
 */
const Input = forwardRef(({
  label,
  type = 'text',
  value = '',
  onChange,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  error,
  helpText,
  leftIcon,
  rightIcon,
  className = '',
  size = 'medium',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const isPassword = type === 'password';
  const actualType = isPassword && showPassword ? 'text' : type;
  
  const hasError = !!error;
  const hasIcons = !!(leftIcon || rightIcon || isPassword);

  const sizeClasses = {
    small: 'slds-input_small',
    medium: '',
    large: 'slds-input_large'
  };

  const inputClasses = [
    'slds-input',
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'slds-form-element',
    hasError ? 'slds-has-error' : '',
    disabled ? 'slds-is-disabled' : ''
  ].filter(Boolean).join(' ');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const renderPasswordToggle = () => {
    if (!isPassword) return null;

    return (
      <button
        type="button"
        className="slds-button slds-button_icon slds-input__icon slds-input__icon_right"
        onClick={togglePasswordVisibility}
        tabIndex="-1"
        title={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        <span className="slds-assistive-text">
          {showPassword ? 'Hide password' : 'Show password'}
        </span>
      </button>
    );
  };

  const renderInput = () => {
    const input = (
      <input
        ref={ref}
        id={inputId}
        type={actualType}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        className={inputClasses}
        aria-describedby={
          [
            hasError ? `${inputId}-error` : '',
            helpText ? `${inputId}-help` : ''
          ].filter(Boolean).join(' ') || undefined
        }
        aria-invalid={hasError ? 'true' : 'false'}
        {...props}
      />
    );

    if (hasIcons) {
      return (
        <div className="slds-input-has-icon slds-input-has-icon_left-right">
          {leftIcon && (
            <span className="slds-icon_container slds-icon-utility-search slds-input__icon slds-input__icon_left">
              {leftIcon}
            </span>
          )}
          {input}
          {rightIcon && !isPassword && (
            <span className="slds-icon_container slds-input__icon slds-input__icon_right">
              {rightIcon}
            </span>
          )}
          {renderPasswordToggle()}
        </div>
      );
    }

    return input;
  };

  return (
    <div className={containerClasses}>
      {label && (
        <label className="slds-form-element__label" htmlFor={inputId}>
          {required && <abbr className="slds-required" title="required">*</abbr>}
          {label}
        </label>
      )}
      <div className="slds-form-element__control">
        {renderInput()}
      </div>
      {helpText && !hasError && (
        <div className="slds-form-element__help" id={`${inputId}-help`}>
          {helpText}
        </div>
      )}
      {hasError && (
        <div className="slds-form-element__help" id={`${inputId}-error`}>
          {error}
        </div>
      )}
    </div>
  );
});

/**
 * Textarea Component
 */
export const Textarea = forwardRef(({
  label,
  value = '',
  onChange,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  error,
  helpText,
  rows = 3,
  className = '',
  ...props
}, ref) => {
  const textareaId = `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  const containerClasses = [
    'slds-form-element',
    hasError ? 'slds-has-error' : '',
    disabled ? 'slds-is-disabled' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label className="slds-form-element__label" htmlFor={textareaId}>
          {required && <abbr className="slds-required" title="required">*</abbr>}
          {label}
        </label>
      )}
      <div className="slds-form-element__control">
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          rows={rows}
          className={`slds-textarea ${className}`}
          aria-describedby={
            [
              hasError ? `${textareaId}-error` : '',
              helpText ? `${textareaId}-help` : ''
            ].filter(Boolean).join(' ') || undefined
          }
          aria-invalid={hasError ? 'true' : 'false'}
          {...props}
        />
      </div>
      {helpText && !hasError && (
        <div className="slds-form-element__help" id={`${textareaId}-help`}>
          {helpText}
        </div>
      )}
      {hasError && (
        <div className="slds-form-element__help" id={`${textareaId}-error`}>
          {error}
        </div>
      )}
    </div>
  );
});

/**
 * Search Input Component
 */
export const SearchInput = ({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search...',
  className = '',
  ...props
}) => {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: '' } });
    }
  };

  return (
    <div className={`slds-form-element ${className}`}>
      <div className="slds-form-element__control slds-input-has-icon slds-input-has-icon_left-right">
        <span className="slds-icon_container slds-icon-utility-search slds-input__icon slds-input__icon_left">
          <svg className="slds-icon slds-icon_x-small slds-icon-text-default" aria-hidden="true">
            <use href="#utility-search"></use>
          </svg>
        </span>
        <input
          type="search"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="slds-input"
          {...props}
        />
        {value && (
          <button
            type="button"
            className="slds-button slds-button_icon slds-input__icon slds-input__icon_right"
            onClick={handleClear}
            title="Clear search"
          >
            <svg className="slds-icon slds-icon_x-small" aria-hidden="true">
              <use href="#utility-clear"></use>
            </svg>
            <span className="slds-assistive-text">Clear search</span>
          </button>
        )}
      </div>
    </div>
  );
};

Input.displayName = 'Input';
Textarea.displayName = 'Textarea';

export default Input;