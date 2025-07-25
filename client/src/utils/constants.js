// utils/constants.js

// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
};

// Course Status
export const COURSE_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  REJECTED: 'rejected',
};

// Enrollment Status
export const ENROLLMENT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
};

// Course Categories
export const COURSE_CATEGORIES = {
  WEB_DEVELOPMENT: 'web-development',
  MOBILE_DEVELOPMENT: 'mobile-development',
  DATA_SCIENCE: 'data-science',
  MACHINE_LEARNING: 'machine-learning',
  DESIGN: 'design',
  BUSINESS: 'business',
  MARKETING: 'marketing',
  PHOTOGRAPHY: 'photography',
  MUSIC: 'music',
  LANGUAGE: 'language',
  HEALTH_FITNESS: 'health-fitness',
  LIFESTYLE: 'lifestyle',
};

// Course Levels
export const COURSE_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  ALL_LEVELS: 'all-levels',
};

// Course Languages
export const COURSE_LANGUAGES = {
  ENGLISH: 'english',
  SPANISH: 'spanish',
  FRENCH: 'french',
  GERMAN: 'german',
  ITALIAN: 'italian',
  PORTUGUESE: 'portuguese',
  CHINESE: 'chinese',
  JAPANESE: 'japanese',
  KOREAN: 'korean',
  ARABIC: 'arabic',
};

// Video Quality
export const VIDEO_QUALITY = {
  LOW: '360p',
  MEDIUM: '720p',
  HIGH: '1080p',
  AUTO: 'auto',
};

// File Types
export const FILE_TYPES = {
  VIDEO: 'video',
  IMAGE: 'image',
  DOCUMENT: 'document',
  AUDIO: 'audio',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  COURSE_ENROLLMENT: 'course_enrollment',
  COURSE_APPROVAL: 'course_approval',
  COURSE_REJECTION: 'course_rejection',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  COURSE_UPDATE: 'course_update',
  MESSAGE: 'message',
  SYSTEM: 'system',
};

// Progress Status
export const PROGRESS_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

// Sort Options
export const SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  POPULAR: 'popular',
  RATING: 'rating',
  PRICE_LOW: 'price_low',
  PRICE_HIGH: 'price_high',
  TITLE_AZ: 'title_az',
  TITLE_ZA: 'title_za',
};

// Filter Types
export const FILTER_TYPES = {
  CATEGORY: 'category',
  LEVEL: 'level',
  PRICE: 'price',
  RATING: 'rating',
  DURATION: 'duration',
  LANGUAGE: 'language',
};

// Price Ranges
export const PRICE_RANGES = {
  FREE: { min: 0, max: 0, label: 'Free' },
  UNDER_25: { min: 1, max: 25, label: 'Under $25' },
  RANGE_25_50: { min: 25, max: 50, label: '$25 - $50' },
  RANGE_50_100: { min: 50, max: 100, label: '$50 - $100' },
  OVER_100: { min: 100, max: null, label: 'Over $100' },
};

// Rating Ranges
export const RATING_RANGES = {
  FOUR_PLUS: { min: 4, label: '4+ Stars' },
  THREE_PLUS: { min: 3, label: '3+ Stars' },
  TWO_PLUS: { min: 2, label: '2+ Stars' },
  ONE_PLUS: { min: 1, label: '1+ Stars' },
};

// Duration Ranges (in minutes)
export const DURATION_RANGES = {
  UNDER_1: { min: 0, max: 60, label: 'Under 1 hour' },
  RANGE_1_3: { min: 60, max: 180, label: '1-3 hours' },
  RANGE_3_6: { min: 180, max: 360, label: '3-6 hours' },
  RANGE_6_10: { min: 360, max: 600, label: '6-10 hours' },
  OVER_10: { min: 600, max: null, label: 'Over 10 hours' },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',

  // Users
  USERS: '/users',
  USER_PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  CHANGE_PASSWORD: '/users/change-password',

  // Courses
  COURSES: '/courses',
  COURSE_BY_ID: '/courses/:id',
  MY_COURSES: '/courses/my-courses',
  FEATURED_COURSES: '/courses/featured',
  POPULAR_COURSES: '/courses/popular',
  SEARCH_COURSES: '/courses/search',

  // Enrollments
  ENROLLMENTS: '/enrollments',
  ENROLL_COURSE: '/enrollments/enroll',
  MY_ENROLLMENTS: '/enrollments/my-enrollments',

  // Payments
  PAYMENTS: '/payments',
  CREATE_PAYMENT_INTENT: '/payments/create-intent',
  CONFIRM_PAYMENT: '/payments/confirm',
  PAYMENT_HISTORY: '/payments/history',

  // Analytics
  ANALYTICS: '/analytics',
  COURSE_ANALYTICS: '/analytics/courses',
  USER_ANALYTICS: '/analytics/users',
  REVENUE_ANALYTICS: '/analytics/revenue',

  // Categories
  CATEGORIES: '/categories',

  // Reviews
  REVIEWS: '/reviews',
  COURSE_REVIEWS: '/reviews/course/:id',

  // Notifications
  NOTIFICATIONS: '/notifications',
  MARK_READ: '/notifications/mark-read',
};

// Local Storage Keys
export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
  THEME: 'theme_preference',
  LANGUAGE: 'language_preference',
  CART: 'shopping_cart',
  RECENT_SEARCHES: 'recent_searches',
  VIDEO_PREFERENCES: 'video_preferences',
};

// Event Names
export const EVENT_NAMES = {
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  COURSE_ENROLL: 'course_enroll',
  COURSE_COMPLETE: 'course_complete',
  VIDEO_PLAY: 'video_play',
  VIDEO_PAUSE: 'video_pause',
  VIDEO_COMPLETE: 'video_complete',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
  PHONE: /^\+?[\d\s-()]{10,}$/,
  URL: /^https?:\/\/.+/,
};

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MM/DD/YYYY',
  LONG: 'MMMM DD, YYYY',
  WITH_TIME: 'MM/DD/YYYY HH:mm',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  RELATIVE: 'relative',
};

// Currency Symbols
export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  INR: '₹',
};

// Animation Durations (in milliseconds)
export const ANIMATION_DURATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000,
};

// Breakpoints
export const BREAKPOINTS = {
  XS: 480,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
};

// Default Values
export const DEFAULTS = {
  AVATAR_URL: '/default-avatar.png',
  COURSE_THUMBNAIL: '/default-course-thumbnail.jpg',
  PAGE_SIZE: 12,
  VIDEO_VOLUME: 0.8,
  PLAYBACK_SPEED: 1,
  NOTIFICATION_DURATION: 5000,
};

// Feature Flags
export const FEATURES = {
  DARK_MODE: true,
  COURSE_REVIEWS: true,
  VIDEO_DOWNLOAD: false,
  COURSE_CERTIFICATES: true,
  MULTIPLE_INSTRUCTORS: false,
  COURSE_DISCUSSIONS: true,
  OFFLINE_VIEWING: false,
};

// Error Codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT',
};