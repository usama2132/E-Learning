import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CourseContext } from '../../context/CourseContext';
import { useCourses } from '../../hooks/useCourses';
import { useDebounce } from '../../hooks/useDebounce';
import CourseCard from './CourseCard';
import CourseFilters from '../common/CourseFilters';
import SearchBar from '../common/SearchBar';
import Pagination from '../common/Pagination';
import Loading from '../common/Loading';
import Button from '../common/Button';
import '../../styles/dashboards/CourseCatalog.css';

const CourseCatalog = () => {
  const { user } = useContext(AuthContext);
  const { 
    courses, 
    loading, 
    error,
    enrollInCourse,
    addToWishlist,
    removeFromWishlist,
    fetchCourses,
    totalPages,
    currentPage
  } = useCourses();

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    level: '',
    price: '', // 'free', 'paid', 'all'
    rating: '',
    duration: '', // 'short', 'medium', 'long'
    sortBy: 'popularity' // 'popularity', 'rating', 'price-low', 'price-high', 'newest'
  });

  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loadingAction, setLoadingAction] = useState(null);

  const debouncedSearch = useDebounce(filters.search, 500);

  useEffect(() => {
    // Fetch courses when filters change
    const params = {
      page: currentPage,
      limit: 12,
      search: debouncedSearch,
      category: filters.category,
      level: filters.level,
      price: filters.price,
      rating: filters.rating,
      duration: filters.duration,
      sortBy: filters.sortBy
    };

    fetchCourses(params);
  }, [debouncedSearch, filters, currentPage, fetchCourses]);

  useEffect(() => {
    // Fetch featured courses separately
    fetchFeaturedCourses();
  }, []);

  const fetchFeaturedCourses = async () => {
    try {
      const response = await fetch('/api/courses?featured=true&limit=6');
      const data = await response.json();
      if (data.success) {
        setFeaturedCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching featured courses:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearchChange = (value) => {
    setFilters(prev => ({
      ...prev,
      search: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      level: '',
      price: '',
      rating: '',
      duration: '',
      sortBy: 'popularity'
    });
  };

  const handleEnrollment = async (courseId) => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login?redirect=/courses';
      return;
    }

    setLoadingAction(`enroll-${courseId}`);
    try {
      await enrollInCourse(courseId);
    } catch (error) {
      console.error('Enrollment error:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleWishlistAdd = async (courseId) => {
    if (!user) {
      window.location.href = '/login?redirect=/courses';
      return;
    }

    setLoadingAction(`wishlist-add-${courseId}`);
    try {
      await addToWishlist(courseId);
    } catch (error) {
      console.error('Add to wishlist error:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleWishlistRemove = async (courseId) => {
    setLoadingAction(`wishlist-remove-${courseId}`);
    try {
      await removeFromWishlist(courseId);
    } catch (error) {
      console.error('Remove from wishlist error:', error);
    } finally {
      setLoadingAction(null);
    }
  };

  const isEnrolled = (courseId) => {
    return user?.enrolledCourses?.includes(courseId) || false;
  };

  const isInWishlist = (courseId) => {
    return user?.wishlist?.includes(courseId) || false;
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== '' && value !== 'popularity'
    ).length;
  };

  const renderFeaturedSection = () => {
    if (featuredCourses.length === 0) return null;

    return (
      <section className="featured-section">
        <div className="section-header">
          <h2>Featured Courses</h2>
          <p>Hand-picked courses by our experts</p>
        </div>
        <div className="featured-courses">
          {featuredCourses.map(course => (
            <CourseCard
              key={course._id}
              course={course}
              variant="catalog"
              onEnroll={handleEnrollment}
              onAddToWishlist={handleWishlistAdd}
              onRemoveFromWishlist={handleWishlistRemove}
              isEnrolled={isEnrolled(course._id)}
              isInWishlist={isInWishlist(course._id)}
            />
          ))}
        </div>
      </section>
    );
  };

  const renderCourseGrid = () => {
    if (courses.length === 0) {
      return (
        <div className="no-courses">
          <div className="no-courses-content">
            <span className="no-courses-icon">🔍</span>
            <h3>No courses found</h3>
            <p>Try adjusting your search criteria or browse our featured courses.</p>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className={`courses-grid ${viewMode}`}>
        {courses.map(course => (
          <CourseCard
            key={course._id}
            course={course}
            variant="catalog"
            onEnroll={handleEnrollment}
            onAddToWishlist={handleWishlistAdd}
            onRemoveFromWishlist={handleWishlistRemove}
            isEnrolled={isEnrolled(course._id)}
            isInWishlist={isInWishlist(course._id)}
          />
        ))}
      </div>
    );
  };

  if (error) {
    return (
      <div className="error-state">
        <h3>Unable to load courses</h3>
        <p>{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
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
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search for courses, instructors, or topics..."
            className="main-search"
          />
        </div>
      </div>

      {!filters.search && renderFeaturedSection()}

      <div className="catalog-main">
        <div className="filters-sidebar">
          <div className="filters-header">
            <h3>Filters</h3>
            {getActiveFiltersCount() > 0 && (
              <Button 
                variant="text" 
                size="small" 
                onClick={clearFilters}
                className="clear-filters"
              >
                Clear ({getActiveFiltersCount()})
              </Button>
            )}
          </div>
          
          <CourseFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
          />
        </div>

        <div className="catalog-content">
          <div className="content-header">
            <div className="results-info">
              <span className="results-count">
                {loading ? 'Loading...' : `${courses.length} courses found`}
              </span>
              {filters.search && (
                <span className="search-term">
                  for "{filters.search}"
                </span>
              )}
            </div>

            <div className="content-controls">
              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid view"
                >
                  ⊞
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List view"
                >
                  ☰
                </button>
              </div>

              <div className="sort-controls">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="sort-select"
                >
                  <option value="popularity">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              <button
                className="filters-toggle mobile-only"
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
              </button>
            </div>
          </div>

          {loading ? (
            <Loading message="Loading courses..." />
          ) : (
            <>
              {renderCourseGrid()}
              
              {totalPages > 1 && (
                <div className="pagination-section">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => fetchCourses({ ...filters, page })}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filters overlay */}
      {showFilters && (
        <div className="mobile-filters-overlay">
          <div className="mobile-filters">
            <div className="mobile-filters-header">
              <h3>Filters</h3>
              <button 
                className="close-filters"
                onClick={() => setShowFilters(false)}
              >
                ×
              </button>
            </div>
            <CourseFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
            <div className="mobile-filters-footer">
              <Button 
                onClick={() => setShowFilters(false)}
                variant="primary"
                fullWidth
              >
                Show Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;
