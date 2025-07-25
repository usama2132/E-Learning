/**
 * Validation utilities for the e-learning platform
 */

// Common validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  URL: /^https?:\/\/.+/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  NUMERIC: /^\d+$/,
  DECIMAL: /^\d+(\.\d{1,2})?$/,
  POSTAL_CODE: /^[A-Z0-9]{3,10}$/i
};

// Validation error messages
export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  PASSWORD: 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character',
  PASSWORD_MATCH: 'Passwords do not match',
  PHONE: 'Please enter a valid phone number',
  URL: 'Please enter a valid URL',
  MIN_LENGTH: (min) => `Must be at least ${min} characters long`,
  MAX_LENGTH: (max) => `Must be no more than ${max} characters long`,
  MIN_VALUE: (min) => `Must be at least ${min}`,
  MAX_VALUE: (max) => `Must be no more than ${max}`,
  INVALID_FORMAT: 'Invalid format',
  UPLOAD_SIZE: (max) => `File size must be less than ${max}MB`,
  UPLOAD_TYPE: (types) => `File type must be one of: ${types.join(', ')}`
};

// Basic validators
export const validators = {
  // Required field validator
  required: (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return Boolean(value);
  },

  // Email validator
  email: (value) => {
    if (!value) return true; // Allow empty if not required
    return VALIDATION_PATTERNS.EMAIL.test(value);
  },

  // Password validator
  password: (value) => {
    if (!value) return true;
    return VALIDATION_PATTERNS.PASSWORD.test(value);
  },

  // Phone number validator
  phone: (value) => {
    if (!value) return true;
    return VALIDATION_PATTERNS.PHONE.test(value);
  },

  // URL validator
  url: (value) => {
    if (!value) return true;
    return VALIDATION_PATTERNS.URL.test(value);
  },

  // Username validator
  username: (value) => {
    if (!value) return true;
    return VALIDATION_PATTERNS.USERNAME.test(value);
  },

  // Numeric validator
  numeric: (value) => {
    if (!value) return true;
    return VALIDATION_PATTERNS.NUMERIC.test(value);
  },

  // Decimal validator
  decimal: (value) => {
    if (!value) return true;
    return VALIDATION_PATTERNS.DECIMAL.test(value);
  },

  // Min length validator
  minLength: (min) => (value) => {
    if (!value) return true;
    return value.toString().length >= min;
  },

  // Max length validator
  maxLength: (max) => (value) => {
    if (!value) return true;
    return value.toString().length <= max;
  },

  // Min value validator
  minValue: (min) => (value) => {
    if (!value) return true;
    return parseFloat(value) >= min;
  },

  // Max value validator
  maxValue: (max) => (value) => {
    if (!value) return true;
    return parseFloat(value) <= max;
  },

  // Range validator
  range: (min, max) => (value) => {
    if (!value) return true;
    const num = parseFloat(value);
    return num >= min && num <= max;
  },

  // Pattern validator
  pattern: (regex) => (value) => {
    if (!value) return true;
    return regex.test(value);
  },

  // Custom validator
  custom: (validatorFn) => validatorFn
};

// Standalone email validation function (ADDED FOR YOUR ERROR FIX)
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED };
  }
  
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED };
  }
  
  const isValid = VALIDATION_PATTERNS.EMAIL.test(trimmedEmail);
  return {
    isValid,
    error: isValid ? null : ERROR_MESSAGES.EMAIL
  };
};

// Form validation
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = formData[field];
    
    for (let rule of rules) {
      let validator, message, params;
      
      if (typeof rule === 'string') {
        validator = validators[rule];
        message = ERROR_MESSAGES[rule.toUpperCase()];
      } else if (typeof rule === 'object') {
        validator = validators[rule.type];
        message = rule.message || ERROR_MESSAGES[rule.type?.toUpperCase()];
        params = rule.params;
      } else if (typeof rule === 'function') {
        validator = rule;
        message = 'Invalid value';
      }

      if (validator) {
        let isFieldValid;
        if (params) {
          isFieldValid = validator(...params)(value);
        } else {
          isFieldValid = validator(value);
        }

        if (!isFieldValid) {
          errors[field] = typeof message === 'function' ? message(...(params || [])) : message;
          isValid = false;
          break; // Stop at first error for this field
        }
      }
    }
  });

  return { isValid, errors };
};

// Course validation rules
export const courseValidationRules = {
  title: [
    'required',
    { type: 'minLength', params: [3], message: ERROR_MESSAGES.MIN_LENGTH(3) },
    { type: 'maxLength', params: [100], message: ERROR_MESSAGES.MAX_LENGTH(100) }
  ],
  description: [
    'required',
    { type: 'minLength', params: [10], message: ERROR_MESSAGES.MIN_LENGTH(10) },
    { type: 'maxLength', params: [1000], message: ERROR_MESSAGES.MAX_LENGTH(1000) }
  ],
  price: [
    'required',
    'decimal',
    { type: 'minValue', params: [0], message: ERROR_MESSAGES.MIN_VALUE(0) }
  ],
  category: ['required'],
  duration: [
    'required',
    'numeric',
    { type: 'minValue', params: [1], message: ERROR_MESSAGES.MIN_VALUE(1) }
  ]
};

// User validation rules
export const userValidationRules = {
  firstName: [
    'required',
    { type: 'minLength', params: [2], message: ERROR_MESSAGES.MIN_LENGTH(2) },
    { type: 'maxLength', params: [50], message: ERROR_MESSAGES.MAX_LENGTH(50) }
  ],
  lastName: [
    'required',
    { type: 'minLength', params: [2], message: ERROR_MESSAGES.MIN_LENGTH(2) },
    { type: 'maxLength', params: [50], message: ERROR_MESSAGES.MAX_LENGTH(50) }
  ],
  email: ['required', 'email'],
  password: ['required', 'password'],
  username: [
    'required',
    'username',
    { type: 'minLength', params: [3], message: ERROR_MESSAGES.MIN_LENGTH(3) }
  ]
};

// Login validation rules
export const loginValidationRules = {
  email: ['required', 'email'],
  password: ['required']
};

// Registration validation rules
export const registrationValidationRules = {
  ...userValidationRules,
  confirmPassword: [
    'required',
    (value, formData) => value === formData.password ? true : ERROR_MESSAGES.PASSWORD_MATCH
  ]
};

// Profile validation rules
export const profileValidationRules = {
  firstName: [
    'required',
    { type: 'minLength', params: [2], message: ERROR_MESSAGES.MIN_LENGTH(2) }
  ],
  lastName: [
    'required',
    { type: 'minLength', params: [2], message: ERROR_MESSAGES.MIN_LENGTH(2) }
  ],
  bio: [
    { type: 'maxLength', params: [500], message: ERROR_MESSAGES.MAX_LENGTH(500) }
  ],
  website: ['url'],
  phone: ['phone']
};

// File upload validators
export const fileValidators = {
  // Validate file size (in MB)
  fileSize: (maxSizeMB) => (file) => {
    if (!file) return true;
    const fileSizeMB = file.size / (1024 * 1024);
    return fileSizeMB <= maxSizeMB;
  },

  // Validate file type
  fileType: (allowedTypes) => (file) => {
    if (!file) return true;
    return allowedTypes.includes(file.type);
  },

  // Validate image dimensions
  imageDimensions: (maxWidth, maxHeight) => (file) => {
    if (!file || !file.type.startsWith('image/')) return true;
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(img.width <= maxWidth && img.height <= maxHeight);
      };
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });
  }
};

// Video upload validation
export const videoValidationRules = {
  file: [
    'required',
    { 
      type: 'custom', 
      validator: fileValidators.fileSize(500),
      message: ERROR_MESSAGES.UPLOAD_SIZE(500)
    },
    {
      type: 'custom',
      validator: fileValidators.fileType(['video/mp4', 'video/webm', 'video/ogg']),
      message: ERROR_MESSAGES.UPLOAD_TYPE(['MP4', 'WebM', 'OGG'])
    }
  ],
  title: [
    'required',
    { type: 'minLength', params: [3], message: ERROR_MESSAGES.MIN_LENGTH(3) }
  ]
};

// Image upload validation
export const imageValidationRules = {
  file: [
    'required',
    {
      type: 'custom',
      validator: fileValidators.fileSize(5),
      message: ERROR_MESSAGES.UPLOAD_SIZE(5)
    },
    {
      type: 'custom',
      validator: fileValidators.fileType(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
      message: ERROR_MESSAGES.UPLOAD_TYPE(['JPEG', 'PNG', 'GIF', 'WebP'])
    }
  ]
};

// Payment validation rules
export const paymentValidationRules = {
  cardNumber: [
    'required',
    { 
      type: 'custom', 
      validator: (value) => {
        const cleaned = value.replace(/\s/g, '');
        return cleaned.length >= 13 && cleaned.length <= 19 && /^\d+$/.test(cleaned);
      },
      message: 'Please enter a valid card number'
    }
  ],
  expiryDate: [
    'required',
    {
      type: 'custom',
      validator: (value) => {
        if (!/^\d{2}\/\d{2}$/.test(value)) return false;
        const [month, year] = value.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        
        const expMonth = parseInt(month);
        const expYear = parseInt(year);
        
        if (expMonth < 1 || expMonth > 12) return false;
        if (expYear < currentYear) return false;
        if (expYear === currentYear && expMonth < currentMonth) return false;
        
        return true;
      },
      message: 'Please enter a valid expiry date'
    }
  ],
  cvc: [
    'required',
    {
      type: 'custom',
      validator: (value) => /^\d{3,4}$/.test(value),
      message: 'Please enter a valid CVC'
    }
  ],
  cardholderName: [
    'required',
    { type: 'minLength', params: [2], message: ERROR_MESSAGES.MIN_LENGTH(2) }
  ]
};

// Real-time validation
export const validateField = (fieldName, value, rules, formData = {}) => {
  const fieldRules = rules[fieldName];
  if (!fieldRules) return { isValid: true, error: null };

  for (let rule of fieldRules) {
    let validator, message, params;
    
    if (typeof rule === 'string') {
      validator = validators[rule];
      message = ERROR_MESSAGES[rule.toUpperCase()];
    } else if (typeof rule === 'object') {
      validator = validators[rule.type] || rule.validator;
      message = rule.message || ERROR_MESSAGES[rule.type?.toUpperCase()];
      params = rule.params;
    } else if (typeof rule === 'function') {
      const result = rule(value, formData);
      if (result !== true) {
        return { isValid: false, error: result };
      }
      continue;
    }

    if (validator) {
      let isValid;
      if (params) {
        isValid = validator(...params)(value);
      } else {
        isValid = validator(value);
      }

      if (!isValid) {
        return { 
          isValid: false, 
          error: typeof message === 'function' ? message(...(params || [])) : message
        };
      }
    }
  }

  return { isValid: true, error: null };
};

// Sanitize input
export const sanitizeInput = (value, type = 'text') => {
  if (!value || typeof value !== 'string') return value;

  switch (type) {
    case 'email':
      return value.toLowerCase().trim();
    case 'username':
      return value.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
    case 'phone':
      return value.replace(/[^+\d]/g, '');
    case 'numeric':
      return value.replace(/[^\d]/g, '');
    case 'decimal':
      return value.replace(/[^\d.]/g, '');
    case 'alphanumeric':
      return value.replace(/[^a-zA-Z0-9]/g, '');
    case 'text':
    default:
      return value.trim();
  }
};