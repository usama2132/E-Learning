import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from './NotificationBell';
import ThemeToggle from '../common/ThemeToggle';
import '../../styles/components/Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const profileMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Don't render header on dashboard pages
  const isDashboardPage = location.pathname.includes('/dashboard') || 
                         location.pathname.includes('/admin/') ||
                         location.pathname.includes('/instructor/') ||
                         location.pathname.includes('/student/') ||
                         location.pathname === '/profile' ||
                         location.pathname === '/help';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      closeAllMenus();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeAllMenus = () => {
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close menus when route changes
  useEffect(() => {
    closeAllMenus();
  }, [location.pathname]);

  // Don't render header on dashboard pages
  if (isDashboardPage) {
    return null;
  }

  return (
    <header className="header">
      <div className="header__container">
        {/* Logo */}
        <div className="header__brand">
          <Link to="/" className="header__logo" onClick={closeAllMenus}>
            <div className="header__logo-icon">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="8" fill="#6366f1"/>
                <path d="M12 28V12h4v12h8v4H12z" fill="white"/>
                <path d="M20 20h8v-4h-8v4z" fill="white" opacity="0.8"/>
              </svg>
            </div>
            <span className="header__logo-text">EduPlatform</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="header__nav">
          <Link 
            to="/" 
            className={`header__nav-link ${isActive('/') ? 'header__nav-link--active' : ''}`}
            onClick={closeAllMenus}
          >
            Home
          </Link>
          <Link 
            to="/courses" 
            className={`header__nav-link ${isActive('/courses') ? 'header__nav-link--active' : ''}`}
            onClick={closeAllMenus}
          >
            Courses
          </Link>
          <Link 
            to="/about" 
            className={`header__nav-link ${isActive('/about') ? 'header__nav-link--active' : ''}`}
            onClick={closeAllMenus}
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className={`header__nav-link ${isActive('/contact') ? 'header__nav-link--active' : ''}`}
            onClick={closeAllMenus}
          >
            Contact
          </Link>
        </nav>

        {/* Desktop Right Section */}
        <div className="header__actions">
          {user ? (
            <>
              <div className="header__user-actions">
                <ThemeToggle showLabel={false} />
                <NotificationBell />

                {(user.role === 'instructor' || user.role === 'admin') && (
                  <Link 
                    to="/instructor/create-course" 
                    className="header__create-course-btn"
                    onClick={closeAllMenus}
                  >
                    Create Course
                  </Link>
                )}
              </div>

              {/* User Profile Dropdown */}
              <div className="header__profile-dropdown" ref={profileMenuRef}>
                <button
                  className={`header__profile-toggle ${isProfileMenuOpen ? 'header__profile-toggle--open' : ''}`}
                  onClick={toggleProfileMenu}
                  aria-expanded={isProfileMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="header__user-avatar">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="header__avatar-image"
                      />
                    ) : (
                      <div className="header__avatar-placeholder">
                        {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="header__user-info">
                    <span className="header__user-role">{user.role}</span>
                  </div>
                  <svg 
                    className={`header__dropdown-arrow ${isProfileMenuOpen ? 'header__dropdown-arrow--open' : ''}`}
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none"
                  >
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                <div className={`header__profile-menu ${isProfileMenuOpen ? 'header__profile-menu--show' : ''}`}>
                  <div className="header__profile-header">
                    <div className="header__profile-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} />
                      ) : (
                        <div className="header__avatar-placeholder">
                          {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="header__profile-info">
                      <span className="header__profile-name">{user.name || 'User'}</span>
                      <span className="header__profile-email">{user.email}</span>
                      <span className="header__profile-role-badge">{user.role}</span>
                    </div>
                  </div>
                  
                  <div className="header__profile-divider"></div>
                  
                  <div className="header__profile-links">
                    <Link 
                      to="/dashboard" 
                      className="header__profile-link"
                      onClick={closeAllMenus}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                      <span>Dashboard</span>
                    </Link>
                    
                    <Link 
                      to="/profile" 
                      className="header__profile-link"
                      onClick={closeAllMenus}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                      <span>Profile Settings</span>
                    </Link>
                    
                    {user.role === 'student' && (
                      <Link 
                        to="/my-learning" 
                        className="header__profile-link"
                        onClick={closeAllMenus}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                        <span>My Learning</span>
                      </Link>
                    )}
                    
                    {user.role === 'instructor' && (
                      <>
                        <Link 
                          to="/instructor/courses" 
                          className="header__profile-link"
                          onClick={closeAllMenus}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M6 12v5c3 3 9 3 12 0v-5" stroke="currentColor" strokeWidth="1.5"/>
                          </svg>
                          <span>My Courses</span>
                        </Link>
                        <Link 
                          to="/instructor/analytics" 
                          className="header__profile-link"
                          onClick={closeAllMenus}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" stroke="currentColor" strokeWidth="1.5"/>
                          </svg>
                          <span>Analytics</span>
                        </Link>
                      </>
                    )}
                    
                    {user.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        className="header__profile-link"
                        onClick={closeAllMenus}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                        <span>Admin Panel</span>
                      </Link>
                    )}
                  </div>
                  
                  <div className="header__profile-divider"></div>
                  
                  <button 
                    onClick={handleLogout} 
                    className="header__profile-link header__profile-logout"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.5"/>
                      <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="1.5"/>
                      <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="header__auth">
              <Link to="/login" className="header__auth-link" onClick={closeAllMenus}>
                Sign In
              </Link>
              <Link to="/register" className="header__auth-button" onClick={closeAllMenus}>
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button 
            className={`header__mobile-toggle ${isMobileMenuOpen ? 'header__mobile-toggle--open' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span className="header__hamburger-line"></span>
            <span className="header__hamburger-line"></span>
            <span className="header__hamburger-line"></span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`header__mobile-menu ${isMobileMenuOpen ? 'header__mobile-menu--open' : ''}`}
          ref={mobileMenuRef}
        >
          <div className="header__mobile-content">
            {/* Mobile Navigation Links */}
            <nav className="header__mobile-nav">
              <Link 
                to="/" 
                className={`header__mobile-nav-link ${isActive('/') ? 'header__mobile-nav-link--active' : ''}`}
                onClick={closeAllMenus}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="1.5"/>
                  <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span>Home</span>
              </Link>
              <Link 
                to="/courses" 
                className={`header__mobile-nav-link ${isActive('/courses') ? 'header__mobile-nav-link--active' : ''}`}
                onClick={closeAllMenus}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span>Courses</span>
              </Link>
              <Link 
                to="/about" 
                className={`header__mobile-nav-link ${isActive('/about') ? 'header__mobile-nav-link--active' : ''}`}
                onClick={closeAllMenus}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="1.5"/>
                  <point x="12" y="17" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span>About</span>
              </Link>
              <Link 
                to="/contact" 
                className={`header__mobile-nav-link ${isActive('/contact') ? 'header__mobile-nav-link--active' : ''}`}
                onClick={closeAllMenus}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span>Contact</span>
              </Link>
            </nav>

            {/* Mobile User Section */}
            {user ? (
              <div className="header__mobile-user">
                <div className="header__mobile-user-info">
                  <div className="header__mobile-avatar">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="header__avatar-image"
                      />
                    ) : (
                      <div className="header__avatar-placeholder">
                        {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="header__mobile-user-details">
                    <span className="header__mobile-user-name">{user.name || user.email}</span>
                    <span className="header__mobile-user-email">{user.email}</span>
                    <span className="header__mobile-user-role">{user.role}</span>
                  </div>
                </div>

                <div className="header__mobile-divider"></div>

                <div className="header__mobile-links">
                  <Link 
                    to="/dashboard" 
                    className="header__mobile-link"
                    onClick={closeAllMenus}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link 
                    to="/profile" 
                    className="header__mobile-link"
                    onClick={closeAllMenus}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <span>Profile</span>
                  </Link>
                  
                  {user.role === 'student' && (
                    <Link 
                      to="/my-learning" 
                      className="header__mobile-link"
                      onClick={closeAllMenus}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                      <span>My Learning</span>
                    </Link>
                  )}
                  
                  {(user.role === 'instructor' || user.role === 'admin') && (
                    <Link 
                      to="/instructor/create-course" 
                      className="header__mobile-link header__mobile-link--primary"
                      onClick={closeAllMenus}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span>Create Course</span>
                    </Link>
                  )}
                  
                  {user.role === 'instructor' && (
                    <>
                      <Link 
                        to="/instructor/courses" 
                        className="header__mobile-link"
                        onClick={closeAllMenus}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M6 12v5c3 3 9 3 12 0v-5" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                        <span>My Courses</span>
                      </Link>
                      <Link 
                        to="/instructor/analytics" 
                        className="header__mobile-link"
                        onClick={closeAllMenus}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                        <span>Analytics</span>
                      </Link>
                    </>
                  )}
                  
                  {user.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="header__mobile-link"
                      onClick={closeAllMenus}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                      <span>Admin Panel</span>
                    </Link>
                  )}
                </div>

                <div className="header__mobile-divider"></div>

                <div className="header__mobile-actions">
                  <ThemeToggle showLabel={true} />
                  <NotificationBell />
                </div>

                <button 
                  onClick={handleLogout} 
                  className="header__mobile-logout"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.5"/>
                    <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="1.5"/>
                    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <>
                <div className="header__mobile-divider"></div>
                <div className="header__mobile-auth">
                  <Link 
                    to="/login" 
                    className="header__mobile-auth-link"
                    onClick={closeAllMenus}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="header__mobile-auth-button"
                    onClick={closeAllMenus}
                  >
                    Get Started
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="header__mobile-overlay" onClick={closeAllMenus}></div>
        )}
      </div>
    </header>
  );
};

export default Header;