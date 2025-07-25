import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/components/ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      lastErrorTime: null
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      lastErrorTime: new Date()
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Enhanced error logging
    if (process.env.NODE_ENV === 'development') {
      console.groupCollapsed('ErrorBoundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }

    // Optional: Send to error tracking service
    this.logError(error, errorInfo);
  }

  logError = (error, errorInfo) => {
    // Implement your error logging service here
    // Example: Sentry.captureException(error, { extra: errorInfo });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoBack = () => {
    window.history.back();
  };

  handleResetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  renderErrorDetails() {
    const { error, errorInfo } = this.state;
    const { showDetailsInProduction = false } = this.props;

    if (!error) return null;

    const shouldShowDetails = process.env.NODE_ENV === 'development' || showDetailsInProduction;

    if (!shouldShowDetails) return null;

    return (
      <details className="error-boundary__details">
        <summary>Error Details</summary>
        <div className="error-boundary__error-message">
          {error.toString()}
        </div>
        <pre className="error-boundary__stack">
          {errorInfo?.componentStack}
        </pre>
      </details>
    );
  }

  renderFallback() {
    const { fallback, customButtons } = this.props;
    const { lastErrorTime } = this.state;

    if (fallback) return fallback;

    return (
      <div className="error-boundary">
        <div className="error-boundary__container">
          <div className="error-boundary__icon">⚠️</div>
          <h2 className="error-boundary__title">
            {this.props.title || 'Oops! Something went wrong'}
          </h2>
          <p className="error-boundary__message">
            {this.props.message || 'We\'re sorry, but something unexpected happened.'}
          </p>
          
          {lastErrorTime && (
            <p className="error-boundary__timestamp">
              Error occurred at: {lastErrorTime.toLocaleString()}
            </p>
          )}

          {this.renderErrorDetails()}

          <div className="error-boundary__actions">
            {customButtons || (
              <>
                <button 
                  onClick={this.handleRefresh}
                  className="error-boundary__button error-boundary__button--primary"
                >
                  Refresh Page
                </button>
                <button 
                  onClick={this.handleGoBack}
                  className="error-boundary__button error-boundary__button--secondary"
                >
                  Go Back
                </button>
                {process.env.NODE_ENV === 'development' && (
                  <button
                    onClick={this.handleResetError}
                    className="error-boundary__button error-boundary__button--tertiary"
                  >
                    Try to Recover
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return this.renderFallback();
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
  fallback: PropTypes.node,
  title: PropTypes.string,
  message: PropTypes.string,
  showDetailsInProduction: PropTypes.bool,
  customButtons: PropTypes.node,
  onError: PropTypes.func
};

// Enhanced HOC with additional props
export const withErrorBoundary = (Component, options = {}) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary 
        fallback={options.fallback}
        title={options.title}
        message={options.message}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

export default ErrorBoundary;