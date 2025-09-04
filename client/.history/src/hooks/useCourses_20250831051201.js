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

  const API_BASE_URL = 'http://localhost:5000/api';

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
      
      if (err.message.includes('fetch') || err.message.includes('Network')) {
        console.error('Network Error - Backend not responding');
      }
      return [];
    }
  }, [getToken]);

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

  const createCourse = useCallback(async (courseData) => {
    try {
      console.log('Creating new course');
      
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

  const addSection = useCallback(async (courseId, sectionData) => {
    try {
      console.log('Adding section to course:', courseId);
      const response = await makeAPIRequest(`/instructor/courses/${courseId}/sections`, {
        method: 'POST',
        body: JSON.stringify(sectionData)
      });
      
      if (response && response.success) {
        console.log('Section added successfully');
        return response.data.section;
      } else {
        throw new Error(response?.message || 'Failed to add section');
      }
    } catch (err) {
      console.error('Add section error:', err);
      throw err;
    }
  }, [getToken]);

  const addLesson = useCallback(async (courseId, sectionId, lessonData) => {
    try {
      console.log('Adding lesson to section:', sectionId);
      const response = await makeAPIRequest(`/instructor/courses/${courseId}/sections/${sectionId}/lessons`, {
        method: 'POST',
        body: JSON.stringify(lessonData)
      });
      
      if (response && response.success) {
        console.log('Lesson added successfully');
        return response.data.lesson;
      } else {
        throw new Error(response?.message || 'Failed to add lesson');
      }
    } catch (err) {
      console.error('Add lesson error:', err);
      throw err;
    }
  }, [getToken]);

  const addVideo = useCallback(async (courseId, sectionId, lessonId, videoData) => {
    try {
      console.log('Adding video to lesson:', lessonId);
      const response = await makeAPIRequest(`/instructor/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/videos`, {
        method: 'POST',
        body: JSON.stringify(videoData)
      });
      
      if (response && response.success) {
        console.log('Video added successfully');
        return response.data.video;
      } else {
        throw new Error(response?.message || 'Failed to add video');
      }
    } catch (err) {
      console.error('Add video error:', err);
      throw err;
    }
  }, [getToken]);

  useEffect(() => {
    let filtered = [...(courses || [])];

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructorName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(course => 
        course.category === selectedCategory || 
        course.category?._id === selectedCategory ||
        course.category?.name === selectedCategory
      );
    }

    filtered = filtered.filter(course => {
      const price = course.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

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
    addSection,
    addLesson,
    addVideo,
    clearError
  };
};

export { useCourses };
export default useCourses;