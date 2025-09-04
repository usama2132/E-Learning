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
  
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    rating: '',
    priceRange: { min: 0, max: 1000 },
    search: ''
  });
  
  const [sortBy, setSortBy] = useState('newest');
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
      minPrice: 0,
      maxPrice: 1000,
      sortBy: 'newest'
    };
    
    fetchCoursesWithParams(initialParams);
    
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [fetchCategories, fetchCoursesWithParams]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    
    const params = {
      page: 1,
      limit: 12,
      ...(newFilters.search?.trim() && { search: newFilters.search.trim() }),
      ...(newFilters.category && { category: newFilters.category }),
      ...(newFilters.level && { level: newFilters.level }),
      ...(newFilters.rating && { rating: parseFloat(newFilters.rating) }),
      minPrice: newFilters.priceRange?.min || 0,
      maxPrice: newFilters.priceRange?.max || 1000,
      sortBy: sortBy
    };
    
    fetchCoursesWithParams(params);
  }, [sortBy, fetchCoursesWithParams]);

  const handleSearch = useCallback((searchTerm) => {
    const newFilters = { ...filters, search: searchTerm };
    handleFilterChange(newFilters);
  }, [filters, handleFilterChange]);

  const handleSortChange = useCallback((sortOption) => {
    setSortBy(sortOption);
    
    const params = {
      page: currentPage,
      limit: 12,
      ...(filters.search?.trim() && { search: filters.search.trim() }),
      ...(filters.category && { category: filters.category }),
      ...(filters.level && { level: filters.level }),
      ...(filters.rating && { rating: parseFloat(filters.rating) }),
      minPrice: filters.priceRange?.min || 0,
      maxPrice: filters.priceRange?.max || 1000,
      sortBy: sortOption
    };
    
    fetchCoursesWithParams(params);
  }, [currentPage, filters, fetchCoursesWithParams]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    
    const params = {
      page,
      limit: 12,
      ...(filters.search?.trim() && { search: filters.search.trim() }),
      ...(filters.category && { category: filters.category }),
      ...(filters.level && { level: filters.level }),
      ...(filters.rating && { rating: parseFloat(filters.rating) }),
      minPrice: filters.priceRange?.min || 0,
      maxPrice: filters.priceRange?.max || 1000,
      sortBy: sortBy
    };
    
    fetchCoursesWithParams(params);
  }, [filters, sortBy, fetchCoursesWithParams]);

  const clearFilters = useCallback(() => {
    const resetFilters = {
      category: '',
      level: '',
      rating: '',
      priceRange: { min: 0, max: 1000 },
      search: ''
    };
    
    setFilters(resetFilters);
    setSortBy('newest');
    setCurrentPage(1);
    
    fetchCoursesWithParams({
      page: 1,
      limit: 12,
      minPrice: 0,
      maxPrice: 1000,
      sortBy: 'newest'
    });
  }, [fetchCoursesWithParams]);

  const retryFetch = useCallback(() => {
    clearError();
    lastFetchParams.current = null;
    
    const params = {
      page: currentPage,
      limit: 12,
      ...(filters.search?.trim() && { search: filters.search.trim() }),
      ...(filters.category && { category: filters.category }),
      ...(filters.level && { level: filters.level }),
      ...(filters.rating && { rating: parseFloat(filters.rating) }),
      minPrice: filters.priceRange?.min || 0,
      maxPrice: filters.priceRange?.max || 1000,
      sortBy: sortBy
    };
    
    fetchCoursesWithParams(params);
  }, [clearError, currentPage, filters, sortBy, fetchCoursesWithParams]);

  const hasActiveFilters = filters.search || filters.category || filters.level || filters.rating;

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
              value={filters.search || ''}
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
                value={sortBy} 
                onChange={(e) => handleSortChange(e.target.value)}
                className="courses-page__sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
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
                    key={course._id} 
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