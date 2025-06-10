// src/components/common/Spinner.js
import React from 'react';

/**
 * SLDS Spinner Component
 * @param {Object} props - Component props
 * @param {string} props.size - Spinner size: 'xx-small', 'x-small', 'small', 'medium', 'large'
 * @param {string} props.variant - Spinner variant: 'base', 'brand', 'inverse'
 * @param {boolean} props.inline - Whether spinner is inline or container
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.assistiveText - Screen reader text
 */
const Spinner = ({ 
  size = 'medium', 
  variant = 'brand',
  inline = false,
  className = '',
  assistiveText = 'Loading'
}) => {
  const sizeClasses = {
    'xx-small': 'slds-spinner_xx-small',
    'x-small': 'slds-spinner_x-small',
    'small': 'slds-spinner_small',
    'medium': 'slds-spinner_medium',
    'large': 'slds-spinner_large'
  };

  const variantClasses = {
    'base': '',
    'brand': 'slds-spinner_brand',
    'inverse': 'slds-spinner_inverse'
  };

  const containerClass = inline ? 'slds-spinner_container slds-is-relative' : 'slds-spinner_container';
  const spinnerClasses = [
    'slds-spinner',
    sizeClasses[size],
    variantClasses[variant],
    className
  ].filter(Boolean).join(' ');

  if (inline) {
    return (
      <div className={containerClass}>
        <div role="status" className={spinnerClasses}>
          <span className="slds-assistive-text">{assistiveText}</span>
          <div className="slds-spinner__dot-a"></div>
          <div className="slds-spinner__dot-b"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div role="status" className={spinnerClasses}>
        <span className="slds-assistive-text">{assistiveText}</span>
        <div className="slds-spinner__dot-a"></div>
        <div className="slds-spinner__dot-b"></div>
      </div>
    </div>
  );
};

/**
 * Button with spinner for loading states
 */
export const SpinnerButton = ({ 
  loading = false, 
  children, 
  disabled = false,
  className = '',
  spinnerSize = 'x-small',
  spinnerVariant = 'inverse',
  ...props 
}) => {
  const isDisabled = loading || disabled;
  const buttonClasses = [
    'slds-button',
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      {...props}
      disabled={isDisabled}
      className={buttonClasses}
    >
      {loading && (
        <span className="slds-button__icon slds-button__icon_left">
          <div className={`slds-spinner slds-spinner_${spinnerSize} ${spinnerVariant === 'inverse' ? 'slds-spinner_inverse' : ''}`}>
            <span className="slds-assistive-text">Loading</span>
            <div className="slds-spinner__dot-a"></div>
            <div className="slds-spinner__dot-b"></div>
          </div>
        </span>
      )}
      {children}
    </button>
  );
};

/**
 * Page-level loading spinner
 */
export const PageSpinner = ({ message = 'Loading...' }) => (
  <div className="slds-scope">
    <div 
      className="slds-grid slds-grid_align-center slds-grid_vertical-align-center"
      style={{ 
        minHeight: '50vh',
        backgroundColor: 'rgba(255, 255, 255, 0.8)'
      }}
    >
      <div className="slds-col slds-text-align_center">
        <Spinner size="large" />
        <div className="slds-m-top_medium">
          <p className="slds-text-body_regular slds-text-color_weak">
            {message}
          </p>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Overlay spinner for covering content
 */
export const OverlaySpinner = ({ 
  show = true, 
  message = 'Loading...',
  backdrop = true 
}) => {
  if (!show) return null;

  return (
    <div 
      className={`slds-backdrop ${backdrop ? 'slds-backdrop_open' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: backdrop ? 'rgba(0, 0, 0, 0.5)' : 'transparent'
      }}
    >
      <div className="slds-align_absolute-center">
        <div className="slds-text-align_center">
          <Spinner size="large" variant="inverse" />
          {message && (
            <div className="slds-m-top_medium">
              <p className="slds-text-body_regular slds-text-color_inverse">
                {message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Card loading state
 */
export const CardSpinner = ({ height = '200px' }) => (
  <div 
    className="slds-card slds-grid slds-grid_align-center slds-grid_vertical-align-center"
    style={{ height }}
  >
    <div className="slds-col">
      <Spinner size="small" />
    </div>
  </div>
);

/**
 * Table loading state
 */
export const TableSpinner = ({ rows = 5, columns = 4 }) => (
  <div className="slds-table_edit_container">
    <table className="slds-table slds-table_cell-buffer slds-table_bordered">
      <tbody>
        {Array.from({ length: rows }, (_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: columns }, (_, colIndex) => (
              <td key={colIndex}>
                <div className="slds-grid slds-grid_align-center">
                  <div className="slds-spinner slds-spinner_x-small">
                    <span className="slds-assistive-text">Loading</span>
                    <div className="slds-spinner__dot-a"></div>
                    <div className="slds-spinner__dot-b"></div>
                  </div>
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/**
 * List loading state
 */
export const ListSpinner = ({ items = 5 }) => (
  <div className="slds-list_vertical slds-has-dividers_top-space">
    {Array.from({ length: items }, (_, index) => (
      <div key={index} className="slds-list__item slds-p-vertical_small">
        <div className="slds-grid slds-grid_align-center">
          <div className="slds-col">
            <div className="slds-grid slds-grid_align-center">
              <div className="slds-m-right_small">
                <Spinner size="x-small" />
              </div>
              <div className="slds-col">
                <div 
                  className="slds-placeholder"
                  style={{
                    height: '1rem',
                    backgroundColor: '#f3f2f2',
                    borderRadius: '0.25rem',
                    width: `${Math.random() * 50 + 50}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default Spinner;