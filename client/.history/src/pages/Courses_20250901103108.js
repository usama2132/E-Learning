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
  
  // Control refs to prevent infinite loops
  const hasInitialized = useRef(false);
  const lastFetchParams = useRef(null);
  const fetchTimeoutRef = useRef(null);

  // Stable function to fetch courses with duplicate prevention
  const fetchCoursesWithParams = useCallback((params) => {
    const paramsKey = JSON.stringify(params);
    
    if (lastFetchParams.current === paramsKey) {
      return;
    }
    
    lastFetchParams.current = paramsKey;
    
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    fetchTimeoutRef.current = setTimeout(() => {
      fetchCourses(params);
    }, 300);
  }, [fetchCourses]);

  // Initial load only once
  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }
    
    hasInitialized.current = true;
    
    fetchCategories();
    
    const initialParams = {
      page: 1,
      limit: 12,
      sortBy: 'newest'
    };
    
    fetchCoursesWithParams(initialParams);
    
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [fetchCategories, fetchCoursesWithParams]);

  // FIXED: Handle filter changes from CourseFilters component
  const handleFilterChange = useCallback((newFilters) => {
    console.log('Filters changed:', newFilters);
    
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Build params for backend API call
    const params = {
      page: 1,
      limit: 12,
      sortBy: newFilters.sortBy || 'newest'
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

    console.log('Fetching courses with params:', params);
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

  // FIXED: Handle sort changes from dropdown
  const handleSortChange = useCallback((sortOption) => {
    const newFilters = { 
      ...filters, 
      sortBy: sortOption 
    };
    
    handleFilterChange(newFilters);
  }, [filters, handleFilterChange]);

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
    
    fetchCoursesWithParams({
      page: 1,
      limit: 12,
      sortBy: 'newest'
    });
  }, [fetchCoursesWithParams]);

  const retryFetch = useCallback(() => {
    clearError();
    lastFetchParams.current = null;
    
    const params = {
      page: currentPage,
      limit: 12,
      sortBy: filters.sortBy || 'newest'
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

  if (isLoading) return <Loading />;

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
              {pagination?.totalCourses || courses?.length || 0} courses found
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
            <button onClick={clearFilters} className="courses-page__clear-filters">
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
            />
          </div>
        </aside>

        {/* Courses Grid */}
        <main className="courses-page__main">
          {courses && courses.length > 0 ? (
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
                  We couldn't find any courses matching your criteria. Try adjusting your search or filters.
                </p>
                <button onClick={clearFilters} className="courses-page__clear-filters">
                  Clear All Filters
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