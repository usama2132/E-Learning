// Updated src/utils/api.js - Backend integration with proper token handling

import { API_CONFIG, API_ENDPOINTS } from './config';
import { getAuthToken, clearAuthData } from './auth';
import { mockAPI } from './mockApi'; // Keep as fallback

// Determine if we should use mock API
const USE_MOCK_API = API_CONFIG.USE_MOCK || process.env.REACT_APP_USE_MOCK === 'true';

// Enhanced API client for handling HTTP requests with backend
class ApiClient {
  constructor(baseURL = 'http://localhost:5000/api') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  // FIXED: Get headers with authentication token from multiple possible sources
  getHeaders(customHeaders = {}) {
    // Try multiple token sources in order of preference
    const token = getAuthToken() || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('lms_auth_token') ||
                  localStorage.getItem('access_token') ||
                  sessionStorage.getItem('token');
    
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log('API request with token:', token.substring(0, 20) + '...');
    } else {
      console.warn('No authentication token found for API request');
    }
    
    return headers;
  }

  // Enhanced error handler for backend responses
  async handleResponse(response) {
    if (!response.ok) {
      let errorData;
      
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: `HTTP error! status: ${response.status}` };
      }

      console.error('API Error Response:', response.status, errorData);

      // Handle specific status codes
      switch (response.status) {
        case 401:
          console.warn('Unauthorized - clearing auth data');
          clearAuthData();
          localStorage.removeItem('token');
          localStorage.removeItem('lms_auth_token');
          sessionStorage.removeItem('token');
          
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            console.log('Redirecting to login due to 401');
            window.location.href = '/login';
          }
          throw new Error(errorData.message || 'Unauthorized - Please log in again');
          
        case 403:
          throw new Error(errorData.message || 'Forbidden');
          
        case 404:
          throw new Error(errorData.message || 'Resource not found');
          
        case 422:
          throw new Error(errorData.message || 'Validation error');
          
        case 500:
          throw new Error(errorData.message || 'Internal server error');
          
        default:
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response;
  }

  // GET request with enhanced error handling
  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    // Add query parameters
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        url.searchParams.append(key, params[key]);
      }
    });

    console.log('GET Request:', url.toString());

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include', // Include cookies if needed
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('GET request failed:', error);
      throw error;
    }
  }

  // POST request with enhanced handling
  async post(endpoint, data = null, customHeaders = {}) {
    console.log('POST Request:', `${this.baseURL}${endpoint}`, data);
    
    try {
      const headers = this.getHeaders(customHeaders);
      let body;

      if (data instanceof FormData) {
        // Remove Content-Type header for FormData (let browser set it)
        delete headers['Content-Type'];
        body = data;
      } else if (data) {
        body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body,
        credentials: 'include',
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('POST request failed:', error);
      throw error;
    }
  }

  // PUT request
  async put(endpoint, data = null, customHeaders = {}) {
    console.log('PUT Request:', `${this.baseURL}${endpoint}`, data);
    
    try {
      const headers = this.getHeaders(customHeaders);
      let body;

      if (data instanceof FormData) {
        delete headers['Content-Type'];
        body = data;
      } else if (data) {
        body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers,
        body,
        credentials: 'include',
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('PUT request failed:', error);
      throw error;
    }
  }

  // PATCH request
  async patch(endpoint, data = null, customHeaders = {}) {
    console.log('PATCH Request:', `${this.baseURL}${endpoint}`, data);
    
    try {
      const headers = this.getHeaders(customHeaders);
      let body;

      if (data instanceof FormData) {
        delete headers['Content-Type'];
        body = data;
      } else if (data) {
        body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PATCH',
        headers,
        body,
        credentials: 'include',
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('PATCH request failed:', error);
      throw error;
    }
  }

  // DELETE request
  async delete(endpoint) {
    console.log('DELETE Request:', `${this.baseURL}${endpoint}`);
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('DELETE request failed:', error);
      throw error;
    }
  }
}

// Create API client instance
const apiClient = new ApiClient();

// Main API object with all endpoints - FIXED TO USE CORRECT ENDPOINTS
export const api = {
  // Authentication endpoints
  auth: {
    login: async (credentials) => {
      if (USE_MOCK_API) {
        console.log('Using mock login');
        return mockAPI.auth.login(credentials);
      }
      
      try {
        const response = await apiClient.post('/auth/login', credentials);
        
        // Store the token after successful login
        if (response.success && response.data && response.data.accessToken) {
          const token = response.data.accessToken;
          localStorage.setItem('token', token);
          localStorage.setItem('lms_auth_token', token);
          console.log('Token stored after login:', token.substring(0, 20) + '...');
        }
        
        return response;
      } catch (error) {
        console.error('Login API error:', error);
        throw error;
      }
    },

    register: async (userData) => {
      if (USE_MOCK_API) {
        console.log('Using mock register');
        return mockAPI.auth.register(userData);
      }
      return apiClient.post('/auth/register', userData);
    },
    
    logout: async () => {
      if (USE_MOCK_API) {
        console.log('Using mock logout');
        return Promise.resolve({ success: true });
      }
      
      try {
        const response = await apiClient.post('/auth/logout');
        
        // Clear tokens after successful logout
        localStorage.removeItem('token');
        localStorage.removeItem('lms_auth_token');
        sessionStorage.removeItem('token');
        clearAuthData();
        console.log('Tokens cleared after logout');
        
        return response;
      } catch (error) {
        // Clear tokens even if logout request fails
        localStorage.removeItem('token');
        localStorage.removeItem('lms_auth_token');
        sessionStorage.removeItem('token');
        clearAuthData();
        console.warn('Logout request failed, but tokens cleared locally');
        return { success: true };
      }
    },
    
    refresh: () => {
      if (USE_MOCK_API) {
        return Promise.resolve({ success: true, token: 'mock-refresh-token' });
      }
      return apiClient.post('/auth/refresh');
    },
    
    forgotPassword: (email) => {
      if (USE_MOCK_API) {
        console.log('Using mock forgot password');
        return mockAPI.auth.forgotPassword({ email });
      }
      return apiClient.post('/auth/forgot-password', { email });
    },
    
    resetPassword: (token, password) => {
      if (USE_MOCK_API) {
        console.log('Using mock reset password');
        return mockAPI.auth.resetPassword({ token, password });
      }
      return apiClient.post(`/auth/reset-password/${token}`, { password });
    },
    
    verifyEmail: (token) => {
      if (USE_MOCK_API) {
        return Promise.resolve({ success: true });
      }
      return apiClient.post('/auth/verify-email', { token });
    },
    
    verifyToken: () => {
      if (USE_MOCK_API) {
        console.log('Using mock verify token');
        return mockAPI.auth.verifyToken(getAuthToken());
      }
      return apiClient.get('/auth/validate-token');
    },
  },

  // Course endpoints - FIXED TO MATCH BACKEND ROUTES EXACTLY
  courses: {
    getCourses: (params) => {
      if (USE_MOCK_API) {
        console.log('Using mock get courses');
        return mockAPI.courses.getCourses(params);
      }
      return apiClient.get('/courses', params);
    },

    getCourseById: (courseId) => {
      if (USE_MOCK_API) {
        console.log('Using mock get course by id');
        return mockAPI.courses.getCourseById(courseId);
      }
      return apiClient.get(`/courses/${courseId}`);
    },

    createCourse: (courseData) => {
      if (USE_MOCK_API) {
        console.log('Using mock create course');
        return mockAPI.courses.createCourse(courseData);
      }
      
      console.log('Creating course with real backend:', courseData);
      return apiClient.post('/courses', courseData);
    },

    updateCourse: (courseId, courseData) => {
      if (USE_MOCK_API) {
        console.log('Using mock update course');
        return mockAPI.courses.updateCourse(courseId, courseData);
      }
      return apiClient.put(`/courses/${courseId}`, courseData);
    },

    deleteCourse: (courseId) => {
      if (USE_MOCK_API) {
        console.log('Using mock delete course');
        return mockAPI.courses.deleteCourse(courseId);
      }
      return apiClient.delete(`/courses/${courseId}`);
    },

    // FIXED: Correct route for getting instructor courses
    getInstructorCourses: (instructorId) => {
      if (USE_MOCK_API) {
        console.log('Using mock get instructor courses');
        return mockAPI.courses.getInstructorCourses(instructorId);
      }
      // This matches the backend route: /courses/instructor/my-courses
      return apiClient.get('/courses/instructor/my-courses');
    },

    // FIXED: Get all categories - corrected route
    getAllCategories: () => {
      if (USE_MOCK_API) {
        console.log('Using mock get categories');
        return mockAPI.courses.getAllCategories();
      }
      // This matches the backend route: /courses/categories
      return apiClient.get('/courses/categories');
    },

    searchCourses: (params) => {
      if (USE_MOCK_API) {
        console.log('Using mock search courses');
        return mockAPI.courses.searchCourses(params);
      }
      return apiClient.get('/courses/search', params);
    },

    getFeaturedCourses: () => {
      if (USE_MOCK_API) {
        console.log('Using mock get featured courses');
        return mockAPI.courses.getFeaturedCourses();
      }
      return apiClient.get('/courses/featured');
    },

    // FIXED: Use correct backend endpoint
    getEnrolledCourses: (params) => {
      if (USE_MOCK_API) {
        console.log('Using mock get enrolled courses');
        return mockAPI.courses.getEnrolledCourses();
      }
      return apiClient.get('/student/enrolled-courses', params);
    },

    enrollInCourse: (courseId) => {
      if (USE_MOCK_API) {
        console.log('Using mock enroll in course');
        return mockAPI.courses.enrollInCourse(courseId);
      }
      return apiClient.post(`/student/enroll/${courseId}`);
    }
  },

  // Payment endpoints - FIXED
  payments: {
    createPaymentIntent: (data) => {
      if (USE_MOCK_API) {
        console.log('Using mock create payment intent');
        return Promise.resolve({ success: true, data: { transactionId: 'mock-123', clientSecret: 'mock-secret' } });
      }
      return apiClient.post('/payments/create-intent', data);
    },

    confirmPayment: (data) => {
      if (USE_MOCK_API) {
        console.log('Using mock confirm payment');
        return Promise.resolve({ success: true });
      }
      return apiClient.post('/payments/confirm', data);
    },

    getPaymentHistory: () => {
      if (USE_MOCK_API) {
        return Promise.resolve({ success: true, data: { payments: [] } });
      }
      return apiClient.get('/student/payment-history');
    }
  },

  // File uploads - FIXED TO MATCH BACKEND ROUTES
  uploads: {
    uploadVideo: async (courseId, file, onProgress) => {
      if (USE_MOCK_API) {
        console.log('Using mock upload video');
        return new Promise((resolve) => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            if (onProgress) onProgress({ loaded: progress, total: 100 });
            if (progress >= 100) {
              clearInterval(interval);
              resolve({
                success: true,
                data: {
                  videoUrl: 'https://mock-cloudinary.com/video/sample-video.mp4',
                  publicId: 'mock-video-id-' + Date.now()
                }
              });
            }
          }, 200);
        });
      }
      
      const formData = new FormData();
      formData.append('video', file);
      
      console.log('Uploading video to backend for course:', courseId);
      return apiClient.post(`/uploads/course/${courseId}/video`, formData);
    },

    uploadImage: (file) => {
      if (USE_MOCK_API) {
        console.log('Using mock upload image');
        return Promise.resolve({
          success: true,
          url: 'https://mock-cloudinary.com/image/sample-image.jpg',
          publicId: 'mock-image-id-' + Date.now()
        });
      }
      
      const formData = new FormData();
      formData.append('image', file);
      return apiClient.post('/uploads/image', formData);
    },

    uploadThumbnail: (courseId, file) => {
      if (USE_MOCK_API) {
        console.log('Using mock upload thumbnail');
        return Promise.resolve({
          success: true,
          data: {
            thumbnailUrl: 'https://mock-cloudinary.com/image/sample-thumbnail.jpg',
            publicId: 'mock-thumb-id-' + Date.now()
          }
        });
      }
      
      const formData = new FormData();
      formData.append('thumbnail', file);
      
      console.log('Uploading thumbnail to backend for course:', courseId);
      return apiClient.post(`/uploads/course/${courseId}/thumbnail`, formData);
    },

    uploadDocument: (file) => {
      if (USE_MOCK_API) {
        console.log('Using mock upload document');
        return Promise.resolve({
          success: true,
          url: 'https://mock-cloudinary.com/document/sample-doc.pdf',
          publicId: 'mock-doc-id-' + Date.now()
        });
      }
      
      const formData = new FormData();
      formData.append('document', file);
      return apiClient.post('/uploads/document', formData);
    },

    deleteFile: (publicId) => {
      if (USE_MOCK_API) {
        console.log('Using mock delete file');
        return Promise.resolve({ success: true, message: 'File deleted successfully' });
      }
      return apiClient.delete(`/uploads/delete/${publicId}`);
    }
  },

  // User endpoints
  users: {
    getProfile: () => {
      if (USE_MOCK_API) {
        console.log('Using mock get profile');
        return mockAPI.users.getProfile();
      }
      return apiClient.get('/student/profile');
    },

    updateProfile: (profileData) => {
      if (USE_MOCK_API) {
        console.log('Using mock update profile');
        return mockAPI.users.updateProfile(profileData);
      }
      return apiClient.put('/student/profile', profileData);
    },

    getAllUsers: (params) => {
      if (USE_MOCK_API) {
        console.log('Using mock get all users');
        return mockAPI.users.getAllUsers(params);
      }
      return apiClient.get('/admin/users', params);
    },

    deleteUser: (userId) => {
      if (USE_MOCK_API) {
        console.log('Using mock delete user');
        return mockAPI.users.deleteUser(userId);
      }
      return apiClient.delete(`/admin/users/${userId}`);
    },

    getUserById: (userId) => {
      if (USE_MOCK_API) {
        console.log('Using mock get user by id');
        return mockAPI.users.getUserById(userId);
      }
      return apiClient.get(`/users/${userId}`);
    },

    updateUserRole: (userId, role) => {
      if (USE_MOCK_API) {
        console.log('Using mock update user role');
        return mockAPI.users.updateUserRole(userId, role);
      }
      return apiClient.patch(`/admin/users/${userId}/role`, { role });
    }
  },

  // Student endpoints - FIXED TO MATCH BACKEND ROUTES
  student: {
    getDashboard: () => {
      if (USE_MOCK_API) {
        return Promise.resolve({ success: true, data: { enrolledCourses: [] } });
      }
      return apiClient.get('/student/dashboard');
    },

    // FIXED: Use correct endpoint from studentController
    getCourses: (params) => {
      if (USE_MOCK_API) {
        return Promise.resolve({ success: true, data: { courses: [] } });
      }
      return apiClient.get('/student/enrolled-courses', params);
    },

    getProgress: (courseId) => {
      if (USE_MOCK_API) {
        return Promise.resolve({ success: true, data: { progress: 0 } });
      }
      return apiClient.get(`/student/course/${courseId}/progress`);
    },

    getStats: (params) => {
      if (USE_MOCK_API) {
        return Promise.resolve({ success: true, data: { stats: {} } });
      }
      return apiClient.get('/student/stats', params);
    },

    getRecentActivity: (params) => {
      if (USE_MOCK_API) {
        return Promise.resolve({ success: true, data: { recentActivity: [] } });
      }
      return apiClient.get('/student/recent-activity', params);
    }
  }
};

// Helper functions
export const checkBackendConnection = async () => {
  try {
    const response = await fetch(`http://localhost:5000/api/health`);
    return response.ok;
  } catch (error) {
    console.warn('Backend connection failed:', error.message);
    return false;
  }
};

export const switchToBackend = () => {
  window.__USE_REAL_BACKEND__ = true;
  console.log('Switched to real backend API');
};

export const switchToMock = () => {
  window.__USE_REAL_BACKEND__ = false;
  console.log('Switched to mock API');
};

export const enableMockAPI = () => {
  window.__MOCK_API_ENABLED__ = true;
  console.log('MOCK API ENABLED');
};

// Additional named exports for backward compatibility
export const authAPI = api.auth;
export const courseAPI = api.courses;
export const paymentAPI = api.payments;

// Export default API client for custom requests
export default apiClient;