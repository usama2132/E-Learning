import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCourse } from '../context/CourseContext';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import CourseCard from '../components/student/CourseCard';
import CourseFilters from '../components/common/CourseFilters';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';
import '../styles/pages/Courses.css';

const Courses = () => {
  const { user } = useAuth();
  const { 
    courses, 
    pagination,
    categories,
    isLoading, 
    error, 
    fetchCourses,
    fetchCategories,
    clearError
  } = useCourse();
  
  const { isDarkMode, actualTheme } = useTheme();
  
  // FIXED: Updated filter state to match CourseFilters component
  const [filters, setFilters] = useState({
    searchQuery: '',
    category: '',
    level: '',
    rating: '',
    priceRange: '',
    sortBy: 'newest'
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [hasInitialLoad, setHasInitialLoad] = useState(false); // FIXED: Track initial load
  
  // Control refs to prevent infinite loops
  const hasInitialized = useRef(false);
  const lastFetchParams = useRef(null);
  const fetchTimeoutRef = useRef(null);

  // Stable function to fetch courses with duplicate prevention
  const fetchCoursesWithParams = useCallback((params) => {
    const paramsKey = JSON.stringify(params);
    
    if (lastFetchParams.current === paramsKey) {
      console.log('Preventing duplicate request with same params');
      return;
    }
    
    console.log('Fetching courses with params:', params);
    lastFetchParams.current = paramsKey;
    
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    fetchTimeoutRef.current = setTimeout(() => {
      fetchCourses(params);
    }, 100); // Reduced timeout for faster response
  }, [fetchCourses]);

  // FIXED: Simplified initial load - fetch courses immediately
  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }
    
    console.log('Courses component: Initial mount, fetching courses...');
    hasInitialized.current = true;
    
    // Fetch categories first
    fetchCategories().catch(err => console.warn('Failed to fetch categories:', err));
    
    // FIXED: Always fetch courses on initial load with explicit sortBy
    const initialParams = {
      page: 1,
      limit: 12,
      sortBy: 'newest' // FIXED: Always include sortBy
    };
    
    console.log('Initial course fetch with params:', initialParams);
    fetchCoursesWithParams(initialParams);
    setHasInitialLoad(true);
    
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []); // FIXED: Empty dependency array to run only once

  // FIXED: Separate effect to handle when courses are loaded
  useEffect(() => {
    if (courses && courses.length > 0) {
      console.log(`Courses loaded successfully: ${courses.length} courses`);
    } else if (hasInitialLoad && !isLoading) {
      console.warn('No courses returned from backend');
    }
  }, [courses, hasInitialLoad, isLoading]);

  // FIXED: Handle filter changes from CourseFilters component
  const handleFilterChange = useCallback((newFilters) => {
    console.log('Filters changed:', newFilters);
    
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Build params for backend API call
    const params = {
      page: 1,
      limit: 12,
      sortBy: newFilters.sortBy || 'newest' // FIXED: Always include sortBy
    };

    // Add search if provided
    if (newFilters.searchQuery?.trim()) {
      params.search = newFilters.searchQuery.trim();
    }

    // Add category if selected
    if (newFilters.category) {
      params.category = newFilters.category;
    }

    // Add level if selected
    if (newFilters.level) {
      params.level = newFilters.level;
    }

    // Handle price range filter
    if (newFilters.priceRange) {
      if (newFilters.priceRange === 'free') {
        params.minPrice = 0;
        params.maxPrice = 0;
      } else if (newFilters.priceRange === '1-50') {
        params.minPrice = 1;
        params.maxPrice = 50;
      } else if (newFilters.priceRange === '51-100') {
        params.minPrice = 51;
        params.maxPrice = 100;
      } else if (newFilters.priceRange === '101-200') {
        params.minPrice = 101;
        params.maxPrice = 200;
      } else if (newFilters.priceRange === '200-999') {
        params.minPrice = 200;
        params.maxPrice = 999;
      }
    }

    // Add rating if selected
    if (newFilters.rating) {
      params.rating = parseFloat(newFilters.rating);
    }

    console.log('Fetching courses with filter params:', params);
    fetchCoursesWithParams(params);
  }, [fetchCoursesWithParams]);

  // FIXED: Handle search from SearchBar component
  const handleSearch = useCallback((searchTerm) => {
    const newFilters = { 
      ...filters, 
      searchQuery: searchTerm 
    };
    
    handleFilterChange(newFilters);
  }, [filters, handleFilterChange]);

  // FIXED: Handle sort changes from dropdown - this is where the fix is needed
  const handleSortChange = useCallback((sortOption) => {
    console.log('Sort option changed to:', sortOption);
    
    const newFilters = { 
      ...filters, 
      sortBy: sortOption 
    };
    
    setFilters(newFilters); // Update local state immediately
    handleFilterChange(newFilters); // Trigger API call
  }, [filters, handleFilterChange]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    
    // Build params with current filters
    const params = {
      page,
      limit: 12,
      sortBy: filters.sortBy || 'newest' // FIXED: Always include sortBy
    };

    if (filters.searchQuery?.trim()) {
      params.search = filters.searchQuery.trim();
    }
    if (filters.category) {
      params.category = filters.category;
    }
    if (filters.level) {
      params.level = filters.level;
    }
    if (filters.rating) {
      params.rating = parseFloat(filters.rating);
    }

    // Handle price range for pagination
    if (filters.priceRange) {
      if (filters.priceRange === 'free') {
        params.minPrice = 0;
        params.maxPrice = 0;
      } else if (filters.priceRange === '1-50') {
        params.minPrice = 1;
        params.maxPrice = 50;
      } else if (filters.priceRange === '51-100') {
        params.minPrice = 51;
        params.maxPrice = 100;
      } else if (filters.priceRange === '101-200') {
        params.minPrice = 101;
        params.maxPrice = 200;
      } else if (filters.priceRange === '200-999') {
        params.minPrice = 200;
        params.maxPrice = 999;
      }
    }
    
    fetchCoursesWithParams(params);
  }, [filters, fetchCoursesWithParams]);

  const clearFilters = useCallback(() => {
    const resetFilters = {
      searchQuery: '',
      category: '',
      level: '',
      rating: '',
      priceRange: '',
      sortBy: 'newest'
    };
    
    setFilters(resetFilters);
    setCurrentPage(1);
    
    const params = {
      page: 1,
      limit: 12,
      sortBy: 'newest' // FIXED: Always include sortBy
    };
    
    console.log('Clearing filters, fetching with params:', params);
    fetchCoursesWithParams(params);
  }, [fetchCoursesWithParams]);

  const retryFetch = useCallback(() => {
    console.log('Retrying course fetch...');
    clearError();
    lastFetchParams.current = null;
    
    const params = {
      page: currentPage,
      limit: 12,
      sortBy: filters.sortBy || 'newest' // FIXED: Always include sortBy
    };

    if (filters.searchQuery?.trim()) params.search = filters.searchQuery.trim();
    if (filters.category) params.category = filters.category;
    if (filters.level) params.level = filters.level;
    if (filters.rating) params.rating = parseFloat(filters.rating);

    // Handle price range for retry
    if (filters.priceRange) {
      if (filters.priceRange === 'free') {
        params.minPrice = 0;
        params.maxPrice = 0;
      } else if (filters.priceRange === '1-50') {
        params.minPrice = 1;
        params.maxPrice = 50;
      } else if (filters.priceRange === '51-100') {
        params.minPrice = 51;
        params.maxPrice = 100;
      } else if (filters.priceRange === '101-200') {
        params.minPrice = 101;
        params.maxPrice = 200;
      } else if (filters.priceRange === '200-999') {
        params.minPrice = 200;
        params.maxPrice = 999;
      }
    }
    
    fetchCoursesWithParams(params);
  }, [clearError, currentPage, filters, fetchCoursesWithParams]);

  const hasActiveFilters = filters.searchQuery || filters.category || filters.level || filters.rating || filters.priceRange;

  // FIXED: Show loading only on initial load or when explicitly loading
  if (isLoading && !hasInitialLoad) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className={`courses-error ${isDarkMode() ? 'dark' : 'light'}`}>
        <div className="courses-error__content">
          <h2 className="courses-error__title">Unable to Load Courses</h2>
          <p className="courses-error__message">{error}</p>
          <button onClick={retryFetch} className="courses-error__retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`courses-page ${isDarkMode() ? 'dark' : 'light'}`}>
      {/* Header Section */}
      <div className="courses-page__header">
        <div className="courses-page__header-content">
          <h1 className="courses-page__title">Discover Courses</h1>
          <p className="courses-page__subtitle">
            Explore our comprehensive collection of expertly crafted courses
          </p>
        </div>
      </div>

      {/* Controls Section */}
      <div className="courses-page__controls">
        <div className="courses-page__search-sort">
          <div className="courses-page__search-wrapper">
            <SearchBar 
              onSearch={handleSearch} 
              placeholder="Search courses, instructors, topics..." 
              value={filters.searchQuery || ''}
            />
          </div>
          
          <div className="courses-page__right-controls">
            <span className="courses-page__results-count">
              {isLoading && hasInitialLoad ? 'Loading...' : `${pagination?.totalCourses || courses?.length || 0} courses found`}
            </span>
            
            <div className="courses-page__sort-wrapper">
              <label htmlFor="courses-sort" className="courses-page__sort-label">
                Sort by
              </label>
              <select 
                id="courses-sort"
                value={filters.sortBy || 'newest'} 
                onChange={(e) => handleSortChange(e.target.value)}
                className="courses-page__sort-select"
                disabled={isLoading}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popularity">Most Popular</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="courses-page__results-info">
          {hasActiveFilters && (
            <button onClick={clearFilters} className="courses-page__clear-filters" disabled={isLoading}>
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="courses-page__content">
        {/* Filters Sidebar */}
        <aside className="courses-page__sidebar">
          <div className="courses-page__filters-container">
            <CourseFilters 
              filters={filters}
              onFilterChange={handleFilterChange}
              categories={categories}
              disabled={isLoading}
            />
          </div>
        </aside>

        {/* Courses Grid */}
        <main className="courses-page__main">
          {isLoading && hasInitialLoad ? (
            <div className="courses-page__loading">
              <Loading />
            </div>
          ) : courses && courses.length > 0 ? (
            <>
              <div className="courses-page__grid">
                {courses.map(course => (
                  <CourseCard 
                    key={course._id || course.id} 
                    course={course}
                    showInstructor={true}
                  />
                ))}
              </div>
              
              {pagination && pagination.totalPages > 1 && (
                <div className="courses-page__pagination-wrapper">
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="courses-page__no-results">
              <div className="courses-page__no-results-content">
                <h3 className="courses-page__no-results-title">No Courses Found</h3>
                <p className="courses-page__no-results-text">
                  {hasInitialLoad 
                    ? "We couldn't find any courses matching your criteria. Try adjusting your search or filters."
                    : "Loading courses... If this persists, please refresh the page."
                  }
                </p>
                <button onClick={clearFilters} className="courses-page__clear-filters">
                  {hasInitialLoad ? 'Clear All Filters' : 'Refresh'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Courses;