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
    
    // Prevent duplicate calls with same parameters
    if (lastFetchParams.current === paramsKey) {
      console.log('Preventing duplicate fetch call');
      return;
    }
    
    lastFetchParams.current = paramsKey;
    
    // Clear any pending fetch
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    // Debounce API calls
    fetchTimeoutRef.current = setTimeout(() => {
      console.log('Fetching courses with params:', params);
      fetchCourses(params);
    }, 300);
  }, [fetchCourses]);

  // Initial load only once
  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }
    
    hasInitialized.current = true;
    console.log('Initial load started');
    
    // Fetch categories first
    fetchCategories();
    
    // Initial courses fetch
    const initialParams = {
      page: 1,
      limit: 12,
      minPrice: 0,
      maxPrice: 1000,
      sortBy: 'newest'
    };
    
    fetchCoursesWithParams(initialParams);
    
    // Cleanup function
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []); // Empty dependency array for one-time initialization

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters) => {
    console.log('Filter change:', newFilters);
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
    console.log('Search:', searchTerm);
    const newFilters = { ...filters, search: searchTerm };
    handleFilterChange(newFilters);
  }, [filters, handleFilterChange]);

  const handleSortChange = useCallback((sortOption) => {
    console.log('Sort change:', sortOption);
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
    console.log('Page change:', page);
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
    console.log('Clearing filters');
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
    console.log('Retrying fetch...');
    clearError();
    lastFetchParams.current = null; // Reset to allow retry
    
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

  if (isLoading) return <Loading />;

  if (error) {
    return (
      <div className={`error-container theme-${actualTheme}`}>
        <h2>Error loading courses</h2>
        <p>{error}</p>
        <button 
          onClick={retryFetch}
          className="retry-btn"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div 
      className="courses-page"
      style={{
        backgroundColor: isDarkMode() ? '#1a1a1a' : '#ffffff',
        color: isDarkMode() ? '#ffffff' : '#212529'
      }}
    >
      <div 
        className="courses-header"
        style={{
          background: isDarkMode() 
            ? `linear-gradient(135deg, #0d6efd, #0d6efd88)` 
            : `linear-gradient(135deg, #007bff, #007bff88)`,
          color: 'white'
        }}
      >
        <h1 style={{ color: 'white' }}>All Courses</h1>
        <p style={{ color: 'white', opacity: 0.9 }}>Discover and learn from our extensive course catalog</p>
      </div>

      <div 
        className="courses-controls"
        style={{
          backgroundColor: isDarkMode() ? '#1a1a1a' : '#ffffff'
        }}
      >
        <div className="search-sort-container">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Search courses, instructors..." 
            value={filters.search || ''}
          />
          <div 
            className="sort-container"
            style={{
              color: isDarkMode() ? '#ffffff' : '#212529'
            }}
          >
            <label 
              htmlFor="sort-select"
              style={{
                color: isDarkMode() ? '#adb5bd' : '#6c757d'
              }}
            >
              Sort by:
            </label>
            <select 
              id="sort-select"
              value={sortBy} 
              onChange={(e) => handleSortChange(e.target.value)}
              style={{
                backgroundColor: isDarkMode() ? '#2d2d2d' : '#ffffff',
                color: isDarkMode() ? '#ffffff' : '#212529',
                borderColor: isDarkMode() ? '#404040' : '#e1e5e9'
              }}
            >
              <option value="newest" style={{backgroundColor: isDarkMode() ? '#2d2d2d' : '#ffffff', color: isDarkMode() ? '#ffffff' : '#212529'}}>Newest First</option>
              <option value="oldest" style={{backgroundColor: isDarkMode() ? '#2d2d2d' : '#ffffff', color: isDarkMode() ? '#ffffff' : '#212529'}}>Oldest First</option>
              <option value="price-low" style={{backgroundColor: isDarkMode() ? '#2d2d2d' : '#ffffff', color: isDarkMode() ? '#ffffff' : '#212529'}}>Price: Low to High</option>
              <option value="price-high" style={{backgroundColor: isDarkMode() ? '#2d2d2d' : '#ffffff', color: isDarkMode() ? '#ffffff' : '#212529'}}>Price: High to Low</option>
              <option value="rating" style={{backgroundColor: isDarkMode() ? '#2d2d2d' : '#ffffff', color: isDarkMode() ? '#ffffff' : '#212529'}}>Highest Rated</option>
              <option value="popular" style={{backgroundColor: isDarkMode() ? '#2d2d2d' : '#ffffff', color: isDarkMode() ? '#ffffff' : '#212529'}}>Most Popular</option>
            </select>
          </div>
        </div>
        
        <div 
          className="results-info"
          style={{
            borderBottomColor: isDarkMode() ? '#404040' : '#e9ecef'
          }}
        >
          <span style={{ color: isDarkMode() ? '#adb5bd' : '#6c757d' }}>
            {pagination?.totalCourses || courses?.length || 0} courses found
          </span>
          {(filters.search || filters.category || filters.level || filters.rating) && (
            <button 
              onClick={clearFilters} 
              className="clear-filters-btn"
              style={{
                backgroundColor: isDarkMode() ? '#6c757d' : '#6c757d'
              }}
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      <div 
        className="courses-content"
        style={{
          backgroundColor: isDarkMode() ? '#1a1a1a' : '#ffffff'
        }}
      >
        <aside 
          className="filters-sidebar"
          style={{
            backgroundColor: isDarkMode() ? '#2d2d2d' : '#ffffff',
            borderColor: isDarkMode() ? '#404040' : '#e1e5e9'
          }}
        >
          <CourseFilters 
            filters={filters}
            onFilterChange={handleFilterChange}
            categories={categories}
          />
        </aside>

        <main className="courses-grid-container">
          {courses && courses.length > 0 ? (
            <>
              <div className="courses-grid">
                {courses.map(course => (
                  <CourseCard 
                    key={course._id} 
                    course={course}
                    showInstructor={true}
                  />
                ))}
              </div>
              
              {pagination && pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          ) : (
            <div 
              className="no-courses"
              style={{
                backgroundColor: isDarkMode() ? '#2d2d2d' : '#ffffff',
                borderColor: isDarkMode() ? '#404040' : '#e1e5e9',
                color: isDarkMode() ? '#ffffff' : '#212529'
              }}
            >
              <h3>No courses found</h3>
              <p style={{ color: isDarkMode() ? '#adb5bd' : '#6c757d' }}>
                Try adjusting your search criteria or filters
              </p>
              <button 
                onClick={clearFilters} 
                className="clear-filters-btn"
                style={{
                  backgroundColor: isDarkMode() ? '#6c757d' : '#6c757d'
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Courses;