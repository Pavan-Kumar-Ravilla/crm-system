// src/components/common/Modal.js
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Button from './Button';

/**
 * SLDS Modal Component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {React.ReactNode} props.footer - Modal footer content
 * @param {string} props.size - Modal size: 'small', 'medium', 'large'
 * @param {boolean} props.closeOnBackdropClick - Whether to close on backdrop click
 * @param {boolean} props.closeOnEscape - Whether to close on escape key
 * @param {string} props.className - Additional CSS classes
 */
const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  footer,
  size = 'medium',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = ''
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  const sizeClasses = {
    small: 'slds-modal_small',
    medium: 'slds-modal_medium',
    large: 'slds-modal_large'
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (closeOnEscape && event.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, closeOnEscape, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement;
      
      // Focus the modal
      setTimeout(() => {
        if (modalRef.current) {
          const focusableElement = modalRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          focusableElement?.focus();
        }
      }, 100);
    } else {
      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen]);

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen) return;

    const handleTabKey = (event) => {
      if (event.key !== 'Tab') return;

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  const handleBackdropClick = (event) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose?.();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="slds-modal-backdrop slds-backdrop_open">
      <div
        className={`slds-modal slds-fade-in-open ${sizeClasses[size]} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-heading"
        onClick={handleBackdropClick}
      >
        <div className="slds-modal__container" ref={modalRef}>
          <header className="slds-modal__header">
            <button
              className="slds-button slds-button_icon slds-modal__close slds-button_icon-inverse"
              title="Close"
              onClick={onClose}
            >
              <X size={16} />
              <span className="slds-assistive-text">Close</span>
            </button>
            {title && (
              <h2 id="modal-heading" className="slds-modal__title slds-hyphenate">
                {title}
              </h2>
            )}
          </header>
          <div className="slds-modal__content slds-p-around_medium">
            {children}
          </div>
          {footer && (
            <footer className="slds-modal__footer">
              {footer}
            </footer>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

/**
 * Confirmation Modal Component
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'destructive',
  loading = false
}) => {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      footer={
        <div className="slds-grid slds-grid_align-end">
          <Button onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            loading={loading}
            className="slds-m-left_x-small"
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <p className="slds-text-body_regular">{message}</p>
    </Modal>
  );
};

/**
 * Alert Modal Component
 */
export const AlertModal = ({
  isOpen,
  onClose,
  title = 'Alert',
  message,
  variant = 'info',
  buttonText = 'OK'
}) => {
  const variantIcons = {
    info: '🛈',
    success: '✓',
    warning: '⚠',
    error: '✕'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="small"
      footer={
        <div className="slds-grid slds-grid_align-end">
          <Button variant="brand" onClick={onClose}>
            {buttonText}
          </Button>
        </div>
      }
    >
      <div className="slds-grid slds-grid_align-center">
        <div className="slds-m-right_medium">
          <span className="slds-text-heading_medium">
            {variantIcons[variant]}
          </span>
        </div>
        <div className="slds-col">
          <p className="slds-text-body_regular">{message}</p>
        </div>
      </div>
    </Modal>
  );
};

/**
 * Form Modal Component
 */
export const FormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = 'Save',
  cancelText = 'Cancel',
  loading = false,
  submitDisabled = false,
  size = 'medium'
}) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    if (onSubmit) {
      onSubmit(event);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      footer={
        <div className="slds-grid slds-grid_align-end">
          <Button onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            type="submit"
            variant="brand"
            loading={loading}
            disabled={submitDisabled}
            className="slds-m-left_x-small"
            onClick={handleSubmit}
          >
            {submitText}
          </Button>
        </div>
      }
    >
      {children}
    </Modal>
  );
};

export default Modal;