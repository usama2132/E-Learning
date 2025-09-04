import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = ({ isOpen, onClose, isMobile, isTablet, isDesktop, theme }) => {
  const { user, logout } = useAuth();
  const { toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  
  // CRITICAL: Enhanced refs for better state management
  const mountedRef = useRef(true);
  const clickTimeoutRef = useRef(null);
  const overlayRef = useRef(null);
  const sidebarRef = useRef(null);

  // CRITICAL: Completely stable open state
  const stableIsOpen = useMemo(() => Boolean(isOpen), [isOpen]);

  // Enhanced outside click handler with better event handling
  useEffect(() => {
    if (!stableIsOpen || isDesktop) return;

    const handleClickOutside = (event) => {
      // More specific outside click detection
      if (!event.target) return;
      
      // Don't close if clicking on sidebar, navbar toggle, or related elements
      if (
        event.target.closest('.sidebar-container') ||
        event.target.closest('.navbar-toggle') ||
        event.target.closest('[data-sidebar-toggle]') ||
        event.target.closest('button[aria-label*="toggle"]') ||
        event.target.closest('button[aria-label*="menu"]')
      ) {
        return;
      }
      
      // Clear existing timeout
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
      
      // Delayed close to prevent conflicts
      clickTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current && onClose) {
          console.log('Outside click detected - closing sidebar');
          onClose();
        }
      }, 100);
    };

    // Delayed event listener attachment
    const attachListeners = () => {
      if (mountedRef.current) {
        document.addEventListener('mousedown', handleClickOutside, { passive: true });
        document.addEventListener('touchstart', handleClickOutside, { passive: true });
      }
    };

    const timeoutId = setTimeout(attachListeners, 200);

    return () => {
      clearTimeout(timeoutId);
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [stableIsOpen, isMobile, isTablet, isDesktop, onClose]);

  // FIXED: Enhanced body scroll prevention
  useEffect(() => {
    if (!isDesktop && stableIsOpen) {
      // Store original styles
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalWidth = document.body.style.width;
      const originalTop = document.body.style.top;
      
      // Apply scroll lock
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = '0';
      
      return () => {
        // Restore original styles
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.width = originalWidth;
        document.body.style.top = originalTop;
      };
    }
  }, [stableIsOpen, isDesktop]);

  // Close submenu when route changes
  useEffect(() => {
    setActiveSubmenu(null);
  }, [location.pathname]);

  // Debug activeSubmenu changes
  useEffect(() => {
    console.log('activeSubmenu changed to:', activeSubmenu);
  }, [activeSubmenu]);

  // Component cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  // LIGHTNING FAST CSS: Inject optimized hover styles directly into DOM
  useEffect(() => {
    const styleId = 'sidebar-lightning-styles';
    let styleElement = document.getElementById(styleId);
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    const isDark = theme === 'dark';
    
    styleElement.textContent = `
      /* LIGHTNING FAST HOVER EFFECTS */
      .sidebar-nav-item {
        transition: none !important;
        will-change: background-color;
      }
      
      .sidebar-nav-item:hover:not(.nav-item-active) {
        background-color: ${isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.3)'} !important;
      }
      
      .sidebar-nav-subitem:hover:not(.nav-subitem-active) {
        background-color: ${isDark ? 'rgba(71, 85, 105, 0.2)' : 'rgba(226, 232, 240, 0.2)'} !important;
      }
      
      .sidebar-footer-btn:hover {
        background-color: ${isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.3)'} !important;
      }
      
      .sidebar-footer-btn.logout-btn:hover {
        background-color: ${isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'} !important;
        color: #ef4444 !important;
      }
      
      .sidebar-close-btn:hover {
        background-color: ${isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.3)'} !important;
      }
      
      /* Disable transitions on mobile for maximum performance */
      @media (max-width: 768px) {
        .sidebar-nav-item:hover,
        .sidebar-nav-subitem:hover,
        .sidebar-footer-btn:hover,
        .sidebar-close-btn:hover {
          background-color: transparent !important;
        }
      }
    `;

    return () => {
      // Cleanup on unmount
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, [theme]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleSubmenu = (menuKey) => {
    console.log('toggleSubmenu called:', { menuKey, currentActive: activeSubmenu });
    // Close the current submenu if clicking the same item, otherwise open the new one
    const newActiveSubmenu = activeSubmenu === menuKey ? null : menuKey;
    console.log('Setting activeSubmenu to:', newActiveSubmenu);
    setActiveSubmenu(newActiveSubmenu);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  const handleCloseClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onClose) {
      onClose();
    }
  };

  const getNavigationItems = () => {
    const baseItems = [
      {
        key: 'dashboard',
        icon: '🏠',
        label: 'Dashboard',
        path: `/${user?.role}/dashboard` || '/dashboard'
      }
    ];

    const roleSpecificItems = {
      admin: [
        {
          key: 'users',
          icon: '👥',
          label: 'User Management',
          path: '/admin/users'
        },
        {
          key: 'courses',
          icon: '📚',
          label: 'Course Management',
          hasSubmenu: true,
          submenu: [
            { label: 'All Courses', path: '/admin/courses' },
            { label: 'Pending Approval', path: '/admin/courses/pending' },
            { label: 'Course Approval', path: '/admin/courses/approval' }
          ]
        },
        {
          key: 'categories',
          icon: '🏷️',
          label: 'Categories',
          path: '/admin/categories'
        },
        {
          key: 'transactions',
          icon: '💳',
          label: 'Transactions',
          path: '/admin/transactions'
        },
        {
          key: 'reports',
          icon: '📊',
          label: 'Reports',
          hasSubmenu: true,
          submenu: [
            { label: 'User Reports', path: '/admin/reports/users' },
            { label: 'Course Reports', path: '/admin/reports/courses' },
            { label: 'Revenue Reports', path: '/admin/reports/revenue' }
          ]
        },
        {
          key: 'settings',
          icon: '⚙️',
          label: 'Settings',
          hasSubmenu: true,
          submenu: [
            { label: 'General Settings', path: '/admin/settings/general' },
            { label: 'Payment Settings', path: '/admin/settings/payments' },
            { label: 'Email Settings', path: '/admin/settings/email' }
          ]
        }
      ],
      instructor: [
        {
          key: 'courses',
          icon: '📚',
          label: 'My Courses',
          hasSubmenu: true,
          submenu: [
            { label: 'All Courses', path: '/instructor/courses' },
            { label: 'Create Course', path: '/instructor/courses/create' },
            { label: 'Draft Courses', path: '/instructor/courses/drafts' }
          ]
        },
        {
          key: 'analytics',
          icon: '📈',
          label: 'Analytics',
          hasSubmenu: true,
          submenu: [
            { label: 'Course Performance', path: '/instructor/analytics/courses' },
            { label: 'Student Engagement', path: '/instructor/analytics/engagement' },
            { label: 'Revenue Analytics', path: '/instructor/analytics/revenue' }
          ]
        },
        {
          key: 'students',
          icon: '🎓',
          label: 'Students',
          path: '/instructor/students'
        },
        {
          key: 'earnings',
          icon: '💰',
          label: 'Earnings',
          path: '/instructor/earnings'
        }
      ],
      student: [
        {
          key: 'learning',
          icon: '📖',
          label: 'My Learning',
          hasSubmenu: true,
          submenu: [
            { label: 'All Courses', path: '/student/learning' },
            { label: 'Completed', path: '/student/learning/completed' },
            { label: 'Saved Courses', path: '/student/learning/saved' }
          ]
        },
        {
          key: 'progress',
          icon: '📊',
          label: 'Progress',
          path: '/student/progress'
        },
        {
          key: 'wishlist',
          icon: '❤️',
          label: 'Wishlist',
          path: '/student/wishlist'
        }
      ]
    };

    const footerItems = [
      {
        key: 'profile',
        icon: '👤',
        label: 'Profile',
        path: '/profile'
      },
      {
        key: 'help',
        icon: '❓',
        label: 'Help & Support',
        path: '/help'
      }
    ];

    return [
      ...baseItems,
      ...(roleSpecificItems[user?.role] || []),
      ...footerItems
    ];
  };

  const navigationItems = useMemo(() => getNavigationItems(), [user?.role]);
  const isDark = theme === 'dark';
  const isCollapsed = isDesktop ? !stableIsOpen : false;

  // FIXED: Completely rewritten container styles for mobile visibility
  const getSidebarContainerStyles = useMemo(() => {
    const baseStyles = {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderRight: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      overflow: 'hidden',
    };

    if (isDesktop) {
      return {
        ...baseStyles,
        position: 'relative',
        width: stableIsOpen ? '280px' : '70px',
        transform: 'none',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 'auto',
      };
    }

    // FIXED: Mobile - Ensure proper visibility and positioning
    return {
      ...baseStyles,
      position: 'fixed',
      top: 0,
      left: 0,
      width: '280px',
      height: '100vh',
      // CRITICAL: Remove all transitions and use display block/none
      display: stableIsOpen ? 'flex' : 'none',
       transform: stableIsOpen ? 'translateX(0)' : 'translateX(-100%)',
  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)',
      zIndex: 9999,
      // Ensure it's always interactive when open
      pointerEvents: 'auto',
    };
  }, [isDark, isDesktop, stableIsOpen]);

  const styles = useMemo(() => ({
    // FIXED: Mobile overlay - only show when sidebar is open
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 9998,
      display: (!isDesktop && stableIsOpen) ? 'block' : 'none',
      pointerEvents: 'auto',
    },
    
    sidebarContainer: getSidebarContainerStyles,

    sidebar: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      background: 'transparent',
      overflow: 'hidden',
    },

    sidebarHeader: {
      padding: isMobile ? '1rem' : '1.25rem',
      borderBottom: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.3)'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: '60px',
      flexShrink: 0,
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
    },

    sidebarBrand: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      flex: 1,
    },

    brandLogo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      textDecoration: 'none',
      color: 'inherit',
    },

    logoIcon: {
      fontSize: isMobile ? '1.25rem' : '1.5rem',
      flexShrink: 0,
    },

    logoText: {
      fontSize: isMobile ? '1.125rem' : '1.25rem',
      fontWeight: '700',
      color: isDark ? '#f8fafc' : '#1e293b',
      display: isCollapsed ? 'none' : 'block',
      whiteSpace: 'nowrap',
    },

    sidebarClose: {
      background: 'none',
      border: 'none',
      color: isDark ? '#cbd5e1' : '#64748b',
      fontSize: '1.25rem',
      cursor: 'pointer',
      padding: '0.5rem',
      borderRadius: '0.375rem',
      display: !isDesktop ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'center',
      // REMOVED: transition for lightning speed
      minWidth: '40px',
      minHeight: '40px',
    },

    sidebarUserInfo: {
      padding: isMobile ? '1rem' : '1.25rem',
      borderBottom: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.3)'}`,
      display: isCollapsed ? 'none' : 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      flexShrink: 0,
      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
    },

    userAvatar: {
      width: isMobile ? '2rem' : '2.5rem',
      height: isMobile ? '2rem' : '2.5rem',
      borderRadius: '50%',
      background: isDark ? '#475569' : '#e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isMobile ? '1rem' : '1.125rem',
      fontWeight: '600',
      color: isDark ? '#f8fafc' : '#1e293b',
      flexShrink: 0,
      overflow: 'hidden',
    },

    userAvatarImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      borderRadius: '50%',
    },

    userDetails: {
      flex: 1,
      minWidth: 0,
    },

    userName: {
      fontSize: isMobile ? '0.8125rem' : '0.875rem',
      fontWeight: '600',
      color: isDark ? '#f8fafc' : '#1e293b',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      lineHeight: '1.2',
    },

    userRole: {
      fontSize: isMobile ? '0.6875rem' : '0.75rem',
      color: isDark ? '#94a3b8' : '#64748b',
      textTransform: 'capitalize',
      lineHeight: '1.2',
      marginTop: '2px',
    },

    sidebarNavigation: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '0.5rem 0',
      scrollbarWidth: 'thin',
      scrollbarColor: isDark ? '#475569 transparent' : '#cbd5e1 transparent',
    },

    navSection: {
      padding: '0 0.75rem',
      marginBottom: '1rem',
    },

    navFooter: {
      marginTop: 'auto',
      marginBottom: '0',
      borderTop: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.3)'}`,
      paddingTop: '0.75rem',
    },

    navItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: isCollapsed ? '0.75rem' : (isMobile ? '0.75rem' : '0.75rem 1rem'),
      borderRadius: '0.5rem',
      textDecoration: 'none',
      color: isDark ? '#cbd5e1' : '#475569',
      fontSize: isMobile ? '0.8125rem' : '0.875rem',
      fontWeight: '500',
      // REMOVED: transition for lightning speed
      marginBottom: '0.25rem',
      cursor: 'pointer',
      border: 'none',
      background: 'none',
      width: '100%',
      textAlign: 'left',
      justifyContent: isCollapsed ? 'center' : 'flex-start',
      minHeight: isMobile ? '44px' : '40px',
    },

    navItemActive: {
      background: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
      color: isDark ? '#a5b4fc' : '#6366f1',
      fontWeight: '600',
    },

    navIcon: {
      fontSize: isMobile ? '1rem' : '1.125rem',
      flexShrink: 0,
      width: isMobile ? '1rem' : '1.125rem',
      textAlign: 'center',
    },

    navLabel: {
      display: isCollapsed ? 'none' : 'block',
      flex: 1,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },

    submenuArrow: {
      fontSize: '0.75rem',
      // REMOVED: transition for lightning speed
      display: isCollapsed ? 'none' : 'block',
      flexShrink: 0,
      transform: 'rotate(0deg)',
    },

    submenuArrowOpen: {
      transform: 'rotate(180deg)',
    },

    navSubmenu: {
      maxHeight: '0',
      overflow: 'hidden',
      transition: 'max-height 0.3s ease',
      marginLeft: isMobile ? '1.5rem' : '2rem',
      display: isCollapsed ? 'none' : 'block',
    },

    navSubmenuOpen: {
      maxHeight: '300px',
    },

    navSubitem: {
      display: 'flex',
      alignItems: 'center',
      padding: isMobile ? '0.5rem 0.75rem' : '0.5rem 1rem',
      borderRadius: '0.375rem',
      textDecoration: 'none',
      color: isDark ? '#94a3b8' : '#64748b',
      fontSize: isMobile ? '0.75rem' : '0.8125rem',
      // REMOVED: transition for lightning speed
      marginBottom: '0.125rem',
      minHeight: isMobile ? '40px' : '36px',
    },

    navSubitemActive: {
      background: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)',
      color: isDark ? '#a5b4fc' : '#6366f1',
      fontWeight: '500',
    },

    sidebarFooter: {
      padding: '1rem 0.75rem',
      borderTop: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.3)'}`,
      flexShrink: 0,
      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
    },

    footerActions: {
      display: isCollapsed ? 'none' : 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },

    footerActionsCollapsed: {
      display: isCollapsed ? 'flex' : 'none',
      flexDirection: 'column',
      gap: '0.5rem',
      alignItems: 'center',
    },

    footerButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: isCollapsed ? '0.75rem' : (isMobile ? '0.75rem' : '0.75rem 1rem'),
      background: 'none',
      border: 'none',
      borderRadius: '0.5rem',
      color: isDark ? '#cbd5e1' : '#475569',
      fontSize: isMobile ? '0.8125rem' : '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      // REMOVED: transition for lightning speed
      width: '100%',
      textAlign: 'left',
      justifyContent: isCollapsed ? 'center' : 'flex-start',
      minHeight: isMobile ? '44px' : '40px',
    },

    iconBtn: {
      width: '2.5rem',
      height: '2.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '0.5rem',
      fontSize: '1.125rem',
    },
  }), [isDark, isMobile, isTablet, isCollapsed, getSidebarContainerStyles]);

  const renderNavigationItem = (item) => {
    const isActive = isActiveRoute(item.path);
    const hasActiveSubmenu = item.submenu && item.submenu.some(subItem => isActiveRoute(subItem.path));
    const isSubmenuOpen = activeSubmenu === item.key;
    
    // Show active state only if: route is active OR submenu has active child
    const shouldShowActive = isActive || hasActiveSubmenu;

    if (item.hasSubmenu) {
      return (
        <div key={item.key}>
          <button
            className={`sidebar-nav-item ${shouldShowActive ? 'nav-item-active' : ''}`}
            style={{
              ...styles.navItem,
              ...(shouldShowActive ? styles.navItemActive : {}),
            }}
            onClick={() => {
              console.log('Toggling submenu:', item.key, 'Current active:', activeSubmenu);
              toggleSubmenu(item.key);
            }}
            aria-expanded={isSubmenuOpen}
            title={isCollapsed ? item.label : ''}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span style={styles.navLabel}>{item.label}</span>
            <span style={{
              ...styles.submenuArrow,
              ...(isSubmenuOpen ? styles.submenuArrowOpen : {})
            }}>
              ▼
            </span>
          </button>
          
          <div style={{
            ...styles.navSubmenu,
            ...(isSubmenuOpen ? styles.navSubmenuOpen : {})
          }}>
            {item.submenu.map((subItem, index) => (
              <Link
                key={index}
                to={subItem.path}
                className={`sidebar-nav-subitem ${isActiveRoute(subItem.path) ? 'nav-subitem-active' : ''}`}
                style={{
                  ...styles.navSubitem,
                  ...(isActiveRoute(subItem.path) ? styles.navSubitemActive : {})
                }}
                onClick={() => {
                  // Close submenu when clicking on a sub-item
                  setActiveSubmenu(null);
                  onClose();
                }}
              >
                {subItem.label}
              </Link>
            ))}
          </div>
        </div>
      );
    }

    return (
      <Link
        key={item.key}
        to={item.path}
        className={`sidebar-nav-item ${isActive ? 'nav-item-active' : ''}`}
        style={{
          ...styles.navItem,
          ...(isActive ? styles.navItemActive : {})
        }}
        onClick={onClose}
        title={isCollapsed ? item.label : ''}
      >
        <span style={styles.navIcon}>{item.icon}</span>
        <span style={styles.navLabel}>{item.label}</span>
      </Link>
    );
  };

  // FIXED: Always render, but control visibility through CSS
  console.log('Sidebar render:', { stableIsOpen, isDesktop, isMobile });

  return (
    <>
      {/* FIXED: Mobile overlay - Only show when needed and sidebar is open */}
      {!isDesktop && stableIsOpen && (
        <div 
          ref={overlayRef}
          style={styles.overlay} 
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}
      
      {/* FIXED: Sidebar Container - Always render, control via display */}
      <div 
        ref={sidebarRef}
        style={styles.sidebarContainer} 
        className="sidebar-container"
      >
        <div style={styles.sidebar}>
          {/* Sidebar Header */}
          <div style={styles.sidebarHeader}>
            <div style={styles.sidebarBrand}>
              <div style={styles.brandLogo}>
                <span style={styles.logoIcon}>🎓</span>
                <span style={styles.logoText}>EduPlatform</span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              className="sidebar-close-btn"
              style={styles.sidebarClose}
              onClick={handleCloseClick}
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          {/* User Info */}
          <div style={styles.sidebarUserInfo}>
            <div style={styles.userAvatar}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} style={styles.userAvatarImg} />
              ) : (
                <span>{user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}</span>
              )}
            </div>
            <div style={styles.userDetails}>
              <div style={styles.userName}>{user?.name || user?.email}</div>
              <div style={styles.userRole}>{user?.role}</div>
            </div>
          </div>

          {/* Navigation */}
          <nav style={styles.sidebarNavigation}>
            <div style={styles.navSection}>
              {navigationItems.slice(0, -2).map(renderNavigationItem)}
            </div>
            
            <div style={{...styles.navSection, ...styles.navFooter}}>
              {navigationItems.slice(-2).map(renderNavigationItem)}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div style={styles.sidebarFooter}>
            <div style={styles.footerActions}>
              <button
                className="sidebar-footer-btn"
                style={styles.footerButton}
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              >
                <span style={styles.navIcon}>
                  {theme === 'light' ? '🌙' : '☀️'}
                </span>
                <span style={styles.navLabel}>
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </span>
              </button>
              
              <button
                className="sidebar-footer-btn logout-btn"
                style={styles.footerButton}
                onClick={handleLogout}
                aria-label="Logout"
              >
                <span style={styles.navIcon}>🚪</span>
                <span style={styles.navLabel}>Logout</span>
              </button>
            </div>
            
            <div style={styles.footerActionsCollapsed}>
              <button
                className="sidebar-footer-btn"
                style={{...styles.footerButton, ...styles.iconBtn}}
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              
              <button
                className="sidebar-footer-btn logout-btn"
                style={{...styles.footerButton, ...styles.iconBtn}}
                onClick={handleLogout}
                title="Logout"
              >
                🚪
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;