// FIXED: StudentDashboard.js - Enhanced enrollment display with proper error handling
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../common/Loading';
import '../../styles/dashboards/StudentDashboard.css';

const StudentDashboard = () => {
  const { user, getToken } = useAuth();
  
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalHoursLearned: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const fetchingRef = useRef(false);

  // FIXED: Enhanced API request with better error handling
  const makeAPIRequest = async (endpoint, options = {}) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      };

      console.log(`Making API request to: ${endpoint}`);

      const response = await fetch(`http://localhost:5000/api${endpoint}`, {
        ...options,
        headers,
        credentials: 'include'
      });

      console.log(`API Response status: ${response.status} for ${endpoint}`);

      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // Use default error message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`API Response data for ${endpoint}:`, data.success ? 'Success' : 'Failed');
      return data;

    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  };

  // FIXED: Fetch enrolled courses with proper error handling
  const fetchEnrolledCourses = async () => {
    try {
      console.log('📚 Fetching enrolled courses...');
      
      const response = await makeAPIRequest('/student/enrolled-courses');
      
      if (response.success && response.courses) {
        console.log('✅ Enrolled courses received:', response.courses.length);
        
        // Process courses with proper ID handling
        const processedCourses = response.courses.map(course => ({
          ...course,
          id: course._id || course.id,
          lessons: course.sections?.flatMap(section => section.lessons || []) || [],
          videos: course.videos || [],
          // Ensure progress data exists
          progress: course.progress || {
            overallPercentage: 0,
            completedLessons: [],
            totalTimeSpent: 0,
            lastAccessedAt: new Date()
          }
        }));
        
        return processedCourses;
      }
      
      console.log('⚠️ No courses found in response');
      return [];
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      if (error.message.includes('404') || error.message.includes('No enrolled courses')) {
        return []; 
      }
      throw error; 
    }
  };

  // FIXED: Dashboard data fetching with multiple fallbacks
  const fetchDashboardData = async () => {
    try {
      console.log('📊 Fetching dashboard data...');
      
      const response = await makeAPIRequest('/student/dashboard');
      
      if (response.success && response.data) {
        console.log('✅ Dashboard data received');
        return response.data;
      }
      
      throw new Error('Dashboard endpoint returned no data');
    } catch (error) {
      console.error('Dashboard fetch failed:', error.message);
      // Return empty structure for fallback
      return {
        enrolledCourses: [],
        recentActivity: [],
        stats: {
          totalEnrollments: 0,
          completedCourses: 0,
          inProgressCourses: 0,
          totalTimeSpent: 0
        }
      };
    }
  };

  // FIXED: Fetch student stats with fallback
  const fetchStudentStats = async () => {
    try {
      console.log('📈 Fetching student stats...');
      
      const response = await makeAPIRequest('/student/stats');
      
      if (response.success && response.data && response.data.stats) {
        return {
          totalCourses: response.data.stats.totalEnrollments || 0,
          completedCourses: response.data.stats.completedCourses || 0,
          inProgressCourses: response.data.stats.inProgressCourses || 0,
          totalHoursLearned: Math.round((response.data.stats.timeSpent || 0) / 60) || 0
        };
      }
      
      throw new Error('Stats endpoint returned no data');
    } catch (error) {
      console.error('Stats fetch failed:', error.message);
      return {
        totalCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        totalHoursLearned: 0
      };
    }
  };

  // Generate activity from courses
  const generateRecentActivity = useCallback((courses) => {
    if (!courses || courses.length === 0) return [];
    
    const activities = [];
    
    courses.slice(0, 5).forEach((course) => {
      const lastAccess = course.progress?.lastAccessedAt || course.enrollmentDate || new Date();
      
      activities.push({
        id: `access-${course._id}`,
        type: 'course_access',
        courseTitle: course.title,
        courseId: course._id,
        timestamp: lastAccess,
        description: `Continued learning ${course.title}`
      });

      if (course.progress?.completedLessons && course.progress.completedLessons.length > 0) {
        activities.push({
          id: `progress-${course._id}`,
          type: 'lesson_completed',
          courseTitle: course.title,
          courseId: course._id,
          timestamp: lastAccess,
          description: `Made progress in ${course.title}`
        });
      }
    });

    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  }, []);

  // Calculate progress percentage
  const getProgressPercentage = useCallback((course) => {
    if (!course) return 0;
    
    if (course.progress?.overallPercentage !== undefined) {
      return Math.round(course.progress.overallPercentage);
    }
    
    const totalLessons = course.totalLessons || course.lessons?.length || course.totalVideos || 1;
    const completedCount = course.progress?.completedLessons?.length || 0;
    return Math.round((completedCount / totalLessons) * 100);
  }, []);

  // Format time ago
  const formatTimeAgo = useCallback((date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - new Date(date)) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  }, []);

  // FIXED: Main data fetching effect
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id || fetchingRef.current) return;
      
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔄 Loading dashboard data for user:', user.id);
        
        // Try dashboard endpoint first
        let dashboardData = null;
        try {
          dashboardData = await fetchDashboardData();
        } catch (dashboardError) {
          console.warn('Dashboard endpoint failed, using individual endpoints');
        }
        
        // Always try to get enrolled courses directly
        let courses = [];
        try {
          courses = await fetchEnrolledCourses();
          console.log('📚 Enrolled courses loaded:', courses.length);
          setEnrolledCourses(courses);
          
          // Generate activity from courses
          const activity = generateRecentActivity(courses);
          setRecentActivity(activity);
          
        } catch (coursesError) {
          console.error('Failed to load enrolled courses:', coursesError.message);
          setEnrolledCourses([]);
          setRecentActivity([]);
        }
        
        // Try to get stats
        try {
          const statsData = await fetchStudentStats();
          console.log('📈 Stats loaded:', statsData);
          
          // If stats are empty, calculate from courses
          if (statsData.totalCourses === 0 && courses.length > 0) {
            const calculatedStats = {
              totalCourses: courses.length,
              completedCourses: courses.filter(c => getProgressPercentage(c) >= 100).length,
              inProgressCourses: courses.filter(c => {
                const progress = getProgressPercentage(c);
                return progress > 0 && progress < 100;
              }).length,
              totalHoursLearned: courses.reduce((total, course) => {
                return total + Math.round((course.progress?.totalTimeSpent || 0) / 60);
              }, 0)
            };
            setStats(calculatedStats);
          } else {
            setStats(statsData);
          }
          
        } catch (statsError) {
          console.error('Failed to load stats:', statsError.message);
          
          // Calculate stats from courses if available
          if (courses.length > 0) {
            const calculatedStats = {
              totalCourses: courses.length,
              completedCourses: courses.filter(c => getProgressPercentage(c) >= 100).length,
              inProgressCourses: courses.filter(c => {
                const progress = getProgressPercentage(c);
                return progress > 0 && progress < 100;
              }).length,
              totalHoursLearned: courses.reduce((total, course) => {
                return total + Math.round((course.progress?.totalTimeSpent || 0) / 60);
              }, 0)
            };
            setStats(calculatedStats);
          }
        }
        
        // Process dashboard data if available
        if (dashboardData && dashboardData.enrolledCourses && dashboardData.enrolledCourses.length > 0) {
          console.log('📊 Processing dashboard course data');
          if (courses.length === 0) {
            // Use dashboard courses if direct fetch failed
            setEnrolledCourses(dashboardData.enrolledCourses);
            const activity = generateRecentActivity(dashboardData.enrolledCourses);
            setRecentActivity(activity);
          }
        }

      } catch (error) {
        console.error('❌ Dashboard data loading failed:', error);
        setError('Failed to load dashboard data. Please try refreshing the page.');
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };

    loadDashboardData();
  }, [user?.id, generateRecentActivity, getProgressPercentage]);

  // FIXED: Optimized Components
  const StatCard = React.memo(({ title, value, icon, color = 'blue' }) => (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-card__icon">
        <i className={`fas fa-${icon}`}></i>
      </div>
      <div className="stat-card__content">
        <h3 className="stat-card__value">{value || 0}</h3>
        <p className="stat-card__title">{title}</p>
      </div>
    </div>
  ));

  const CourseCard = React.memo(({ course }) => {
    const progressPercentage = getProgressPercentage(course);
    
    return (
      <div className="course-card">
        <img 
          src={course.thumbnail || '/placeholder-course.jpg'} 
          alt={course.title}
          className="course-image"
          loading="lazy"
        />
        <div className="course-content">
          <h4 className="course-title">{course.title}</h4>
          <p className="course-instructor">By {course.instructor?.name || 'Unknown Instructor'}</p>
          
          <div className="course-progress">
            <div className="progress-header">
              <span className="progress-label">Progress</span>
              <span className="progress-percentage">{progressPercentage}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          
          <div className="course-meta">
            <span>{course.totalLessons || 0} lessons</span>
            <span>{course.duration || 0}h</span>
            <span>{course.level || 'Beginner'}</span>
          </div>
          
          <Link 
            to={`/courses/${course._id}`}
            className="course-action"
          >
            {progressPercentage === 0 ? 'Start Course' : 'Continue Learning'}
          </Link>
        </div>
      </div>
    );
  });

  if (!user) {
    return <Loading message="Loading user data..." />;
  }

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-content">
          <i className="fas fa-exclamation-triangle error-icon"></i>
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button 
            className="retry-button" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header__content">
          <h1>Welcome back, {user?.firstName || user?.name || 'Student'}!</h1>
          <p>Continue your learning journey and achieve your goals</p>
        </div>
        
        <div className="dashboard-header__actions">
          <Link to="/courses" className="header-button header-button--primary">
            <i className="fas fa-search"></i>
            <span>Browse Courses</span>
          </Link>
          
          <Link to="/my-learning" className="header-button header-button--secondary">
            <i className="fas fa-book"></i>
            <span>My Learning</span>
          </Link>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Enrolled Courses"
          value={stats.totalCourses}
          icon="book"
          color="blue"
        />
        <StatCard
          title="Completed Courses"
          value={stats.completedCourses}
          icon="check-circle"
          color="green"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgressCourses}
          icon="play-circle"
          color="orange"
        />
        <StatCard
          title="Hours Learned"
          value={stats.totalHoursLearned}
          icon="clock"
          color="purple"
        />
      </div>

      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info" style={{ padding: '10px', background: '#f0f0f0', margin: '10px 0', borderRadius: '4px' }}>
          <strong>Debug Info:</strong>
          <p>User ID: {user?.id}</p>
          <p>Enrolled Courses: {enrolledCourses.length}</p>
          <p>Recent Activities: {recentActivity.length}</p>
          <p>Stats Total: {stats.totalCourses}</p>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        {/* Continue Learning Section */}
        <section className="continue-learning">
          <h2>Continue Learning</h2>
          
          {enrolledCourses.length > 0 ? (
            <div className="course-grid">
              {enrolledCourses
                .filter(course => {
                  const progressPercentage = getProgressPercentage(course);
                  return progressPercentage > 0 && progressPercentage < 100;
                })
                .slice(0, 4)
                .map(course => (
                  <CourseCard key={course._id} course={course} />
                ))}
              
              {enrolledCourses.filter(course => {
                const progressPercentage = getProgressPercentage(course);
                return progressPercentage > 0 && progressPercentage < 100;
              }).length === 0 && (
                <div className="no-progress-courses">
                  <h3>No courses in progress</h3>
                  <p>Start learning something new!</p>
                  <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
                </div>
              )}
            </div>
          ) : (
            <div className="no-enrolled-courses">
              <h3>No enrolled courses found</h3>
              <p>Start your learning journey today!</p>
              <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
            </div>
          )}
        </section>

        {/* Recent Activity */}
        <section className="recent-activity">
          <h2>Recent Activity</h2>
          
          {recentActivity.length > 0 ? (
            <div className="activity-list">
              {recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className={`activity-icon ${activity.type === 'lesson_completed' ? 'activity-icon--completed' : 'activity-icon--access'}`}>
                    <i className={`fas fa-${activity.type === 'lesson_completed' ? 'check' : 'book'}`}></i>
                  </div>
                  <div className="activity-content">
                    <p className="activity-description">{activity.description}</p>
                    <span className="activity-time">{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-activity">
              <p>No recent activity. Start learning to see your progress here!</p>
            </div>
          )}
        </section>

        {/* All Courses */}
        {enrolledCourses.length > 0 && (
          <section className="all-courses">
            <div className="section-header">
              <h2>All My Courses ({enrolledCourses.length})</h2>
              <Link to="/my-learning" className="view-all-link">View All</Link>
            </div>
            
            <div className="course-grid">
              {enrolledCourses.slice(0, 6).map(course => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;