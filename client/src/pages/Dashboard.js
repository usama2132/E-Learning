import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { Navigate } from 'react-router-dom';
import AdminDashboard from '../components/admin/AdminDashboard';
import InstructorDashboard from '../components/instructor/InstructorDashboard';
import StudentDashboard from '../components/student/StudentDashboard';
import Loading from '../components/common/Loading';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState(null);

  // Theme check
  const isDark = theme === 'dark';

  // Optimized loading state management
  useEffect(() => {
    if (!authLoading) {
      // Simulate minimal loading time for smooth transition
      const timer = setTimeout(() => {
        setDashboardLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [authLoading]);

  // Memoized styles - Main content only
  const styles = useMemo(() => ({
    // Main container
    dashboardContainer: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
    },

    // Content area
    dashboardContent: {
      background: isDark 
        ? 'rgba(30, 41, 59, 0.8)' 
        : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '2rem',
      border: `1px solid ${isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(226, 232, 240, 0.5)'}`,
      boxShadow: isDark 
        ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
        : '0 8px 32px rgba(15, 23, 42, 0.08)',
      minHeight: '400px',
    },

    // Error states
    dashboardError: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 2rem',
      textAlign: 'center',
      background: isDark 
        ? 'rgba(239, 68, 68, 0.1)' 
        : 'rgba(254, 226, 226, 0.8)',
      borderRadius: '16px',
      border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
    },

    errorIcon: {
      fontSize: '3rem',
      marginBottom: '1rem',
      color: '#ef4444',
    },

    errorTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#ef4444',
      margin: '0 0 0.75rem 0',
    },

    errorMessage: {
      fontSize: '1rem',
      color: isDark ? '#fca5a5' : '#991b1b',
      margin: '0 0 1.5rem 0',
      lineHeight: '1.5',
      maxWidth: '400px',
    },

    contactSupportBtn: {
      padding: '12px 24px',
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none',
    },

    // Loading state
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px',
      gap: '1rem',
    },

    loadingText: {
      fontSize: '1rem',
      color: isDark ? '#94a3b8' : '#64748b',
      fontWeight: '500',
    },

    // Mobile responsive
    '@media (max-width: 768px)': {
      dashboardContent: {
        padding: '1.5rem',
      },
    },
  }), [isDark]);

  // Early loading state
  if (authLoading || dashboardLoading) {
    return (
      <div style={styles.dashboardContainer}>
        <div style={styles.loadingContainer}>
          <Loading />
          <p style={styles.loadingText}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role validation
  if (!user.role) {
    console.error('User object missing role:', user);
    return (
      <div style={styles.dashboardContainer}>
        <div style={styles.dashboardError}>
          <div style={styles.errorIcon}>⚠️</div>
          <h2 style={styles.errorTitle}>Missing User Role</h2>
          <p style={styles.errorMessage}>
            Your account is missing role information. Please contact support.
          </p>
          <button 
            style={styles.contactSupportBtn}
            onClick={() => window.location.href = '/contact'}
          >
            Contact Support
          </button>
        </div>
      </div>
    );
  }

  // Dashboard component renderer
  const renderDashboard = () => {
    try {
      switch (user.role.toLowerCase()) {
        case 'admin':
          return <AdminDashboard />;
        case 'instructor':
          return <InstructorDashboard />;
        case 'student':
          return <StudentDashboard />;
        default:
          return (
            <div style={styles.dashboardError}>
              <div style={styles.errorIcon}>❌</div>
              <h2 style={styles.errorTitle}>Invalid User Role</h2>
              <p style={styles.errorMessage}>
                Your account role "{user.role}" is not recognized. Please contact support.
              </p>
              <button 
                style={styles.contactSupportBtn}
                onClick={() => window.location.href = '/contact'}
              >
                Contact Support
              </button>
            </div>
          );
      }
    } catch (err) {
      console.error('Dashboard render error:', err);
      setError(err.message);
      return (
        <div style={styles.dashboardError}>
          <div style={styles.errorIcon}>💥</div>
          <h2 style={styles.errorTitle}>Dashboard Error</h2>
          <p style={styles.errorMessage}>
            Unable to load your dashboard. Please try refreshing the page.
          </p>
          <button 
            style={styles.contactSupportBtn}
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      );
    }
  };

  // Helper functions - removed unused ones
  const handleProfileEdit = () => {
    window.location.href = '/profile';
  };

  const handleCreateCourse = () => {
    window.location.href = '/instructor/create-course';
  };

  // Extract user data
  const userRole = user.role || 'unknown';

  return (
    <>
      <div style={styles.dashboardContainer}>
        {/* Main Dashboard Content */}
        <main style={styles.dashboardContent}>
          {error && (
            <div style={{
              background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(254, 226, 226, 0.5)',
              color: '#ef4444',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}
          {renderDashboard()}
        </main>
      </div>
    </>
  );
};

export default Dashboard;