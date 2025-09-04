import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/components/CourseFilters.css';

const CourseFilters = ({
  filters = {},
  onFilterChange,
  categories = [],
  levels = ['Beginner', 'Intermediate', 'Advanced'],
  priceRanges = [
    { label: 'Free', value: 'free' },
    { label: '$1 - $50', value: '1-50' },
    { label: '$51 - $100', value: '51-100' },
    { label: '$101 - $200', value: '101-200' },
    { label: '$200+', value: '200-999' }
  ],
  ratings = [5, 4, 3, 2, 1]
}) => {
  const { theme, toggleTheme } = useTheme();
  
  // FIXED: Initialize tempFilters with current filters
  const [tempFilters, setTempFilters] = useState({
    searchQuery: '',
    category: '',
    level: '',
    priceRange: '',
    rating: '',
    sortBy: 'newest',
    ...filters
  });

  // FIXED: Update tempFilters when external filters change
  useEffect(() => {
    setTempFilters(prevTemp => ({
      ...prevTemp,
      ...filters
    }));
  }, [filters]);

  const handleTempFilterChange = (filterType, value) => {
    setTempFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // FIXED: Apply filters function - passes complete filter object
  const applyFilters = () => {
    console.log('Applying filters:', tempFilters);
    
    // Convert filters to the format expected by the backend
    const filterParams = {
      searchQuery: tempFilters.searchQuery || '',
      category: tempFilters.category || '',
      level: tempFilters.level || '',
      priceRange: tempFilters.priceRange || '',
      rating: tempFilters.rating || '',
      sortBy: tempFilters.sortBy || 'newest'
    };

    // Call parent's onFilterChange with complete filter object
    if (onFilterChange && typeof onFilterChange === 'function') {
      onFilterChange(filterParams);
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      searchQuery: '',
      category: '',
      level: '',
      priceRange: '',
      rating: '',
      sortBy: 'newest'
    };
    
    setTempFilters(clearedFilters);
    
    // Immediately apply cleared filters
    if (onFilterChange && typeof onFilterChange === 'function') {
      onFilterChange(clearedFilters);
    }
  };

  // Check if there are any pending changes
  const hasChanges = JSON.stringify(tempFilters) !== JSON.stringify(filters);

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
            value={tempFilters.category || ''}
            onChange={(e) => handleTempFilterChange('category', e.target.value)}
            className="filter-group__select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category._id || category.id} value={category._id || category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Level Filter */}
        <div className="filter-group">
          <label className="filter-group__label">Level</label>
          <select
            value={tempFilters.level || ''}
            onChange={(e) => handleTempFilterChange('level', e.target.value)}
            className="filter-group__select"
          >
            <option value="">All Levels</option>
            {levels.map(level => (
              <option key={level} value={level.toLowerCase()}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range Filter */}
        <div className="filter-group">
          <label className="filter-group__label">Price</label>
          <div className="filter-group__radio-group">
            <label className="filter-group__radio-label">
              <input
                type="radio"
                name="priceRange"
                value=""
                checked={tempFilters.priceRange === '' || tempFilters.priceRange === null}
                onChange={(e) => handleTempFilterChange('priceRange', e.target.value)}
              />
              All Prices
            </label>
            {priceRanges.map((range, index) => (
              <label key={index} className="filter-group__radio-label">
                <input
                  type="radio"
                  name="priceRange"
                  value={range.value}
                  checked={tempFilters.priceRange === range.value}
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
            <label className="filter-group__radio-label">
              <input
                type="radio"
                name="rating"
                value=""
                checked={tempFilters.rating === '' || tempFilters.rating === null}
                onChange={(e) => handleTempFilterChange('rating', e.target.value)}
              />
              All Ratings
            </label>
            {ratings.map(rating => (
              <label key={rating} className="filter-group__radio-label">
                <input
                  type="radio"
                  name="rating"
                  value={rating.toString()}
                  checked={tempFilters.rating === rating.toString()}
                  onChange={(e) => handleTempFilterChange('rating', e.target.value)}
                />
                {rating} stars & up
              </label>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div className="filter-group">
          <label className="filter-group__label">Sort By</label>
          <select
            value={tempFilters.sortBy || 'newest'}
            onChange={(e) => handleTempFilterChange('sortBy', e.target.value)}
            className="filter-group__select"
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