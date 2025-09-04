// src/utils/config.js - Enhanced configuration for backend integration

// Determine environment
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Backend configuration with fallbacks - FIXED TO REMOVE DOUBLE PREFIX
export const API_CONFIG = {
  // Base URL configuration - FIXED: Ensure no double /api prefix
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000, // 30 seconds
  
  // Retry configuration for rate limiting
  maxRetries: 3,
  retryDelay: 2000, // 2 seconds base delay
  
  // Development flags
  USE_MOCK: process.env.REACT_APP_USE_MOCK === 'true' || false,
  DEBUG_API: isDevelopment && process.env.REACT_APP_DEBUG_API === 'true',
  
  // Headers
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Version': process.env.REACT_APP_VERSION || '1.0.0',
  }
};

// API Endpoints mapping - FIXED: All routes are correct without double prefix
export const API_ENDPOINTS = {
  // Authentication endpoints
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    validateToken: '/auth/validate-token',
  },
  
  // Course endpoints - CORRECTED to match backend exactly
  courses: {
    base: '/courses',
    getAll: '/courses',
    getById: (id) => `/courses/${id}`,
    create: '/courses',
    update: (id) => `/courses/${id}`,
    delete: (id) => `/courses/${id}`,
    categories: '/courses/categories', // FIXED: Correct route
    featured: '/courses/featured',
    search: '/courses/search',
    instructorCourses: '/courses/instructor/my-courses', // FIXED: Correct route
    enroll: (id) => `/courses/${id}/enroll`,
    unenroll: (id) => `/courses/${id}/unenroll`,
  },
  
  // User endpoints
  users: {
    profile: '/users/profile',
    updateProfile: '/users/profile',
    getAllUsers: '/admin/users',
    getUserById: (id) => `/users/${id}`,
    deleteUser: (id) => `/admin/users/${id}`,
    updateUserRole: (id) => `/admin/users/${id}/role`,
  },
  
  // Student endpoints
  student: {
    dashboard: '/student/dashboard',
    courses: '/student/courses',
    enrolledCourses: '/student/courses/enrolled',
    progress: '/student/progress',
    wishlist: '/student/wishlist',
    addToWishlist: (courseId) => `/student/wishlist/${courseId}`,
    removeFromWishlist: (courseId) => `/student/wishlist/${courseId}`,
  },
  
  // Instructor endpoints
  instructor: {
    dashboard: '/instructor/dashboard',
    courses: '/instructor/courses',
    createCourse: '/instructor/courses',
    updateCourse: (id) => `/instructor/courses/${id}`,
    deleteCourse: (id) => `/instructor/courses/${id}`,
    analytics: '/instructor/analytics',
    students: '/instructor/students',
    earnings: '/instructor/earnings',
  },
  
  // Admin endpoints
  admin: {
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    courses: '/admin/courses',
    analytics: '/admin/analytics',
    settings: '/admin/settings',
    transactions: '/admin/transactions',
  },
  
  // Upload endpoints - FIXED to match backend
  uploads: {
    video: (courseId) => `/uploads/course/${courseId}/video`,
    image: '/uploads/image',
    thumbnail: (courseId) => `/uploads/course/${courseId}/thumbnail`,
    document: '/uploads/document',
    deleteFile: (publicId) => `/uploads/delete/${publicId}`,
  },
  
  // Payment endpoints - FIXED
  payments: {
    createIntent: '/payments/create-intent',
    confirm: '/payments/confirm',
    webhook: '/payments/webhook',
    history: '/payments/history',
  },
  
  // Notification endpoints
  notifications: {
    getAll: '/notifications',
    markAsRead: (id) => `/notifications/${id}/read`,
    markAllAsRead: '/notifications/read-all',
    delete: (id) => `/notifications/${id}`,
  },
  
  // Progress endpoints
  progress: {
    getCourseProgress: (courseId) => `/progress/course/${courseId}`,
    updateProgress: (courseId) => `/progress/course/${courseId}`,
    getLessonProgress: (lessonId) => `/progress/lesson/${lessonId}`,
    updateLessonProgress: (lessonId) => `/progress/lesson/${lessonId}`,
  },
  
  // Analytics endpoints
  analytics: {
    dashboard: '/analytics/dashboard',
    courses: '/analytics/courses',
    users: '/analytics/users',
    revenue: '/analytics/revenue',
    engagement: '/analytics/engagement',
  }
};

// Feature flags
export const FEATURES = {
  enablePayments: process.env.REACT_APP_ENABLE_PAYMENTS === 'true',
  enableNotifications: process.env.REACT_APP_ENABLE_NOTIFICATIONS !== 'false',
  enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS !== 'false',
  enableVideoStreaming: process.env.REACT_APP_ENABLE_VIDEO_STREAMING !== 'false',
  enableOfflineMode: process.env.REACT_APP_ENABLE_OFFLINE === 'true',
  enablePWA: process.env.REACT_APP_ENABLE_PWA === 'true',
};

// Third-party service configurations
export const SERVICES = {
  // Cloudinary configuration
  cloudinary: {
    cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.REACT_APP_CLOUDINARY_API_KEY,
    uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET,
  },
  
  // Stripe configuration
  stripe: {
    publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
    successUrl: process.env.REACT_APP_STRIPE_SUCCESS_URL || `${window.location.origin}/payment/success`,
    cancelUrl: process.env.REACT_APP_STRIPE_CANCEL_URL || `${window.location.origin}/payment/cancel`,
  },
  
  // Google Analytics
  googleAnalytics: {
    trackingId: process.env.REACT_APP_GA_TRACKING_ID,
  },
  
  // Email service
  email: {
    serviceId: process.env.REACT_APP_EMAIL_SERVICE_ID,
    templateId: process.env.REACT_APP_EMAIL_TEMPLATE_ID,
    userId: process.env.REACT_APP_EMAIL_USER_ID,
  }
};

// App configuration
export const APP_CONFIG = {
  name: process.env.REACT_APP_NAME || 'EduPlatform',
  version: process.env.REACT_APP_VERSION || '1.0.0',
  description: process.env.REACT_APP_DESCRIPTION || 'Online Learning Platform',
  
  // Pagination
  defaultPageSize: 12,
  maxPageSize: 50,
  
  // File upload limits
  maxFileSize: 100 * 1024 * 1024, // 100MB
  maxVideoSize: 500 * 1024 * 1024, // 500MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedVideoTypes: ['video/mp4', 'video/webm', 'video/ogg'],
  allowedDocumentTypes: ['application/pdf', 'text/plain', 'application/msword'],
  
  // Course configuration
  maxCourseTitleLength: 100,
  maxCourseDescriptionLength: 2000,
  maxLearningObjectives: 10,
  maxRequirements: 10,
  
  // User configuration
  maxUsernameLength: 30,
  minPasswordLength: 8,
  maxBioLength: 500,
  
  // UI configuration
  theme: {
    defaultTheme: 'light',
    enableDarkMode: true,
  },
  
  // Cache configuration
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  
  // Rate limiting configuration (frontend awareness)
  rateLimits: {
    search: { max: 30, window: 60000 }, // 30 per minute
    upload: { max: 10, window: 60000 }, // 10 per minute
    auth: { max: 5, window: 900000 }, // 5 per 15 minutes
  }
};

// Validation rules
export const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  username: /^[a-zA-Z0-9_]{3,30}$/,
  phone: /^\+?[\d\s-()]{10,15}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
};

// Environment-specific configurations
export const ENV_CONFIG = {
  development: {
    enableDebug: true,
    enableMockData: process.env.REACT_APP_USE_MOCK === 'true',
    apiTimeout: 10000,
    showDetailedErrors: true,
  },
  
  production: {
    enableDebug: false,
    enableMockData: false,
    apiTimeout: 30000,
    showDetailedErrors: false,
  },
  
  test: {
    enableDebug: true,
    enableMockData: true,
    apiTimeout: 5000,
    showDetailedErrors: true,
  }
};

// Get current environment config
export const getCurrentEnvConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return ENV_CONFIG[env] || ENV_CONFIG.development;
};

// Storage keys
export const STORAGE_KEYS = {
  authToken: 'lms_auth_token',
  refreshToken: 'lms_refresh_token',
  user: 'lms_user',
  theme: 'lms_theme',
  language: 'lms_language',
  preferences: 'lms_preferences',
  cart: 'lms_cart',
  recentSearches: 'lms_recent_searches',
  viewMode: 'lms_view_mode',
  filters: 'lms_filters',
};

// Error types
export const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  PAYMENT_ERROR: 'PAYMENT_ERROR',
};

// Success message types
export const SUCCESS_TYPES = {
  COURSE_CREATED: 'Course created successfully',
  COURSE_UPDATED: 'Course updated successfully',
  COURSE_DELETED: 'Course deleted successfully',
  ENROLLMENT_SUCCESS: 'Successfully enrolled in course',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
  PAYMENT_SUCCESS: 'Payment completed successfully',
};

// Route configurations
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  COURSES: '/courses',
  COURSE_DETAIL: '/courses/:id',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  CART: '/cart',
  CHECKOUT: '/checkout',
  PAYMENT_SUCCESS: '/payment/success',
  PAYMENT_CANCEL: '/payment/cancel',
  
  // Student routes
  STUDENT_DASHBOARD: '/student/dashboard',
  MY_LEARNING: '/student/learning',
  WISHLIST: '/student/wishlist',
  
  // Instructor routes
  INSTRUCTOR_DASHBOARD: '/instructor/dashboard',
  CREATE_COURSE: '/instructor/courses/create',
  EDIT_COURSE: '/instructor/courses/:id/edit',
  MY_COURSES: '/instructor/courses',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_COURSES: '/admin/courses',
  ADMIN_SETTINGS: '/admin/settings',
};

export default {
  API_CONFIG,
  API_ENDPOINTS,
  FEATURES,
  SERVICES,
  APP_CONFIG,
  VALIDATION_RULES,
  getCurrentEnvConfig,
  STORAGE_KEYS,
  ERROR_TYPES,
  SUCCESS_TYPES,
  ROUTES
};