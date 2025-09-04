import { useState, useEffect, useCallback, useContext } from 'react';
import CourseContext from '../context/CourseContext';
import { useAuth } from './useAuth';

const useCourses = (filters = {}) => {
  const {
    courses,
    isLoading,
    error,
    categories,
    fetchCourses: contextFetchCourses,
    fetchCourse,
    createCourse: contextCreateCourse,
    updateCourse: contextUpdateCourse,
    deleteCourse: contextDeleteCourse,
    fetchInstructorCourses,
    fetchCategories: contextFetchCategories,
    clearError
  } = useContext(CourseContext);

  const { getToken } = useAuth();
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
  const [priceRange, setPriceRange] = useState(filters.priceRange || [0, 1000]);
  const [sortBy, setSortBy] = useState(filters.sortBy || 'newest');

  // FIXED: Correct API base URL without double prefix
  const API_BASE_URL = 'http://localhost:5000/api';

  // Enhanced API request helper with better token handling
  const makeAPIRequest = async (endpoint, options = {}) => {
    const token = getToken && typeof getToken === 'function' ? getToken() : 
                  localStorage.getItem('token') || 
                  localStorage.getItem('lms_auth_token') ||
                  sessionStorage.getItem('token');
    
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // Use default error message
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  };

  // Fetch all courses with proper error handling
  const fetchCourses = useCallback(async (params = {}) => {
    try {
      console.log('Fetching courses from backend API');
      const response = await makeAPIRequest('/courses', {
        method: 'GET'
      });
      
      if (response && response.success) {
        console.log(`Fetched ${response.data.courses.length} courses`);
        return response.data.courses;
      } else {
        throw new Error(response?.message || 'Failed to fetch courses');
      }

    } catch (err) {
      console.error('Courses fetch error:', err);
      
      // Check if it's a network error
      if (err.message.includes('fetch') || err.message.includes('Network')) {
        console.error('Network Error - Backend not responding');
      }
      return [];
    }
  }, [getToken]);

  // FIXED: Fetch course by ID without double prefix
  const fetchCourseById = useCallback(async (courseId) => {
    try {
      console.log('Fetching course by ID:', courseId);
      const response = await makeAPIRequest(`/courses/${courseId}`, {
        method: 'GET'
      });
      
      if (response && response.success) {
        console.log('Course fetched successfully');
        return response.data.course;
      } else {
        throw new Error(response?.message || 'Course not found');
      }

    } catch (err) {
      console.error('Course fetch error:', err);
      throw err;
    }
  }, [getToken]);

  // Create new course
  const createCourse = useCallback(async (courseData) => {
    try {
      console.log('Creating new course');
      
      // Ensure courseData is properly formatted
      const formattedData = {
        title: courseData.title,
        description: courseData.description,
        shortDescription: courseData.shortDescription,
        category: courseData.category,
        level: courseData.level || 'beginner',
        price: parseFloat(courseData.price) || 0,
        thumbnail: courseData.thumbnail || { url: '', public_id: '' },
        learningOutcomes: courseData.learningOutcomes || courseData.learningObjectives || [],
        requirements: courseData.requirements || (courseData.prerequisites ? [courseData.prerequisites] : []),
        tags: courseData.tags || [],
        targetAudience: courseData.targetAudience || [],
        isPublished: courseData.isPublished || false
      };

      const response = await makeAPIRequest('/courses', {
        method: 'POST',
        body: JSON.stringify(formattedData)
      });
      
      if (response && response.success) {
        console.log('Course created successfully');
        return response.data.course;
      } else {
        throw new Error(response?.message || 'Failed to create course');
      }

    } catch (err) {
      console.error('Course creation error:', err);
      throw err;
    }
  }, [getToken]);

  // Update course
  const updateCourse = useCallback(async (courseId, courseData) => {
    try {
      console.log('Updating course:', courseId);
      const response = await makeAPIRequest(`/courses/${courseId}`, {
        method: 'PUT',
        body: JSON.stringify(courseData)
      });
      
      if (response && response.success) {
        console.log('Course updated successfully');
        return response.data.course;
      } else {
        throw new Error(response?.message || 'Failed to update course');
      }

    } catch (err) {
      console.error('Course update error:', err);
      throw err;
    }
  }, [getToken]);

  // Delete course
  const deleteCourse = useCallback(async (courseId) => {
    try {
      console.log('Deleting course:', courseId);
      const response = await makeAPIRequest(`/courses/${courseId}`, {
        method: 'DELETE'
      });
      
      if (response && response.success) {
        console.log('Course deleted successfully');
      } else {
        throw new Error(response?.message || 'Failed to delete course');
      }

    } catch (err) {
      console.error('Course deletion error:', err);
      throw err;
    }
  }, [getToken]);

  // Filter and sort courses locally
  useEffect(() => {
    let filtered = [...(courses || [])];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructorName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(course => 
        course.category === selectedCategory || 
        course.category?._id === selectedCategory ||
        course.category?.name === selectedCategory
      );
    }

    // Apply price range filter
    filtered = filtered.filter(course => {
      const price = course.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt || a.created_at) - new Date(b.createdAt || b.created_at));
        break;
      case 'price-low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || b.averageRating || 0) - (a.rating || a.averageRating || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.students || b.enrolledCount || b.totalStudents || 0) - (a.students || a.enrolledCount || a.totalStudents || 0));
        break;
      default:
        break;
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedCategory, priceRange, sortBy]);

  // Get instructor's courses
  const getInstructorCourses = useCallback(async (instructorId) => {
    try {
      console.log('Fetching instructor courses');
      const response = await makeAPIRequest('/courses/instructor/my-courses', {
        method: 'GET'
      });
      
      if (response && response.success) {
        console.log(`Fetched ${response.data.courses.length} instructor courses`);
        return response.data.courses;
      } else {
        throw new Error(response?.message || 'Failed to fetch instructor courses');
      }

    } catch (err) {
      console.error('Instructor courses fetch error:', err);
      return [];
    }
  }, [getToken]);

  // Get enrolled courses for student
  const getEnrolledCourses = useCallback(async (userId) => {
    try {
      console.log('Fetching enrolled courses for user:', userId);
      const response = await makeAPIRequest(`/student/courses`, {
        method: 'GET'
      });
      
      if (response && response.success) {
        console.log(`Fetched ${response.data.courses.length} enrolled courses`);
        return response.data.courses;
      } else {
        throw new Error(response?.message || 'Failed to fetch enrolled courses');
      }

    } catch (err) {
      console.error('Enrolled courses fetch error:', err);
      return [];
    }
  }, [getToken]);

  // Get categories
  const fetchCategories = useCallback(async () => {
    try {
      console.log('Fetching categories');
      const response = await makeAPIRequest('/courses/categories', {
        method: 'GET'
      });
      
      if (response && response.success) {
        console.log(`Fetched ${response.data.categories.length} categories`);
        return response.data.categories;
      } else {
        throw new Error(response?.message || 'Failed to fetch categories');
      }

    } catch (err) {
      console.error('Categories fetch error:', err);
      return [];
    }
  }, [getToken]);

  // Enroll in course
  const enrollInCourse = useCallback(async (courseId) => {
    try {
      console.log('Enrolling in course:', courseId);
      const response = await makeAPIRequest(`/courses/${courseId}/enroll`, {
        method: 'POST'
      });
      
      if (response && response.success) {
        console.log('Successfully enrolled in course');
        return response;
      } else {
        throw new Error(response?.message || 'Failed to enroll in course');
      }

    } catch (err) {
      console.error('Course enrollment error:', err);
      throw err;
    }
  }, [getToken]);

  // Get recommended courses
  const getRecommendedCourses = useCallback(async (userId) => {
    try {
      console.log('Fetching recommended courses for user:', userId);
      const response = await makeAPIRequest('/courses/recommended', {
        method: 'GET'
      });
      
      if (response && response.success) {
        console.log(`Fetched ${response.data.courses.length} recommended courses`);
        return response.data.courses;
      } else {
        throw new Error(response?.message || 'Failed to fetch recommended courses');
      }

    } catch (err) {
      console.error('Recommended courses fetch error:', err);
      return [];
    }
  }, [getToken]);

  return {
    courses: filteredCourses,
    allCourses: courses,
    categories,
    loading: isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    fetchCourses,
    fetchCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getInstructorCourses,
    getEnrolledCourses,
    enrollInCourse,
    getRecommendedCourses,
    fetchCategories,
    clearError
  };
};

export { useCourses };
export default useCourses;