import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';



const Sidebar = ({ isCollapsed, onToggle }) => {
  const { user, logout, loading } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  // Styles object
  const styles = {
    sidebar: {
      position: 'fixed',
      left: 0,
      top: '60px', // Adjust this to match your navbar height
      height: 'calc(100vh - 60px)', // Subtract navbar height
      width: isCollapsed ? '60px' : '280px',
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
      borderRight: theme === 'dark' ? '1px solid #333' : '1px solid #e5e7eb',
      transition: 'width 0.3s ease-in-out',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100, // Lower than navbar (usually 1000+) but higher than main content
      boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    },
    sidebarHeader: {
      padding: '16px',
      borderBottom: theme === 'dark' ? '1px solid #333' : '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: '60px',
      flexShrink: 0
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      overflow: 'hidden'
    },
    logoText: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: theme === 'dark' ? '#ffffff' : '#1f2937',
      whiteSpace: 'nowrap',
      opacity: isCollapsed ? 0 : 1,
      transform: isCollapsed ? 'translateX(-10px)' : 'translateX(0)',
      transition: 'opacity 0.3s ease, transform 0.3s ease'
    },
    logoIcon: {
      fontSize: '24px',
      flexShrink: 0,
      transition: 'transform 0.3s ease',
      transform: isCollapsed ? 'scale(1.1)' : 'scale(1)'
    },
    toggleBtn: {
      background: 'none',
      border: 'none',
      fontSize: '16px',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '6px',
      color: theme === 'dark' ? '#ffffff' : '#374151',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '32px',
      height: '32px'
    },
    toggleBtnHover: {
      backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
      transform: 'scale(1.05)'
    },
    sidebarContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
      overflow: 'hidden',
      paddingBottom: '60px'
    },
    sidebarLoading: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '12px'
    },
    loadingSpinner: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: theme === 'dark' ? '#9ca3af' : '#6b7280'
    },
    spinner: {
      width: '20px',
      height: '20px',
      border: '2px solid transparent',
      borderTop: `2px solid ${theme === 'dark' ? '#3b82f6' : '#2563eb'}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    sidebarGuest: {
      padding: '16px',
      borderBottom: theme === 'dark' ? '1px solid #333' : '1px solid #e5e7eb',
      flexShrink: 0
    },
    guestInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: isCollapsed ? 0 : '16px'
    },
    guestAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      flexShrink: 0
    },
    guestText: {
      flex: 1,
      minWidth: 0,
      opacity: isCollapsed ? 0 : 1,
      transform: isCollapsed ? 'translateX(-10px)' : 'translateX(0)',
      transition: 'opacity 0.3s ease, transform 0.3s ease'
    },
    guestMessage: {
      fontSize: '14px',
      fontWeight: '600',
      color: theme === 'dark' ? '#ffffff' : '#1f2937',
      marginBottom: '2px'
    },
    guestSubtitle: {
      fontSize: '12px',
      color: theme === 'dark' ? '#9ca3af' : '#6b7280',
      lineHeight: '1.3'
    },
    guestActions: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      opacity: isCollapsed ? 0 : 1,
      maxHeight: isCollapsed ? '0' : '100px',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    },
    guestBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '8px 12px',
      borderRadius: '6px',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      border: 'none',
      cursor: 'pointer'
    },
    loginBtn: {
      backgroundColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
      color: '#ffffff'
    },
    registerBtn: {
      backgroundColor: theme === 'dark' ? '#059669' : '#10b981',
      color: '#ffffff'
    },
    userInfo: {
      padding: '16px',
      borderBottom: theme === 'dark' ? '1px solid #333' : '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexShrink: 0
    },
    userAvatar: {
      position: 'relative',
      flexShrink: 0
    },
    avatarImg: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      objectFit: 'cover'
    },
    avatarPlaceholder: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: '600',
      color: theme === 'dark' ? '#ffffff' : '#1f2937'
    },
    roleBadge: {
      position: 'absolute',
      bottom: '-2px',
      right: '-2px',
      width: '16px',
      height: '16px',
      borderRadius: '50%',
      fontSize: '10px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid',
      borderColor: theme === 'dark' ? '#1a1a1a' : '#ffffff'
    },
    adminBadge: {
      backgroundColor: '#dc2626',
      color: '#ffffff'
    },
    instructorBadge: {
      backgroundColor: '#2563eb',
      color: '#ffffff'
    },
    userDetails: {
      flex: 1,
      minWidth: 0,
      opacity: isCollapsed ? 0 : 1,
      transform: isCollapsed ? 'translateX(-10px)' : 'translateX(0)',
      transition: 'opacity 0.3s ease, transform 0.3s ease'
    },
    userName: {
      fontSize: '14px',
      fontWeight: '600',
      color: theme === 'dark' ? '#ffffff' : '#1f2937',
      marginBottom: '2px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    userRole: {
      fontSize: '12px',
      color: theme === 'dark' ? '#9ca3af' : '#6b7280',
      marginBottom: '2px'
    },
    userStatus: {
      fontSize: '11px',
      fontWeight: '500'
    },
    statusVerified: {
      color: '#059669'
    },
    statusPending: {
      color: '#d97706'
    },
    statusSuspended: {
      color: '#dc2626'
    },
    sidebarNav: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '8px 0',
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
    },
    navList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    navItem: {
      margin: '0'
    },
    navLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      textDecoration: 'none',
      color: theme === 'dark' ? '#d1d5db' : '#374151',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      border: 'none',
      background: 'none',
      width: '100%',
      textAlign: 'left',
      position: 'relative'
    },
    navLinkActive: {
      backgroundColor: theme === 'dark' ? '#374151' : '#eff6ff',
      color: theme === 'dark' ? '#60a5fa' : '#2563eb',
      borderRight: `3px solid ${theme === 'dark' ? '#60a5fa' : '#2563eb'}`
    },
    navLinkHover: {
      backgroundColor: theme === 'dark' ? '#2d3748' : '#f9fafb'
    },
    navIcon: {
      fontSize: '18px',
      flexShrink: 0,
      minWidth: '18px',
      textAlign: 'center'
    },
    navLabel: {
      fontSize: '14px',
      fontWeight: '500',
      flex: 1,
      opacity: isCollapsed ? 0 : 1,
      transform: isCollapsed ? 'translateX(-10px)' : 'translateX(0)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    submenuToggle: {
      justifyContent: 'space-between'
    },
    submenuArrow: {
      fontSize: '12px',
      transition: 'transform 0.2s ease',
      opacity: isCollapsed ? 0 : 1,
      flexShrink: 0
    },
    submenu: {
      maxHeight: (activeSubmenu && !isCollapsed) ? '500px' : '0',
      overflow: 'hidden',
      transition: 'max-height 0.3s ease',
      backgroundColor: theme === 'dark' ? '#111827' : '#f8fafc'
    },
    submenuItem: {
      margin: 0
    },
    submenuLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px 8px 48px',
      textDecoration: 'none',
      color: theme === 'dark' ? '#9ca3af' : '#6b7280',
      fontSize: '13px',
      transition: 'all 0.2s ease'
    },
    submenuLinkActive: {
      backgroundColor: theme === 'dark' ? '#1f2937' : '#e0f2fe',
      color: theme === 'dark' ? '#60a5fa' : '#0891b2'
    },
    submenuDot: {
      fontSize: '12px',
      color: theme === 'dark' ? '#4b5563' : '#9ca3af'
    },
    quickStats: {
      padding: '12px 16px',
      borderTop: theme === 'dark' ? '1px solid #333' : '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      flexShrink: 0
    },
    statItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '4px 0'
    },
    statIcon: {
      fontSize: '14px'
    },
    statValue: {
      fontSize: '12px',
      fontWeight: '600',
      color: theme === 'dark' ? '#60a5fa' : '#2563eb'
    },
    sidebarFooter: {
      padding: '8px 0',
      borderTop: theme === 'dark' ? '1px solid #333' : '1px solid #e5e7eb',
      flexShrink: 0
    },
    footerLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 16px',
      textDecoration: 'none',
      color: theme === 'dark' ? '#9ca3af' : '#6b7280',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      border: 'none',
      background: 'none',
      width: '100%',
      textAlign: 'left'
    },
    footerLinkHover: {
      backgroundColor: theme === 'dark' ? '#2d3748' : '#f9fafb'
    },
    logoutBtn: {
      color: theme === 'dark' ? '#f87171' : '#dc2626'
    },
    themeIndicator: {
      position: 'absolute',
      bottom: '8px',
      right: '8px',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: theme === 'dark' ? '#60a5fa' : '#f59e0b'
    }
  };

  // Admin menu items
  const adminMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      path: '/admin/dashboard'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: '👥',
      path: '/admin/users'
    },
    {
      id: 'courses',
      label: 'Course Management',
      icon: '📚',
      submenu: [
        { label: 'All Courses', path: '/admin/courses' },
        { label: 'Pending Courses', path: '/admin/courses/pending' },
        { label: 'Course Approval', path: '/admin/courses/approval' },
        { label: 'Categories', path: '/admin/categories' }
      ]
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: '💰',
      path: '/admin/transactions'
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: '📋',
      submenu: [
        { label: 'User Reports', path: '/admin/reports/users' },
        { label: 'Course Reports', path: '/admin/reports/courses' },
        { label: 'Revenue Reports', path: '/admin/reports/revenue' }
      ]
    },
    {
      id: 'stats',
      label: 'Platform Stats',
      icon: '📈',
      path: '/admin/stats'
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: '⚙️',
      submenu: [
        { label: 'General Settings', path: '/admin/settings/general' },
        { label: 'Payment Settings', path: '/admin/settings/payments' },
        { label: 'Email Settings', path: '/admin/settings/email' },
        { label: 'Security Settings', path: '/admin/settings/security' }
      ]
    }
  ];

  // Instructor menu items
  const instructorMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      path: '/instructor/dashboard'
    },
    {
      id: 'courses',
      label: 'My Courses',
      icon: '📚',
      submenu: [
        { label: 'All Courses', path: '/instructor/courses' },
        { label: 'Create Course', path: '/instructor/courses/create' },
        { label: 'Draft Courses', path: '/instructor/courses/drafts' },
        { label: 'Published Courses', path: '/instructor/courses/published' }
      ]
    },
    {
      id: 'content',
      label: 'Content Library',
      icon: '📁',
      path: '/instructor/content'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📈',
      submenu: [
        { label: 'Course Performance', path: '/instructor/analytics/courses' },
        { label: 'Student Engagement', path: '/instructor/analytics/engagement' },
        { label: 'Revenue Analytics', path: '/instructor/analytics/revenue' }
      ]
    },
    {
      id: 'students',
      label: 'Students',
      icon: '👨‍🎓',
      submenu: [
        { label: 'All Students', path: '/instructor/students' },
        { label: 'Student Progress', path: '/instructor/students/progress' },
        { label: 'Communications', path: '/instructor/students/messages' }
      ]
    },
    {
      id: 'earnings',
      label: 'Earnings',
      icon: '💰',
      submenu: [
        { label: 'Revenue Overview', path: '/instructor/earnings' },
        { label: 'Payout History', path: '/instructor/earnings/payouts' },
        { label: 'Tax Documents', path: '/instructor/earnings/tax' }
      ]
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: '⭐',
      path: '/instructor/reviews'
    }
  ];

  // Student menu items
  const studentMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      path: '/student/dashboard'
    },
    {
      id: 'learning',
      label: 'My Learning',
      icon: '📖',
      submenu: [
        { label: 'Continue Learning', path: '/student/learning' },
        { label: 'Completed Courses', path: '/student/learning/completed' },
        { label: 'Saved Courses', path: '/student/learning/saved' },
        { label: 'Downloaded Content', path: '/student/learning/downloads' }
      ]
    },
    {
      id: 'catalog',
      label: 'Course Catalog',
      icon: '🔍',
      path: '/courses'
    },
    {
      id: 'progress',
      label: 'Progress',
      icon: '📈',
      submenu: [
        { label: 'Learning Progress', path: '/student/progress' },
        { label: 'Achievements', path: '/student/achievements' },
        { label: 'Certificates', path: '/student/certificates' }
      ]
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: '❤️',
      path: '/student/wishlist'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: '💬',
      path: '/student/messages'
    }
  ];

  // Get menu items based on user role
  const getMenuItems = () => {
    if (!user) return [];
    
    switch (user.role) {
      case 'admin':
        return adminMenuItems;
      case 'instructor':
        return instructorMenuItems;
      case 'student':
        return studentMenuItems;
      default:
        return studentMenuItems;
    }
  };

  const menuItems = getMenuItems();

  // Toggle submenu
  const toggleSubmenu = (itemId) => {
    if (isCollapsed) {
      // When sidebar is collapsed, clicking should expand the sidebar first
      onToggle();
      // Then open the submenu after a small delay to allow the sidebar to expand
      setTimeout(() => setActiveSubmenu(itemId), 300);
    } else {
      setActiveSubmenu(activeSubmenu === itemId ? null : itemId);
    }
  };

  // Check if path is active
  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Check if submenu item is active
  const isSubmenuActive = (submenu) => {
    return submenu.some(item => isActivePath(item.path));
  };

  // Auto-expand active submenu
  useEffect(() => {
    const activeItem = menuItems.find(item => 
      item.submenu && isSubmenuActive(item.submenu)
    );
    if (activeItem && !isCollapsed) {
      setActiveSubmenu(activeItem.id);
    }
  }, [location.pathname, menuItems, isCollapsed]);

  // Close submenus when sidebar is collapsed
  useEffect(() => {
    if (isCollapsed) {
      setActiveSubmenu(null);
    }
  }, [isCollapsed]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>
            {!isCollapsed && <span style={styles.logoText}>EduPlatform</span>}
            <span style={styles.logoIcon}>🎓</span>
          </div>
          <button 
            style={styles.toggleBtn}
            onClick={onToggle}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? '►' : '◄'}
          </button>
        </div>
        <div style={styles.sidebarLoading}>
          <div style={styles.loadingSpinner}>
            <div style={styles.spinner}></div>
            {!isCollapsed && <span>Loading...</span>}
          </div>
        </div>
      </div>
    );
  }

  // Show guest/unauthenticated state
  if (!user) {
    return (
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>
            {!isCollapsed && <span style={styles.logoText}>EduPlatform</span>}
            <span style={styles.logoIcon}>🎓</span>
          </div>
          <button 
            style={styles.toggleBtn}
            onClick={onToggle}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? '►' : '◄'}
          </button>
        </div>
        
        <div style={styles.sidebarGuest}>
          <div style={styles.guestInfo}>
            <div style={styles.guestAvatar}>👤</div>
            {!isCollapsed && (
              <div style={styles.guestText}>
                <div style={styles.guestMessage}>Welcome, Guest!</div>
                <div style={styles.guestSubtitle}>Please sign in to access features</div>
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <div style={styles.guestActions}>
              <Link to="/login" style={{...styles.guestBtn, ...styles.loginBtn}}>
                🔑 Sign In
              </Link>
              <Link to="/register" style={{...styles.guestBtn, ...styles.registerBtn}}>
                ✨ Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Basic navigation for guests */}
        <nav style={styles.sidebarNav}>
          <ul style={styles.navList}>
            <li style={styles.navItem}>
              <Link
                to="/"
                style={{
                  ...styles.navLink,
                  ...(isActivePath('/') ? styles.navLinkActive : {})
                }}
                title={isCollapsed ? 'Home' : ''}
              >
                <span style={styles.navIcon}>🏠</span>
                {!isCollapsed && <span style={styles.navLabel}>Home</span>}
              </Link>
            </li>
            <li style={styles.navItem}>
              <Link
                to="/courses"
                style={{
                  ...styles.navLink,
                  ...(isActivePath('/courses') ? styles.navLinkActive : {})
                }}
                title={isCollapsed ? 'Browse Courses' : ''}
              >
                <span style={styles.navIcon}>📚</span>
                {!isCollapsed && <span style={styles.navLabel}>Browse Courses</span>}
              </Link>
            </li>
            <li style={styles.navItem}>
              <Link
                to="/about"
                style={{
                  ...styles.navLink,
                  ...(isActivePath('/about') ? styles.navLinkActive : {})
                }}
                title={isCollapsed ? 'About' : ''}
              >
                <span style={styles.navIcon}>ℹ️</span>
                {!isCollapsed && <span style={styles.navLabel}>About</span>}
              </Link>
            </li>
            <li style={styles.navItem}>
              <Link
                to="/contact"
                style={{
                  ...styles.navLink,
                  ...(isActivePath('/contact') ? styles.navLinkActive : {})
                }}
                title={isCollapsed ? 'Contact' : ''}
              >
                <span style={styles.navIcon}>📞</span>
                {!isCollapsed && <span style={styles.navLabel}>Contact</span>}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    );
  }

  // Main authenticated sidebar
  return (
    <div style={styles.sidebar}>
      {/* Sidebar Header */}
      <div style={styles.sidebarHeader}>
        <div style={styles.logo}>
          {!isCollapsed && <span style={styles.logoText}>EduPlatform</span>}
          <span style={styles.logoIcon}>🎓</span>
        </div>
        <button 
          style={styles.toggleBtn}
          onClick={onToggle}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? '►' : '◄'}
        </button>
      </div>

      {/* User Info */}
      <div style={styles.userInfo}>
        <div style={styles.userAvatar}>
          {user.avatar ? (
            <img src={user.avatar} alt={user.name || 'User'} style={styles.avatarImg} />
          ) : (
            <div style={styles.avatarPlaceholder}>
              {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          {user.role === 'admin' && (
            <div style={{...styles.roleBadge, ...styles.adminBadge}}>A</div>
          )}
          {user.role === 'instructor' && (
            <div style={{...styles.roleBadge, ...styles.instructorBadge}}>I</div>
          )}
        </div>
        {!isCollapsed && (
          <div style={styles.userDetails}>
            <div style={styles.userName}>{user.name || user.email || 'User'}</div>
            <div style={styles.userRole}>
              {user.role === 'admin' && '👑 Administrator'}
              {user.role === 'instructor' && '👨‍🏫 Instructor'}
              {user.role === 'student' && '🎓 Student'}
            </div>
            {user.status && (
              <div style={{
                ...styles.userStatus,
                ...(user.status === 'verified' ? styles.statusVerified : {}),
                ...(user.status === 'pending' ? styles.statusPending : {}),
                ...(user.status === 'suspended' ? styles.statusSuspended : {})
              }}>
                {user.status === 'verified' && '✅ Verified'}
                {user.status === 'pending' && '⏳ Pending'}
                {user.status === 'suspended' && '🚫 Suspended'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Menu */}
       <nav style={styles.sidebarNav}>
        <ul style={styles.navList}>
          {menuItems.map((item) => (
            <li key={item.id} style={styles.navItem}>
              {item.submenu ? (
                <>
                  <button
                    style={{
                      ...styles.navLink,
                      ...styles.submenuToggle,
                      ...(isSubmenuActive(item.submenu) ? styles.navLinkActive : {})
                    }}
                    onClick={() => toggleSubmenu(item.id)}
                    title={isCollapsed ? item.label : ''}
                  >
                    <span style={styles.navIcon}>{item.icon}</span>
                    {!isCollapsed && (
                      <>
                        <span style={styles.navLabel}>{item.label}</span>
                        <span style={{
                          ...styles.submenuArrow,
                          transform: activeSubmenu === item.id ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}>
                          ▼
                        </span>
                      </>
                    )}
                  </button>
                  <ul style={{
                    ...styles.submenu,
                    maxHeight: activeSubmenu === item.id && !isCollapsed ? '500px' : '0'
                  }}>
                    {item.submenu.map((subItem) => (
                      <li key={subItem.path} style={styles.submenuItem}>
                        <Link
                          to={subItem.path}
                          style={{
                            ...styles.submenuLink,
                            ...(isActivePath(subItem.path) ? styles.submenuLinkActive : {})
                          }}
                        >
                          <span style={styles.submenuDot}>•</span>
                          {subItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <Link
                  to={item.path}
                  style={{
                    ...styles.navLink,
                    ...(isActivePath(item.path) ? styles.navLinkActive : {})
                  }}
                  title={isCollapsed ? item.label : ''}
                >
                  <span style={styles.navIcon}>{item.icon}</span>
                  {!isCollapsed && <span style={styles.navLabel}>{item.label}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Quick Stats (for collapsed sidebar) */}
      {isCollapsed && user && (
        <div style={styles.quickStats}>
          {user.role === 'student' && (
            <div style={styles.statItem} title="Enrolled Courses">
              <span style={styles.statIcon}>📚</span>
              <span style={styles.statValue}>{user.enrolledCourses || 0}</span>
            </div>
          )}
          {user.role === 'instructor' && (
            <div style={styles.statItem} title="My Courses">
              <span style={styles.statIcon}>🎯</span>
              <span style={styles.statValue}>{user.courseCount || 0}</span>
            </div>
          )}
          {user.role === 'admin' && (
            <div style={styles.statItem} title="Total Users">
              <span style={styles.statIcon}>👥</span>
              <span style={styles.statValue}>{user.totalUsers || 0}</span>
            </div>
          )}
        </div>
      )}

      {/* Sidebar Footer */}
      <div style={styles.sidebarFooter}>
        <Link 
          to="/profile" 
          style={{
            ...styles.footerLink,
            ...(isActivePath('/profile') ? styles.navLinkActive : {})
          }}
          title={isCollapsed ? 'Profile Settings' : ''}
        >
          <span style={styles.navIcon}>⚙️</span>
          {!isCollapsed && <span style={styles.navLabel}>Settings</span>}
        </Link>
        
        <Link 
          to="/help" 
          style={{
            ...styles.footerLink,
            ...(isActivePath('/help') ? styles.navLinkActive : {})
          }}
          title={isCollapsed ? 'Help & Support' : ''}
        >
          <span style={styles.navIcon}>❓</span>
          {!isCollapsed && <span style={styles.navLabel}>Help</span>}
        </Link>
        
        <button 
          style={{...styles.footerLink, ...styles.logoutBtn}}
          onClick={handleLogout}
          title={isCollapsed ? 'Sign Out' : ''}
        >
          <span style={styles.navIcon}>🚪</span>
          {!isCollapsed && <span style={styles.navLabel}>Sign Out</span>}
        </button>
      </div>

      {/* Theme indicator */}
      <div style={styles.themeIndicator}></div>

      {/* Add keyframes for spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Sidebar;