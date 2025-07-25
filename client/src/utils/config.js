// utils/config.js

// API Configuration
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Authentication Configuration
export const AUTH_CONFIG = {
  tokenKey: 'lms_token',
  refreshTokenKey: 'lms_refresh_token',
  userKey: 'lms_user',
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  rememberMeDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// Cloudinary Configuration
export const CLOUDINARY_CONFIG = {
  cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.REACT_APP_CLOUDINARY_API_KEY,
  uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET,
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedVideoTypes: ['mp4', 'mov', 'avi', 'wmv', 'flv', 'webm'],
  allowedImageTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
};

// Stripe Configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
  currency: 'usd',
  country: 'US',
};

// Application Configuration
export const APP_CONFIG = {
  name: 'Learning Management System',
  version: '1.0.0',
  description: 'A comprehensive online learning platform',
  supportEmail: 'support@lms.com',
  maxCoursePrice: 500,
  minCoursePrice: 5,
  courseThumbnailSize: {
    width: 480,
    height: 270,
  },
  videoPlayerSettings: {
    controls: true,
    playbackRates: [0.5, 1, 1.25, 1.5, 2],
    fluid: true,
    responsive: true,
  },
};

// Pagination Configuration
export const PAGINATION_CONFIG = {
  defaultPageSize: 12,
  pageSizeOptions: [6, 12, 24, 48],
  maxPages: 10,
};

// Upload Configuration
export const UPLOAD_CONFIG = {
  maxVideoSize: 500 * 1024 * 1024, // 500MB
  maxImageSize: 10 * 1024 * 1024, // 10MB
  maxDocumentSize: 50 * 1024 * 1024, // 50MB
  chunkSize: 1024 * 1024, // 1MB chunks for large uploads
  supportedVideoFormats: ['mp4', 'webm', 'ogg', 'mov', 'avi'],
  supportedImageFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  supportedDocumentFormats: ['pdf', 'doc', 'docx', 'ppt', 'pptx'],
};

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  newestOnTop: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  types: {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
  },
};

// Theme Configuration
export const THEME_CONFIG = {
  defaultTheme: 'light',
  themes: {
    light: {
      primary: '#3b82f6',
      secondary: '#64748b',
      success: '#10b981',
      danger: '#ef4444',
      warning: '#f59e0b',
      info: '#06b6d4',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      muted: '#64748b',
    },
    dark: {
      primary: '#60a5fa',
      secondary: '#94a3b8',
      success: '#34d399',
      danger: '#f87171',
      warning: '#fbbf24',
      info: '#22d3ee',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      muted: '#94a3b8',
    },
  },
};

// Validation Configuration
export const VALIDATION_CONFIG = {
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
  username: {
    minLength: 3,
    maxLength: 20,
    allowedChars: /^[a-zA-Z0-9_-]+$/,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  course: {
    title: {
      minLength: 10,
      maxLength: 100,
    },
    description: {
      minLength: 50,
      maxLength: 2000,
    },
    price: {
      min: 0,
      max: 1000,
    },
  },
};

// Error Messages Configuration
export const ERROR_MESSAGES = {
  network: 'Network error. Please check your connection.',
  server: 'Server error. Please try again later.',
  unauthorized: 'You are not authorized to perform this action.',
  notFound: 'The requested resource was not found.',
  validation: 'Please check your input and try again.',
  upload: 'File upload failed. Please try again.',
  payment: 'Payment processing failed. Please try again.',
  generic: 'Something went wrong. Please try again.',
};

// Success Messages Configuration
export const SUCCESS_MESSAGES = {
  login: 'Successfully logged in!',
  register: 'Account created successfully!',
  logout: 'Successfully logged out!',
  profileUpdate: 'Profile updated successfully!',
  courseCreate: 'Course created successfully!',
  courseUpdate: 'Course updated successfully!',
  courseDelete: 'Course deleted successfully!',
  enrollment: 'Successfully enrolled in course!',
  payment: 'Payment completed successfully!',
  upload: 'File uploaded successfully!',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  theme: 'lms_theme',
  language: 'lms_language',
  preferences: 'lms_preferences',
  cart: 'lms_cart',
  recentCourses: 'lms_recent_courses',
  searchHistory: 'lms_search_history',
};

// Feature Flags
export const FEATURE_FLAGS = {
  enableVideoDownload: process.env.REACT_APP_ENABLE_VIDEO_DOWNLOAD === 'true',
  enableCourseRatings: process.env.REACT_APP_ENABLE_COURSE_RATINGS !== 'false',
  enableDiscounts: process.env.REACT_APP_ENABLE_DISCOUNTS === 'true',
  enableCertificates: process.env.REACT_APP_ENABLE_CERTIFICATES === 'true',
  enableMultiLanguage: process.env.REACT_APP_ENABLE_MULTI_LANGUAGE === 'true',
  enableDarkMode: process.env.REACT_APP_ENABLE_DARK_MODE !== 'false',
};

// Environment Configuration
export const ENV_CONFIG = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  enableLogging: process.env.REACT_APP_ENABLE_LOGGING !== 'false',
  enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
};