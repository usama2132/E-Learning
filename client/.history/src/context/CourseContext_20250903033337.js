import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';

const CourseContext = createContext();

const initialState = {
  courses: [],
  currentCourse: null,
  categories: [],
  instructorCourses: [],
  enrolledCourses: [],
  featuredCourses: [],
  searchResults: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCourses: 0,
    limit: 10
  },
  isLoading: false,
  error: null,
  filters: {
    category: '',
    level: '',
    priceRange: '',
    rating: '',
    sortBy: 'newest'
  }
};

const courseReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'SET_COURSES':
      return { 
        ...state, 
        courses: action.payload.courses || [],
        pagination: action.payload.pagination || state.pagination,
        isLoading: false,
        error: null
      };

    case 'SET_CURRENT_COURSE':
      return { ...state, currentCourse: action.payload, isLoading: false, error: null };

    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload, isLoading: false };

    case 'SET_INSTRUCTOR_COURSES':
      return { ...state, instructorCourses: action.payload, isLoading: false };

    case 'SET_ENROLLED_COURSES':
      return { ...state, enrolledCourses: action.payload, isLoading: false };

    case 'SET_FEATURED_COURSES':
      return { ...state, featuredCourses: action.payload, isLoading: false };

    case 'SET_SEARCH_RESULTS':
      return { 
        ...state, 
        searchResults: action.payload.courses || [],
        pagination: action.payload.pagination || state.pagination,
        isLoading: false 
      };

    case 'ADD_COURSE':
      return { 
        ...state, 
        courses: [...state.courses, action.payload],
        instructorCourses: [...state.instructorCourses, action.payload]
      };

    case 'UPDATE_COURSE':
      return {
        ...state,
        courses: state.courses.map(course => 
          (course._id || course.id) === (action.payload._id || action.payload.id) 
            ? action.payload 
            : course
        ),
        instructorCourses: state.instructorCourses.map(course => 
          (course._id || course.id) === (action.payload._id || action.payload.id) 
            ? action.payload 
            : course
        ),
        currentCourse: state.currentCourse && 
          (state.currentCourse._id || state.currentCourse.id) === (action.payload._id || action.payload.id)
          ? action.payload 
          : state.currentCourse
      };

    case 'DELETE_COURSE':
      return {
        ...state,
        courses: state.courses.filter(course => 
          (course._id || course.id) !== action.payload
        ),
        instructorCourses: state.instructorCourses.filter(course => 
          (course._id || course.id) !== action.payload
        )
      };

    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case 'CLEAR_FILTERS':
      return { ...state, filters: initialState.filters };

    default:
      return state;
  }
};

export const CourseProvider = ({ children }) => {
  const [state, dispatch] = useReducer(courseReducer, initialState);
  const { getToken } = useAuth();

  // API Base URL
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Control refs to prevent duplicate requests
  const requestInProgress = useRef(false);
  const lastRequestParams = useRef(null);
  const abortController = useRef(null);

  // Helper function to make API calls with duplicate prevention
  const apiCall = async (endpoint, options = {}) => {
    try {
      const token = getToken();
      const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (token) {
        defaultHeaders.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment.');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  };

  // Fetch all courses with duplicate prevention
  // FIXED: Fetch all courses with proper sorting parameter handling
  const fetchCourses = useCallback(async (params = {}) => {
    const paramsKey = JSON.stringify(params);
    
    // Prevent duplicate requests
    if (requestInProgress.current && lastRequestParams.current === paramsKey) {
      console.log('Preventing duplicate fetchCourses request');
      return;
    }

    // Abort previous request
    if (abortController.current) {
      abortController.current.abort();
    }

    requestInProgress.current = true;
    lastRequestParams.current = paramsKey;
    abortController.current = new AbortController();

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination
      queryParams.append('page', params.page || 1);
      queryParams.append('limit', params.limit || 12);
      
      // Add filters
      if (params.search?.trim()) queryParams.append('search', params.search.trim());
      if (params.category) queryParams.append('category', params.category);
      if (params.level) queryParams.append('level', params.level);
      if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice);
      if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice);
      if (params.rating) queryParams.append('rating', params.rating);
      
      // FIXED: Ensure sortBy is always included, with default fallback
      const sortValue = params.sortBy || 'newest';
      queryParams.append('sortBy', sortValue);
      
      console.log('Final query params being sent to backend:', queryParams.toString());
      console.log('SortBy parameter specifically:', sortValue);

      const data = await apiCall(`/courses?${queryParams.toString()}`, {
        signal: abortController.current.signal
      });
      
      if (data.success) {
        console.log('Courses API response:', data);
        console.log('Number of courses returned:', data.data?.courses?.length || 0);
        
        dispatch({
          type: 'SET_COURSES',
          payload: {
            courses: data.data.courses || [],
            pagination: data.data.pagination || {}
          }
        });
        console.log('Courses fetched and sorted successfully with sortBy:', sortValue);
      } else {
        throw new Error(data.message || 'Failed to fetch courses');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching courses:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    } finally {
      requestInProgress.current = false;
      abortController.current = null;
    }
  }, [getToken]);

  // FIXED: Fetch course by ID function
  const getCourseById = useCallback(async (courseId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const data = await apiCall(`/courses/${courseId}`);
      
      if (data.success) {
        dispatch({ type: 'SET_CURRENT_COURSE', payload: data.data.course });
        console.log('Course fetched successfully');
        return data.data.course;
      } else {
        throw new Error(data.message || 'Failed to fetch course');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return null;
    }
  }, [getToken]);

  // FIXED: Add fetchCourseById alias for backward compatibility
  const fetchCourseById = getCourseById;

  // Fetch categories - only once
  const fetchCategories = useCallback(async () => {
    try {
      const data = await apiCall('/courses/categories');
      
      if (data.success) {
        dispatch({ type: 'SET_CATEGORIES', payload: data.data.categories || [] });
        console.log('Categories fetched successfully');
      } else {
        console.warn('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [getToken]);

  // Fetch instructor courses
  const fetchInstructorCourses = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const data = await apiCall('/courses/instructor/my-courses');
      
      if (data.success) {
        dispatch({ type: 'SET_INSTRUCTOR_COURSES', payload: data.data.courses || [] });
        console.log('Instructor courses fetched successfully');
      } else {
        throw new Error(data.message || 'Failed to fetch instructor courses');
      }
    } catch (error) {
      console.error('Error fetching instructor courses:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [getToken]);

  // Fetch enrolled courses for student
  const fetchEnrolledCourses = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const data = await apiCall('/student/courses');
      
      if (data.success) {
        dispatch({ type: 'SET_ENROLLED_COURSES', payload: data.data.courses || [] });
        console.log('Enrolled courses fetched successfully');
      } else {
        throw new Error(data.message || 'Failed to fetch enrolled courses');
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [getToken]);

  // Fetch featured courses
  const fetchFeaturedCourses = useCallback(async () => {
    try {
      const data = await apiCall('/courses/featured');
      
      if (data.success) {
        dispatch({ type: 'SET_FEATURED_COURSES', payload: data.data.courses || [] });
        console.log('Featured courses fetched successfully');
      } else {
        console.warn('Failed to fetch featured courses');
      }
    } catch (error) {
      console.error('Error fetching featured courses:', error);
    }
  }, [getToken]);

  // Search courses
  const searchCourses = useCallback(async (searchQuery, filters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const queryParams = new URLSearchParams();
      
      if (searchQuery) queryParams.append('search', searchQuery);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.level) queryParams.append('level', filters.level);
      if (filters.minPrice !== undefined) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice !== undefined) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.rating) queryParams.append('rating', filters.rating);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);

      const data = await apiCall(`/courses/search?${queryParams.toString()}`);
      
      if (data.success) {
        dispatch({
          type: 'SET_SEARCH_RESULTS',
          payload: {
            courses: data.data.courses || [],
            pagination: data.data.pagination || {}
          }
        });
        console.log('Course search completed');
      } else {
        throw new Error(data.message || 'Search failed');
      }
    } catch (error) {
      console.error('Error searching courses:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, [getToken]);

  // Create new course
  const createCourse = useCallback(async (courseData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const data = await apiCall('/courses', {
        method: 'POST',
        body: JSON.stringify(courseData),
      });
      
      if (data.success) {
        dispatch({ type: 'ADD_COURSE', payload: data.data.course });
        console.log('Course created successfully');
        return data.data.course;
      } else {
        throw new Error(data.message || 'Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [getToken]);

  // Update course
  const updateCourse = useCallback(async (courseId, courseData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const data = await apiCall(`/courses/${courseId}`, {
        method: 'PUT',
        body: JSON.stringify(courseData),
      });
      
      if (data.success) {
        dispatch({ type: 'UPDATE_COURSE', payload: data.data.course });
        console.log('Course updated successfully');
        return data.data.course;
      } else {
        throw new Error(data.message || 'Failed to update course');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [getToken]);

  // Delete course
  const deleteCourse = useCallback(async (courseId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const data = await apiCall(`/courses/${courseId}`, {
        method: 'DELETE',
      });
      
      if (data.success) {
        dispatch({ type: 'DELETE_COURSE', payload: courseId });
        console.log('Course deleted successfully');
        return true;
      } else {
        throw new Error(data.message || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [getToken]);

  // Enroll in course
  const enrollInCourse = useCallback(async (courseId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const data = await apiCall(`/courses/${courseId}/enroll`, {
        method: 'POST',
      });
      
      if (data.success) {
        console.log('Enrolled in course successfully');
        // Optionally refresh enrolled courses
        await fetchEnrolledCourses();
        return true;
      } else {
        throw new Error(data.message || 'Failed to enroll in course');
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [getToken, fetchEnrolledCourses]);

  // Unenroll from course
  const unenrollFromCourse = useCallback(async (courseId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const data = await apiCall(`/courses/${courseId}/unenroll`, {
        method: 'POST',
      });
      
      if (data.success) {
        console.log('Unenrolled from course successfully');
        // Refresh enrolled courses
        await fetchEnrolledCourses();
        return true;
      } else {
        throw new Error(data.message || 'Failed to unenroll from course');
      }
    } catch (error) {
      console.error('Error unenrolling from course:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [getToken, fetchEnrolledCourses]);

  // Set filters
  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Clear current course
  const clearCurrentCourse = useCallback(() => {
    dispatch({ type: 'SET_CURRENT_COURSE', payload: null });
  }, []);

  const value = {
    // State
    ...state,
    
    // Actions
    fetchCourses,
    getCourseById,
    fetchCourseById, // Keep both for compatibility
    fetchCategories,
    fetchInstructorCourses,
    fetchEnrolledCourses,
    fetchFeaturedCourses,
    searchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollInCourse,
    unenrollFromCourse,
    setFilters,
    clearFilters,
    clearError,
    clearCurrentCourse,
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};

export default CourseContext;