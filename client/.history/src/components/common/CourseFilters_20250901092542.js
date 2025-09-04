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
  
  const [tempFilters, setTempFilters] = useState({
    category: '',
    level: '',
    priceRange: '',
    rating: '',
    duration: '',
    sortBy: 'newest',
    ...initialFilters
  });

  const [appliedFilters, setAppliedFilters] = useState({
    category: '',
    level: '',
    priceRange: '',
    rating: '',
    duration: '',
    sortBy: 'newest',
    ...initialFilters
  });

  const handleTempFilterChange = (filterType, value) => {
    setTempFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const applyFilters = () => {
    setAppliedFilters(tempFilters);
    onFilterChange(tempFilters);
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
    setTempFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  // Check if there are any pending changes
  const hasChanges = JSON.stringify(tempFilters) !== JSON.stringify(appliedFilters);

  return (
    <div className="course-filters">
      <div className="course-filters__header">
        <h3>Filter Courses</h3>
        <div className="course-filters__header-actions">
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
            value={tempFilters.category}
            onChange={(e) => handleTempFilterChange('category', e.target.value)}
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
            value={tempFilters.level}
            onChange={(e) => handleTempFilterChange('level', e.target.value)}
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
                  checked={tempFilters.priceRange === `${range.min}-${range.max}`}
                  onChange={(e) => handleTempFilterChange('priceRange', e.target.value)}
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
                  checked={tempFilters.rating === rating.toString()}
                  onChange={(e) => handleTempFilterChange('rating', e.target.value)}
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
            value={tempFilters.duration}
            onChange={(e) => handleTempFilterChange('duration', e.target.value)}
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
            value={tempFilters.sortBy}
            onChange={(e) => handleTempFilterChange('sortBy', e.target.value)}
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

      {/* Apply Button Section */}
      <div className="course-filters__actions">
        <button 
          onClick={applyFilters}
          className={`course-filters__apply ${hasChanges ? 'has-changes' : ''}`}
          disabled={!hasChanges}
        >
          Apply Filters
          {hasChanges && <span className="changes-indicator">•</span>}
        </button>
      </div>
    </div>
  );
};

export default CourseFilters;