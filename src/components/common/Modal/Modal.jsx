import React, { useEffect, useRef } from 'react';
import './Modal.css';

const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  size = 'medium',
  variant = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  preventScroll = true,
  animation = 'fade',
  className = '',
  overlayClassName = '',
  contentClassName = '',
  actions,
  hideHeader = false,
  icon
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (closeOnEscape && event.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      previousActiveElement.current = document.activeElement;
      
      if (preventScroll) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (preventScroll) {
        document.body.style.overflow = '';
      }
      
      // Restore focus when modal closes
      if (previousActiveElement.current) {
        previousActiveElement.current.focus?.();
      }
    };
  }, [isOpen, closeOnEscape, preventScroll, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  const handleOverlayClick = (event) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose?.();
    }
  };

  const handleClose = () => {
    onClose?.();
  };

  if (!isOpen) return null;

  const modalClass = `
    modal
    modal-size-${size}
    modal-variant-${variant}
    modal-animation-${animation}
    ${className}
  `.trim();

  const overlayClass = `
    modal-overlay
    ${overlayClassName}
  `.trim();

  const contentClass = `
    modal-content
    ${contentClassName}
  `.trim();

  return (
    <div 
      className={overlayClass}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        ref={modalRef}
        className={modalClass}
        tabIndex={-1}
      >
        {/* Header */}
        {!hideHeader && (
          <div className="modal-header">
            <div className="modal-header-content">
              {icon && <div className="modal-icon">{icon}</div>}
              {title && (
                <h2 id="modal-title" className="modal-title">
                  {title}
                </h2>
              )}
            </div>
            
            {showCloseButton && (
              <button
                className="modal-close-button"
                onClick={handleClose}
                aria-label="Close modal"
              >
                <span className="close-icon">×</span>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={contentClass}> {/* ✅ FIXED: Now using contentClass */}
          {children}
        </div>

        {/* Footer with Actions */}
        {actions && (
          <div className="modal-footer">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

// Pre-built modal components for common use cases
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
  icon = "⚠️",
  isLoading = false
}) => {
  const actions = (
    <>
      <button
        className="modal-button modal-button-secondary"
        onClick={onClose}
        disabled={isLoading}
      >
        {cancelText}
      </button>
      <button
        className={`modal-button modal-button-primary modal-button-${variant}`}
        onClick={onConfirm}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="button-loading">
            <div className="button-spinner"></div>
            Processing...
          </div>
        ) : (
          confirmText
        )}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      variant={variant}
      icon={icon}
      actions={actions}
      size="small"
    >
      <div className="confirm-modal-content">
        <div className="confirm-message">{message}</div>
      </div>
    </Modal>
  );
};

export const AlertModal = ({
  isOpen,
  onClose,
  title = "Alert",
  message,
  variant = "info",
  icon = "ℹ️",
  buttonText = "OK"
}) => {
  const actions = (
    <button
      className={`modal-button modal-button-primary modal-button-${variant}`}
      onClick={onClose}
    >
      {buttonText}
    </button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      variant={variant}
      icon={icon}
      actions={actions}
      size="small"
    >
      <div className="alert-modal-content">
        <div className="alert-message">{message}</div>
      </div>
    </Modal>
  );
};

export const FormModal = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = "Save",
  cancelText = "Cancel",
  variant = "primary",
  isLoading = false,
  size = "medium"
}) => {
  const actions = (
    <>
      <button
        className="modal-button modal-button-secondary"
        onClick={onClose}
        disabled={isLoading}
        type="button"
      >
        {cancelText}
      </button>
      <button
        className={`modal-button modal-button-primary modal-button-${variant}`}
        disabled={isLoading}
        type="submit"
      >
        {isLoading ? (
          <div className="button-loading">
            <div className="button-spinner"></div>
            Saving...
          </div>
        ) : (
          submitText
        )}
      </button>
    </>
  );

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      variant={variant}
      actions={actions}
      size={size}
    >
      <form onSubmit={handleFormSubmit} className="form-modal-content">
        {children}
      </form>
    </Modal>
  );
};

export const FullscreenModal = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  className = ''
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="fullscreen"
      showCloseButton={showCloseButton}
      className={className}
      hideHeader={false}
    >
      {children}
    </Modal>
  );
};

export default Modal;