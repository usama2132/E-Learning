/**
 * Storage utilities for the e-learning platform
 */

// Storage keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  USER_PREFERENCES: 'user_preferences',
  COURSE_PROGRESS: 'course_progress',
  CART_ITEMS: 'cart_items',
  SEARCH_HISTORY: 'search_history',
  THEME_PREFERENCE: 'theme_preference',
  LANGUAGE_PREFERENCE: 'language_preference',
  NOTIFICATION_SETTINGS: 'notification_settings',
  VIDEO_QUALITY: 'video_quality',
  PLAYBACK_SPEED: 'playback_speed',
  RECENTLY_VIEWED: 'recently_viewed_courses',
  BOOKMARKS: 'course_bookmarks',
  FILTERS: 'course_filters',
  FORM_DRAFTS: 'form_drafts'
};

// LocalStorage utilities
export const localStorage = {
  // Set item in localStorage
  setItem: (key, value) => {
    try {
      const serializedValue = JSON.stringify(value);
      window.localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error('Error setting localStorage item:', error);
      return false;
    }
  },

  // Get item from localStorage
  getItem: (key, defaultValue = null) => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error('Error getting localStorage item:', error);
      return defaultValue;
    }
  },

  // Remove item from localStorage
  removeItem: (key) => {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing localStorage item:', error);
      return false;
    }
  },

  // Clear all localStorage
  clear: () => {
    try {
      window.localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },

  // Check if key exists
  hasItem: (key) => {
    return window.localStorage.getItem(key) !== null;
  },

  // Get all keys
  getAllKeys: () => {
    return Object.keys(window.localStorage);
  },

  // Get storage size
  getSize: () => {
    let total = 0;
    for (let key in window.localStorage) {
      if (window.localStorage.hasOwnProperty(key)) {
        total += window.localStorage[key].length + key.length;
      }
    }
    return total;
  }
};

// SessionStorage utilities
export const sessionStorage = {
  // Set item in sessionStorage
  setItem: (key, value) => {
    try {
      const serializedValue = JSON.stringify(value);
      window.sessionStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error('Error setting sessionStorage item:', error);
      return false;
    }
  },

  // Get item from sessionStorage
  getItem: (key, defaultValue = null) => {
    try {
      const item = window.sessionStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error('Error getting sessionStorage item:', error);
      return defaultValue;
    }
  },

  // Remove item from sessionStorage
  removeItem: (key) => {
    try {
      window.sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing sessionStorage item:', error);
      return false;
    }
  },

  // Clear all sessionStorage
  clear: () => {
    try {
      window.sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
      return false;
    }
  },

  // Check if key exists
  hasItem: (key) => {
    return window.sessionStorage.getItem(key) !== null;
  }
};

// Cookie utilities
export const cookies = {
  // Set cookie
  setCookie: (name, value, options = {}) => {
    try {
      let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(JSON.stringify(value))}`;
      
      // Set expiration
      if (options.expires) {
        if (typeof options.expires === 'number') {
          const date = new Date();
          date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
          cookieString += `; expires=${date.toUTCString()}`;
        } else if (options.expires instanceof Date) {
          cookieString += `; expires=${options.expires.toUTCString()}`;
        }
      }
      
      // Set path
      if (options.path) {
        cookieString += `; path=${options.path}`;
      }
      
      // Set domain
      if (options.domain) {
        cookieString += `; domain=${options.domain}`;
      }
      
      // Set secure flag
      if (options.secure) {
        cookieString += '; secure';
      }
      
      // Set httpOnly flag
      if (options.httpOnly) {
        cookieString += '; httpOnly';
      }
      
      // Set sameSite
      if (options.sameSite) {
        cookieString += `; sameSite=${options.sameSite}`;
      }
      
      document.cookie = cookieString;
      return true;
    } catch (error) {
      console.error('Error setting cookie:', error);
      return false;
    }
  },

  // Get cookie
  getCookie: (name, defaultValue = null) => {
    try {
      const nameEQ = encodeURIComponent(name) + '=';
      const cookies = document.cookie.split(';');
      
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(nameEQ) === 0) {
          const value = cookie.substring(nameEQ.length);
          return JSON.parse(decodeURIComponent(value));
        }
      }
      
      return defaultValue;
    } catch (error) {
      console.error('Error getting cookie:', error);
      return defaultValue;
    }
  },

  // Remove cookie
  removeCookie: (name, options = {}) => {
    const expiredOptions = {
      ...options,
      expires: new Date(0)
    };
    return cookies.setCookie(name, '', expiredOptions);
  },

  // Check if cookie exists
  hasCookie: (name) => {
    return cookies.getCookie(name) !== null;
  },

  // Get all cookies
  getAllCookies: () => {
    try {
      const cookieObj = {};
      const cookies = document.cookie.split(';');
      
      for (let cookie of cookies) {
        cookie = cookie.trim();
        const [name, value] = cookie.split('=');
        if (name && value) {
          cookieObj[decodeURIComponent(name)] = JSON.parse(decodeURIComponent(value));
        }
      }
      
      return cookieObj;
    } catch (error) {
      console.error('Error getting all cookies:', error);
      return {};
    }
  }
};

// Storage abstraction layer
export const storage = {
  // Set data with automatic storage selection
  set: (key, value, persistent = true) => {
    if (persistent) {
      return localStorage.setItem(key, value);
    } else {
      return sessionStorage.setItem(key, value);
    }
  },

  // Get data from any available storage
  get: (key, defaultValue = null) => {
    // Try localStorage first
    let value = localStorage.getItem(key, null);
    if (value !== null) return value;
    
    // Try sessionStorage
    value = sessionStorage.getItem(key, null);
    if (value !== null) return value;
    
    // Try cookies
    value = cookies.getCookie(key, null);
    if (value !== null) return value;
    
    return defaultValue;
  },

  // Remove from all storages
  remove: (key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
    cookies.removeCookie(key);
  },

  // Clear all data
  clearAll: () => {
    localStorage.clear();
    sessionStorage.clear();
    // Note: Cannot clear all cookies without knowing their names
  }
};

// Auth-specific storage functions (MISSING EXPORTS ADDED HERE)
export const getStoredAuth = () => {
  try {
    const user = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    const token = localStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    if (user && token) {
      return {
        user,
        token,
        refreshToken
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting stored auth:', error);
    return null;
  }
};

export const setStoredAuth = (authData) => {
  try {
    if (authData.user) {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, authData.user);
    }
    if (authData.token) {
      localStorage.setItem(STORAGE_KEYS.USER_TOKEN, authData.token);
    }
    if (authData.refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken);
    }
    return true;
  } catch (error) {
    console.error('Error setting stored auth:', error);
    return false;
  }
};

export const removeStoredAuth = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    return true;
  } catch (error) {
    console.error('Error removing stored auth:', error);
    return false;
  }
};

// User-specific storage utilities
export const userStorage = {
  // Save user preferences
  saveUserPreferences: (preferences) => {
    return localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
  },

  // Get user preferences
  getUserPreferences: () => {
    return localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES, {
      theme: 'light',
      language: 'en',
      notifications: true,
      autoplay: false,
      videoQuality: 'auto'
    });
  },

  // Save course progress
  saveCourseProgress: (courseId, progress) => {
    const allProgress = localStorage.getItem(STORAGE_KEYS.COURSE_PROGRESS, {});
    allProgress[courseId] = progress;
    return localStorage.setItem(STORAGE_KEYS.COURSE_PROGRESS, allProgress);
  },

  // Get course progress
  getCourseProgress: (courseId) => {
    const allProgress = localStorage.getItem(STORAGE_KEYS.COURSE_PROGRESS, {});
    return allProgress[courseId] || { completed: 0, total: 0, lastAccessed: null };
  },

  // Save search history
  saveSearchHistory: (searchTerm) => {
    const history = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY, []);
    const filteredHistory = history.filter(term => term !== searchTerm);
    const newHistory = [searchTerm, ...filteredHistory].slice(0, 10); // Keep last 10 searches
    return localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, newHistory);
  },

  // Get search history
  getSearchHistory: () => {
    return localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY, []);
  },

  // Clear search history
  clearSearchHistory: () => {
    return localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
  },

  // Save recently viewed courses
  saveRecentlyViewed: (courseId) => {
    const recent = localStorage.getItem(STORAGE_KEYS.RECENTLY_VIEWED, []);
    const filtered = recent.filter(id => id !== courseId);
    const newRecent = [courseId, ...filtered].slice(0, 20); // Keep last 20 courses
    return localStorage.setItem(STORAGE_KEYS.RECENTLY_VIEWED, newRecent);
  },

  // Get recently viewed courses
  getRecentlyViewed: () => {
    return localStorage.getItem(STORAGE_KEYS.RECENTLY_VIEWED, []);
  }
};

// Storage cleanup utility
export const cleanupStorage = () => {
  try {
    // Remove expired data
    const now = new Date().getTime();
    const keys = localStorage.getAllKeys();
    
    keys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data && data.expires && data.expires < now) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        // Ignore parsing errors for non-JSON data
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error cleaning up storage:', error);
    return false;
  }
};

// Check storage availability
export const isStorageAvailable = (type) => {
  try {
    const storage = window[type];
    const testKey = '__storage_test__';
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};