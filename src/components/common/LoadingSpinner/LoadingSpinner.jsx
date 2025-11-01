import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({
  size = 'medium',
  variant = 'primary',
  type = 'spinner',
  text = 'Loading...',
  overlay = false,
  fullScreen = false,
  className = ''
}) => {
  // Size classes
  const sizeClasses = {
    small: 'loading-spinner-small',
    medium: 'loading-spinner-medium',
    large: 'loading-spinner-large',
    xlarge: 'loading-spinner-xlarge'
  };

  // Variant classes
  const variantClasses = {
    primary: 'loading-variant-primary',
    secondary: 'loading-variant-secondary',
    success: 'loading-variant-success',
    warning: 'loading-variant-warning',
    danger: 'loading-variant-danger',
    light: 'loading-variant-light',
    dark: 'loading-variant-dark'
  };

  const spinnerClass = `
    loading-spinner 
    ${sizeClasses[size]} 
    ${variantClasses[variant]}
    ${className}
  `.trim();

  const containerClass = `
    loading-container
    ${overlay ? 'loading-overlay' : ''}
    ${fullScreen ? 'loading-fullscreen' : ''}
  `.trim();

  // Render different spinner types
  const renderSpinner = () => {
    switch (type) {
      case 'dots':
        return (
          <div className={`dots-loader ${spinnerClass}`}>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        );

      case 'pulse':
        return (
          <div className={`pulse-loader ${spinnerClass}`}>
            <div className="pulse-circle"></div>
          </div>
        );

      case 'bounce':
        return (
          <div className={`bounce-loader ${spinnerClass}`}>
            <div className="bounce-dot"></div>
            <div className="bounce-dot"></div>
            <div className="bounce-dot"></div>
          </div>
        );

      case 'progress':
        return (
          <div className={`progress-loader ${spinnerClass}`}>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
        );

      case 'skeleton':
        return (
          <div className={`skeleton-loader ${spinnerClass}`}>
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
            <div className="skeleton-line medium"></div>
          </div>
        );

      case 'gear':
        return (
          <div className={`gear-loader ${spinnerClass}`}>
            <div className="gear">⚙️</div>
          </div>
        );

      case 'hourglass':
        return (
          <div className={`hourglass-loader ${spinnerClass}`}>
            <div className="hourglass">⏳</div>
          </div>
        );

      default: // spinner
        return (
          <div className={`spinner-loader ${spinnerClass}`}>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
        );
    }
  };

  if (fullScreen) {
    return (
      <div className="loading-fullscreen-container">
        <div className={containerClass}>
          <div className="loading-content">
            {renderSpinner()}
            {text && <div className="loading-text">{text}</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className="loading-content">
        {renderSpinner()}
        {text && <div className="loading-text">{text}</div>}
      </div>
    </div>
  );
};

// Specialized loading components for common use cases
export const PageLoader = ({ text = 'Loading page...' }) => (
  <LoadingSpinner
    type="spinner"
    variant="primary"
    size="large"
    text={text}
    fullScreen={true}
  />
);

export const TableLoader = ({ rowCount = 5 }) => (
  <div className="table-loader">
    {Array.from({ length: rowCount }, (_, index) => (
      <div key={index} className="table-row-skeleton">
        <div className="table-cell-skeleton"></div>
        <div className="table-cell-skeleton"></div>
        <div className="table-cell-skeleton"></div>
        <div className="table-cell-skeleton short"></div>
      </div>
    ))}
  </div>
);

export const CardLoader = () => (
  <div className="card-loader">
    <div className="card-skeleton">
      <div className="card-header-skeleton"></div>
      <div className="card-body-skeleton">
        <div className="skeleton-line"></div>
        <div className="skeleton-line short"></div>
        <div className="skeleton-line medium"></div>
      </div>
      <div className="card-footer-skeleton">
        <div className="skeleton-button"></div>
        <div className="skeleton-button short"></div>
      </div>
    </div>
  </div>
);

export const ButtonLoader = ({ size = 'medium' }) => (
  <div className={`button-loader button-loader-${size}`}>
    <LoadingSpinner
      type="dots"
      variant="light"
      size="small"
      text=""
    />
  </div>
);

export const InlineLoader = ({ text = 'Loading...' }) => (
  <div className="inline-loader">
    <LoadingSpinner
      type="dots"
      variant="primary"
      size="small"
      text={text}
    />
  </div>
);

export default LoadingSpinner;