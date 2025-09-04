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
        // For 404, return empty data instead of error for dashboard
        return { success: true, data: { courses: [], enrolledCourses: [] } };
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

  // FIXED: Fetch dashboard data using the exact backend endpoint
  const fetchDashboardData = async () => {
    try {
      console.log('📊 Fetching dashboard data for user:', user?.id);
      
      const response = await makeAPIRequest('/student/dashboard');
      
      if (response.success && response.data) {
        const dashboardData = response.data;
        
        // FIXED: Process enrolled courses with proper sections handling
        if (dashboardData.enrolledCourses) {
          const coursesData = dashboardData.enrolledCourses.map(course => ({
            _id: course._id,
            id: course._id,
            title: course.title || "Untitled Course",
            description: course.description || "",
            thumbnail: course.thumbnail || "/placeholder-course.jpg",
            instructor: {
              name: course.instructor?.name || "Unknown Instructor",
              avatar: course.instructor?.avatar
            },
            category: course.category || "General",
            level: course.level || "Beginner",
            price: course.price || 0,
            averageRating: course.averageRating || 0,
            totalReviews: course.totalReviews || 0,
            estimatedHours: course.estimatedHours || 0,
            enrollmentDate: course.enrollmentDate || new Date(),
            status: course.status || "active",
            // FIXED: Properly handle sections structure
            sections: course.sections || [],
            lessons: course.sections?.flatMap(section => section.lessons || []) || [],
            totalLessons: course.sections?.reduce((total, section) => {
              return total + (section.lessons ? section.lessons.length : 0);
            }, 0) || 0,
            progress: course.progress || {
              overallPercentage: 0,
              completedLessons: [],
              totalTimeSpent: 0,
              lastAccessedAt: new Date()
            }
          }));
          
          setEnrolledCourses(coursesData);
        }
        
        // Process recent activity
        if (dashboardData.recentActivity) {
          setRecentActivity(dashboardData.recentActivity);
        }
        
        // Process continue learning courses
        if (dashboardData.contineLearning) {
          // Use continue learning as recommended courses
          setRecommendedCourses(dashboardData.contineLearning);
        }
        
        // Process stats
        if (dashboardData.stats) {
          setStats({
            totalCourses: dashboardData.stats.totalEnrollments || 0,
            completedCourses: dashboardData.stats.completedCourses || 0,
            inProgressCourses: dashboardData.stats.inProgressCourses || 0,
            totalHoursLearned: Math.round((dashboardData.stats.totalTimeSpent || 0) / 60) || 0
          });
        }
        
        console.log('✅ Dashboard data processed successfully');
      }
      
      return response.data || {};
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  };

  // FIXED: Fetch enrolled courses with correct endpoint
  const fetchEnrolledCourses = async () => {
    try {
      console.log('📚 Fetching enrolled courses...');
      
      const response = await makeAPIRequest('/student/enrolled-courses');
      
      if (response.success && response.courses) {
        return response.courses.map(course => ({
          ...course,
          id: course._id || course.id,
          // FIXED: Ensure lessons are properly extracted from sections
          lessons: course.sections?.flatMap(section => section.lessons || []) || course.lessons || [],
          totalLessons: course.totalLessons || course.sections?.reduce((total, section) => {
            return total + (section.lessons ? section.lessons.length : 0);
          }, 0) || 0,
          videos: course.videos || []
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      if (error.message.includes('404') || error.message.includes('No enrolled courses')) {
        return []; 
      }
      throw error; 
    }
  };

  // FIXED: Fetch recommended courses
  const fetchRecommendedCourses = async () => {
    try {
      console.log('🎯 Fetching recommended courses...');
      
      const response = await makeAPIRequest('/courses?limit=4');
      
      if (response.success && response.courses) {
        return response.courses || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching recommended courses:', error);
      return [];
    }
  };

  // FIXED: Fetch student stats
  const fetchStudentStats = async () => {
    try {
      console.log('📈 Fetching student stats...');
      
      const response = await makeAPIRequest('/student/stats');
      
      if (response.success && response.data) {
        return {
          totalCourses: response.data.stats?.totalEnrollments || 0,
          completedCourses: response.data.stats?.completedCourses || 0,
          inProgressCourses: response.data.stats?.inProgressCourses || 0,
          totalHoursLearned: Math.round((response.data.stats?.totalTimeSpent || 0) / 60) || 0
        };
      }
      
      return {
        totalCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        totalHoursLearned: 0
      };
    } catch (error) {
      console.error('Error fetching student stats:', error);
      return {
        totalCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        totalHoursLearned: 0
      };
    }
  };

  // Generate recent activity based on enrolled courses
  const generateRecentActivity = useCallback((courses) => {
    const activities = [];
    
    courses.slice(0, 5).forEach((course) => {
      activities.push({
        id: `access-${course._id}`,
        type: 'course_access',
        courseTitle: course.title,
        courseId: course._id,
        timestamp: course.progress?.lastAccessedAt || course.enrollmentDate || new Date(),
        description: `Continued learning ${course.title}`
      });

      if (course.progress?.completedLessons && course.progress.completedLessons.length > 0) {
        activities.push({
          id: `progress-${course._id}`,
          type: 'lesson_completed',
          courseTitle: course.title,
          courseId: course._id,
          timestamp: course.progress.lastAccessedAt || new Date(),
          description: `Made progress in ${course.title}`
        });
      }
    });

    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  }, []);

  // FIXED: Get progress percentage with proper sections handling
  const getProgressPercentage = useCallback((course) => {
    if (course.progress?.overallPercentage) {
      return Math.round(course.progress.overallPercentage);
    }
    
    // FIXED: Handle sections structure from backend
    let totalLessons = 0;
    if (course.sections && Array.isArray(course.sections)) {
      totalLessons = course.sections.reduce((total, section) => {
        return total + (section.lessons ? section.lessons.length : 0);
      }, 0);
    } else if (course.lessons && Array.isArray(course.lessons)) {
      totalLessons = course.lessons.length;
    } else if (course.totalLessons) {
      totalLessons = course.totalLessons;
    } else {
      totalLessons = course.totalVideos || course.videosCount || 1;
    }
    
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

  // FIXED: Main data fetching function
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id || fetchingRef.current) return;
      
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔄 Loading dashboard data for user:', user.id);
        
        // Try to fetch dashboard data first (contains all info)
        try {
          const dashboardData = await fetchDashboardData();
          if (dashboardData) {
            console.log('✅ Dashboard data loaded successfully');
            
            // If dashboard data is incomplete, fetch individual endpoints
            if (!enrolledCourses.length) {
              const courses = await fetchEnrolledCourses();
              if (courses.length) {
                setEnrolledCourses(courses);
                
                // Generate activity from courses
                const activity = generateRecentActivity(courses);
                setRecentActivity(activity);
              }
            }
            
            // If no recommended courses, fetch them separately
            if (!recommendedCourses.length) {
              const recommended = await fetchRecommendedCourses();
              setRecommendedCourses(recommended);
            }
            
            // If stats are empty, fetch them separately
            if (stats.totalCourses === 0) {
              const studentStats = await fetchStudentStats();
              setStats(studentStats);
            }
          }
        } catch (dashboardError) {
          console.warn('Dashboard endpoint failed, trying individual endpoints:', dashboardError.message);
          
          // Fallback: fetch data from individual endpoints
          const [courses, recommended, studentStats] = await Promise.allSettled([
            fetchEnrolledCourses(),
            fetchRecommendedCourses(),
            fetchStudentStats()
          ]);
          
          if (courses.status === 'fulfilled') {
            setEnrolledCourses(courses.value);
            const activity = generateRecentActivity(courses.value);
            setRecentActivity(activity);
          }
          
          if (recommended.status === 'fulfilled') {
            setRecommendedCourses(recommended.value);
          }
          
          if (studentStats.status === 'fulfilled') {
            setStats(studentStats.value);
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
  }, [user?.id, generateRecentActivity]);

  // Calculate processed stats from data
  const processedStats = useMemo(() => {
    if (stats.totalCourses > 0) {
      return stats;
    }
    
    // Calculate from enrolled courses if stats API failed
    const totalCourses = enrolledCourses.length;
    const completedCourses = enrolledCourses.filter(course => {
      const progressPercentage = getProgressPercentage(course);
      return progressPercentage >= 100;
    }).length;

    const inProgressCourses = enrolledCourses.filter(course => {
      const progressPercentage = getProgressPercentage(course);
      return progressPercentage > 0 && progressPercentage < 100;
    }).length;

    const totalHoursLearned = enrolledCourses.reduce((total, course) => {
      const timeSpent = course.progress?.totalTimeSpent || 0;
      return total + Math.round(timeSpent / 60);
    }, 0);

    return {
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalHoursLearned
    };
  }, [enrolledCourses, stats, getProgressPercentage]);

  // Update stats when processed stats change
  useEffect(() => {
    if (processedStats.totalCourses !== stats.totalCourses) {
      setStats(processedStats);
    }
  }, [processedStats, stats.totalCourses]);

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
                      {enrolledCourses.filter(c => getProgressPercentage(c) > 0).length}
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
                const progressPercentage = getProgressPercentage(course);
                return progressPercentage > 0 && progressPercentage < 100;
              }).length > 0 ? (
                <div className="course-grid">
                  {enrolledCourses
                    .filter(course => {
                      const progressPercentage = getProgressPercentage(course);
                      return progressPercentage > 0 && progressPercentage < 100;
                    })
                    .map(course => {
                      const progressPercentage = getProgressPercentage(course);
                      return (
                        <div key={course._id} className="course-card">
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
                            
                            <Link 
                              to={`/courses/${course._id}`}
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
                    const progressPercentage = getProgressPercentage(course);
                    const completedLessons = course.progress?.completedLessons?.length || 0;
                    const totalLessons = course.lessons?.length || course.totalVideos || 1;
                    
                    return (
                      <div key={course._id} className="progress-item">
                        <div className="circular-progress">
                          <CircularProgressBar percentage={progressPercentage} />
                        </div>
                        
                        <div className="progress-details">
                          <h4 className="progress-course-title">{course.title}</h4>
                          <p className="progress-lesson-count">
                            {completedLessons} of {totalLessons} lessons completed
                          </p>
                          
                          <Link 
                            to={`/courses/${course._id}`} 
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
                          <p className="course-instructor">By {course.instructor?.name || 'Unknown Instructor'}</p>
                          
                          <div className="course-meta">
                            <div className="course-rating">
                              <span className="star">★</span>
                              <span>{course.rating || course.averageRating || '4.5'}</span>
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