// utils/formatters.js
import { CURRENCY_SYMBOLS, DATE_FORMATS } from './constants';

/**
 * Format currency value
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {Object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD', options = {}) => {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    useSymbol = true,
    locale = 'en-US',
  } = options;

  if (amount === null || amount === undefined || isNaN(amount)) {
    return useSymbol ? `${CURRENCY_SYMBOLS[currency] || '$'}0.00` : '0.00';
  }

  const formatter = new Intl.NumberFormat(locale, {
    style: useSymbol ? 'currency' : 'decimal',
    currency: currency,
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return formatter.format(amount);
};

/**
 * Format number with thousands separators
 * @param {number} number - Number to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted number string
 */
export const formatNumber = (number, options = {}) => {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    locale = 'en-US',
  } = options;

  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(number);
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {Object} options - Formatting options
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, options = {}) => {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 1,
    locale = 'en-US',
  } = options;

  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value / 100);
};

/**
 * Format date
 * @param {Date|string|number} date - Date to format
 * @param {string} format - Format type or custom format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = DATE_FORMATS.SHORT, options = {}) => {
  const { locale = 'en-US', timezone } = options;

  if (!date) return '';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const formatOptions = { ...options };
  if (timezone) formatOptions.timeZone = timezone;

  switch (format) {
    case DATE_FORMATS.SHORT:
      return dateObj.toLocaleDateString(locale, formatOptions);
    
    case DATE_FORMATS.LONG:
      return dateObj.toLocaleDateString(locale, {
        ...formatOptions,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    
    case DATE_FORMATS.WITH_TIME:
      return dateObj.toLocaleString(locale, {
        ...formatOptions,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    
    case DATE_FORMATS.ISO:
      return dateObj.toISOString();
    
    case DATE_FORMATS.RELATIVE:
      return formatRelativeDate(dateObj);
    
    default:
      // Custom format or fallback
      return dateObj.toLocaleDateString(locale, formatOptions);
  }
};

/**
 * Format relative date (e.g., "2 days ago", "in 3 hours")
 * @param {Date} date - Date to format
 * @returns {string} Relative date string
 */
export const formatRelativeDate = (date) => {
  if (!date) return '';

  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else if (diffWeeks < 4) {
    return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  } else if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
  } else {
    return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
  }
};

/**
 * Format duration in seconds to human readable format
 * @param {number} seconds - Duration in seconds
 * @param {Object} options - Formatting options
 * @returns {string} Formatted duration string
 */
export const formatDuration = (seconds, options = {}) => {
  const { format = 'long', showSeconds = true } = options;

  if (!seconds || isNaN(seconds)) return '0 minutes';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (format === 'short') {
    if (hours > 0) {
      return showSeconds
        ? `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
        : `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    return showSeconds
      ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
      : `${minutes}m`;
  }

  // Long format
  const parts = [];
  if (hours > 0) {
    parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  }
  if (showSeconds && remainingSeconds > 0) {
    parts.push(`${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`);
  }

  if (parts.length === 0) {
    return showSeconds ? '0 seconds' : '0 minutes';
  }

  return parts.join(', ');
};

/**
 * Format file size in bytes to human readable format
 * @param {number} bytes - Size in bytes
 * @param {Object} options - Formatting options
 * @returns {string} Formatted file size string
 */
export const formatFileSize = (bytes, options = {}) => {
  const { decimals = 2, binary = false } = options;

  if (bytes === 0) return '0 Bytes';
  if (!bytes || isNaN(bytes)) return '0 Bytes';

  const k = binary ? 1024 : 1000;
  const sizes = binary
    ? ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
    : ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);

  return `${size.toFixed(decimals)} ${sizes[i]}`;
};

/**
 * Format phone number
 * @param {string} phoneNumber - Phone number to format
 * @param {string} format - Format type ('us', 'international')
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber, format = 'us') => {
  if (!phoneNumber) return '';

  // Remove all non-digits
  const cleaned = phoneNumber.replace(/\D/g, '');

  if (format === 'us' && cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (format === 'us' && cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  // Return original for other formats or invalid lengths
  return phoneNumber;
};

/**
 * Format text to title case
 * @param {string} text - Text to format
 * @returns {string} Title cased text
 */
export const formatTitleCase = (text) => {
  if (!text) return '';

  const smallWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'of', 'on', 'or', 'the', 'to', 'up'];

  return text
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index === 0 || !smallWords.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(' ');
};

/**
 * Format text to sentence case
 * @param {string} text - Text to format
 * @returns {string} Sentence cased text
 */
export const formatSentenceCase = (text) => {
  if (!text) return '';

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Format camelCase to readable text
 * @param {string} camelCaseText - CamelCase text
 * @returns {string} Readable text
 */
export const formatCamelCaseToReadable = (camelCaseText) => {
  if (!camelCaseText) return '';

  return camelCaseText
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

/**
 * Format snake_case to readable text
 * @param {string} snakeCaseText - Snake_case text
 * @returns {string} Readable text
 */
export const formatSnakeCaseToReadable = (snakeCaseText) => {
  if (!snakeCaseText) return '';

  return snakeCaseText
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {Object} options - Truncation options
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength, options = {}) => {
  const { suffix = '...', wordBoundary = true } = options;

  if (!text || text.length <= maxLength) return text || '';

  let truncated = text.slice(0, maxLength);

  if (wordBoundary) {
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
      truncated = truncated.slice(0, lastSpace);
    }
  }

  return truncated + suffix;
};

/**
 * Format array to readable list
 * @param {Array} array - Array to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted list string
 */
export const formatArrayToList = (array, options = {}) => {
  const { conjunction = 'and', oxford = true } = options;

  if (!Array.isArray(array) || array.length === 0) return '';

  if (array.length === 1) return array[0].toString();

  if (array.length === 2) {
    return `${array[0]} ${conjunction} ${array[1]}`;
  }

  const lastItem = array[array.length - 1];
  const otherItems = array.slice(0, -1);
  const separator = oxford ? `, ${conjunction} ` : ` ${conjunction} `;

  return otherItems.join(', ') + separator + lastItem;
};

/**
 * Format rating to stars
 * @param {number} rating - Rating value (0-5)
 * @param {Object} options - Formatting options
 * @returns {string} Star representation
 */
export const formatRatingToStars = (rating, options = {}) => {
  const { maxStars = 5, starChar = '★', emptyChar = '☆', showNumber = true } = options;

  if (rating === null || rating === undefined || isNaN(rating)) {
    return emptyChar.repeat(maxStars);
  }

  const clampedRating = Math.max(0, Math.min(maxStars, rating));
  const fullStars = Math.floor(clampedRating);
  const hasHalfStar = clampedRating % 1 >= 0.5;
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

  let stars = starChar.repeat(fullStars);
  if (hasHalfStar) stars += '☆'; // Half star representation
  stars += emptyChar.repeat(emptyStars);

  return showNumber ? `${stars} (${clampedRating.toFixed(1)})` : stars;
};

/**
 * Format course progress
 * @param {number} completed - Completed lessons
 * @param {number} total - Total lessons
 * @param {Object} options - Formatting options
 * @returns {Object} Progress information
 */
export const formatCourseProgress = (completed, total, options = {}) => {
  const { includePercentage = true, includeText = true } = options;

  if (!total || total === 0) {
    return {
      percentage: 0,
      text: '0/0',
      formatted: '0%',
    };
  }

  const percentage = Math.round((completed / total) * 100);
  const text = `${completed}/${total}`;

  let formatted = '';
  if (includeText) formatted += text;
  if (includePercentage) {
    formatted += includeText ? ` (${percentage}%)` : `${percentage}%`;
  }

  return {
    percentage,
    text,
    formatted,
  };
};

/**
 * Format API response for display
 * @param {Object} response - API response
 * @returns {Object} Formatted response
 */
export const formatApiResponse = (response) => {
  if (!response) return null;

  const formatted = { ...response };

  // Format dates
  const dateFields = ['createdAt', 'updatedAt', 'publishedAt', 'enrolledAt'];
  dateFields.forEach(field => {
    if (formatted[field]) {
      formatted[field] = formatDate(formatted[field], DATE_FORMATS.RELATIVE);
    }
  });

  // Format prices
  if (formatted.price !== undefined) {
    formatted.formattedPrice = formatCurrency(formatted.price);
  }

  // Format duration
  if (formatted.duration) {
    formatted.formattedDuration = formatDuration(formatted.duration);
  }

  // Format file sizes
  if (formatted.fileSize) {
    formatted.formattedFileSize = formatFileSize(formatted.fileSize);
  }

  return formatted;
};