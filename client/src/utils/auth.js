// Authentication utilities for managing user sessions and tokens

// Storage keys
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DATA_KEY = 'user_data';
const TOKEN_EXPIRY_KEY = 'token_expiry';

// Get authentication token from localStorage
export const getAuthToken = () => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Set authentication token in localStorage
export const setAuthToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

// Get refresh token from localStorage
export const getRefreshToken = () => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

// Set refresh token in localStorage
export const setRefreshToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error setting refresh token:', error);
  }
};

// Get user data from localStorage
export const getUserData = () => {
  try {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Set user data in localStorage
export const setUserData = (userData) => {
  try {
    if (userData) {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(USER_DATA_KEY);
    }
  } catch (error) {
    console.error('Error setting user data:', error);
  }
};

// Set token expiry time
export const setTokenExpiry = (expiryTime) => {
  try {
    if (expiryTime) {
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    } else {
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
    }
  } catch (error) {
    console.error('Error setting token expiry:', error);
  }
};

// Get token expiry time
export const getTokenExpiry = () => {
  try {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    return expiry ? parseInt(expiry, 10) : null;
  } catch (error) {
    console.error('Error getting token expiry:', error);
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = () => {
  try {
    const expiry = getTokenExpiry();
    if (!expiry) return true;
    
    const now = Date.now();
    return now >= expiry;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
};

// Store authentication data
export const setAuthData = (authData) => {
  try {
    const { token, refreshToken, user, expiresIn } = authData;
    
    setAuthToken(token);
    setRefreshToken(refreshToken);
    setUserData(user);
    
    // Calculate expiry time (expiresIn is usually in seconds)
    if (expiresIn) {
      const expiryTime = Date.now() + (expiresIn * 1000);
      setTokenExpiry(expiryTime);
    }
  } catch (error) {
    console.error('Error setting auth data:', error);
  }
};

// Clear all authentication data
export const clearAuthData = () => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  const user = getUserData();
  
  return !!(token && user && !isTokenExpired());
};

// Get user role
export const getUserRole = () => {
  const userData = getUserData();
  return userData?.role || null;
};

// Check if user has specific role
export const hasRole = (role) => {
  const userRole = getUserRole();
  return userRole === role;
};

// Check if user has any of the specified roles
export const hasAnyRole = (roles) => {
  const userRole = getUserRole();
  return roles.includes(userRole);
};

// Check if user is admin
export const isAdmin = () => {
  return hasRole('admin');
};

// Check if user is instructor
export const isInstructor = () => {
  return hasRole('instructor');
};

// Check if user is student
export const isStudent = () => {
  return hasRole('student');
};

// Get user permissions based on role
export const getUserPermissions = () => {
  const role = getUserRole();
  
  switch (role) {
    case 'admin':
      return [
        'manage_users',
        'manage_courses',
        'manage_categories',
        'view_analytics',
        'manage_payments',
        'manage_system_settings',
        'approve_courses',
        'view_all_transactions',
      ];
    case 'instructor':
      return [
        'create_courses',
        'edit_own_courses',
        'view_own_analytics',
        'manage_own_students',
        'upload_content',
        'view_earnings',
      ];
    case 'student':
      return [
        'enroll_courses',
        'view_own_progress',
        'access_enrolled_courses',
        'download_certificates',
        'rate_courses',
      ];
    default:
      return [];
  }
};

// Check if user has specific permission
export const hasPermission = (permission) => {
  const permissions = getUserPermissions();
  return permissions.includes(permission);
};

// Format user display name
export const getUserDisplayName = () => {
  const userData = getUserData();
  if (!userData) return 'Guest';
  
  if (userData.firstName && userData.lastName) {
    return `${userData.firstName} ${userData.lastName}`;
  }
  
  return userData.name || userData.email || 'User';
};

// Get user avatar URL
export const getUserAvatar = () => {
  const userData = getUserData();
  return userData?.avatar || null;
};

// Decode JWT token (basic decode without verification)
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Get token payload
export const getTokenPayload = () => {
  const token = getAuthToken();
  return decodeToken(token);
};

// Check if token needs refresh (within 5 minutes of expiry)
export const shouldRefreshToken = () => {
  try {
    const expiry = getTokenExpiry();
    if (!expiry) return false;
    
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    return (expiry - now) <= fiveMinutes;
  } catch (error) {
    console.error('Error checking token refresh:', error);
    return false;
  }
};

// Create authorization header
export const getAuthHeader = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    errors: [
      ...(password.length < minLength ? [`Password must be at least ${minLength} characters long`] : []),
      ...(!hasUpperCase ? ['Password must contain at least one uppercase letter'] : []),
      ...(!hasLowerCase ? ['Password must contain at least one lowercase letter'] : []),
      ...(!hasNumbers ? ['Password must contain at least one number'] : []),
      ...(!hasSpecialChar ? ['Password must contain at least one special character'] : []),
    ],
  };
};

// Generate a simple password
export const generatePassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
};

export default {
  getAuthToken,
  setAuthToken,
  getRefreshToken,
  setRefreshToken,
  getUserData,
  setUserData,
  setAuthData,
  clearAuthData,
  isAuthenticated,
  getUserRole,
  hasRole,
  hasAnyRole,
  isAdmin,
  isInstructor,
  isStudent,
  getUserPermissions,
  hasPermission,
  getUserDisplayName,
  getUserAvatar,
  decodeToken,
  getTokenPayload,
  shouldRefreshToken,
  getAuthHeader,
  isValidEmail,
  validatePassword,
  generatePassword,
};