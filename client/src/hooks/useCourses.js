import { useState, useEffect, useCallback, useContext } from 'react';
import { CourseContext } from '../context/CourseContext';

const useCourses = (filters = {}) => {
  const {
    courses,
    setCourses,
    loading,
    setLoading,
    error,
    setError
  } = useContext(CourseContext);

  const [filteredCourses, setFilteredCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
  const [priceRange, setPriceRange] = useState(filters.priceRange || [0, 1000]);
  const [sortBy, setSortBy] = useState(filters.sortBy || 'newest');

  // Fetch all courses
  const fetchCourses = useCallback(async () => {
  setLoading(true);
  setError(null);

  try {
    const response = await fetch('/api/courses');
    
    // First check if response is OK (status 200-299)
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to fetch courses');
    }

    // Then check content type before parsing as JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Received non-JSON response from server');
    }

    const data = await response.json();
    setCourses(data.courses || []);
    
    // Extract unique categories
    const uniqueCategories = [...new Set(data.courses.map(course => course.category))];
    setCategories(uniqueCategories);

  } catch (err) {
    setError(err.message);
    console.error('Fetch courses error:', err);
  } finally {
    setLoading(false);
  }
}, [setCourses, setLoading, setError]);

  // Fetch course by ID
  const fetchCourseById = useCallback(async (courseId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) {
        throw new Error('Course not found');
      }
      
      const data = await response.json();
      return data.course;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Create new course
  const createCourse = useCallback(async (courseData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(courseData)
      });

      if (!response.ok) {
        throw new Error('Failed to create course');
      }

      const data = await response.json();
      setCourses(prev => [...prev, data.course]);
      return data.course;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setCourses, setLoading, setError]);

  // Update course
  const updateCourse = useCallback(async (courseId, courseData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(courseData)
      });

      if (!response.ok) {
        throw new Error('Failed to update course');
      }

      const data = await response.json();
      setCourses(prev => 
        prev.map(course => 
          course._id === courseId ? data.course : course
        )
      );
      return data.course;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setCourses, setLoading, setError]);

  // Delete course
  const deleteCourse = useCallback(async (courseId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete course');
      }

      setCourses(prev => prev.filter(course => course._id !== courseId));

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setCourses, setLoading, setError]);

  // Filter and sort courses
  useEffect(() => {
    let filtered = [...courses];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Apply price range filter
    filtered = filtered.filter(course => {
      const price = course.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'price-low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0));
        break;
      default:
        break;
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedCategory, priceRange, sortBy]);

  // Get instructor's courses
  const getInstructorCourses = useCallback(async (instructorId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/courses/instructor/${instructorId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch instructor courses');
      }

      const data = await response.json();
      return data.courses;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // Get enrolled courses for student
  const getEnrolledCourses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/courses/enrolled', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch enrolled courses');
      }

      const data = await response.json();
      return data.courses;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  return {
    courses: filteredCourses,
    allCourses: courses,
    categories,
    loading,
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
    clearError: () => setError(null)
  };
};

export { useCourses };

export default useCourses;