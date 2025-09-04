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
  
  const { isDarkMode } = useTheme();
  
  const [filters, setFilters] = useState({
    searchQuery: '',
    category: '',
    level: '',
    rating: '',
    priceRange: '',
    sortBy: 'newest'
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  
  const hasInitialized = useRef(false);

  // DEBUG: Add courses to window for debugging
  useEffect(() => {
    window.coursesDebug = { courses, isLoading, error, hasInitialLoad };
    console.log('🔍 COURSES DEBUG:', { 
      coursesLength: courses?.length || 0, 
      isLoading, 
      error, 
      hasInitialLoad,
      coursesData: courses 
    });
  }, [courses, isLoading, error, hasInitialLoad]);

  // FIXED: Simpler initial load
  useEffect(() => {
    if (hasInitialized.current) return;
    
    console.log('📱 Courses page: Initial mount');
    hasInitialized.current = true;
    
    const initializePage = async () => {
      try {
        // Fetch categories first (optional)
        fetchCategories().catch(err => console.warn('Categories failed:', err));
        
        // CRITICAL FIX: Always include sortBy in initial params
        const initialParams = {
          page: 1,
          limit: 12,
          sortBy: 'newest' // This is the key fix!
        };
        
        console.log('🎯 Initial fetch with params:', initialParams);
        await fetchCourses(initialParams);
        setHasInitialLoad(true);
        
      } catch (error) {
        console.error('Initial load failed:', error);
        setHasInitialLoad(true);
      }
    };
    
    initializePage();
  }, [fetchCategories, fetchCourses]);

  const handleFilterChange = useCallback((newFilters) => {
    console.log('🎛️ Filters changed:', newFilters);
    
    setFilters(newFilters);
    setCurrentPage(1);
    
    const params = {
      page: 1,
      limit: 12,
      sortBy: newFilters.sortBy || 'newest' // Always include sortBy
    };

    if (newFilters.searchQuery?.trim()) {
      params.search = newFilters.searchQuery.trim();
    }
    if (newFilters.category) {
      params.category = newFilters.category;
    }
    if (newFilters.level) {
      params.level = newFilters.level;
    }

    // Price range handling
    if (newFilters.priceRange) {
      switch (newFilters.priceRange) {
        case 'free':
          params.minPrice = 0;
          params.maxPrice = 0;
          break;
        case '1-50':
          params.minPrice = 1;
          params.maxPrice = 50;
          break;
        case '51-100':
          params.minPrice = 51;
          params.maxPrice = 100;
          break;
        case '101-200':
          params.minPrice = 101;
          params.maxPrice = 200;
          break;
        case '200-999':
          params.minPrice = 200;
          params.maxPrice = 999;
          break;
      }
    }

    if (newFilters.rating) {
      params.rating = parseFloat(newFilters.rating);
    }

    console.log('🔄 Fetching with filter params:', params);
    fetchCourses(params);
  }, [fetchCourses]);

  const handleSearch = useCallback((searchTerm) => {
    const newFilters = { 
      ...filters, 
      searchQuery: searchTerm 
    };
    handleFilterChange(newFilters);
  }, [filters, handleFilterChange]);

  const handleSortChange = useCallback((sortOption) => {
    console.log('📊 Sort changed to:', sortOption);
    
    const newFilters = { 
      ...filters, 
      sortBy: sortOption 
    };
    
    setFilters(newFilters);
    handleFilterChange(newFilters);
  }, [filters, handleFilterChange]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    
    const params = {
      page,
      limit: 12,
      sortBy: filters.sortBy || 'newest'
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

    if (filters.priceRange) {
      switch (filters.priceRange) {
        case 'free':
          params.minPrice = 0;
          params.maxPrice = 0;
          break;
        case '1-50':
          params.minPrice = 1;
          params.maxPrice = 50;
          break;
        case '51-100':
          params.minPrice = 51;
          params.maxPrice = 100;
          break;
        case '101-200':
          params.minPrice = 101;
          params.maxPrice = 200;
          break;
        case '200-999':
          params.minPrice = 200;
          params.maxPrice = 999;
          break;
      }
    }
    
    fetchCourses(params);
  }, [filters, fetchCourses]);

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
      sortBy: 'newest'
    };
    
    console.log('🧹 Clearing filters, fetching with:', params);
    fetchCourses(params);
  }, [fetchCourses]);

  const retryFetch = useCallback(() => {
    console.log('🔄 Retrying fetch...');
    clearError();
    
    const params = {
      page: currentPage,
      limit: 12,
      sortBy: filters.sortBy || 'newest'
    };

    if (filters.searchQuery?.trim()) params.search = filters.searchQuery.trim();
    if (filters.category) params.category = filters.category;
    if (filters.level) params.level = filters.level;
    if (filters.rating) params.rating = parseFloat(filters.rating);

    if (filters.priceRange) {
      switch (filters.priceRange) {
        case 'free':
          params.minPrice = 0;
          params.maxPrice = 0;
          break;
        case '1-50':
          params.minPrice = 1;
          params.maxPrice = 50;
          break;
        case '51-100':
          params.minPrice = 51;
          params.maxPrice = 100;
          break;
        case '101-200':
          params.minPrice = 101;
          params.maxPrice = 200;
          break;
        case '200-999':
          params.minPrice = 200;
          params.maxPrice = 999;
          break;
      }
    }
    
    fetchCourses(params);
  }, [clearError, currentPage, filters, fetchCourses]);

  const hasActiveFilters = filters.searchQuery || filters.category || filters.level || filters.rating || filters.priceRange;

  // Show loading only for initial load
  if (isLoading && !hasInitialLoad) {
    console.log('🔄 Showing initial loading...');
    return <Loading />;
  }

  if (error) {
    console.log('❌ Showing error:', error);
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

  // Always render the page structure
  const coursesToDisplay = courses || [];
  const showCourses = coursesToDisplay.length > 0;
  
  console.log('🎯 Final render decision:', {
    showCourses,
    coursesToDisplay: coursesToDisplay.length,
    isLoading,
    hasInitialLoad
  });

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
              {isLoading ? 'Loading...' : `${pagination?.totalCourses || coursesToDisplay.length || 0} courses found`}
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
      <div >
        

        {/* Courses Grid */}
        <main className="courses-page__main">
          {/* Show loading overlay while fetching but keep existing content visible */}
          {isLoading && hasInitialLoad && (
            <div className="courses-page__loading-overlay">
              <Loading />
            </div>
          )}
          
          {showCourses ? (
            <>
              <div className="courses-page__grid">
                {coursesToDisplay.map(course => (
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
                <h3 className="courses-page__no-results-title">
                  {hasInitialLoad ? 'No Courses Found' : 'Loading Courses...'}
                </h3>
                <p className="courses-page__no-results-text">
                  {hasInitialLoad 
                    ? "We couldn't find any courses matching your criteria. Try adjusting your search or filters."
                    : "Please wait while we load the available courses."
                  }
                </p>
                {hasInitialLoad && (
                  <button onClick={clearFilters} className="courses-page__clear-filters">
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Courses;