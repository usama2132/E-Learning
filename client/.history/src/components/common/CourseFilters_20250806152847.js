import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/components/CourseFilters.css';

const CourseFilters = ({
  onFilterChange,
  categories = [],
  levels = ['Beginner', 'Intermediate', 'Advanced'],
  priceRanges = [
    { label: 'Free', min: 0, max: 0 },
    { label: '$1 - $50', min: 1, max: 50 },
    { label: '$51 - $100', min: 51, max: 100 },
    { label: '$101 - $200', min: 101, max: 200 },
    { label: '$200+', min: 201, max: null }
  ],
  ratings = [5, 4, 3, 2, 1],
  initialFilters = {}
}) => {
  const { theme, toggleTheme } = useTheme();
  
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    priceRange: '',
    rating: '',
    duration: '',
    sortBy: 'newest',
    ...initialFilters
  });

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      level: '',
      priceRange: '',
      rating: '',
      duration: '',
      sortBy: 'newest'
    };
    setFilters(clearedFilters);
  };

  return (
    <div className="course-filters">
      <div className="course-filters__header">
        <h3>Filter Courses</h3>
        <div className="course-filters__header-actions">
          {/* Theme Toggle Button */}
         
          
          <button 
            onClick={clearFilters}
            className="course-filters__clear"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="course-filters__content">
        {/* Category Filter */}
        <div className="filter-group">
          <label className="filter-group__label">Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-group__select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Level Filter */}
        <div className="filter-group">
          <label className="filter-group__label">Level</label>
          <select
            value={filters.level}
            onChange={(e) => handleFilterChange('level', e.target.value)}
            className="filter-group__select"
          >
            <option value="">All Levels</option>
            {levels.map(level => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range Filter */}
        <div className="filter-group">
          <label className="filter-group__label">Price</label>
          <div className="filter-group__radio-group">
            {priceRanges.map((range, index) => (
              <label key={index} className="filter-group__radio-label">
                <input
                  type="radio"
                  name="priceRange"
                  value={`${range.min}-${range.max}`}
                  checked={filters.priceRange === `${range.min}-${range.max}`}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                />
                {range.label}
              </label>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div className="filter-group">
          <label className="filter-group__label">Rating</label>
          <div className="filter-group__radio-group">
            {ratings.map(rating => (
              <label key={rating} className="filter-group__radio-label">
                <input
                  type="radio"
                  name="rating"
                  value={rating}
                  checked={filters.rating === rating.toString()}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                />
                {rating} stars & up
              </label>
            ))}
          </div>
        </div>

        {/* Duration Filter */}
        <div className="filter-group">
          <label className="filter-group__label">Duration</label>
          <select
            value={filters.duration}
            onChange={(e) => handleFilterChange('duration', e.target.value)}
            className="filter-group__select"
          >
            <option value="">Any Duration</option>
            <option value="0-2">0-2 hours</option>
            <option value="2-5">2-5 hours</option>
            <option value="5-10">5-10 hours</option>
            <option value="10+">10+ hours</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="filter-group">
          <label className="filter-group__label">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="filter-group__select"
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
  );
};

export default CourseFilters;