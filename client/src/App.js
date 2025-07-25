import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import { NotificationProvider } from './context/NotificationContext';
import { PaymentProvider } from './context/PaymentContext';
import { ProgressProvider } from './context/ProgressContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { enableMockAPI } from './utils/api';

// Common Components
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import Loading from './components/common/Loading';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

// Student Components
import StudentDashboard from './components/student/StudentDashboard';
import MyLearning from './components/student/MyLearning';
import CheckoutForm from './components/student/CheckoutForm';
import PaymentSuccess from './components/student/PaymentSuccess';
import PaymentFailure from './components/student/PaymentFailure';

// Instructor Components
import InstructorDashboard from './components/instructor/InstructorDashboard';
import CreateCourse from './components/instructor/CreateCourse';
import MyCourses from './components/instructor/MyCourses';
import EditCourse from './components/instructor/EditCourse';
import CourseAnalytics from './components/instructor/CourseAnalytics';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import CourseApproval from './components/admin/CourseApproval';
import PlatformStats from './components/admin/PlatformStats';
import SystemSettings from './components/admin/SystemSettings';

// Enable mock API in development
if (process.env.NODE_ENV === 'development') {
  enableMockAPI();
}

// PROFESSIONAL STYLES - NO BOTTOM GAP
const styles = {
  // Root app container - normal page with no bottom gap
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    width: '100%',
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  
  // Enhanced Navbar with toggle button
  navbarContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e1e5e9',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    height: '60px',
    padding: '0 1rem',
    flexShrink: 0
  },
  
  // Professional Toggle Button
  sidebarToggleBtn: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '8px',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    zIndex: 1001,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
    color: 'white',
    fontSize: '16px'
  },
  
  sidebarToggleBtnHover: {
    transform: 'translateY(-50%) scale(1.05)',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
  },
  
  // App layout - normal layout without height restrictions
  appLayout: {
    display: 'flex',
    flex: 1,
    marginTop: '60px',
    minHeight: 'calc(100vh - 60px)',
    position: 'relative'
  },
  
  // Fixed Professional Sidebar Styles
  sidebar: {
    position: 'fixed',
    left: 0,
    top: '60px',
    bottom: 0,
    width: '280px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e1e5e9',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 900,
    overflow: 'auto',
    boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
    transform: 'translateX(0)'
  },
  
  // Complete collapse - hide sidebar entirely
  sidebarCollapsed: {
    transform: 'translateX(-100%)',
    width: '280px'
  },
  
  sidebarHidden: {
    transform: 'translateX(-100%)'
  },
  
  // Main content container - NO BOTTOM SPACING
  mainContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '0',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    minHeight: '100%',
    backgroundColor: '#f8fafc',
    position: 'relative',
    margin: 0,
    padding: 0
  },
  
  // When sidebar is shown, main container gets margin
  mainContainerWithSidebar: {
    marginLeft: '280px'
  },
  
  mainContainerFullWidth: {
    marginLeft: '0'
  },
  
  // Main Content - ZERO SPACING EVERYWHERE
  mainContent: {
    flex: 1,
    padding: 0,
    margin: 0,
    minHeight: '100%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column'
  },
  
  // Mobile Sidebar
  mobileSidebar: {
    position: 'fixed',
    top: '60px',
    left: 0,
    bottom: 0,
    width: '280px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e1e5e9',
    transform: 'translateX(-100%)',
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 999,
    boxShadow: '2px 0 20px rgba(0,0,0,0.15)',
    display: 'none',
    overflow: 'auto'
  },
  
  mobileSidebarOpen: {
    transform: 'translateX(0)'
  },
  
  // Enhanced Overlay
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 898,
    opacity: 0,
    visibility: 'hidden',
    transition: 'all 0.3s ease'
  },
  
  overlayVisible: {
    opacity: 1,
    visibility: 'visible'
  },
  
  // Footer - NO SPACING AT ALL
  footer: {
    margin: 0,
    padding: 0,
    flexShrink: 0
  }
};

// Media query helper
const isMobile = () => window.innerWidth <= 768;

// Enhanced Toggle Button Component
const SidebarToggleButton = ({ isCollapsed, onClick, isMobileView }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button
      style={{
        ...styles.sidebarToggleBtn,
        ...(isHovered ? styles.sidebarToggleBtnHover : {})
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={isMobileView ? (isCollapsed ? 'Open Menu' : 'Close Menu') : (isCollapsed ? 'Show Sidebar' : 'Hide Sidebar')}
    >
      {isMobileView ? (isCollapsed ? '☰' : '✕') : (isCollapsed ? '☰' : '✕')}
    </button>
  );
};

// Enhanced Navbar Component
const EnhancedNavbar = ({ 
  sidebarCollapsed, 
  toggleSidebar, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  isAuthenticated,
  isMobileView,
  showSidebarToggle 
}) => {
  const handleToggle = () => {
    if (isMobileView) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      toggleSidebar();
    }
  };

  return (
    <>
      <div style={styles.navbarContainer}>
        {isAuthenticated && showSidebarToggle && (
          <SidebarToggleButton
            isCollapsed={isMobileView ? !mobileMenuOpen : sidebarCollapsed}
            onClick={handleToggle}
            isMobileView={isMobileView}
          />
        )}
        <Navbar />
      </div>
      
      {/* Mobile Sidebar */}
      {isMobileView && showSidebarToggle && (
        <div 
          style={{
            ...styles.mobileSidebar,
            ...(mobileMenuOpen ? styles.mobileSidebarOpen : {}),
            display: 'block'
          }}
        >
          <Sidebar 
            collapsed={false}
            onToggleCollapse={() => {}}
          />
        </div>
      )}
      
      {/* Mobile Overlay */}
      <div 
        style={{
          ...styles.overlay,
          ...(mobileMenuOpen && isMobileView && showSidebarToggle ? styles.overlayVisible : {})
        }}
        onClick={() => setMobileMenuOpen(false)}
      />
    </>
  );
};

// Utility function to check if route is a dashboard route
const checkIsDashboardRoute = (pathname) => {
  return pathname.includes('/dashboard') || 
         pathname.includes('/student/') || 
         pathname.includes('/instructor/') || 
         pathname.includes('/admin/') ||
         pathname === '/profile';
};

// Component to detect route changes and manage sidebar state
function RouteHandler({ children, setSidebarCollapsed, setMobileMenuOpen, setCurrentRoute }) {
  const location = useLocation();

  useEffect(() => {
    // Update current route
    setCurrentRoute(location.pathname);
    
    // Close mobile menu when route changes
    setMobileMenuOpen(false);
    
    // Check if current route is a dashboard route
    const isDashboardRoute = checkIsDashboardRoute(location.pathname);
    
    // Always collapse sidebar when navigating to any route (including dashboard routes)
    // This ensures sidebar is hidden by default on all routes
    setSidebarCollapsed(true);
    
  }, [location.pathname, setSidebarCollapsed, setMobileMenuOpen, setCurrentRoute]);

  return children;
}

function AppContent() {
  const { theme } = useTheme();
  const { user, isAuthenticated, isLoading } = useAuth();
  // Changed: Start with sidebar collapsed (true means hidden)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(isMobile());
  const [currentRoute, setCurrentRoute] = useState('/'); // Track current route
  
  // NORMAL BROWSER STYLE RESET - NOT RESTRICTIVE
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.boxSizing = 'border-box';
  }, [theme]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = isMobile();
      setIsMobileView(mobile);
      
      if (!mobile) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcuts for sidebar toggle - only on dashboard routes
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle sidebar with Ctrl/Cmd + B only on dashboard routes
      if ((e.ctrlKey || e.metaKey) && e.key === 'b' && isAuthenticated && checkIsDashboardRoute(currentRoute)) {
        e.preventDefault();
        if (isMobileView) {
          setMobileMenuOpen(!mobileMenuOpen);
        } else {
          setSidebarCollapsed(!sidebarCollapsed);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarCollapsed, mobileMenuOpen, isAuthenticated, isMobileView, currentRoute]);

  if (isLoading) {
    return <Loading fullPage />;
  }

  // Check if current route is a dashboard route using the tracked route
  const isDashboardRoute = checkIsDashboardRoute(currentRoute);

  // Calculate main container styles based on sidebar state
  const getMainContainerStyle = () => {
    // For mobile or non-authenticated users or non-dashboard routes, always full width
    if (isMobileView || !isAuthenticated || !isDashboardRoute) {
      return {
        ...styles.mainContainer,
        ...styles.mainContainerFullWidth
      };
    }
    
    // For desktop dashboard routes, check if sidebar is open (not collapsed)
    if (!sidebarCollapsed) {
      return {
        ...styles.mainContainer,
        ...styles.mainContainerWithSidebar
      };
    }
    
    // Default: full width (sidebar collapsed)
    return {
      ...styles.mainContainer,
      ...styles.mainContainerFullWidth
    };
  };

  // Determine if sidebar toggle should be shown
  const shouldShowSidebarToggle = isAuthenticated && isDashboardRoute;

  return (
    <Router>
      <div style={styles.appContainer}>
        <EnhancedNavbar 
          sidebarCollapsed={sidebarCollapsed}
          toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          isAuthenticated={isAuthenticated}
          isMobileView={isMobileView}
          showSidebarToggle={shouldShowSidebarToggle}
        />
        
        <div style={styles.appLayout}>
          {/* Desktop Sidebar - Show only for authenticated users on dashboard routes and when not collapsed */}
          {isAuthenticated && !isMobileView && isDashboardRoute && (
            <div 
              style={{
                ...styles.sidebar,
                ...(sidebarCollapsed ? styles.sidebarCollapsed : {})
              }}
            >
              <Sidebar 
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                user={user} 
              />
            </div>
          )}
          
          {/* Main container that includes both content and footer */}
          <div style={getMainContainerStyle()}>
            <main style={styles.mainContent}>
              {/* DIRECT CONTENT - NO WRAPPER */}
              <div style={{ flex: 1, margin: 0, padding: 0 }}>
                <ErrorBoundary>
                  <RouteHandler 
                    setSidebarCollapsed={setSidebarCollapsed}
                    setMobileMenuOpen={setMobileMenuOpen}
                    setCurrentRoute={setCurrentRoute}
                  >
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password/:token" element={<ResetPassword />} />
                      <Route path="/courses" element={<Courses />} />
                      <Route path="/courses/:id" element={<CourseDetails />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/terms-of-service" element={<TermsOfService />} />

                      {/* Protected Routes */}
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        }
                      />

                      {/* Student Routes */}
                      <Route
                        path="/student/dashboard"
                        element={
                          <ProtectedRoute requiredRole="student">
                            <StudentDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/student/learning"
                        element={
                          <ProtectedRoute requiredRole="student">
                            <MyLearning />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/checkout/:courseId"
                        element={
                          <ProtectedRoute requiredRole="student">
                            <CheckoutForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/payment/success"
                        element={
                          <ProtectedRoute requiredRole="student">
                            <PaymentSuccess />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/payment/failure"
                        element={
                          <ProtectedRoute requiredRole="student">
                            <PaymentFailure />
                          </ProtectedRoute>
                        }
                      />

                      {/* Instructor Routes */}
                      <Route
                        path="/instructor/dashboard"
                        element={
                          <ProtectedRoute requiredRole="instructor">
                            <InstructorDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/instructor/courses"
                        element={
                          <ProtectedRoute requiredRole="instructor">
                            <MyCourses />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/instructor/create-course"
                        element={
                          <ProtectedRoute requiredRole="instructor">
                            <CreateCourse />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/instructor/edit-course/:id"
                        element={
                          <ProtectedRoute requiredRole="instructor">
                            <EditCourse />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/instructor/analytics/:id"
                        element={
                          <ProtectedRoute requiredRole="instructor">
                            <CourseAnalytics />
                          </ProtectedRoute>
                        }
                      />

                      {/* Admin Routes */}
                      <Route
                        path="/admin/dashboard"
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <AdminDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/users"
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <UserManagement />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/courses"
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <CourseApproval />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/stats"
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <PlatformStats />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/settings"
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <SystemSettings />
                          </ProtectedRoute>
                        }
                      />

                      {/* Error Routes */}
                      <Route path="/unauthorized" element={<Unauthorized />} />
                      <Route path="/404" element={<NotFound />} />
                      <Route path="*" element={<Navigate to="/404" replace />} />
                    </Routes>
                  </RouteHandler>
                </ErrorBoundary>
              </div>
              
              {/* Footer DIRECTLY attached - NO GAP */}
              <div style={{ margin: 0, padding: 0 }}>
                <Footer />
              </div>
            </main>
          </div>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CourseProvider>
            <NotificationProvider>
              <PaymentProvider>
                <ProgressProvider>
                  <AppContent />
                </ProgressProvider>
              </PaymentProvider>
            </NotificationProvider>
          </CourseProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;