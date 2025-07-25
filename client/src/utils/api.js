// Updated src/utils/api.js - Complete version with all mock API endpoints

import { API_CONFIG as CONFIG } from './config';
import { getAuthToken, clearAuthData } from './auth';
import { mockAPI } from './mockApi'; // Import mock API


// Check if we should use mock API
const USE_MOCK_API = !process.env.REACT_APP_API_URL || window.__MOCK_API_ENABLED__;

// Base API class for handling HTTP requests
class ApiClient {
  constructor(baseURL = CONFIG.baseURL || CONFIG.API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Get headers with authentication token
  getHeaders(customHeaders = {}) {
    const token = getAuthToken();
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Handle API responses and errors
  async handleResponse(response) {
    if (!response.ok) {
      if (response.status === 401) {
        clearAuthData();
        window.location.href = '/login';
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response;
  }

  // GET request
  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key]);
      }
    });

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('GET request failed:', error);
      throw error;
    }
  }

  // POST request
  async post(endpoint, data = null, customHeaders = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(customHeaders),
        body: data instanceof FormData ? data : JSON.stringify(data),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('POST request failed:', error);
      throw error;
    }
  }

  // PUT request
  async put(endpoint, data = null, customHeaders = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(customHeaders),
        body: data instanceof FormData ? data : JSON.stringify(data),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('PUT request failed:', error);
      throw error;
    }
  }

  // PATCH request
  async patch(endpoint, data = null, customHeaders = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PATCH',
        headers: this.getHeaders(customHeaders),
        body: data instanceof FormData ? data : JSON.stringify(data),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('PATCH request failed:', error);
      throw error;
    }
  }

  // DELETE request
  async delete(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('DELETE request failed:', error);
      throw error;
    }
  }
}

// Create and export API client instance
const apiClient = new ApiClient();

// Specific API endpoints with comprehensive mock support
export const api = {
  auth: {
    login: async ({ email, password }) => {
      // Mock user database
      const mockUsers = [
        {
          email: 'admin@example.com',
          password: 'admin123',
          user: { id: 1, name: 'Admin', role: 'admin', avatar: '' },
          token: 'mock-admin-token'
        },
        {
          email: 'instructor@example.com',
          password: 'instructor123',
          user: { id: 2, name: 'Instructor', role: 'instructor', avatar: '' },
          token: 'mock-instructor-token'
        },
        {
          email: 'student@example.com',
          password: 'student123',
          user: { id: 3, name: 'Student', role: 'student', avatar: '' },
          token: 'mock-student-token'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const user = mockUsers.find(u => 
        u.email === email && u.password === password
      );

      if (user) {
        return { 
          success: true,
          user: user.user,
          token: user.token
        };
      } else {
        return { 
          success: false, 
          message: 'Invalid email or password' 
        };
      }
    },

    // Add the admin endpoints section here
   admin: {
    getDashboardData: async () => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock admin dashboard data');
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        return {
          success: true,
          data: {
            pendingCourses: 5,
            newUsers: 3,
            recentTransactions: 12,
            systemAlerts: 1,
            serverStatus: 'online',
            databaseStatus: 'connected',
            lastUpdated: new Date().toISOString(),
            // Additional stats for the overview
            totalUsers: 1250,
            totalInstructors: 85,
            totalStudents: 1165,
            totalCourses: 156,
            approvedCourses: 142,
            rejectedCourses: 9,
            totalRevenue: 125000,
            monthlyRevenue: 15600,
            activeUsers: 850
          }
        };
      }
      return apiClient.get('/admin/dashboard');
    },

    getAllUsers: (params) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock get all users');
        return mockAPI.users.getAllUsers(params);
      }
      return apiClient.get('/admin/users', params);
    },

    getPendingCourses: (params) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock get pending courses');
        return mockAPI.courses.getPendingCourses(params);
      }
      return apiClient.get('/admin/courses/pending', params);
    },

    getTransactions: (params) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock get admin transactions');
        return mockAPI.payments.getTransactions(params);
      }
      return apiClient.get('/admin/transactions', params);
    },

    getSystemSettings: () => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock get system settings');
        return api.system.getSettings();
      }
      return apiClient.get('/admin/settings');
    },

    updateSystemSettings: (settings) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock update system settings');
        return api.system.updateSettings(settings);
      }
      return apiClient.put('/admin/settings', settings);
    }
  },
    
    register: (userData) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock register');
        return mockAPI.auth.register(userData);
      }
      return apiClient.post('/auth/register', userData);
    },
    
    logout: () => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock logout');
        return Promise.resolve({ success: true });
      }
      return apiClient.post('/auth/logout');
    },
    
    refresh: () => {
      if (USE_MOCK_API) {
        return Promise.resolve({ success: true, token: 'mock-refresh-token' });
      }
      return apiClient.post('/auth/refresh');
    },
    
    forgotPassword: (email) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock forgot password');
        return mockAPI.auth.forgotPassword({ email });
      }
      return apiClient.post('/auth/forgot-password', { email });
    },
    
    resetPassword: (token, password) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock reset password');
        return mockAPI.auth.resetPassword({ token, password });
      }
      return apiClient.post('/auth/reset-password', { token, password });
    },
    
    verifyEmail: (token) => {
      if (USE_MOCK_API) {
        return Promise.resolve({ success: true });
      }
      return apiClient.post('/auth/verify-email', { token });
    },
    
    verifyToken: (token) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock verify token');
        return mockAPI.auth.verifyToken(token);
      }
      return apiClient.post('/auth/verify-token', { token });
    },
  },

  // Users (with mock support)
  users: {
    getProfile: () => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock get profile');
        return mockAPI.users.getProfile();
      }
      return apiClient.get('/users/profile');
    },

    updateProfile: (profileData) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock update profile');
        return mockAPI.users.updateProfile(profileData);
      }
      return apiClient.put('/users/profile', profileData);
    },

    getAllUsers: (params) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock get all users');
        return mockAPI.users.getAllUsers(params);
      }
      return apiClient.get('/users', params);
    },

    deleteUser: (userId) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock delete user');
        return mockAPI.users.deleteUser(userId);
      }
      return apiClient.delete(`/users/${userId}`);
    },

    getUserById: (userId) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock get user by id');
        return mockAPI.users.getUserById(userId);
      }
      return apiClient.get(`/users/${userId}`);
    },

    updateUserRole: (userId, role) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock update user role');
        return mockAPI.users.updateUserRole(userId, role);
      }
      return apiClient.patch(`/users/${userId}/role`, { role });
    }
  },

  // Courses (with mock support)
  courses: {
    getCourses: (params) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock get courses');
        return mockAPI.courses.getCourses(params);
      }
      return apiClient.get('/courses', params);
    },

    getCourseById: (courseId) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock get course by id');
        return mockAPI.courses.getCourseById(courseId);
      }
      return apiClient.get(`/courses/${courseId}`);
    },

    createCourse: (courseData) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock create course');
        return mockAPI.courses.createCourse(courseData);
      }
      return apiClient.post('/courses', courseData);
    },

    updateCourse: (courseId, courseData) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock update course');
        return mockAPI.courses.updateCourse(courseId, courseData);
      }
      return apiClient.put(`/courses/${courseId}`, courseData);
    },

    deleteCourse: (courseId) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock delete course');
        return mockAPI.courses.deleteCourse(courseId);
      }
      return apiClient.delete(`/courses/${courseId}`);
    },

    approveCourse: (courseId) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock approve course');
        return mockAPI.courses.approveCourse(courseId);
      }
      return apiClient.patch(`/courses/${courseId}/approve`);
    },

    rejectCourse: (courseId, reason) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock reject course');
        return mockAPI.courses.rejectCourse(courseId, reason);
      }
      return apiClient.patch(`/courses/${courseId}/reject`, { reason });
    },

    getInstructorCourses: (instructorId) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock get instructor courses');
        return mockAPI.courses.getInstructorCourses(instructorId);
      }
      return apiClient.get(`/instructors/${instructorId}/courses`);
    },

    getEnrolledCourses: (userId) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock get enrolled courses');
        return mockAPI.courses.getEnrolledCourses(userId);
      }
      return apiClient.get(`/users/${userId}/enrolled-courses`);
    },

    enrollInCourse: (courseId) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock enroll in course');
        return mockAPI.courses.enrollInCourse(courseId);
      }
      return apiClient.post(`/courses/${courseId}/enroll`);
    }
  },

  // Analytics endpoints
  analytics: {
    getInstructorAnalytics: (instructorId) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock instructor analytics');
        return mockAPI.analytics.getInstructorAnalytics(instructorId);
      }
      return apiClient.get(`/analytics/instructor/${instructorId}`);
    },

    getAdminAnalytics: () => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock admin analytics');
        return mockAPI.analytics.getAdminAnalytics();
      }
      return apiClient.get('/analytics/admin');
    },

    getPlatformStats: () => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock platform stats');
        return mockAPI.analytics.getPlatformStats();
      }
      return apiClient.get('/analytics/platform-stats');
    },

    getUserProgress: (userId, courseId) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock user progress');
        return mockAPI.progress.getUserProgress(userId, courseId);
      }
      return apiClient.get(`/progress/${userId}/${courseId}`);
    }
  },

  // Notifications
  notifications: {
    getNotifications: (userId) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock get notifications');
        return mockAPI.notifications.getNotifications(userId);
      }
      return apiClient.get(`/notifications/${userId}`);
    },

    markAsRead: (notificationId) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock mark notification as read');
        return mockAPI.notifications.markAsRead(notificationId);
      }
      return apiClient.patch(`/notifications/${notificationId}/read`);
    },

    deleteNotification: (notificationId) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock delete notification');
        return mockAPI.notifications.deleteNotification(notificationId);
      }
      return apiClient.delete(`/notifications/${notificationId}`);
    },

    markAllAsRead: (userId) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock mark all notifications as read');
        return Promise.resolve({ success: true, message: 'All notifications marked as read' });
      }
      return apiClient.patch(`/notifications/${userId}/read-all`);
    }
  },

  // Payments
  payments: {
    createPaymentIntent: (courseId, amount) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock create payment intent');
        return mockAPI.payments.createPaymentIntent(courseId, amount);
      }
      return apiClient.post('/payments/create-intent', { courseId, amount });
    },

    confirmPayment: (paymentIntentId) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock confirm payment');
        return mockAPI.payments.confirmPayment(paymentIntentId);
      }
      return apiClient.post('/payments/confirm', { paymentIntentId });
    },

    getTransactions: (params = {}) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock get transactions');
        return mockAPI.payments.getTransactions(params);
      }
      return apiClient.get('/payments/transactions', params);
    },

    getUserTransactions: (userId) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock get user transactions');
        return mockAPI.payments.getUserTransactions(userId);
      }
      return apiClient.get(`/payments/users/${userId}/transactions`);
    },

    processRefund: (transactionId, amount) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock process refund');
        return Promise.resolve({ success: true, message: 'Refund processed successfully' });
      }
      return apiClient.post(`/payments/transactions/${transactionId}/refund`, { amount });
    }
  },

  // Progress tracking
  progress: {
    getUserProgress: (userId, courseId) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock get user progress');
        return mockAPI.progress.getUserProgress(userId, courseId);
      }
      return apiClient.get(`/progress/${userId}/${courseId}`);
    },

    updateProgress: (userId, courseId, progressData) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock update progress');
        return mockAPI.progress.updateProgress(userId, courseId, progressData);
      }
      return apiClient.put(`/progress/${userId}/${courseId}`, progressData);
    },

    getAllUserProgress: (userId) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock get all user progress');
        return Promise.resolve({ 
          success: true, 
          progress: [
            { courseId: 1, progressPercentage: 75, completedLessons: 18, totalLessons: 24 },
            { courseId: 2, progressPercentage: 40, completedLessons: 14, totalLessons: 36 }
          ]
        });
      }
      return apiClient.get(`/progress/${userId}`);
    }
  },

  // Categories
  categories: {
    getCategories: () => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock get categories');
        return mockAPI.categories.getCategories();
      }
      return apiClient.get('/categories');
    },

    createCategory: (categoryData) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock create category');
        return mockAPI.categories.createCategory(categoryData);
      }
      return apiClient.post('/categories', categoryData);
    },

    updateCategory: (categoryId, categoryData) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock update category');
        return mockAPI.categories.updateCategory(categoryId, categoryData);
      }
      return apiClient.put(`/categories/${categoryId}`, categoryData);
    },

    deleteCategory: (categoryId) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock delete category');
        return mockAPI.categories.deleteCategory(categoryId);
      }
      return apiClient.delete(`/categories/${categoryId}`);
    }
  },

  // File uploads
  uploads: {
    uploadVideo: (file, onProgress) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock upload video');
        return new Promise((resolve) => {
          // Simulate upload progress
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            if (onProgress) onProgress({ loaded: progress, total: 100 });
            if (progress >= 100) {
              clearInterval(interval);
              resolve({
                success: true,
                url: 'https://mock-cloudinary.com/video/sample-video.mp4',
                publicId: 'mock-video-id-' + Date.now()
              });
            }
          }, 200);
        });
      }
      const formData = new FormData();
      formData.append('video', file);
      return apiClient.post('/uploads/video', formData, {
        'Content-Type': 'multipart/form-data'
      });
    },

    uploadImage: (file) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock upload image');
        return Promise.resolve({
          success: true,
          url: 'https://mock-cloudinary.com/image/sample-image.jpg',
          publicId: 'mock-image-id-' + Date.now()
        });
      }
      const formData = new FormData();
      formData.append('image', file);
      return apiClient.post('/uploads/image', formData, {
        'Content-Type': 'multipart/form-data'
      });
    },

    deleteFile: (publicId) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock delete file');
        return Promise.resolve({ success: true, message: 'File deleted successfully' });
      }
      return apiClient.delete(`/uploads/${publicId}`);
    }
  },

  // System settings (Admin only)
  system: {
    getSettings: () => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock get system settings');
        return Promise.resolve({
          success: true,
          settings: {
            siteName: 'LearningHub',
            maintenanceMode: false,
            registrationEnabled: true,
            emailNotifications: true,
            maxFileSize: 100, // MB
            supportedVideoFormats: ['mp4', 'webm', 'avi'],
            currency: 'USD',
            timezone: 'UTC'
          }
        });
      }
      return apiClient.get('/system/settings');
    },

    updateSettings: (settings) => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock update system settings');
        return Promise.resolve({
          success: true,
          message: 'Settings updated successfully'
        });
      }
      return apiClient.put('/system/settings', settings);
    },

    getDashboardStats: () => {
      if (USE_MOCK_API) {
        console.log('🟡 Using mock get dashboard stats');
        return Promise.resolve({
          success: true,
          stats: {
            totalUsers: 1250,
            totalCourses: 156,
            totalRevenue: 125000,
            activeUsers: 850
          }
        });
      }
      return apiClient.get('/system/dashboard-stats');
    }
  }
};

// Helper function to enable mock mode from anywhere in the app
export const enableMockAPI = () => {
  window.__MOCK_API_ENABLED__ = true;
  console.log('🟡 MOCK API ENABLED - Using fake data for testing');
  console.log('📋 Test accounts:');
  console.log('👨‍🎓 Student: student@test.com / password123');
  console.log('👨‍🏫 Instructor: instructor@test.com / password123');
  console.log('👨‍💼 Admin: admin@test.com / password123');
  console.log('');
  console.log('🚀 All dashboards should now work with mock data!');
};

// Additional named exports for backward compatibility
export const authAPI = api.auth;
export const courseAPI = api.courses;
export const notificationAPI = api.notifications;
export const paymentAPI = api.payments;
export const progressAPI = api.progress;
// Export default API client for custom requests
export default apiClient;