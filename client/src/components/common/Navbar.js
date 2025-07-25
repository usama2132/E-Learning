import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from './NotificationBell';

const Navbar = ({ onMenuToggle }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      closeAllMenus();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    onMenuToggle(!isMenuOpen);
  };

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
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

  // Theme-based styles
  const isDark = theme === 'dark';
  
  const styles = {
    navbar: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: isDark 
        ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.3)'}`,
      boxShadow: isDark 
        ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
        : '0 8px 32px rgba(15, 23, 42, 0.1)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    navbarContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '70px',
      position: 'relative',
    },
    navbarBrand: {
      display: 'flex',
      alignItems: 'center',
      zIndex: 1001,
    },
    navbarLogo: {
      display: 'flex',
      alignItems: 'center',
      textDecoration: 'none',
      color: 'inherit',
      transition: 'transform 0.3s ease',
    },
    logoImage: {
      height: '40px',
      width: '40px',
      marginRight: '12px',
      borderRadius: '8px',
      transition: 'transform 0.3s ease',
    },
    logoText: {
      fontSize: '1.5rem',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      letterSpacing: '-0.025em',
    },
    desktopNav: {
      display: 'flex',
      alignItems: 'center',
      gap: '2rem',
      '@media (max-width: 768px)': {
        display: 'none',
      },
    },
    navLink: {
      textDecoration: 'none',
      color: isDark ? '#e2e8f0' : '#475569',
      fontWeight: '500',
      fontSize: '0.95rem',
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      position: 'relative',
      transition: 'all 0.3s ease',
      overflow: 'hidden',
    },
    navLinkActive: {
      color: '#667eea',
      background: isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.1)',
    },
    navbarActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      zIndex: 1001,
    },
    themeToggle: {
      background: isDark 
        ? 'linear-gradient(135deg, #374151 0%, #4b5563 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      border: `1px solid ${isDark ? '#4b5563' : '#cbd5e1'}`,
      borderRadius: '50%',
      width: '42px',
      height: '42px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '1.1rem',
      transition: 'all 0.3s ease',
      boxShadow: isDark 
        ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
        : '0 4px 12px rgba(15, 23, 42, 0.1)',
    },
    createCourseBtn: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      textDecoration: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '12px',
      fontWeight: '600',
      fontSize: '0.9rem',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
      border: 'none',
      cursor: 'pointer',
    },
    userDropdown: {
      position: 'relative',
    },
    dropdownToggle: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      background: isDark 
        ? 'rgba(51, 65, 85, 0.8)' 
        : 'rgba(248, 250, 252, 0.8)',
      border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
      borderRadius: '12px',
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      color: isDark ? '#e2e8f0' : '#374151',
      fontWeight: '500',
    },
    userAvatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: '600',
      fontSize: '0.9rem',
      overflow: 'hidden',
    },
    avatarImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    dropdownArrow: {
      fontSize: '0.7rem',
      transition: 'transform 0.3s ease',
      color: isDark ? '#94a3b8' : '#64748b',
    },
    dropdownArrowOpen: {
      transform: 'rotate(180deg)',
    },
    dropdownMenu: {
      position: 'absolute',
      top: '110%',
      right: '0',
      background: isDark 
        ? 'rgba(30, 41, 59, 0.95)' 
        : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
      borderRadius: '16px',
      minWidth: '200px',
      boxShadow: isDark 
        ? '0 20px 40px rgba(0, 0, 0, 0.4)' 
        : '0 20px 40px rgba(15, 23, 42, 0.15)',
      opacity: 0,
      visibility: 'hidden',
      transform: 'translateY(-10px) scale(0.95)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 1002,
    },
    dropdownMenuShow: {
      opacity: 1,
      visibility: 'visible',
      transform: 'translateY(0) scale(1)',
    },
    dropdownItem: {
      display: 'block',
      width: '100%',
      padding: '0.75rem 1rem',
      textDecoration: 'none',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: '0.9rem',
      fontWeight: '500',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'left',
    },
    dropdownDivider: {
      height: '1px',
      background: isDark ? '#475569' : '#e2e8f0',
      margin: '0.5rem 0',
    },
    authButtons: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    loginBtn: {
      textDecoration: 'none',
      color: isDark ? '#e2e8f0' : '#475569',
      padding: '0.75rem 1.5rem',
      borderRadius: '12px',
      fontWeight: '600',
      fontSize: '0.9rem',
      transition: 'all 0.3s ease',
      border: `1px solid ${isDark ? '#475569' : '#cbd5e1'}`,
      background: 'transparent',
    },
    signupBtn: {
      textDecoration: 'none',
      color: 'white',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '0.75rem 1.5rem',
      borderRadius: '12px',
      fontWeight: '600',
      fontSize: '0.9rem',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    },
    mobileMenuToggle: {
      display: 'none',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '40px',
      height: '40px',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      '@media (max-width: 768px)': {
        display: 'flex',
      },
    },
    toggleBar: {
      width: '24px',
      height: '2px',
      background: isDark ? '#e2e8f0' : '#475569',
      margin: '3px 0',
      borderRadius: '2px',
      transition: 'all 0.3s ease',
    },
    mobileMenuOverlay: {
      position: 'fixed',
      top: '70px',
      left: 0,
      right: 0,
      bottom: 0,
      background: isDark 
        ? 'rgba(15, 23, 42, 0.98)' 
        : 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(20px)',
      transform: 'translateX(-100%)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 999,
    },
    mobileMenuOverlayActive: {
      transform: 'translateX(0)',
    },
    mobileMenuContent: {
      padding: '2rem',
      height: '100%',
      overflow: 'auto',
    },
    mobileNav: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    mobileNavLink: {
      display: 'block',
      textDecoration: 'none',
      color: isDark ? '#e2e8f0' : '#475569',
      padding: '1rem',
      borderRadius: '12px',
      fontWeight: '600',
      fontSize: '1.1rem',
      transition: 'all 0.3s ease',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      width: '100%',
    },
    mobileNavLinkActive: {
      background: isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.1)',
      color: '#667eea',
    },
    signupLink: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white !important',
    },
  };

  // Responsive styles helper
  const isSmallScreen = window.innerWidth <= 768;

  // Hover effects using onMouseEnter/onMouseLeave
  const handleNavLinkHover = (e, isHover) => {
    if (isHover) {
      e.target.style.background = isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.1)';
      e.target.style.transform = 'translateY(-2px)';
    } else {
      if (!isActive(e.target.getAttribute('to'))) {
        e.target.style.background = 'transparent';
      }
      e.target.style.transform = 'translateY(0)';
    }
  };

  const handleButtonHover = (e, isHover, hoverStyle) => {
    if (isHover) {
      Object.assign(e.target.style, hoverStyle);
    } else {
      // Reset to original styles
      e.target.style.transform = 'scale(1)';
      e.target.style.boxShadow = '';
    }
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.navbarContainer}>
        {/* Left side - Logo */}
        <div style={styles.navbarBrand}>
          <Link 
            to="/" 
            style={styles.navbarLogo} 
            onClick={closeAllMenus}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            <img 
              src="/logo.png" 
              alt="EduPlatform" 
              style={styles.logoImage}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }}
            />
            <span style={styles.logoText}>EduPlatform</span>
          </Link>
        </div>

        {/* Center - Navigation Links (Desktop) */}
        <div style={{...styles.desktopNav, display: isSmallScreen ? 'none' : 'flex'}}>
          <Link 
            to="/" 
            style={{
              ...styles.navLink,
              ...(isActive('/') ? styles.navLinkActive : {})
            }}
            onClick={closeAllMenus}
            onMouseEnter={(e) => handleNavLinkHover(e, true)}
            onMouseLeave={(e) => handleNavLinkHover(e, false)}
          >
            Home
          </Link>
          <Link 
            to="/courses" 
            style={{
              ...styles.navLink,
              ...(isActive('/courses') ? styles.navLinkActive : {})
            }}
            onClick={closeAllMenus}
            onMouseEnter={(e) => handleNavLinkHover(e, true)}
            onMouseLeave={(e) => handleNavLinkHover(e, false)}
          >
            Courses
          </Link>
          <Link 
            to="/about" 
            style={{
              ...styles.navLink,
              ...(isActive('/about') ? styles.navLinkActive : {})
            }}
            onClick={closeAllMenus}
            onMouseEnter={(e) => handleNavLinkHover(e, true)}
            onMouseLeave={(e) => handleNavLinkHover(e, false)}
          >
            About
          </Link>
          <Link 
            to="/contact" 
            style={{
              ...styles.navLink,
              ...(isActive('/contact') ? styles.navLinkActive : {})
            }}
            onClick={closeAllMenus}
            onMouseEnter={(e) => handleNavLinkHover(e, true)}
            onMouseLeave={(e) => handleNavLinkHover(e, false)}
          >
            Contact
          </Link>
        </div>

        {/* Right side - Actions */}
        <div style={styles.navbarActions}>
          {/* Theme Toggle */}
          <button 
            style={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1) rotate(10deg)';
              e.target.style.boxShadow = isDark 
                ? '0 8px 20px rgba(0, 0, 0, 0.4)' 
                : '0 8px 20px rgba(15, 23, 42, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1) rotate(0deg)';
            }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {user ? (
            <>
              <NotificationBell />

              {(user.role === 'instructor' || user.role === 'admin') && (
                <Link 
                  to="/instructor/create-course" 
                  style={styles.createCourseBtn}
                  onClick={closeAllMenus}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px) scale(1.05)';
                    e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                  }}
                >
                  Create Course
                </Link>
              )}

              <div style={styles.userDropdown} ref={dropdownRef}>
                <button
                  style={{
                    ...styles.dropdownToggle,
                    ...(isDropdownOpen ? {
                      background: isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.1)',
                      borderColor: '#667eea'
                    } : {})
                  }}
                  onClick={toggleDropdown}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                  onMouseEnter={(e) => {
                    if (!isDropdownOpen) {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDropdownOpen) {
                      e.target.style.borderColor = isDark ? '#475569' : '#e2e8f0';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <div style={styles.userAvatar}>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} style={styles.avatarImg} />
                    ) : (
                      <span>{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <span style={{fontSize: '0.9rem'}}>{user.name}</span>
                  <span style={{
                    ...styles.dropdownArrow,
                    ...(isDropdownOpen ? styles.dropdownArrowOpen : {})
                  }}>▼</span>
                </button>

                <div style={{
                  ...styles.dropdownMenu,
                  ...(isDropdownOpen ? styles.dropdownMenuShow : {})
                }}>
                  <Link 
                    to="/dashboard" 
                    style={styles.dropdownItem}
                    onClick={closeAllMenus}
                    onMouseEnter={(e) => {
                      e.target.style.background = isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)';
                      e.target.style.color = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = isDark ? '#e2e8f0' : '#374151';
                    }}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/profile" 
                    style={styles.dropdownItem}
                    onClick={closeAllMenus}
                    onMouseEnter={(e) => {
                      e.target.style.background = isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)';
                      e.target.style.color = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = isDark ? '#e2e8f0' : '#374151';
                    }}
                  >
                    Profile
                  </Link>
                  {user.role === 'student' && (
                    <Link 
                      to="/my-learning" 
                      style={styles.dropdownItem}
                      onClick={closeAllMenus}
                      onMouseEnter={(e) => {
                        e.target.style.background = isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)';
                        e.target.style.color = '#667eea';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = isDark ? '#e2e8f0' : '#374151';
                      }}
                    >
                      My Learning
                    </Link>
                  )}
                  {user.role === 'instructor' && (
                    <>
                      <Link 
                        to="/instructor/courses" 
                        style={styles.dropdownItem}
                        onClick={closeAllMenus}
                        onMouseEnter={(e) => {
                          e.target.style.background = isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)';
                          e.target.style.color = '#667eea';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = isDark ? '#e2e8f0' : '#374151';
                        }}
                      >
                        My Courses
                      </Link>
                      <Link 
                        to="/instructor/analytics" 
                        style={styles.dropdownItem}
                        onClick={closeAllMenus}
                        onMouseEnter={(e) => {
                          e.target.style.background = isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)';
                          e.target.style.color = '#667eea';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = isDark ? '#e2e8f0' : '#374151';
                        }}
                      >
                        Analytics
                      </Link>
                    </>
                  )}
                  {user.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      style={styles.dropdownItem}
                      onClick={closeAllMenus}
                      onMouseEnter={(e) => {
                        e.target.style.background = isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)';
                        e.target.style.color = '#667eea';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = isDark ? '#e2e8f0' : '#374151';
                      }}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <div style={styles.dropdownDivider}></div>
                  <button 
                    style={{...styles.dropdownItem, color: '#ef4444'}}
                    onClick={handleLogout}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                      e.target.style.color = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#ef4444';
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={styles.authButtons}>
              <Link 
                to="/login" 
                style={styles.loginBtn}
                onClick={closeAllMenus}
                onMouseEnter={(e) => {
                  e.target.style.background = isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)';
                  e.target.style.borderColor = '#667eea';
                  e.target.style.color = '#667eea';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = isDark ? '#475569' : '#cbd5e1';
                  e.target.style.color = isDark ? '#e2e8f0' : '#475569';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                style={styles.signupBtn}
                onClick={closeAllMenus}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.05)';
                  e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                }}
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            style={{
              ...styles.mobileMenuToggle,
              ...(isSmallScreen ? {display: 'flex'} : {display: 'none'})
            }}
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation"
            onMouseEnter={(e) => {
              e.target.style.background = isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            <span style={{
              ...styles.toggleBar,
              ...(isMenuOpen ? {transform: 'rotate(45deg) translate(5px, 5px)'} : {})
            }}></span>
            <span style={{
              ...styles.toggleBar,
              ...(isMenuOpen ? {opacity: 0} : {})
            }}></span>
            <span style={{
              ...styles.toggleBar,
              ...(isMenuOpen ? {transform: 'rotate(-45deg) translate(7px, -6px)'} : {})
            }}></span>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div 
          style={{
            ...styles.mobileMenuOverlay,
            ...(isMenuOpen ? styles.mobileMenuOverlayActive : {})
          }}
          ref={mobileMenuRef}
        >
          <div style={styles.mobileMenuContent}>
            <div style={styles.mobileNav}>
              <Link 
                to="/" 
                style={{
                  ...styles.mobileNavLink,
                  ...(isActive('/') ? styles.mobileNavLinkActive : {})
                }}
                onClick={closeAllMenus}
                onMouseEnter={(e) => {
                  if (!isActive('/')) {
                    e.target.style.background = isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)';
                    e.target.style.color = '#667eea';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/')) {
                    e.target.style.background = 'transparent';
                    e.target.style.color = isDark ? '#e2e8f0' : '#475569';
                  }
                }}
              >
                Home
              </Link>
              <Link 
                to="/courses" 
                style={{
                  ...styles.mobileNavLink,
                  ...(isActive('/courses') ? styles.mobileNavLinkActive : {})
                }}
                onClick={closeAllMenus}
                onMouseEnter={(e) => {
                  if (!isActive('/courses')) {
                    e.target.style.background = isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)';
                    e.target.style.color = '#667eea';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/courses')) {
                    e.target.style.background = 'transparent';
                    e.target.style.color = isDark ? '#e2e8f0' : '#475569';
                  }
                }}
              >
                Courses
              </Link>
              <Link 
                to="/about" 
                style={{
                  ...styles.mobileNavLink,
                  ...(isActive('/about') ? styles.mobileNavLinkActive : {})
                }}
                onClick={closeAllMenus}
                onMouseEnter={(e) => {
                  if (!isActive('/about')) {
                    e.target.style.background = isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)';
                    e.target.style.color = '#667eea';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/about')) {
                    e.target.style.background = 'transparent';
                    e.target.style.color = isDark ? '#e2e8f0' : '#475569';
                  }
                }}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                style={{
                  ...styles.mobileNavLink,
                  ...(isActive('/contact') ? styles.mobileNavLinkActive : {})
                }}
                onClick={closeAllMenus}
                onMouseEnter={(e) => {
                  if (!isActive('/contact')) {
                    e.target.style.background = isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)';
                    e.target.style.color = '#667eea';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/contact')) {
                    e.target.style.background = 'transparent';
                    e.target.style.color = isDark ? '#e2e8f0' : '#475569';
                  }
                }}
              >
                Contact
              </Link>
              
              {user ? (
                <>
                  <div style={{
                    height: '1px',
                    background: isDark ? '#475569' : '#e2e8f0',
                    margin: '1rem 0',
                  }}></div>
                  <Link 
                    to="/dashboard" 
                    style={styles.mobileNavLink}
                    onClick={closeAllMenus}
                    onMouseEnter={(e) => {
                      e.target.style.background = isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)';
                      e.target.style.color = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = isDark ? '#e2e8f0' : '#475569';
                    }}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/profile" 
                    style={styles.mobileNavLink}
                    onClick={closeAllMenus}
                    onMouseEnter={(e) => {
                      e.target.style.background = isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)';
                      e.target.style.color = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = isDark ? '#e2e8f0' : '#475569';
                    }}
                  >
                    Profile
                  </Link>
                  {user.role === 'student' && (
                    <Link 
                      to="/my-learning" 
                      style={styles.mobileNavLink}
                      onClick={closeAllMenus}
                      onMouseEnter={(e) => {
                        e.target.style.background = isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)';
                        e.target.style.color = '#667eea';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = isDark ? '#e2e8f0' : '#475569';
                      }}
                    >
                      My Learning
                    </Link>
                  )}
                  {user.role === 'instructor' && (
                    <>
                      <Link 
                        to="/instructor/courses" 
                        style={styles.mobileNavLink}
                        onClick={closeAllMenus}
                        onMouseEnter={(e) => {
                          e.target.style.background = isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)';
                          e.target.style.color = '#667eea';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = isDark ? '#e2e8f0' : '#475569';
                        }}
                      >
                        My Courses
                      </Link>
                      <Link 
                        to="/instructor/analytics" 
                        style={styles.mobileNavLink}
                        onClick={closeAllMenus}
                        onMouseEnter={(e) => {
                          e.target.style.background = isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)';
                          e.target.style.color = '#667eea';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = isDark ? '#e2e8f0' : '#475569';
                        }}
                      >
                        Analytics
                      </Link>
                      <Link 
                        to="/instructor/create-course" 
                        style={styles.mobileNavLink}
                        onClick={closeAllMenus}
                        onMouseEnter={(e) => {
                          e.target.style.background = isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)';
                          e.target.style.color = '#10b981';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = isDark ? '#e2e8f0' : '#475569';
                        }}
                      >
                        Create Course
                      </Link>
                    </>
                  )}
                  {user.role === 'admin' && (
                    <>
                      <Link 
                        to="/admin" 
                        style={styles.mobileNavLink}
                        onClick={closeAllMenus}
                        onMouseEnter={(e) => {
                          e.target.style.background = isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)';
                          e.target.style.color = '#667eea';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = isDark ? '#e2e8f0' : '#475569';
                        }}
                      >
                        Admin Panel
                      </Link>
                      <Link 
                        to="/instructor/create-course" 
                        style={styles.mobileNavLink}
                        onClick={closeAllMenus}
                        onMouseEnter={(e) => {
                          e.target.style.background = isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)';
                          e.target.style.color = '#10b981';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = isDark ? '#e2e8f0' : '#475569';
                        }}
                      >
                        Create Course
                      </Link>
                    </>
                  )}
                  <div style={{
                    height: '1px',
                    background: isDark ? '#475569' : '#e2e8f0',
                    margin: '1rem 0',
                  }}></div>
                  <button 
                    style={{
                      ...styles.mobileNavLink,
                      color: '#ef4444',
                      textAlign: 'left'
                    }}
                    onClick={handleLogout}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                      e.target.style.color = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#ef4444';
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div style={{
                    height: '1px',
                    background: isDark ? '#475569' : '#e2e8f0',
                    margin: '1rem 0',
                  }}></div>
                  <Link 
                    to="/login" 
                    style={styles.mobileNavLink}
                    onClick={closeAllMenus}
                    onMouseEnter={(e) => {
                      e.target.style.background = isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)';
                      e.target.style.color = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = isDark ? '#e2e8f0' : '#475569';
                    }}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    style={{
                      ...styles.mobileNavLink,
                      ...styles.signupLink
                    }}
                    onClick={closeAllMenus}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.02)';
                      e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
          