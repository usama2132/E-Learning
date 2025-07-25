import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import AdminDashboard from '../components/admin/AdminDashboard';
import InstructorDashboard from '../components/instructor/InstructorDashboard';
import StudentDashboard from '../components/student/StudentDashboard';
import Loading from '../components/common/Loading';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.role) {
    console.error('User object missing role:', user);
    return <Loading />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'instructor':
        return <InstructorDashboard />;
      case 'student':
        return <StudentDashboard />;
      default:
        return (
          <div style={styles.dashboardError}>
            <div style={styles.errorIcon}>⚠️</div>
            <h2 style={styles.errorTitle}>Invalid User Role</h2>
            <p style={styles.errorMessage}>Your account role is not recognized. Please contact support.</p>
            <button style={styles.contactSupportBtn}>Contact Support</button>
          </div>
        );
    }
  };

  const getRoleDisplayName = (role) => {
    if (!role) return 'Unknown';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const handleProfileEdit = () => {
    window.location.href = '/profile';
  };

  const handleCreateCourse = () => {
    window.location.href = '/instructor/create-course';
  };

  const userFirstName = user.firstName || user.name || user.username || 'User';
  const userRole = user.role || 'unknown';

  return (
    <div style={styles.dashboardPage}>
      <div style={styles.dashboardContainer}>
        <header style={styles.dashboardHeader}>
          <div style={styles.welcomeSection}>
            <h1 style={styles.welcomeTitle}>
              Welcome back, <span style={styles.userName}>{userFirstName}</span>!
            </h1>
            <p style={styles.userRoleBadge}>
              <span style={styles.roleIcon}>
                {userRole === 'admin' && '👑'}
                {userRole === 'instructor' && '🎓'}
                {userRole === 'student' && '📚'}
              </span>
              {getRoleDisplayName(userRole)} Dashboard
            </p>
          </div>
          
          <div style={styles.dashboardActions}>
            <button 
              style={styles.secondaryBtn}
              onClick={handleProfileEdit}
              aria-label="Edit Profile"
              onMouseEnter={(e) => e.target.style.backgroundColor = styles.secondaryBtnHover.backgroundColor}
              onMouseLeave={(e) => e.target.style.backgroundColor = styles.secondaryBtn.backgroundColor}
            >
              <span style={styles.btnIcon}>👤</span>
              Edit Profile
            </button>
            
            {userRole === 'instructor' && (
              <button 
                style={styles.primaryBtn}
                onClick={handleCreateCourse}
                aria-label="Create New Course"
                onMouseEnter={(e) => e.target.style.backgroundColor = styles.primaryBtnHover.backgroundColor}
                onMouseLeave={(e) => e.target.style.backgroundColor = styles.primaryBtn.backgroundColor}
              >
                <span style={styles.btnIcon}>➕</span>
                Create Course
              </button>
            )}
          </div>
        </header>

        <main style={styles.dashboardContent}>
          {renderDashboard()}
        </main>
      </div>
    </div>
  );
};

const styles = {
  dashboardPage: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px 0',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },

  dashboardContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px'
  },

  dashboardHeader: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '32px',
    marginBottom: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    flexWrap: 'wrap',
    gap: '20px'
  },

  welcomeSection: {
    flex: 1,
    minWidth: '300px'
  },

  welcomeTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 12px 0',
    lineHeight: '1.2',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },

  userName: {
    background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },

  userRoleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '50px',
    fontSize: '1rem',
    fontWeight: '600',
    boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
    border: 'none',
    margin: 0
  },

  roleIcon: {
    fontSize: '1.2rem'
  },

  dashboardActions: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },

  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    color: '#667eea',
    border: '2px solid #667eea',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none'
  },

  secondaryBtnHover: {
    backgroundColor: '#667eea',
    color: 'white',
    transform: 'translateY(-2px)'
  },

  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none',
    boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
  },

  primaryBtnHover: {
    backgroundColor: '#5a67d8',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 24px rgba(102, 126, 234, 0.4)'
  },

  btnIcon: {
    fontSize: '1rem'
  },

  dashboardContent: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '32px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    minHeight: '500px'
  },

  dashboardError: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '24px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
  },

  errorIcon: {
    fontSize: '4rem',
    marginBottom: '20px'
  },

  errorTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#e53e3e',
    margin: '0 0 16px 0'
  },

  errorMessage: {
    fontSize: '1.1rem',
    color: '#666',
    margin: '0 0 32px 0',
    lineHeight: '1.6'
  },

  contactSupportBtn: {
    padding: '12px 32px',
    backgroundColor: '#e53e3e',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none'
  }
};

export default Dashboard;