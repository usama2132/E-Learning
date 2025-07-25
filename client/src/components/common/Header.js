import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import SearchBar from './SearchBar';
import NotificationBell from './NotificationBell';
import ThemeToggle from '../common/ThemeToggle';
import '../../styles/components/Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const closeProfileMenu = () => {
    setIsProfileMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header__container">
        {/* Logo */}
        <div className="header__brand">
          <Link to="/" className="header__logo">
            <img 
              src="/logo.png" 
              alt="LearnHub" 
              className="header__logo-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }}
            />
            <span className="header__logo-text">LearnHub</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="header__nav">
          <ul className="header__nav-list">
            <li className="header__nav-item">
              <Link to="/courses" className="header__nav-link">
                Courses
              </Link>
            </li>
            <li className="header__nav-item">
              <Link to="/about" className="header__nav-link">
                About
              </Link>
            </li>
            <li className="header__nav-item">
              <Link to="/contact" className="header__nav-link">
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        {/* Search Bar */}
        <div className="header__search">
          <SearchBar />
        </div>

        {/* Right Section */}
        <div className="header__actions">
          {/* Theme Toggle - Using ThemeToggle component */}
          <ThemeToggle showLabel={false} />

          {user ? (
            <>
              {/* Notifications */}
              <NotificationBell />

              {/* Create Course Button (for instructors) */}
              {(user.role === 'instructor' || user.role === 'admin') && (
                <Link 
                  to="/instructor/create-course" 
                  className="header__create-course"
                >
                  Create Course
                </Link>
              )}

              {/* Profile Menu */}
              <div className="header__profile" onClick={toggleProfileMenu}>
                <div className="header__profile-avatar">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="header__avatar-image"
                    />
                  ) : (
                    <div className="header__avatar-placeholder">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                
                {isProfileMenuOpen && (
                  <>
                    <div className="header__profile-overlay" onClick={closeProfileMenu}></div>
                    <div className="header__profile-menu">
                      <div className="header__profile-info">
                        <span className="header__profile-name">{user.name}</span>
                        <span className="header__profile-email">{user.email}</span>
                      </div>
                      
                      <div className="header__profile-links">
                        <Link 
                          to="/dashboard" 
                          className="header__profile-link"
                          onClick={closeProfileMenu}
                        >
                          Dashboard
                        </Link>
                        <Link 
                          to="/profile" 
                          className="header__profile-link"
                          onClick={closeProfileMenu}
                        >
                          Profile
                        </Link>
                        
                        {user.role === 'student' && (
                          <Link 
                            to="/my-learning" 
                            className="header__profile-link"
                            onClick={closeProfileMenu}
                          >
                            My Learning
                          </Link>
                        )}
                        
                        {user.role === 'instructor' && (
                          <>
                            <Link 
                              to="/instructor/courses" 
                              className="header__profile-link"
                              onClick={closeProfileMenu}
                            >
                              My Courses
                            </Link>
                            <Link 
                              to="/instructor/analytics" 
                              className="header__profile-link"
                              onClick={closeProfileMenu}
                            >
                              Analytics
                            </Link>
                          </>
                        )}
                        
                        {user.role === 'admin' && (
                          <Link 
                            to="/admin" 
                            className="header__profile-link"
                            onClick={closeProfileMenu}
                          >
                            Admin Panel
                          </Link>
                        )}
                        
                        <div className="header__profile-divider"></div>
                        
                        <button 
                          onClick={handleLogout} 
                          className="header__profile-link header__profile-logout"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            /* Not logged in */
            <div className="header__auth">
              <Link to="/login" className="header__auth-link">
                Login
              </Link>
              <Link to="/register" className="header__auth-button">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;