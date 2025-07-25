import React, { useState, useEffect } from 'react';
import { useCourses } from '../hooks/useCourses';
import { useAuth } from '../hooks/useAuth';
import CourseCard from '../components/student/CourseCard';
import CourseFilters from '../components/common/CourseFilters';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';
import '../styles/pages/Courses.css';

const Courses = () => {
  const { user } = useAuth();
  const { courses, loading, error, fetchCourses } = useCourses();
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    rating: '',
    priceRange: { min: 0, max: 1000 }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(12);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterAndSortCourses();
  }, [courses, filters, searchTerm, sortBy]);

  const filterAndSortCourses = () => {
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
    if (filters.category) {
      filtered = filtered.filter(course => course.category === filters.category);
    }

    // Apply level filter
    if (filters.level) {
      filtered = filtered.filter(course => course.level === filters.level);
    }

    // Apply rating filter
    if (filters.rating) {
      filtered = filtered.filter(course => course.rating >= parseFloat(filters.rating));
    }

    // Apply price range filter
    filtered = filtered.filter(course => 
      course.price >= filters.priceRange.min && course.price <= filters.priceRange.max
    );

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        filtered.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
        break;
      default:
        break;
    }

    setFilteredCourses(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleSortChange = (sortOption) => {
    setSortBy(sortOption);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      level: '',
      rating: '',
      priceRange: { min: 0, max: 1000 }
    });
    setSearchTerm('');
    setSortBy('newest');
  };

  // Pagination logic
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="error-container">
        <h2>Error loading courses</h2>
        <p>{error}</p>
        <button onClick={fetchCourses} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="courses-page">
      <div className="courses-header">
        <h1>All Courses</h1>
        <p>Discover and learn from our extensive course catalog</p>
      </div>

      <div className="courses-controls">
        <div className="search-sort-container">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Search courses, instructors..." 
            value={searchTerm}
          />
          <div className="sort-container">
            <label htmlFor="sort-select">Sort by:</label>
            <select 
              id="sort-select"
              value={sortBy} 
              onChange={(e) => handleSortChange(e.target.value)}
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
        
        <div className="results-info">
          <span>{filteredCourses.length} courses found</span>
          {(searchTerm || filters.category || filters.level || filters.rating) && (
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      <div className="courses-content">
        <aside className="filters-sidebar">
          <CourseFilters 
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </aside>

        <main className="courses-grid-container">
          {currentCourses.length > 0 ? (
            <>
              <div className="courses-grid">
                {currentCourses.map(course => (
                  <CourseCard 
                    key={course.id} 
                    course={course}
                    showInstructor={true}
                  />
                ))}
              </div>
              
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          ) : (
            <div className="no-courses">
              <h3>No courses found</h3>
              <p>Try adjusting your search criteria or filters</p>
              <button onClick={clearFilters} className="clear-filters-btn">
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