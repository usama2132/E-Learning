import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { api } from '../utils/api';

const CourseContext = createContext();
const courseAPI = api.courses; 
const initialState = {
  courses: [],
  myCourses: [],
  enrolledCourses: [],
  currentCourse: null,
  categories: [],
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCourses: 0,
    hasNext: false,
    hasPrev: false
  },
  filters: {
    category: '',
    level: '',
    priceRange: '',
    rating: '',
    duration: '',
    language: '',
    searchQuery: '',
    sortBy: 'newest'
  }
};

const courseReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'SET_COURSES':
      return {
        ...state,
        courses: action.payload,
        isLoading: false,
        error: null
      };
    case 'SET_MY_COURSES':
      return {
        ...state,
        myCourses: action.payload,
        isLoading: false,
        error: null
      };
    case 'SET_ENROLLED_COURSES':
      return {
        ...state,
        enrolledCourses: action.payload,
        isLoading: false,
        error: null
      };
    case 'SET_CURRENT_COURSE':
      return {
        ...state,
        currentCourse: action.payload,
        isLoading: false,
        error: null
      };
    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: action.payload
      };
    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: action.payload
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: initialState.filters
      };
    case 'ADD_COURSE':
      return {
        ...state,
        myCourses: [action.payload, ...state.myCourses]
      };
    case 'UPDATE_COURSE':
      return {
        ...state,
        courses: state.courses.map(course =>
          course._id === action.payload._id ? action.payload : course
        ),
        myCourses: state.myCourses.map(course =>
          course._id === action.payload._id ? action.payload : course
        ),
        currentCourse: state.currentCourse?._id === action.payload._id 
          ? action.payload 
          : state.currentCourse
      };
    case 'DELETE_COURSE':
      return {
        ...state,
        courses: state.courses.filter(course => course._id !== action.payload),
        myCourses: state.myCourses.filter(course => course._id !== action.payload)
      };
    case 'ENROLL_COURSE':
      return {
        ...state,
        enrolledCourses: [action.payload, ...state.enrolledCourses]
      };
    case 'UNENROLL_COURSE':
      return {
        ...state,
        enrolledCourses: state.enrolledCourses.filter(
          course => course._id !== action.payload
        )
      };
    default:
      return state;
  }
};

export const CourseProvider = ({ children }) => {
  const [state, dispatch] = useReducer(courseReducer, initialState);

  const setLoading = useCallback((loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Fetch all courses with filters and pagination
  const fetchCourses = useCallback(async (page = 1, filters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await courseAPI.getCourses(page, filters);
      if (response.success) {
        dispatch({ type: 'SET_COURSES', payload: response.courses });
        dispatch({ type: 'SET_PAGINATION', payload: response.pagination });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  // Fetch instructor's courses
  const fetchMyCourses = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await courseAPI.getInstructorCourses();
      if (response.success) {
        dispatch({ type: 'SET_MY_COURSES', payload: response.courses });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  // Fetch student's enrolled courses
  const fetchEnrolledCourses = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await courseAPI.getEnrolledCourses();
      if (response.success) {
        dispatch({ type: 'SET_ENROLLED_COURSES', payload: response.courses });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  // Fetch single course by ID
  const fetchCourse = useCallback(async (courseId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await courseAPI.getCourse(courseId);
      if (response.success) {
        dispatch({ type: 'SET_CURRENT_COURSE', payload: response.course });
        return response.course;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        return null;
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return null;
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await courseAPI.getCategories();
      if (response.success) {
        dispatch({ type: 'SET_CATEGORIES', payload: response.categories });
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  // Create new course
  const createCourse = useCallback(async (courseData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await courseAPI.createCourse(courseData);
      if (response.success) {
        dispatch({ type: 'ADD_COURSE', payload: response.course });
        return { success: true, course: response.course };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    }
  }, []);

  // Update course
  const updateCourse = useCallback(async (courseId, courseData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await courseAPI.updateCourse(courseId, courseData);
      if (response.success) {
        dispatch({ type: 'UPDATE_COURSE', payload: response.course });
        return { success: true, course: response.course };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    }
  }, []);

  // Delete course
  const deleteCourse = useCallback(async (courseId) => {
    try {
      const response = await courseAPI.deleteCourse(courseId);
      if (response.success) {
        dispatch({ type: 'DELETE_COURSE', payload: courseId });
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    }
  }, []);

  // Enroll in course
  const enrollCourse = useCallback(async (courseId) => {
    try {
      const response = await courseAPI.enrollCourse(courseId);
      if (response.success) {
        dispatch({ type: 'ENROLL_COURSE', payload: response.enrollment });
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, []);

  // Unenroll from course
  const unenrollCourse = useCallback(async (courseId) => {
    try {
      const response = await courseAPI.unenrollCourse(courseId);
      if (response.success) {
        dispatch({ type: 'UNENROLL_COURSE', payload: courseId });
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: newFilters });
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  // Search courses
  const searchCourses = useCallback(async (query) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await courseAPI.searchCourses(query);
      if (response.success) {
        dispatch({ type: 'SET_COURSES', payload: response.courses });
        dispatch({ type: 'SET_PAGINATION', payload: response.pagination });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.message });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  const value = {
    ...state,
    setLoading,
    setError,
    clearError,
    fetchCourses,
    fetchMyCourses,
    fetchEnrolledCourses,
    fetchCourse,
    fetchCategories,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollCourse,
    unenrollCourse,
    updateFilters,
    resetFilters,
    searchCourses
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

export { CourseContext };

export default CourseContext;