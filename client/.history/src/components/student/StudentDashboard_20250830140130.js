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
  const [progress, setProgress] = useState({});
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

  // Enhanced API request helper with proper error handling
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

      const response = await fetch(`http://localhost:5000/api${endpoint}`, {
        ...options,
        headers,
        credentials: 'include'
      });

      // Handle different response statuses
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }

      if (response.status === 403) {
        throw new Error('Access denied. You do not have permission to access this resource.');
      }

      if (response.status === 404) {
        // For 404, return empty data instead of error
        return { success: true, data: { courses: [] } };
      }

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error?.message || errorMessage;
        } catch (parseError) {
          // Use default error message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  };

  // Fixed: Fetch enrolled courses with proper endpoint
  const fetchEnrolledCourses = async () => {
  try {
    const response = await makeAPIRequest('/student/enrolled-courses');
    
    if (response.success) {
      // ✅ Courses are directly under response.courses
      return response.courses || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return [];
  }
};

  // Fixed: Fetch progress with correct endpoint structure
 const fetchProgress = async (courseIds) => {
  if (!courseIds.length) return {};
  
  try {
    // FIXED: Use correct backend endpoint 
    const response = await makeAPIRequest('/student/stats');
    
    if (response.success && response.data) {
      const progressMap = {};
      if (response.data.stats) {
        // Map the stats data to progress format
        courseIds.forEach(courseId => {
          progressMap[courseId] = {
            completionPercentage: response.data.stats.completionRate || 0,
            completedLessons: [],
            timeSpent: response.data.stats.timeSpent || 0,
            lastAccessed: new Date()
          };
        });
      }
      return progressMap;
    }
    
    return {};
  } catch (error) {
    console.error('Error fetching progress:', error);
    return {};
  }
};

  // Fixed: Fetch recommended courses with proper query parameters
  const fetchRecommendedCourses = async () => {
  try {
    const response = await makeAPIRequest('/courses?limit=4');
    
    if (response.success) {
      // ✅ Courses are directly under response.courses
      return response.courses || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching recommended courses:', error);
    return [];
  }
};

  // Generate recent activity based on progress data
  const generateRecentActivity = useCallback((courses, progressData) => {
    const activities = [];
    
    courses.forEach(course => {
      const courseId = course._id || course.id;
      const courseProgress = progressData[courseId];
      
      if (courseProgress?.lastAccessed) {
        activities.push({
          id: `access-${courseId}`,
          type: 'course_access',
          courseTitle: course.title,
          courseId: courseId,
          timestamp: courseProgress.lastAccessed,
          description: `Continued learning ${course.title}`
        });
      }

      if (courseProgress?.completedLessons && courseProgress.completedLessons.length > 0) {
        courseProgress.completedLessons.slice(0, 3).forEach((lessonId, index) => {
          const lesson = course.lessons?.find(l => (l._id || l.id) === lessonId);
          if (lesson) {
            activities.push({
              id: `lesson-${lessonId}`,
              type: 'lesson_completed',
              courseTitle: course.title,
              courseId: courseId,
              lessonTitle: lesson.title,
              timestamp: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000),
              description: `Completed "${lesson.title}" in ${course.title}`
            });
          }
        });
      }
    });

    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  }, []);

  // Calculate stats from enrolled courses and progress
  const processedStats = useMemo(() => {
    const totalCourses = enrolledCourses.length;
    const completedCourses = enrolledCourses.filter(course => {
      const courseId = course._id || course.id;
      const courseProgress = progress[courseId];
      const totalLessons = course.lessons?.length || 0;
      const completedLessons = courseProgress?.completedLessons?.length || 0;
      return totalLessons > 0 && completedLessons === totalLessons;
    }).length;

    const inProgressCourses = enrolledCourses.filter(course => {
      const courseId = course._id || course.id;
      const courseProgress = progress[courseId];
      const completedLessons = courseProgress?.completedLessons?.length || 0;
      const totalLessons = course.lessons?.length || 0;
      return completedLessons > 0 && completedLessons < totalLessons;
    }).length;

    const totalHoursLearned = enrolledCourses.reduce((total, course) => {
      const courseId = course._id || course.id;
      const courseProgress = progress[courseId];
      const completedLessons = courseProgress?.completedLessons?.length || 0;
      return total + (completedLessons * (course.avgLessonDuration || 20) / 60);
    }, 0);

    return {
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalHoursLearned: Math.round(totalHoursLearned)
    };
  }, [enrolledCourses, progress]);

  // Get progress percentage for a course
  const getProgressPercentage = useCallback((courseId, totalLessons) => {
    const courseProgress = progress[courseId];
    if (!courseProgress || !totalLessons) return 0;
    const completedCount = courseProgress.completedLessons?.length || 0;
    return Math.round((completedCount / totalLessons) * 100);
  }, [progress]);

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

  // Fixed: Main data fetching with better error handling
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id || fetchingRef.current) return;
      
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching dashboard data for user:', user.id);
        
        // Fetch enrolled courses first
        const courses = await fetchEnrolledCourses();
        console.log('Enrolled courses fetched:', courses.length);
        setEnrolledCourses(courses);

        // If courses exist, fetch progress
        if (courses.length > 0) {
          const courseIds = courses.map(course => course._id || course.id);
          console.log('Fetching progress for courses:', courseIds);
          
          const progressData = await fetchProgress(courseIds);
          console.log('Progress data fetched:', Object.keys(progressData).length);
          setProgress(progressData);

          const activity = generateRecentActivity(courses, progressData);
          setRecentActivity(activity);
        }

        // Fetch recommended courses
        console.log('Fetching recommended courses...');
        const recommended = await fetchRecommendedCourses();
        console.log('Recommended courses fetched:', recommended.length);
        setRecommendedCourses(recommended);

      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        setError('Failed to load dashboard data. Please try refreshing the page.');
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };

    fetchDashboardData();
  }, [user?.id, generateRecentActivity]);

  // Update stats when data changes
  useEffect(() => {
    setStats(processedStats);
  }, [processedStats]);

  // Optimized Components
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

  const TabButton = React.memo(({ id, label, isActive, onClick }) => (
    <button
      className={`tab-button ${isActive ? 'tab-button--active' : ''}`}
      onClick={() => onClick(id)}
    >
      {label}
    </button>
  ));

  const EmptyState = React.memo(({ icon, title, description, actionText, actionLink }) => (
    <div className="empty-state">
      <i className={`fas fa-${icon} empty-state__icon`}></i>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__description">{description}</p>
      {actionText && actionLink && (
        <Link to={actionLink} className="empty-state__action">
          {actionText}
        </Link>
      )}
    </div>
  ));

  const CircularProgressBar = React.memo(({ percentage }) => (
    <div className="circular-progress">
      <svg viewBox="0 0 36 36" className="circular-progress-svg">
        <path
          className="circular-progress-bg"
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className="circular-progress-fill"
          strokeDasharray={`${percentage}, 100`}
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <text x="18" y="20.35" className="circular-progress-text">
          {percentage}%
        </text>
      </svg>
    </div>
  ));

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

      {/* Main Content */}
      <main className="main-content">
        <nav className="tab-nav">
          <TabButton
            id="overview"
            label="Overview"
            isActive={activeTab === 'overview'}
            onClick={setActiveTab}
          />
          <TabButton
            id="continue"
            label="Continue Learning"
            isActive={activeTab === 'continue'}
            onClick={setActiveTab}
          />
          <TabButton
            id="progress"
            label="Progress"
            isActive={activeTab === 'progress'}
            onClick={setActiveTab}
          />
          <TabButton
            id="recommended"
            label="Recommended"
            isActive={activeTab === 'recommended'}
            onClick={setActiveTab}
          />
        </nav>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-grid">
              {/* Recent Activity */}
              <div className="content-card">
                <h3 className="content-card__title">Recent Activity</h3>
                
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
                  <EmptyState
                    icon="clock"
                    title="No recent activity"
                    description="Start learning to see your activity here"
                    actionText="Browse Courses"
                    actionLink="/courses"
                  />
                )}
              </div>
              
              {/* Learning Overview */}
              <div className="content-card">
                <h3 className="content-card__title">Learning Overview</h3>
                
                <div className="quick-stats">
                  <div className="quick-stat">
                    <span className="quick-stat__value quick-stat__value--green">
                      {Math.round((stats.completedCourses / (stats.totalCourses || 1)) * 100)}%
                    </span>
                    <span className="quick-stat__label">Completion Rate</span>
                  </div>
                  <div className="quick-stat">
                    <span className="quick-stat__value quick-stat__value--purple">
                      {stats.totalHoursLearned}
                    </span>
                    <span className="quick-stat__label">Hours This Month</span>
                  </div>
                  <div className="quick-stat">
                    <span className="quick-stat__value quick-stat__value--orange">
                      {enrolledCourses.filter(c => {
                        const courseId = c._id || c.id;
                        return getProgressPercentage(courseId, c.lessons?.length) > 0;
                      }).length}
                    </span>
                    <span className="quick-stat__label">Active Courses</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'continue' && (
            <div>
              {enrolledCourses.filter(course => {
                const courseId = course._id || course.id;
                const progressPercentage = getProgressPercentage(courseId, course.lessons?.length);
                return progressPercentage > 0 && progressPercentage < 100;
              }).length > 0 ? (
                <div className="course-grid">
                  {enrolledCourses
                    .filter(course => {
                      const courseId = course._id || course.id;
                      const progressPercentage = getProgressPercentage(courseId, course.lessons?.length);
                      return progressPercentage > 0 && progressPercentage < 100;
                    })
                    .map(course => {
                      const courseId = course._id || course.id;
                      const progressPercentage = getProgressPercentage(courseId, course.lessons?.length);
                      return (
                        <div key={courseId} className="course-card">
                          <img 
                            src={course.thumbnail || '/placeholder-course.jpg'} 
                            alt={course.title}
                            className="course-image"
                            loading="lazy"
                          />
                          <div className="course-content">
                            <h4 className="course-title">{course.title}</h4>
                            <p className="course-instructor">By {course.instructor?.name || course.instructor?.firstName || 'Unknown Instructor'}</p>
                            
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
                            
                            <Link 
                              to={`/courses/${courseId}`}
                              className="course-action"
                            >
                              Continue Learning
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <EmptyState
                  icon="book-open"
                  title="No courses in progress"
                  description="Start learning something new today!"
                  actionText="Browse Courses"
                  actionLink="/courses"
                />
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <div>
              <h3 className="section-title">Learning Progress Overview</h3>
              
              {enrolledCourses.length > 0 ? (
                <div className="progress-list">
                  {enrolledCourses.map(course => {
                    const courseId = course._id || course.id;
                    const progressPercentage = getProgressPercentage(courseId, course.lessons?.length);
                    const completedLessons = progress[courseId]?.completedLessons?.length || 0;
                    const totalLessons = course.lessons?.length || 0;
                    
                    return (
                      <div key={courseId} className="progress-item">
                        <div className="circular-progress">
                          <CircularProgressBar percentage={progressPercentage} />
                        </div>
                        
                        <div className="progress-details">
                          <h4 className="progress-course-title">{course.title}</h4>
                          <p className="progress-lesson-count">
                            {completedLessons} of {totalLessons} lessons completed
                          </p>
                          
                          <Link 
                            to={`/courses/${courseId}`} 
                            className="progress-link"
                          >
                            {progressPercentage === 0 ? 'Start Course' : progressPercentage === 100 ? 'Review' : 'Continue'}
                            <i className="fas fa-arrow-right"></i>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon="chart-line"
                  title="No courses enrolled"
                  description="Enroll in courses to track your progress"
                  actionText="Explore Courses"
                  actionLink="/courses"
                />
              )}
            </div>
          )}

          {activeTab === 'recommended' && (
            <div>
              <h3 className="section-title">Recommended for You</h3>
              
              {recommendedCourses.length > 0 ? (
                <div className="course-grid">
                  {recommendedCourses.map(course => {
                    const courseId = course._id || course.id;
                    return (
                      <div key={courseId} className="course-card">
                        <img 
                          src={course.thumbnail || '/placeholder-course.jpg'} 
                          alt={course.title}
                          className="course-image"
                          loading="lazy"
                        />
                        <div className="course-content">
                          <h4 className="course-title">{course.title}</h4>
                          <p className="course-instructor">By {course.instructor?.name || course.instructor?.firstName || 'Unknown Instructor'}</p>
                          
                          <div className="course-meta">
                            <div className="course-rating">
                              <span className="star">★</span>
                              <span>{course.rating || '4.5'}</span>
                            </div>
                            <span className="course-price">
                              ${course.price || '99'}
                            </span>
                          </div>
                          
                          <Link 
                            to={`/courses/${courseId}`}
                            className="course-action"
                          >
                            View Course
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon="lightbulb"
                  title="No recommendations yet"
                  description="Complete some courses to get personalized recommendations"
                  actionText="Explore All Courses"
                  actionLink="/courses"
                />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2 className="quick-actions__title">Quick Actions</h2>
        
        <div className="quick-actions__grid">
          <Link to="/courses" className="quick-action quick-action--blue">
            <div className="quick-action__icon">
              <i className="fas fa-search"></i>
            </div>
            <h3 className="quick-action__title">Browse Courses</h3>
            <p className="quick-action__description">Discover new courses to expand your skills</p>
          </Link>
          
          <Link to="/my-learning" className="quick-action quick-action--green">
            <div className="quick-action__icon">
              <i className="fas fa-book"></i>
            </div>
            <h3 className="quick-action__title">My Learning</h3>
            <p className="quick-action__description">View all your enrolled courses</p>
          </Link>
          
          <Link to="/profile" className="quick-action quick-action--purple">
            <div className="quick-action__icon">
              <i className="fas fa-user"></i>
            </div>
            <h3 className="quick-action__title">Profile</h3>
            <p className="quick-action__description">Update your profile and preferences</p>
          </Link>
          
          <Link to="/certificates" className="quick-action quick-action--orange">
            <div className="quick-action__icon">
              <i className="fas fa-trophy"></i>
            </div>
            <h3 className="quick-action__title">Certificates</h3>
            <p className="quick-action__description">View your earned certificates</p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;