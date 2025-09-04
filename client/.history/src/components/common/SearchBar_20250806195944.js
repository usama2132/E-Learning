import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useDebounce from '../../hooks/useDebounce'; // ✅
import api from '../../utils/api'; // ✅
import '../../styles/components/SearchBar.css';

const SearchBar = ({ 
  placeholder = "Search courses...", 
  onSearch,
  showSuggestions = true,
  className = "" 
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim() && showSuggestions) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [debouncedQuery, showSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchQuery) => {
    setIsLoading(true);
    try {
      const response = await api({
        query: searchQuery,
        limit: 5
      });
      setSuggestions(response.courses || []);
      setIsOpen(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query.trim());
      } else {
        navigate(`/courses?search=${encodeURIComponent(query.trim())}`);
      }
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (course) => {
    setQuery(course.title);
    setIsOpen(false);
    navigate(`/courses/${course._id}`);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? 
        <span key={index} className="search-highlight">{part}</span> : 
        part
    );
  };

  return (
    <div className={`search-bar ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="search-input"
            autoComplete="off"
          />
          <button 
            type="submit" 
            className="search-button"
            disabled={!query.trim()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {isOpen && showSuggestions && (
          <div className="search-suggestions">
            {isLoading ? (
              <div className="suggestion-item loading">
                <div className="loading-spinner"></div>
                <span>Searching...</span>
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((course, index) => (
                <div
                  key={course._id}
                  className={`suggestion-item ${
                    index === selectedIndex ? 'selected' : ''
                  }`}
                  onClick={() => handleSuggestionClick(course)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="suggestion-content">
                    <div className="suggestion-title">
                      {highlightMatch(course.title, query)}
                    </div>
                    <div className="suggestion-meta">
                      <span className="suggestion-instructor">
                        {course.instructor?.name}
                      </span>
                      <span className="suggestion-price">
                        ${course.price}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : query.trim() ? (
              <div className="suggestion-item no-results">
                <span>No courses found for "{query}"</span>
                <button 
                  type="button"
                  onClick={handleSubmit}
                  className="search-anyway-btn"
                >
                  Search anyway
                </button>
              </div>
            ) : null}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
