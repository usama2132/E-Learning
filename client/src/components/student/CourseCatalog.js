import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import CourseCard from './CourseCard';
import CourseFilters from '../common/CourseFilters';
import SearchBar from '../common/SearchBar';
import Pagination from '../common/Pagination';
import Loading from '../common/Loading';
import Button from '../common/Button';
import '../../styles/dashboards/CourseCatalog.css';

const CourseCatalog = () => {
  const { user, getToken } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCourses: 0,
    limit: 12
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    searchQuery: '',
    category: '',
    level: '',
    priceRange: '',
    rating: '',
    sortBy: 'newest'
  });
  
  const [viewMode, setViewMode] = useState('grid');
  const [loadingAction, setLoadingAction] = useState(null);

  // Control refs
  const hasInitialized = useRef(false);
  const lastFetchParams = useRef(null);
  const requestInProgress = useRef(false);
  const debounceTimeout = useRef(null);
  const abortController = useRef(null);

  // FIXED: Main fetch function with proper backend API call
  const fetchCourses = useCallback(async (params = {}) => {
    const paramsKey = JSON.stringify(params);
    
    // Prevent duplicate requests
    if (requestInProgress.current && lastFetchParams.current === paramsKey) {
      console.log('Preventing duplicate request');
      return;
    }

    // Abort previous request
    if (abortController.current) {
      abortController.current.abort();
    }

    requestInProgress.current = true;
    lastFetchParams.current = paramsKey;
    abortController.current = new AbortController();

    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      queryParams.append('page', params.page || 1);
      queryParams.append('limit', params.limit || 12);
      
      // Only add non-empty filters
      if (params.search?.trim()) queryParams.append('search', params.search.trim());
      if (params.category) queryParams.append('category', params.category);
      if (params.level) queryParams.append('level', params.level);
      
      // Handle price filters
      if (params.priceRange === 'free') {
        queryParams.append('minPrice', '0');
        queryParams.append('maxPrice', '0');
      } else {
        queryParams.append('minPrice', '0');
        queryParams.append('maxPrice', '1000');
      }
      
      if (params.rating) queryParams.append('rating', params.rating);
      queryParams.append('sortBy', params.sortBy || 'newest');

      console.log('Fetching courses from backend API...');
      const response = await fetch(`http://localhost:5000/api/courses?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        signal: abortController.current.signal
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCourses(data.data.courses || []);
          setPagination(data.data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalCourses: 0,
            limit: 12
          });
          
          console.log(`Loaded ${data.data.courses?.length || 0} courses`);
        } else {
          throw new Error(data.message || 'Failed to fetch courses');
        }
      } else if (response.status === 429) {
        setError('Too many requests. Please wait a moment.');
        return;
      } else {
        throw new Error(`Failed to fetch courses: ${response.status}`);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Fetch error:', error);
        setError(error.message || 'Failed to load courses');
      }
    } finally {
      requestInProgress.current = false;
      setIsLoading(false);
      abortController.current = null;
    }
  }, []);

  // Debounced fetch wrapper
  const fetchCoursesDebounced = useCallback((params, delay = 800) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      fetchCourses(params);
    }, delay);
  }, [fetchCourses]);

  // FIXED: Fetch categories from backend
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/courses/categories', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(data.data.categories || []);
          console.log('Categories loaded:', data.data.categories?.length);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Set fallback categories
      setCategories([
        { _id: 'programming', name: 'Programming' },
        { _id: 'design', name: 'Design' },
        { _id: 'business', name: 'Business' },
        { _id: 'marketing', name: 'Marketing' }
      ]);
    }
  }, []);

  // Initial load - one time only
  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;
    console.log('Initializing CourseCatalog');

    const initialize = async () => {
      await fetchCategories();
      
      // Delay initial course fetch to avoid rapid requests
      setTimeout(() => {
        fetchCourses({ 
          page: 1, 
          limit: 12, 
          sortBy: 'newest' 
        });
      }, 200);
    };

    initialize();

    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  // Filter change handler with debouncing
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // Build params for fetch
      const params = {
        page: 1,
        limit: 12,
        sortBy: newFilters.sortBy
      };

      if (newFilters.searchQuery?.trim()) params.search = newFilters.searchQuery.trim();
      if (newFilters.category) params.category = newFilters.category;
      if (newFilters.level) params.level = newFilters.level;
      if (newFilters.priceRange) params.priceRange = newFilters.priceRange;
      if (newFilters.rating) params.rating = newFilters.rating;

      // Use debounced fetch for filter changes
      fetchCoursesDebounced(params, 800);
      
      return newFilters;
    });
  }, [fetchCoursesDebounced]);

  const clearFilters = useCallback(() => {
    const resetFilters = {
      searchQuery: '',
      category: '',
      level: '',
      priceRange: '',
      rating: '',
      sortBy: 'newest'
    };
    
    setFilters(resetFilters);
    
    // Reset to initial state
    fetchCourses({
      page: 1,
      limit: 12,
      sortBy: 'newest'
    });
  }, [fetchCourses]);

  const handlePageChange = useCallback((page) => {
    if (requestInProgress.current || page === pagination.currentPage) return;

    const params = {
      page,
      limit: 12,
      sortBy: filters.sortBy
    };

    if (filters.searchQuery?.trim()) params.search = filters.searchQuery.trim();
    if (filters.category) params.category = filters.category;
    if (filters.level) params.level = filters.level;
    if (filters.priceRange) params.priceRange = filters.priceRange;
    if (filters.rating) params.rating = filters.rating;

    fetchCourses(params);
  }, [filters, pagination.currentPage, fetchCourses]);

  // FIXED: Action handlers with proper backend API calls
  const handleEnrollment = async (courseId) => {
    if (!user || loadingAction === `enroll-${courseId}`) return;

    setLoadingAction(`enroll-${courseId}`);
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          courseId,
          paymentMethod: 'free'
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('Enrollment successful');
        alert('Successfully enrolled in the course!');
      } else {
        throw new Error(result.message || 'Enrollment failed');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert(error.message || 'Failed to enroll. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleWishlistAdd = async (courseId) => {
    if (!user || loadingAction === `wishlist-add-${courseId}`) return;
    
    setLoadingAction(`wishlist-add-${courseId}`);
    try {
      const token = getToken();
      await fetch(`http://localhost:5000/api/student/wishlist/${courseId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
    } catch (error) {
      console.error('Wishlist error:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'sortBy') return value !== 'newest';
      return value !== '' && value !== null && value !== undefined;
    }).length;
  };

  const retryFetch = useCallback(() => {
    setError(null);
    lastFetchParams.current = null; // Reset to allow retry
    fetchCourses({ 
      page: pagination.currentPage || 1, 
      limit: 12, 
      sortBy: filters.sortBy 
    });
  }, [fetchCourses, pagination.currentPage, filters.sortBy]);

  if (error && !isLoading) {
    return (
      <div className="error-state">
        <div className="error-content">
          <i className="fas fa-exclamation-triangle error-icon"></i>
          <h3>Error loading courses</h3>
          <p>{error}</p>
          <div className="error-actions">
            <Button onClick={retryFetch}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="course-catalog">
      <div className="catalog-header">
        <div className="header-content">
          <h1>Explore Courses</h1>
          <p>Discover your next learning adventure</p>
        </div>
        
        <div className="search-section">
          <SearchBar
            value={filters.searchQuery}
            onChange={(value) => handleFilterChange('searchQuery', value)}
            placeholder="Search for courses, instructors, or topics..."
            className="main-search"
          />
        </div>
      </div>

      <div className="catalog-main">
        <div className="filters-sidebar">
          <div className="filters-header">
            <h3>Filters</h3>
            {getActiveFiltersCount() > 0 && (
              <Button variant="text" size="small" onClick={clearFilters}>
                Clear ({getActiveFiltersCount()})
              </Button>
            )}
          </div>
          
          <CourseFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            categories={categories}
          />
        </div>

        <div className="catalog-content">
          <div className="content-header">
            <div className="results-info">
              <span className="results-count">
                {isLoading ? 'Loading...' : `${pagination.totalCourses} courses found`}
              </span>
            </div>

            <div className="content-controls">
              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  List
                </button>
              </div>

              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="popularity">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <Loading message="Loading courses..." />
          ) : courses.length === 0 ? (
            <div className="no-courses">
              <div className="no-courses-content">
                <h3>No courses found</h3>
                <p>Try adjusting your search criteria.</p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className={`courses-grid ${viewMode}`}>
                {courses.map(course => (
                  <CourseCard
                    key={course._id || course.id}
                    course={course}
                    variant="catalog"
                    onEnroll={handleEnrollment}
                    onAddToWishlist={handleWishlistAdd}
                    isEnrolled={user?.enrolledCourses?.includes(course._id || course.id)}
                    isInWishlist={user?.wishlist?.includes(course._id || course.id)}
                    loadingAction={loadingAction}
                  />
                ))}
              </div>
              
              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCatalog;