import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCourse } from '../context/CourseContext';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import CourseCard from '../components/student/CourseCard';
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
  
  // Simplified filter state - only search and sort
  const [filters, setFilters] = useState({
    searchQuery: '',
    sortBy: 'newest'
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  
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
    }, 100);
  }, [fetchCourses]);

  // Initial load - fetch courses immediately
  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }
    
    console.log('Courses component: Initial mount, fetching courses...');
    hasInitialized.current = true;
    
    // Fetch categories for potential future use
    fetchCategories().catch(err => console.warn('Failed to fetch categories:', err));
    
    // Always fetch courses on initial load
    const initialParams = {
      page: 1,
      limit: 12,
      sortBy: 'newest'
    };
    
    console.log('Initial course fetch with params:', initialParams);
    fetchCoursesWithParams(initialParams);
    setHasInitialLoad(true);
    
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  // Handle when courses are loaded
  useEffect(() => {
    if (courses && courses.length > 0) {
      console.log(`Courses loaded successfully: ${courses.length} courses`);
    } else if (hasInitialLoad && !isLoading) {
      console.warn('No courses returned from backend');
    }
  }, [courses, hasInitialLoad, isLoading]);

  // Handle search from SearchBar component
  const handleSearch = useCallback((searchTerm) => {
    console.log('Search term changed:', searchTerm);
    
    const newFilters = { 
      ...filters, 
      searchQuery: searchTerm 
    };
    
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Build params for backend API call
    const params = {
      page: 1,
      limit: 12,
      sortBy: newFilters.sortBy || 'newest'
    };

    // Add search if provided
    if (searchTerm?.trim()) {
      params.search = searchTerm.trim();
    }

    console.log('Fetching courses with search params:', params);
    fetchCoursesWithParams(params);
  }, [filters, fetchCoursesWithParams]);

  // Handle sort changes from dropdown
  const handleSortChange = useCallback((sortOption) => {
    console.log('Sort option changed to:', sortOption);
    
    const newFilters = { 
      ...filters, 
      sortBy: sortOption 
    };
    
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Build params for backend API call
    const params = {
      page: 1,
      limit: 12,
      sortBy: sortOption
    };

    // Add search if provided
    if (filters.searchQuery?.trim()) {
      params.search = filters.searchQuery.trim();
    }

    console.log('Fetching courses with sort params:', params);
    fetchCoursesWithParams(params);
  }, [filters, fetchCoursesWithParams]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    
    // Build params with current filters
    const params = {
      page,
      limit: 12,
      sortBy: filters.sortBy || 'newest'
    };

    if (filters.searchQuery?.trim()) {
      params.search = filters.searchQuery.trim();
    }
    
    fetchCoursesWithParams(params);
  }, [filters, fetchCoursesWithParams]);

  const clearFilters = useCallback(() => {
    const resetFilters = {
      searchQuery: '',
      sortBy: 'newest'
    };
    
    setFilters(resetFilters);
    setCurrentPage(1);
    
    const params = {
      page: 1,
      limit: 12,
      sortBy: 'newest'
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
      sortBy: filters.sortBy || 'newest'
    };

    if (filters.searchQuery?.trim()) {
      params.search = filters.searchQuery.trim();
    }
    
    fetchCoursesWithParams(params);
  }, [clearError, currentPage, filters, fetchCoursesWithParams]);

  const hasActiveFilters = filters.searchQuery?.trim();

  // Show loading only on initial load
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
              {isLoading && hasInitialLoad ? 
                'Loading...' : 
                `${pagination?.totalCourses || courses?.length || 0} courses found`
              }
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
                <option value="alphabetical">A-Z</option>
                <option value="students">Most Students</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="courses-page__results-info">
          {hasActiveFilters && (
            <button 
              onClick={clearFilters} 
              className="courses-page__clear-filters" 
              disabled={isLoading}
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* Main Content - Full Width Grid (No Sidebar) */}
      <div className="courses-page__content courses-page__content--no-sidebar">
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
                    ? hasActiveFilters 
                      ? "We couldn't find any courses matching your search. Try different keywords or clear your search."
                      : "No courses are currently available. Please check back later."
                    : "Loading courses... If this persists, please refresh the page."
                  }
                </p>
                <div className="courses-page__no-results-actions">
                  {hasActiveFilters ? (
                    <button onClick={clearFilters} className="courses-page__clear-filters">
                      Clear Search
                    </button>
                  ) : (
                    <button onClick={retryFetch} className="courses-page__clear-filters">
                      Refresh
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Courses;