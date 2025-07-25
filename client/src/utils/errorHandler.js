/**
 * Error handling utilities for the e-learning platform
 */

// Error types
export const ErrorTypes = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NETWORK: 'NETWORK_ERROR',
  SERVER: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  PAYMENT: 'PAYMENT_ERROR',
  UPLOAD: 'UPLOAD_ERROR',
  COURSE_ACCESS: 'COURSE_ACCESS_ERROR',
  ENROLLMENT: 'ENROLLMENT_ERROR'
};

// Custom error class
export class AppError extends Error {
  constructor(message, type = ErrorTypes.SERVER, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Error handler function
export const handleError = (error, context = '') => {
  const errorInfo = {
    message: error.message || 'An unknown error occurred',
    type: error.type || ErrorTypes.SERVER,
    statusCode: error.statusCode || 500,
    details: error.details || null,
    context,
    timestamp: new Date().toISOString(),
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  };

  // Log error to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Handler:', errorInfo);
  }

  return errorInfo;
};

// API error handler
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return new AppError(
          data.message || 'Bad request',
          ErrorTypes.VALIDATION,
          400,
          data.errors
        );
      case 401:
        return new AppError(
          data.message || 'Authentication required',
          ErrorTypes.AUTHENTICATION,
          401
        );
      case 403:
        return new AppError(
          data.message || 'Access forbidden',
          ErrorTypes.AUTHORIZATION,
          403
        );
      case 404:
        return new AppError(
          data.message || 'Resource not found',
          ErrorTypes.NOT_FOUND,
          404
        );
      case 422:
        return new AppError(
          data.message || 'Validation failed',
          ErrorTypes.VALIDATION,
          422,
          data.errors
        );
      case 500:
        return new AppError(
          data.message || 'Internal server error',
          ErrorTypes.SERVER,
          500
        );
      default:
        return new AppError(
          data.message || `Server error: ${status}`,
          ErrorTypes.SERVER,
          status
        );
    }
  } else if (error.request) {
    // Network error
    return new AppError(
      'Network error. Please check your connection.',
      ErrorTypes.NETWORK,
      0
    );
  } else {
    // Other error
    return new AppError(
      error.message || 'An unexpected error occurred',
      ErrorTypes.SERVER,
      500
    );
  }
};

// User-friendly error messages
export const getUserFriendlyMessage = (error) => {
  const friendlyMessages = {
    [ErrorTypes.VALIDATION]: 'Please check your input and try again.',
    [ErrorTypes.AUTHENTICATION]: 'Please log in to continue.',
    [ErrorTypes.AUTHORIZATION]: 'You don\'t have permission to access this resource.',
    [ErrorTypes.NETWORK]: 'Please check your internet connection and try again.',
    [ErrorTypes.SERVER]: 'Something went wrong on our end. Please try again later.',
    [ErrorTypes.NOT_FOUND]: 'The requested resource could not be found.',
    [ErrorTypes.PAYMENT]: 'Payment processing failed. Please try again.',
    [ErrorTypes.UPLOAD]: 'File upload failed. Please try again.',
    [ErrorTypes.COURSE_ACCESS]: 'You don\'t have access to this course.',
    [ErrorTypes.ENROLLMENT]: 'Failed to enroll in the course. Please try again.'
  };

  return friendlyMessages[error.type] || error.message || 'An unexpected error occurred.';
};

// Error notification helper
export const showErrorNotification = (error, notificationSystem) => {
  const message = getUserFriendlyMessage(error);
  
  if (notificationSystem) {
    notificationSystem.addNotification({
      message,
      level: 'error',
      position: 'tr',
      autoDismiss: 5
    });
  }
};

// Validation error formatter
export const formatValidationErrors = (errors) => {
  if (Array.isArray(errors)) {
    return errors.reduce((acc, error) => {
      acc[error.field] = error.message;
      return acc;
    }, {});
  }
  
  if (typeof errors === 'object') {
    return errors;
  }
  
  return { general: 'Validation failed' };
};

// Retry helper for failed operations
export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Don't retry authentication/authorization errors
      if (error.type === ErrorTypes.AUTHENTICATION || 
          error.type === ErrorTypes.AUTHORIZATION) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};