import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { Menu, X, Bell, Plus, ChevronDown, BarChart3, Users, Settings, BookOpen, User, LogOut, Layout, FileText, CreditCard } from 'lucide-react';

// CSS Styles
const styles = `
  .navbar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
  }

  .navbar-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .navbar-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 4rem;
  }

  .navbar-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .sidebar-toggle {
    padding: 0.5rem;
    border-radius: 0.375rem;
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .sidebar-toggle:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .logo {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: white;
  }

  .logo-icon {
    width: 2.5rem;
    height: 2.5rem;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 0.75rem;
  }

  .logo-text {
    font-size: 1.25rem;
    font-weight: bold;
  }

  .nav-links {
    display: none;
    align-items: center;
    gap: 2rem;
  }

  @media (min-width: 768px) {
    .nav-links {
      display: flex;
    }
  }

  .nav-link {
    color: white;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .nav-link:hover {
    color: #bfdbfe;
  }

  .navbar-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .theme-toggle, .notification-btn {
    padding: 0.5rem;
    border-radius: 50%;
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;
    position: relative;
  }

  .theme-toggle:hover, .notification-btn:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .notification-badge {
    position: absolute;
    top: -0.25rem;
    right: -0.25rem;
    width: 0.75rem;
    height: 0.75rem;
    background-color: #ef4444;
    border-radius: 50%;
  }

  .create-course-btn {
    display: none;
    align-items: center;
    gap: 0.5rem;
    background-color: #10b981;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  @media (min-width: 768px) {
    .create-course-btn {
      display: flex;
    }
  }

  .create-course-btn:hover {
    background-color: #059669;
  }

  .auth-buttons {
    display: none;
    align-items: center;
    gap: 0.75rem;
  }

  @media (min-width: 768px) {
    .auth-buttons {
      display: flex;
    }
  }

  .sign-in-btn {
    padding: 0.5rem 1rem;
    background: transparent;
    border: none;
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.2s;
  }

  .sign-in-btn:hover {
    color: #bfdbfe;
  }

  .sign-up-btn {
    padding: 0.5rem 1rem;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .sign-up-btn:hover {
    background-color: #1d4ed8;
  }

  .profile-dropdown {
    position: relative;
  }

  .profile-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: transparent;
    border: none;
    color: white;
    padding: 0.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .profile-btn:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .profile-icon {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
  }

  .profile-icon.instructor {
    background-color: #10b981;
  }

  .profile-icon.admin {
    background-color: #ef4444;
  }

  .profile-icon.student {
    background-color: #3b82f6;
  }

  .profile-text {
    display: none;
    font-weight: 500;
    text-transform: capitalize;
  }

  @media (min-width: 768px) {
    .profile-text {
      display: block;
    }
  }

  .dropdown-menu {
    position: absolute;
    right: 0;
    top: 100%;
    margin-top: 0.5rem;
    width: 16rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    padding: 0.5rem 0;
    z-index: 50;
  }

  .dropdown-header {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .dropdown-header p:first-child {
    font-size: 0.875rem;
    font-weight: 500;
    color: #111827;
    margin: 0 0 0.25rem 0;
  }

  .dropdown-header p:last-child {
    font-size: 0.75rem;
    color: #6b7280;
    text-transform: capitalize;
    margin: 0;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    color: #374151;
    text-decoration: none;
    transition: background-color 0.2s;
  }

  .dropdown-item:hover {
    background-color: #f3f4f6;
    color: #374151;
  }

  .mobile-toggle {
    display: block;
    padding: 0.5rem;
    border-radius: 0.375rem;
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  @media (min-width: 768px) {
    .mobile-toggle {
      display: none;
    }
  }

  .mobile-toggle:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .mobile-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    border-top: 1px solid #e5e7eb;
    z-index: 40;
  }

  .mobile-menu-content {
    padding: 1rem;
  }

  .mobile-nav-links {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .mobile-nav-link {
    color: #374151;
    text-decoration: none;
    font-weight: 500;
    padding: 0.5rem 0;
    transition: color 0.2s;
  }

  .mobile-nav-link:hover {
    color: #2563eb;
  }

  .mobile-create-course {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background-color: #10b981;
    color: white;
    border: none;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-bottom: 1rem;
  }

  .mobile-create-course:hover {
    background-color: #059669;
  }

  .mobile-auth-section {
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .mobile-sign-in {
    width: 100%;
    color: #374151;
    background: transparent;
    border: none;
    font-weight: 500;
    padding: 0.5rem 0;
    text-align: left;
    cursor: pointer;
    transition: color 0.2s;
  }

  .mobile-sign-in:hover {
    color: #2563eb;
  }

  .mobile-sign-up {
    width: 100%;
    background-color: #2563eb;
    color: white;
    border: none;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .mobile-sign-up:hover {
    background-color: #1d4ed8;
  }

  .mobile-profile-section {
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .mobile-profile-header {
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .mobile-profile-header p:first-child {
    font-size: 0.875rem;
    font-weight: 500;
    color: #111827;
    margin: 0 0 0.25rem 0;
  }

  .mobile-profile-header p:last-child {
    font-size: 0.75rem;
    color: #6b7280;
    text-transform: capitalize;
    margin: 0;
  }

  .mobile-dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0;
    font-size: 0.875rem;
    color: #374151;
    text-decoration: none;
    transition: color 0.2s;
  }

  .mobile-dropdown-item:hover {
    color: #2563eb;
  }

  .overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.25);
    z-index: 30;
  }

  /* Remove blue background from signup button when mobile menu is open */
  .mobile-menu-open .mobile-sign-up {
    background-color: transparent;
    color: #374151;
    border: none;
    padding: 0.5rem 0;
  }

  .mobile-menu-open .mobile-sign-up:hover {
    background-color: transparent;
    color: #2563eb;
  }

  /* REMOVED: The problematic body padding rule that was causing white space */
  /* 
  body {
    padding-top: 4rem;
  }
  */
`;

// Base Navbar Component
const BaseNavbar = ({ 
  userType = 'guest',
  userName = 'User',
  onSidebarToggle = () => {},
  showSidebarToggle = false,
  showCreateCourse = false
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }, [isMobileMenuOpen]);

  const toggleProfileDropdown = useCallback(() => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  }, [isProfileDropdownOpen]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, navigate]);

  const handleCreateCourse = useCallback(() => {
    navigate('/instructor/create-course');
  }, [navigate]);

  const handleSignIn = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleSignUp = useCallback(() => {
    navigate('/register');
  }, [navigate]);

  const getProfileMenuItems = useMemo(() => {
    const baseItems = [
      { icon: User, label: 'Profile', path: '/profile' },
      { icon: Settings, label: 'Settings', path: '/settings' },
      { icon: LogOut, label: 'Logout', action: handleLogout }
    ];

    switch(userType) {
      case 'instructor':
        return [
          { icon: Layout, label: 'Dashboard', path: '/instructor/dashboard' },
          { icon: BookOpen, label: 'My Courses', path: '/instructor/courses' },
          { icon: Users, label: 'Students', path: '/instructor/students' },
          { icon: BarChart3, label: 'Analytics', path: '/instructor/analytics' },
          { icon: CreditCard, label: 'Earnings', path: '/instructor/earnings' },
          ...baseItems
        ];
      case 'admin':
        return [
          { icon: Layout, label: 'Dashboard', path: '/admin/dashboard' },
          { icon: Users, label: 'User Management', path: '/admin/users' },
          { icon: BookOpen, label: 'Course Approval', path: '/admin/courses' },
          { icon: BarChart3, label: 'Platform Stats', path: '/admin/stats' },
          { icon: CreditCard, label: 'Transactions', path: '/admin/transactions' },
          { icon: Settings, label: 'System Settings', path: '/admin/settings' },
          ...baseItems
        ];
      case 'student':
        return [
          { icon: Layout, label: 'Dashboard', path: '/student/dashboard' },
          { icon: BookOpen, label: 'My Learning', path: '/student/learning' },
          { icon: BarChart3, label: 'Progress', path: '/student/progress' },
          { icon: CreditCard, label: 'Purchase History', path: '/student/purchases' },
          ...baseItems
        ];
      default:
        return [];
    }
  }, [userType, handleLogout]);

  const handleMenuItemClick = useCallback((item) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [navigate]);

  // Close dropdowns when clicking outside or navigating
  useEffect(() => {
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Auto-close mobile menu on window resize to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  return (
    <>
      <style>{styles}</style>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-content">
            {/* Left Section */}
            <div className="navbar-left">
              {showSidebarToggle && (
                <button className="sidebar-toggle" onClick={onSidebarToggle}>
                  <Menu size={20} />
                </button>
              )}
              
              <Link to="/" className="logo">
                <div className="logo-icon">
                  <BookOpen size={24} />
                </div>
                <span className="logo-text">EduPlatform</span>
              </Link>
            </div>

            {/* Center Section - Navigation Links */}
            <div className="nav-links">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/courses" className="nav-link">Courses</Link>
              <Link to="/about" className="nav-link">About</Link>
              <Link to="/contact" className="nav-link">Contact</Link>
            </div>

            {/* Right Section */}
            <div className="navbar-right">
              {/* Theme Toggle */}
              <button className="theme-toggle" onClick={toggleTheme}>
                <div style={{
                  width: '20px', 
                  height: '20px', 
                  backgroundColor: theme === 'dark' ? '#fbbf24' : '#f59e0b', 
                  borderRadius: '50%'
                }}></div>
              </button>

              {/* Notifications */}
              {userType !== 'guest' && (
                <button className="notification-btn">
                  <Bell size={20} />
                  <span className="notification-badge"></span>
                </button>
              )}

              {/* Create Course Button */}
              {showCreateCourse && (
                <button className="create-course-btn" onClick={handleCreateCourse}>
                  <Plus size={16} />
                  <span>Create Course</span>
                </button>
              )}

              {/* Auth or Profile */}
              {userType === 'guest' ? (
                <div className="auth-buttons">
                  <button className="sign-in-btn" onClick={handleSignIn}>Sign In</button>
                  <button className="sign-up-btn" onClick={handleSignUp}>Sign Up</button>
                </div>
              ) : (
                <div className="profile-dropdown">
                  <button className="profile-btn" onClick={toggleProfileDropdown}>
                    <div className={`profile-icon ${userType}`}>
                      {(user?.name || userName).charAt(0).toUpperCase()}
                    </div>
                    <span className="profile-text">{userType}</span>
                    <ChevronDown size={16} />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="dropdown-menu">
                      <div className="dropdown-header">
                        <p>{user?.name || userName}</p>
                        <p>{userType}</p>
                      </div>
                      {getProfileMenuItems.map((item, index) => (
                        <div 
                          key={index} 
                          className="dropdown-item"
                          onClick={() => handleMenuItemClick(item)}
                          style={{ cursor: 'pointer' }}
                        >
                          <item.icon size={16} />
                          <span>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button className="mobile-toggle" onClick={toggleMobileMenu}>
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`mobile-menu ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
            <div className="mobile-menu-content">
              {/* Navigation Links */}
              <div className="mobile-nav-links">
                <Link to="/" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                <Link to="/courses" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Courses</Link>
                <Link to="/about" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
                <Link to="/contact" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
              </div>

              {/* Create Course Button (Mobile) */}
              {showCreateCourse && (
                <button className="mobile-create-course" onClick={handleCreateCourse}>
                  <Plus size={16} />
                  <span>Create Course</span>
                </button>
              )}

              {/* Auth or Profile Section */}
              {userType === 'guest' ? (
                <div className="mobile-auth-section">
                  <button className="mobile-sign-in" onClick={handleSignIn}>Sign In</button>
                  <button className="mobile-sign-up" onClick={handleSignUp}>Sign Up</button>
                </div>
              ) : (
                <div className="mobile-profile-section">
                  <div className="mobile-profile-header">
                    <p>{user?.name || userName}</p>
                    <p>{userType}</p>
                  </div>
                  {getProfileMenuItems.map((item, index) => (
                    <div 
                      key={index} 
                      className="mobile-dropdown-item"
                      onClick={() => handleMenuItemClick(item)}
                      style={{ cursor: 'pointer' }}
                    >
                      <item.icon size={16} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Overlay */}
        {(isMobileMenuOpen || isProfileDropdownOpen) && (
          <div className="overlay" onClick={() => {
            setIsMobileMenuOpen(false);
            setIsProfileDropdownOpen(false);
          }}></div>
        )}
      </nav>
    </>
  );
};

// Individual Navbar Components
const HomeNavbar = () => {
  return <BaseNavbar userType="guest" />;
};

const StudentNavbar = ({ onSidebarToggle }) => {
  const { user } = useAuth();
  return (
    <BaseNavbar 
      userType="student" 
      userName={user?.name || "Student"}
      showSidebarToggle={true}
      onSidebarToggle={onSidebarToggle}
    />
  );
};

const InstructorNavbar = ({ onSidebarToggle }) => {
  const { user } = useAuth();
  return (
    <BaseNavbar 
      userType="instructor" 
      userName={user?.name || "Instructor"}
      showSidebarToggle={true}
      showCreateCourse={true}
      onSidebarToggle={onSidebarToggle}
    />
  );
};

const AdminNavbar = ({ onSidebarToggle }) => {
  const { user } = useAuth();
  return (
    <BaseNavbar 
      userType="admin" 
      userName={user?.name || "Admin"}
      showSidebarToggle={true}
      onSidebarToggle={onSidebarToggle}
    />
  );
};

// Main Navbar Component that determines which navbar to show based on user role
const Navbar = ({ onSidebarToggle }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Determine user type based on user data or current route
  const getUserType = () => {
    if (!isAuthenticated || !user) return 'guest';
    
    // Check route first
    if (location.pathname.startsWith('/admin/')) return 'admin';
    if (location.pathname.startsWith('/instructor/')) return 'instructor';
    if (location.pathname.startsWith('/student/')) return 'student';
    
    // Check user role
    return user.role || 'student';
  };

  const userType = getUserType();

  switch(userType) {
    case 'student':
      return <StudentNavbar onSidebarToggle={onSidebarToggle} />;
    case 'instructor':
      return <InstructorNavbar onSidebarToggle={onSidebarToggle} />;
    case 'admin':
      return <AdminNavbar onSidebarToggle={onSidebarToggle} />;
    default:
      return <HomeNavbar />;
  }
};

// Export individual components and main Navbar
export { HomeNavbar, StudentNavbar, InstructorNavbar, AdminNavbar };
export default Navbar;