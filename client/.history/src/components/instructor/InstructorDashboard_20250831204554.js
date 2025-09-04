import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import useCourses from '../../hooks/useCourses';
import CourseAnalytics from './CourseAnalytics';
import EarningsChart from './EarningsChart';
import MyCourses from './MyCourses';
import '../../styles/dashboards/InstructorDashboard.css';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { courses, loading, fetchInstructorCourses } = useCourses();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalEarnings: 0,
    pendingApproval: 0
  });
  const [activeTab, setActiveTab] = useState('overview');

  // Remove the local theme state management since we're using ThemeContext
  // const [isDarkMode, setIsDarkMode] = useState(false);

  // Remove custom theme toggle functionality since we're using ThemeContext
  // const toggleTheme = () => {
  //   const newTheme = !isDarkMode;
  //   setIsDarkMode(newTheme);
  //   
  //   // Apply theme to document
  //   if (newTheme) {
  //     document.documentElement.setAttribute('data-theme', 'dark');
  //   } else {
  //     document.documentElement.removeAttribute('data-theme');
  //   }
  // };

  // Remove theme initialization since ThemeContext handles it
  // useEffect(() => {
  //   // Check if user has a theme preference
  //   const savedTheme = false; // Set default to light mode
  //   setIsDarkMode(savedTheme);
  //   
  //   if (savedTheme) {
  //     document.documentElement.setAttribute('data-theme', 'dark');
  //   } else {
  //     document.documentElement.removeAttribute('data-theme');
  //   }
  // }, []);

  // Debug logging
  console.log('InstructorDashboard - User:', user);
  console.log('InstructorDashboard - User ID:', user?.id);
  console.log('InstructorDashboard - Courses:', courses);
  console.log('InstructorDashboard - Loading:', loading);

  // Replace the useEffect section (lines 63-74) with:

useEffect(() => {
  if (user && (user.id || user._id) && fetchInstructorCourses) {
    const userId = user.id || user._id;
    console.log('Fetching instructor courses for user ID:', userId);
    
    try {
      fetchInstructorCourses(userId);
      fetchInstructorStats(userId);
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  } else {
    console.warn('User, User ID, or fetchInstructorCourses not available:', user, fetchInstructorCourses);
  }
}, [user, fetchInstructorCourses]);

  const fetchInstructorStats = async (userId) => {
    try {
      console.log('Fetching stats for user ID:', userId);
      // Mock data for now to prevent API errors
      const mockStats = {
        totalCourses: 5,
        totalStudents: 150,
        totalEarnings: 2500,
        pendingApproval: 2
      };
      setStats(mockStats);
      
      // Uncomment this when your API is working
      // const response = await fetch(`/api/instructors/${userId}/stats`);
      // if (response.ok) {
      //   const data = await response.json();
      //   setStats(data);
      // } else {
      //   console.error('Failed to fetch stats:', response.statusText);
      // }
    } catch (error) {
      console.error('Error fetching instructor stats:', error);
      // Set default stats on error
      setStats({
        totalCourses: 0,
        totalStudents: 0,
        totalEarnings: 0,
        pendingApproval: 0
      });
    }
  };

  // Navigation handler for Edit Profile button
  const handleEditProfile = () => {
    navigate('/instructor/profile');
  };

  const StatCard = ({ title, value, icon, trend, color = 'blue' }) => {
    return (
      <div className={`instructor-stat-card instructor-stat-card--${color}`}>
        {/* Decorative gradient overlay */}
        <div className="instructor-stat-card__gradient"></div>
        
        <div className="instructor-stat-card__header">
          <div className="instructor-stat-card__icon">
            <i className={`fas fa-${icon}`}></i>
          </div>
          {trend && (
            <div className={`instructor-stat-card__trend instructor-stat-card__trend--${trend > 0 ? 'positive' : 'negative'}`}>
              <i className={`fas fa-arrow-${trend > 0 ? 'up' : 'down'}`}></i>
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        
        <div className="instructor-stat-card__content">
          <h3 className="instructor-stat-card__value">{value || 0}</h3>
          <p className="instructor-stat-card__title">{title}</p>
        </div>
      </div>
    );
  };

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      className={`instructor-tab-button ${isActive ? 'instructor-tab-button--active' : ''}`}
      onClick={() => onClick(id)}
    >
      {label}
    </button>
  );

  // Add safety check for user
  if (!user) {
    return (
      <div className="instructor-loading-container">
        <div className="instructor-loading-spinner"></div>
        <p>Loading user data...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="instructor-loading-container">
        <div className="instructor-loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="instructor-dashboard">
      {/* Header */}
      <div className="instructor-dashboard-header">
        <div className="instructor-dashboard-header__content fade-in-up">
          <h1>Welcome back, {user?.firstName || user?.name || 'Instructor'}!</h1>
          <p>Manage your courses and track your teaching performance</p>
        </div>
        
        <div className="instructor-dashboard-header__actions">
          <button 
            className="instructor-header-button instructor-header-button--primary"
            onClick={handleEditProfile}
          >
            <i className="fas fa-user-edit"></i>
            Edit Profile
          </button>
          
          <button className="instructor-header-button instructor-header-button--secondary">
            <i className="fas fa-chart-line"></i>
            View Analytics
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="instructor-stats-grid">
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          icon="book"
          trend={12}
          color="blue"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents ? stats.totalStudents.toLocaleString() : '0'}
          icon="users"
          trend={8}
          color="green"
        />
        <StatCard
          title="Total Earnings"
          value={`$${stats.totalEarnings ? stats.totalEarnings.toLocaleString() : '0'}`}
          icon="dollar-sign"
          trend={15}
          color="purple"
        />
        <StatCard
          title="Pending Approval"
          value={stats.pendingApproval}
          icon="clock"
          color="orange"
        />
      </div>

      {/* Main Content */}
      <div className="instructor-main-content">
        <div className="instructor-tab-nav">
          <TabButton
            id="overview"
            label="Overview"
            isActive={activeTab === 'overview'}
            onClick={setActiveTab}
          />
          <TabButton
            id="courses"
            label="My Courses"
            isActive={activeTab === 'courses'}
            onClick={setActiveTab}
          />
          <TabButton
            id="analytics"
            label="Analytics"
            isActive={activeTab === 'analytics'}
            onClick={setActiveTab}
          />
          <TabButton
            id="earnings"
            label="Earnings"
            isActive={activeTab === 'earnings'}
            onClick={setActiveTab}
          />
        </div>

        <div className="instructor-tab-content">
          {activeTab === 'overview' && (
            <div className="instructor-overview-grid">
              <div className="instructor-content-card">
                <h3 className="instructor-content-card__title">Recent Activity</h3>
                
                <div className="instructor-activity-list">
                  {[
                    { icon: 'user-plus', color: 'green', text: '5 new students enrolled in "React Fundamentals"', time: '2 hours ago' },
                    { icon: 'star', color: 'orange', text: 'New 5-star review on "JavaScript Mastery"', time: '1 day ago' },
                    { icon: 'dollar-sign', color: 'green', text: '$150 earned from course sales', time: '2 days ago' },
                  ].map((activity, index) => (
                    <div key={index} className="instructor-activity-item">
                      <div className={`instructor-activity-icon instructor-activity-icon--${activity.color}`}>
                        <i className={`fas fa-${activity.icon}`}></i>
                      </div>
                      <div className="instructor-activity-content">
                        <p className="instructor-activity-description">{activity.text}</p>
                        <span className="instructor-activity-time">{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="instructor-content-card">
                <h3 className="instructor-content-card__title">This Month</h3>
                
                <div className="instructor-quick-stats">
                  {[
                    { value: '24', label: 'New Enrollments', color: 'blue' },
                    { value: '4.8', label: 'Avg Rating', color: 'orange' },
                    { value: '89%', label: 'Completion Rate', color: 'green' },
                  ].map((stat, index) => (
                    <div key={index} className="instructor-quick-stat">
                      <span className={`instructor-quick-stat__value instructor-quick-stat__value--${stat.color}`}>
                        {stat.value}
                      </span>
                      <span className="instructor-quick-stat__label">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'courses' && <MyCourses />}
          {activeTab === 'analytics' && <CourseAnalytics />}
          {activeTab === 'earnings' && <EarningsChart />}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;