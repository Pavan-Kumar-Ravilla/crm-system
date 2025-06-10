// src/components/common/Select.js
import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * SLDS Select Component
 * @param {Object} props - Component props
 * @param {string} props.label - Select label
 * @param {string} props.value - Selected value
 * @param {Function} props.onChange - Change handler
 * @param {Array} props.options - Array of option objects {value, label, disabled}
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Whether select is required
 * @param {boolean} props.disabled - Whether select is disabled
 * @param {string} props.error - Error message
 * @param {string} props.helpText - Help text
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Select size: 'small', 'medium', 'large'
 */
const Select = forwardRef(({
  label,
  value = '',
  onChange,
  options = [],
  placeholder = 'Choose one...',
  required = false,
  disabled = false,
  error,
  helpText,
  className = '',
  size = 'medium',
  ...props
}, ref) => {
  const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  const sizeClasses = {
    small: 'slds-select_small',
    medium: '',
    large: 'slds-select_large'
  };

  const selectClasses = [
    'slds-select',
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'slds-form-element',
    hasError ? 'slds-has-error' : '',
    disabled ? 'slds-is-disabled' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label className="slds-form-element__label" htmlFor={selectId}>
          {required && <abbr className="slds-required" title="required">*</abbr>}
          {label}
        </label>
      )}
      <div className="slds-form-element__control">
        <div className="slds-select_container">
          <select
            ref={ref}
            id={selectId}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={selectClasses}
            aria-describedby={
              [
                hasError ? `${selectId}-error` : '',
                helpText ? `${selectId}-help` : ''
              ].filter(Boolean).join(' ') || undefined
            }
            aria-invalid={hasError ? 'true' : 'false'}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option, index) => (
              <option
                key={option.value || index}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {helpText && !hasError && (
        <div className="slds-form-element__help" id={`${selectId}-help`}>
          {helpText}
        </div>
      )}
      {hasError && (
        <div className="slds-form-element__help" id={`${selectId}-error`}>
          {error}
        </div>
      )}
    </div>
  );
});

/**
 * Multi-Select Component (using native select with multiple)
 */
export const MultiSelect = forwardRef(({
  label,
  value = [],
  onChange,
  options = [],
  required = false,
  disabled = false,
  error,
  helpText,
  className = '',
  size = 4,
  ...props
}, ref) => {
  const selectId = `multiselect-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  const handleChange = (e) => {
    const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
    onChange && onChange({
      target: {
        value: selectedValues,
        name: e.target.name
      }
    });
  };

  const containerClasses = [
    'slds-form-element',
    hasError ? 'slds-has-error' : '',
    disabled ? 'slds-is-disabled' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label className="slds-form-element__label" htmlFor={selectId}>
          {required && <abbr className="slds-required" title="required">*</abbr>}
          {label}
        </label>
      )}
      <div className="slds-form-element__control">
        <select
          ref={ref}
          id={selectId}
          value={value}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          multiple
          size={size}
          className={`slds-select ${className}`}
          aria-describedby={
            [
              hasError ? `${selectId}-error` : '',
              helpText ? `${selectId}-help` : ''
            ].filter(Boolean).join(' ') || undefined
          }
          aria-invalid={hasError ? 'true' : 'false'}
          {...props}
        >
          {options.map((option, index) => (
            <option
              key={option.value || index}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {helpText && !hasError && (
        <div className="slds-form-element__help" id={`${selectId}-help`}>
          {helpText}
        </div>
      )}
      {hasError && (
        <div className="slds-form-element__help" id={`${selectId}-error`}>
          {error}
        </div>
      )}
    </div>
  );
});

/**
 * Checkbox Component
 */
export const Checkbox = forwardRef(({
  label,
  checked = false,
  onChange,
  disabled = false,
  error,
  helpText,
  className = '',
  ...props
}, ref) => {
  const checkboxId = `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  const containerClasses = [
    'slds-form-element',
    hasError ? 'slds-has-error' : '',
    disabled ? 'slds-is-disabled' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className="slds-form-element__control">
        <div className="slds-checkbox">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className={className}
            aria-describedby={
              [
                hasError ? `${checkboxId}-error` : '',
                helpText ? `${checkboxId}-help` : ''
              ].filter(Boolean).join(' ') || undefined
            }
            {...props}
          />
          <label className="slds-checkbox__label" htmlFor={checkboxId}>
            <span className="slds-checkbox_faux"></span>
            <span className="slds-form-element__label">{label}</span>
          </label>
        </div>
      </div>
      {helpText && !hasError && (
        <div className="slds-form-element__help" id={`${checkboxId}-help`}>
          {helpText}
        </div>
      )}
      {hasError && (
        <div className="slds-form-element__help" id={`${checkboxId}-error`}>
          {error}
        </div>
      )}
    </div>
  );
});

/**
 * Radio Group Component
 */
export const RadioGroup = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error,
  helpText,
  className = ''
}) => {
  const groupId = `radio-group-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  const containerClasses = [
    'slds-form-element',
    hasError ? 'slds-has-error' : '',
    disabled ? 'slds-is-disabled' : ''
  ].filter(Boolean).join(' ');

  return (
    <fieldset className={containerClasses}>
      {label && (
        <legend className="slds-form-element__legend slds-form-element__label">
          {required && <abbr className="slds-required" title="required">*</abbr>}
          {label}
        </legend>
      )}
      <div className="slds-form-element__control">
        {options.map((option, index) => {
          const radioId = `${groupId}-${index}`;
          return (
            <div key={option.value || index} className="slds-radio">
              <input
                type="radio"
                id={radioId}
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={onChange}
                disabled={disabled || option.disabled}
                className={className}
              />
              <label className="slds-radio__label" htmlFor={radioId}>
                <span className="slds-radio_faux"></span>
                <span className="slds-form-element__label">{option.label}</span>
              </label>
            </div>
          );
        })}
      </div>
      {helpText && !hasError && (
        <div className="slds-form-element__help">
          {helpText}
        </div>
      )}
      {hasError && (
        <div className="slds-form-element__help">
          {error}
        </div>
      )}
    </fieldset>
  );
};

Select.displayName = 'Select';
MultiSelect.displayName = 'MultiSelect';
Checkbox.displayName = 'Checkbox';

export default Select;