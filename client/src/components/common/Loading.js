import React from 'react';
import '../../styles/components/Loading.css';

const Loading = ({
  size = 'medium',
  variant = 'spinner',
  fullScreen = false,
  overlay = false,
  text = '',
  color = 'primary',
  className = ''
}) => {
  const loadingClasses = [
    'loading',
    `loading--${size}`,
    `loading--${variant}`,
    `loading--${color}`,
    fullScreen && 'loading--fullscreen',
    overlay && 'loading--overlay',
    className
  ].filter(Boolean).join(' ');

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="loading__dots">
            <div className="loading__dot"></div>
            <div className="loading__dot"></div>
            <div className="loading__dot"></div>
          </div>
        );
      
      case 'bars':
        return (
          <div className="loading__bars">
            <div className="loading__bar"></div>
            <div className="loading__bar"></div>
            <div className="loading__bar"></div>
            <div className="loading__bar"></div>
          </div>
        );
      
      case 'pulse':
        return <div className="loading__pulse"></div>;
      
      case 'ring':
        return <div className="loading__ring"></div>;
      
      case 'skeleton':
        return (
          <div className="loading__skeleton">
            <div className="loading__skeleton-line loading__skeleton-line--long"></div>
            <div className="loading__skeleton-line loading__skeleton-line--medium"></div>
            <div className="loading__skeleton-line loading__skeleton-line--short"></div>
          </div>
        );
      
      default:
        return <div className="loading__spinner"></div>;
    }
  };

  const loadingContent = (
    <div className="loading__content">
      {renderSpinner()}
      {text && <div className="loading__text">{text}</div>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={loadingClasses}>
        <div className="loading__backdrop">
          {loadingContent}
        </div>
      </div>
    );
  }

  if (overlay) {
    return (
      <div className={loadingClasses}>
        <div className="loading__overlay">
          {loadingContent}
        </div>
      </div>
    );
  }

  return (
    <div className={loadingClasses}>
      {loadingContent}
    </div>
  );
};

// Higher-order component for wrapping components with loading state
export const withLoading = (WrappedComponent, loadingProps = {}) => {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <Loading {...loadingProps} />;
    }
    return <WrappedComponent {...props} />;
  };
};

// Hook for managing loading states
export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);
  
  const startLoading = React.useCallback(() => setIsLoading(true), []);
  const stopLoading = React.useCallback(() => setIsLoading(false), []);
  const toggleLoading = React.useCallback(() => setIsLoading(prev => !prev), []);
  
  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    setIsLoading
  };
};

export default Loading;
