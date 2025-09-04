import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CourseProvider } from './context/CourseContext';
import { NotificationProvider } from './context/NotificationContext';
import { PaymentProvider } from './context/PaymentContext';
import { ProgressProvider } from './context/ProgressContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout Components
import DashboardLayout from './layouts/DashboardLayout';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import ScrollToTop from './components/common/ScrollToTop'; // NEW: Import ScrollToTop

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
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
import StudentProfile from './components/student/StudentProfile';
import MyLearning from './components/student/MyLearning';
import CheckoutForm from './components/student/CheckoutForm';
import PaymentSuccess from './components/student/PaymentSuccess';
import PaymentFailure from './components/student/PaymentFailure';
import CourseProgress from './components/student/CourseProgress';
import VideoLecture from './components/student/VideoLecture';

// Instructor Components
import InstructorDashboard from './components/instructor/InstructorDashboard';
import CreateCourse from './components/instructor/CreateCourse';
import MyCourses from './components/instructor/MyCourses';
import EditCourse from './components/instructor/EditCourse';
import CourseAnalytics from './components/instructor/CourseAnalytics';
import StudentsList from './components/instructor/StudentsList';
import InstructorProfile from './components/instructor/InstructorProfile';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import CourseApproval from './components/admin/CourseApproval';
import PendingCourses from './components/admin/PendingCourses';
import CategoryManager from './components/admin/CategoryManager';
import TransactionList from './components/admin/TransactionList';
import PlatformStats from './components/admin/PlatformStats';
import SystemSettings from './components/admin/SystemSettings';
import AdminProfile from './components/admin/AdminProfile';

// Fallback Component for missing components
const FallbackComponent = ({ componentName, message }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
      <div className="text-6xl mb-4">🚧</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        {componentName} Coming Soon
      </h3>
      <p className="text-gray-600 mb-4">
        {message || `The ${componentName} component is currently under development.`}
      </p>
      <div className="text-sm text-gray-500">
        Please check back later or contact support if you need immediate assistance.
      </div>
    </div>
  </div>
);

// Safe component wrapper
const SafeComponent = ({ component: Component, fallbackName, ...props }) => {
  try {
    return <Component {...props} />;
  } catch (error) {
    console.error(`Error rendering ${fallbackName}:`, error);
    return <FallbackComponent componentName={fallbackName} message="There was an error loading this component." />;
  }
};

// Loading Component
const LoadingSpinner = ({ message = "Loading...", variant = "default" }) => {
  const variants = {
    default: "bg-gray-50",
    dark: "bg-gray-900",
    transparent: "bg-transparent"
  };

  return (
    <div className={`flex items-center justify-center min-h-screen ${variants[variant]}`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className={`${variant === 'dark' ? 'text-white' : 'text-gray-600'}`}>{message}</p>
      </div>
    </div>
  );
};

// FIXED: Full Screen Layout Component for public pages
const FullScreenPageLayout = ({ children, showNavbar = true, showFooter = true, className = "" }) => {
  const location = useLocation();
  const routeClass = location.pathname.replace('/', '').replace(/\//g, '-') || 'home';
  
  return (
    <div className={`w-full ${className} route-${routeClass}`}>
      {/* Fixed navbar positioning */}
      {showNavbar && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>
      )}
      
      {/* Main content with proper full-screen coverage */}
      <main className={`w-full ${showNavbar ? 'pt-16' : 'pt-0'} ${showFooter ? 'pb-0' : ''}`}>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <div className="w-full min-h-screen">
              {children}
            </div>
          </Suspense>
        </ErrorBoundary>
      </main>
      
      {/* Footer positioned properly */}
      {showFooter && (
        <div className="w-full">
          <Footer />
        </div>
      )}
      
      {/* NEW: ScrollToTop component for public pages */}
      <ScrollToTop />
    </div>
  );
};

// FIXED: Auth Layout for login/register (full screen, centered)
const AuthLayout = ({ children, className = "" }) => {
  const location = useLocation();
  const routeClass = location.pathname.replace('/', '').replace(/\//g, '-') || 'auth';
  
  return (
    <div className={`w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 ${className} route-${routeClass}`}>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner variant="transparent" message="Loading..." />}>
          <div className="w-full h-full flex items-center justify-center p-4">
            {children}
          </div>
        </Suspense>
      </ErrorBoundary>
      {/* NEW: ScrollToTop for auth pages */}
      <ScrollToTop />
    </div>
  );
};

// FIXED: Dashboard Layout Wrapper
const DashboardPageLayout = ({ children }) => {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner message="Loading Dashboard..." />}>
          <DashboardLayout>
            <div className="w-full">
              {children}
            </div>
          </DashboardLayout>
        </Suspense>
      </ErrorBoundary>
      {/* NEW: ScrollToTop for dashboard pages */}
      <ScrollToTop />
    </div>
  );
};

// FIXED: Video Player Layout (full screen) - NO ScrollToTop here to avoid interference
const VideoPlayerLayout = ({ children, className = "" }) => {
  return (
    <div className={`w-full h-screen bg-black ${className}`}>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner variant="dark" message="Loading Video..." />}>
          <div className="w-full h-full">
            {children}
          </div>
        </Suspense>
      </ErrorBoundary>
      {/* NOTE: No ScrollToTop on video pages to avoid interference */}
    </div>
  );
};

// FIXED: Error Page Layout
const ErrorPageLayout = ({ children }) => {
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <ErrorBoundary>
        <div className="w-full h-full">
          {children}
        </div>
      </ErrorBoundary>
      {/* NEW: ScrollToTop for error pages */}
      <ScrollToTop />
    </div>
  );
};

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - Full screen coverage */}
        <Route 
          path="/" 
          element={
            <FullScreenPageLayout className="home-page">
              <Home />
            </FullScreenPageLayout>
          } 
        />
        
        <Route 
          path="/about" 
          element={
            <FullScreenPageLayout className="about-page">
              <SafeComponent component={About} fallbackName="About" />
            </FullScreenPageLayout>
          } 
        />
        
        <Route 
          path="/contact" 
          element={
            <FullScreenPageLayout className="contact-page">
              <SafeComponent component={Contact} fallbackName="Contact" />
            </FullScreenPageLayout>
          } 
        />
        
        <Route 
          path="/courses" 
          element={
            <FullScreenPageLayout className="courses-page">
              <SafeComponent component={Courses} fallbackName="Courses" />
            </FullScreenPageLayout>
          } 
        />
        
        <Route 
          path="/courses/:id" 
          element={
            <FullScreenPageLayout className="course-details-page">
              <SafeComponent component={CourseDetails} fallbackName="Course Details" />
            </FullScreenPageLayout>
          } 
        />
        

{/* Auth Routes - Full screen with navbar */}
<Route 
  path="/login" 
  element={
    <FullScreenPageLayout showNavbar={true} showFooter={false} className="login-page">
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 -mt-16">
        <div className="w-full h-full flex items-center justify-center p-4">
          <Login />
        </div>
      </div>
    </FullScreenPageLayout>
  } 
/>

<Route 
  path="/register" 
  element={
    <FullScreenPageLayout showNavbar={true} showFooter={false} className="register-page">
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 -mt-16">
        <div className="w-full h-full flex items-center justify-center p-4">
          <Register />
        </div>
      </div>
    </FullScreenPageLayout>
  } 
/>

<Route 
  path="/forgot-password" 
  element={
    <FullScreenPageLayout showNavbar={true} showFooter={false} className="forgot-password-page">
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 -mt-16">
        <div className="w-full h-full flex items-center justify-center p-4">
          <ForgotPassword />
        </div>
      </div>
    </FullScreenPageLayout>
  } 
/>

<Route 
  path="/reset-password/:token" 
  element={
    <FullScreenPageLayout showNavbar={true} showFooter={false} className="reset-password-page">
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 -mt-16">
        <div className="w-full h-full flex items-center justify-center p-4">
          <ResetPassword />
        </div>
      </div>
    </FullScreenPageLayout>
  } 
/>

<Route 
  path="/verify-email/:token" 
  element={
    <FullScreenPageLayout showNavbar={true} showFooter={false} className="verify-email-page">
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 -mt-16">
        <div className="w-full h-full flex items-center justify-center p-4">
          <VerifyEmail />
        </div>
      </div>
    </FullScreenPageLayout>
  } 
/>
        
        {/* Legal Pages - Full screen with footer */}
        <Route 
          path="/privacy-policy" 
          element={
            <FullScreenPageLayout className="privacy-policy-page">
              <SafeComponent component={PrivacyPolicy} fallbackName="Privacy Policy" />
            </FullScreenPageLayout>
          } 
        />
        
        <Route 
          path="/terms-of-service" 
          element={
            <FullScreenPageLayout className="terms-page">
              <SafeComponent component={TermsOfService} fallbackName="Terms of Service" />
            </FullScreenPageLayout>
          } 
        />

        {/* Main Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPageLayout>
                <Dashboard />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />

        {/* Student Dashboard Pages */}
        <Route 
          path="/student/dashboard" 
          element={
            <ProtectedRoute requiredRole="student">
              <DashboardPageLayout>
                <StudentDashboard />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/student/learning" 
          element={
            <ProtectedRoute requiredRole="student">
              <DashboardPageLayout>
                <MyLearning />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/student/learning/completed" 
          element={
            <ProtectedRoute requiredRole="student">
              <DashboardPageLayout>
                <MyLearning filter="completed" />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/student/learning/saved" 
          element={
            <ProtectedRoute requiredRole="student">
              <DashboardPageLayout>
                <MyLearning filter="saved" />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/student/wishlist" 
          element={
            <ProtectedRoute requiredRole="student">
              <DashboardPageLayout>
                <MyLearning filter="wishlist" />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />

        {/* Course Progress and Learning Pages */}
        <Route 
          path="/student/course/:courseId/progress" 
          element={
            <ProtectedRoute requiredRole="student">
              <DashboardPageLayout>
                <CourseProgress />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />

        // Add this route after the CourseProgress route in App.js:
          <Route 
            path="/student/course/:courseId/lessons" 
            element={
              <ProtectedRoute requiredRole="student">
                <DashboardPageLayout>
                  <CourseProgress />
                </DashboardPageLayout>
              </ProtectedRoute>
            } 
          />
        
        {/* Video Lecture - Full screen */}
        <Route 
          path="/student/course/:courseId/lecture/:lectureId" 
          element={
            <ProtectedRoute requiredRole="student">
              <VideoPlayerLayout className="video-lecture-page">
                <VideoLecture />
              </VideoPlayerLayout>
            </ProtectedRoute>
          } 
        />

        {/* Instructor Dashboard Pages */}
        <Route 
          path="/instructor/dashboard" 
          element={
            <ProtectedRoute requiredRole="instructor">
              <DashboardPageLayout>
                <InstructorDashboard />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/instructor/courses" 
          element={
            <ProtectedRoute requiredRole="instructor">
              <DashboardPageLayout>
                <MyCourses />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/instructor/courses/create" 
          element={
            <ProtectedRoute requiredRole="instructor">
              <DashboardPageLayout>
                <CreateCourse />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/instructor/courses/drafts" 
          element={
            <ProtectedRoute requiredRole="instructor">
              <DashboardPageLayout>
                <MyCourses filter="drafts" />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/instructor/edit-course/:id" 
          element={
            <ProtectedRoute requiredRole="instructor">
              <DashboardPageLayout>
                <EditCourse />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/instructor/analytics/courses" 
          element={
            <ProtectedRoute requiredRole="instructor">
              <DashboardPageLayout>
                <CourseAnalytics />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/instructor/profile" 
          element={
            <ProtectedRoute requiredRole="instructor">
              <DashboardPageLayout>
                <InstructorProfile />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/instructor/students" 
          element={
            <ProtectedRoute requiredRole="instructor">
              <DashboardPageLayout>
                <StudentsList />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />

        {/* Admin Dashboard Pages */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardPageLayout>
                <AdminDashboard />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardPageLayout>
                <UserManagement />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/courses" 
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardPageLayout>
                <CourseApproval />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/courses/pending" 
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardPageLayout>
                <PendingCourses />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/categories" 
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardPageLayout>
                <CategoryManager />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/transactions" 
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardPageLayout>
                <TransactionList />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/profile" 
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardPageLayout>
                <AdminProfile />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/settings" 
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardPageLayout>
                <SystemSettings />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/stats" 
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardPageLayout>
                <PlatformStats />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />

        {/* Profile Pages */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <DashboardPageLayout>
                <Profile />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/student/profile" 
          element={
            <ProtectedRoute requiredRole="student">
              <DashboardPageLayout>
                <StudentProfile />
              </DashboardPageLayout>
            </ProtectedRoute>
          } 
        />

        {/* Payment Process Pages - Full screen */}
        <Route 
          path="/checkout/:courseId" 
          element={
            <ProtectedRoute requiredRole="student">
              <FullScreenPageLayout showFooter={false} className="checkout-page">
                <CheckoutForm />
              </FullScreenPageLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/payment/success" 
          element={
            <ProtectedRoute requiredRole="student">
              <FullScreenPageLayout showFooter={false} className="payment-success-page">
                <PaymentSuccess />
              </FullScreenPageLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/payment/failure" 
          element={
            <ProtectedRoute requiredRole="student">
              <FullScreenPageLayout showFooter={false} className="payment-failure-page">
                <PaymentFailure />
              </FullScreenPageLayout>
            </ProtectedRoute>
          } 
        />

        {/* Error Pages - Full screen */}
        <Route 
         path="/unauthorized" 
         element={
         <FullScreenPageLayout className="unauthorized-page">
         <Unauthorized />
         </FullScreenPageLayout>
        } 
       />
        
      
         <Route 
           path="/404" 
           element={
           <ErrorPageLayout showNavbar={true}>
           <NotFound />
           </ErrorPageLayout>
          } 
        />


        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
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
                  <div className="w-full h-full">
                    <AppContent />
                  </div>
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