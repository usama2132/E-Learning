import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/pages/NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleSearch = (searchTerm) => {
    if (searchTerm.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e.target.value);
    }
  };

  const handleSearchClick = (e) => {
    const input = e.target.parentElement.querySelector('input');
    handleSearch(input.value);
  };

  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="error-illustration">
          <div className="error-code">404</div>
          <div className="error-animation">
            <div className="floating-elements">
              <div className="float-element float-1"></div>
              <div className="float-element float-2"></div>
              <div className="float-element float-3"></div>
            </div>
            <svg width="240" height="240" viewBox="0 0 240 240" className="main-illustration">
              <defs>
                <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--gradient-start)" />
                  <stop offset="100%" stopColor="var(--gradient-end)" />
                </linearGradient>
              </defs>
              <circle cx="120" cy="120" r="90" fill="none" stroke="url(#circleGradient)" strokeWidth="3" strokeDasharray="12,8" className="rotating-circle"/>
              <circle cx="95" cy="105" r="12" fill="var(--text-secondary)" className="eye left-eye"/>
              <circle cx="145" cy="105" r="12" fill="var(--text-secondary)" className="eye right-eye"/>
              <path d="M85 150 Q120 180 155 150" stroke="var(--text-secondary)" strokeWidth="4" fill="none" strokeLinecap="round" className="mouth"/>
              <path d="M120 50 L120 25 M120 25 L110 35 M120 25 L130 35" stroke="var(--error-accent)" strokeWidth="3" strokeLinecap="round" className="exclamation"/>
              <circle cx="120" cy="35" r="4" fill="var(--error-accent)" className="exclamation-dot"/>
            </svg>
          </div>
        </div>

        <div className="error-content">
          <h1 className="error-title">Page Not Found</h1>
          <p className="error-description">
            The page you're looking for seems to have wandered off into the digital void. 
            Don't worry though - let's get you back on track!
          </p>
        </div>

        <div className="action-buttons">
          <button className="btn btn-primary" onClick={handleGoBack}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Go Back
          </button>
          
          <button className="btn btn-secondary" onClick={handleGoHome}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            Go Home
          </button>
        </div>

        <div className="helpful-section">
          <div className="quick-links card">
            <h3>Popular Pages</h3>
            <div className="links-grid">
              <Link to="/courses" className="quick-link">
                <div className="link-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                </div>
                <div className="link-content">
                  <span className="link-title">All Courses</span>
                  <span className="link-desc">Browse our course catalog</span>
                </div>
              </Link>

              <Link to="/dashboard" className="quick-link">
                <div className="link-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                  </svg>
                </div>
                <div className="link-content">
                  <span className="link-title">Dashboard</span>
                  <span className="link-desc">Your learning hub</span>
                </div>
              </Link>

              <Link to="/profile" className="quick-link">
                <div className="link-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div className="link-content">
                  <span className="link-title">Profile</span>
                  <span className="link-desc">Manage your account</span>
                </div>
              </Link>
            </div>
          </div>

          <div className="search-section card">
            <h3>Search for Content</h3>
            <p>Can't find what you're looking for? Try searching:</p>
            <div className="search-wrapper">
              <div className="search-container">
                <input 
                  type="text" 
                  placeholder="Search courses, topics, instructors..." 
                  onKeyPress={handleKeyPress}
                  className="search-input"
                />
                <button 
                  onClick={handleSearchClick}
                  className="search-button"
                  aria-label="Search"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="error-details">
          <details className="tech-details">
            <summary>Technical Information</summary>
            <div className="tech-info">
              <div className="info-row">
                <span className="info-label">Error Code:</span>
                <span className="info-value">404 - Page Not Found</span>
              </div>
              <div className="info-row">
                <span className="info-label">Requested URL:</span>
                <span className="info-value">{window.location.pathname}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Timestamp:</span>
                <span className="info-value">{new Date().toLocaleString()}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Browser:</span>
                <span className="info-value">{navigator.userAgent.split(' ')[0]}...</span>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default NotFound;