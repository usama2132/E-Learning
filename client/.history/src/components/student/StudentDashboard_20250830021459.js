import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useApiRequest } from '../../hooks/useApi';
import Loading from '../common/Loading';
import '../../styles/dashboards/StudentDashboard.css';

const StudentDashboard = () => {
  const { user, getToken } = useAuth();
  const { get, loading, error: apiError } = useApiRequest();
  
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
  const [loading_, setLoading_] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch enrolled courses from backend
  const fetchEnrolledCourses = useCallback(async () => {
    try {
      console.log('Fetching enrolled courses for user:', user.id);
      
      const response = await get('/student/courses');
      
      if (response.success && response.data) {
        const courses = response.data.courses || [];
        console.log('Successfully fetched enrolled courses:', courses.length);
        
        // Transform courses to match expected structure
        const transformedCourses = courses.map(course => {
          const courseData = course.course || course;
          return {
            _id: courseData._id || courseData.id,
            id: courseData._id || courseData.id,
            title: courseData.title || 'Untitled Course',
            description: courseData.description || '',
            shortDescription: courseData.shortDescription || courseData.description?.substring(0, 150) || '',
            thumbnail: courseData.thumbnail?.url || courseData.thumbnail || '/placeholder-course.jpg',
            instructor: {
              _id: courseData.instructor?._id || courseData.instructor?.id,
              name: courseData.instructor?.name || 
                    `${courseData.instructor?.firstName || ''} ${courseData.instructor?.lastName || ''}`.trim() ||
                    'Unknown Instructor',
              firstName: courseData.instructor?.firstName || 'Unknown',
              lastName: courseData.instructor?.lastName || 'Instructor',
              avatar: courseData.instructor?.avatar || courseData.instructor?.profile?.avatar
            },
            category: courseData.category,
            level: courseData.level || 'Beginner',
            price: courseData.price || 0,
            averageRating: courseData.averageRating || 4.5,
            totalReviews: courseData.totalReviews || 0,
            totalEnrollments: courseData.totalEnrollments || 0,
            estimatedHours: courseData.estimatedHours || 1,
            avgLessonDuration: courseData.avgLessonDuration || 20,
            // Course structure
            lessons: courseData.lessons || courseData.sections?.reduce((acc, section) => {
              return acc.concat(section.lessons || []);
            }, []) || [],
            sections: courseData.sections || [],
            // Enrollment info
            enrollmentDate: course.enrolledAt || course.enrollmentDate || new Date(),
            status: course.status || 'active'
          };
        });
        
        return transformedCourses;
      }
      return [];
    } catch (fetchError) {
      console.error('Error fetching enrolled courses:', fetchError);
      return [];
    }
  }, [get, user.id]);

  // Fetch progress for courses
  const fetchProgress = useCallback(async (courseIds) => {
    if (!courseIds.length) return {};
    
    try {
      const progressPromises = courseIds.map(async (courseId) => {
        try {
          const response = await get(`/student/courses/${courseId}/progress`);
          
          if (response.success && response.data && response.data.progress) {
            return { 
              courseId, 
              progress: {
                completedLessons: response.data.progress.completedVideos || [],
                overallPercentage: response.data.progress.completionPercentage || 0,
                lastAccessed: response.data.progress.lastAccessed || new Date(),
                timeSpent: response.data.progress.timeSpent || 0
              }
            };
          }
          return { 
            courseId, 
            progress: { 
              completedLessons: [], 
              overallPercentage: 0,
              lastAccessed: new Date(),
              timeSpent: 0
            } 
          };
        } catch (error) {
          console.warn(`Could not fetch progress for course ${courseId}:`, error);
          return { 
            courseId, 
            progress: { 
              completedLessons: [], 
              overallPercentage: 0,
              lastAccessed: new Date(),
              timeSpent: 0
            } 
          };
        }
      });

      const results = await Promise.all(progressPromises);
      const progressMap = {};
      results.forEach(({ courseId, progress }) => {
        progressMap[courseId] = progress;
      });
      
      return progressMap;
    } catch (error) {
      console.error('Error fetching progress:', error);
      return {};
    }
  }, [get]);

  // Fetch recommended courses
  const fetchRecommendedCourses = useCallback(async () => {
    try {
      const response = await get('/courses/featured');
      
      if (response.success && response.data) {
        const courses = response.data.courses?.slice(0, 4) || [];
        
        return courses.map(course => ({
          _id: course._id || course.id,
          id: course._id || course.id,
          title: course.title || 'Untitled Course',
          description: course.description || '',
          thumbnail: course.thumbnail?.url || course.thumbnail || '/placeholder-course.jpg',
          instructor: {
            name: course.instructor?.name || 
                  `${course.instructor?.firstName || ''} ${course.instructor?.lastName || ''}`.trim() ||
                  'Unknown Instructor',
            firstName: course.instructor?.firstName || 'Unknown',
            lastName: course.instructor?.lastName || 'Instructor'
          },
          price: course.price || 0,
          averageRating: course.averageRating || 4.5,
          level: course.level || 'Beginner'
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching recommended courses:', error);
      return [];
    }
  }, [get]);

  // Generate recent activity from courses and progress
  const generateRecentActivity = useCallback((courses, progressData) => {
    const activities = [];
    
    courses.forEach(course => {
      const courseProgress = progressData[course._id || course.id];
      if (courseProgress?.lastAccessed) {
        activities.push({
          id: `access-${course._id || course.id}`,
          type: 'course_access',
          courseTitle: course.title,
          courseId: course._id || course.id,
          timestamp: courseProgress.lastAccessed,
          description: `Continued learning ${course.title}`
        });
      }

      if (courseProgress?.completedLessons && courseProgress.completedLessons.length > 0) {
        courseProgress.completedLessons.slice(0, 3).forEach((lessonId, index) => {
          const lesson = course.lessons?.find(l => l._id === lessonId || l.id === lessonId);
          if (lesson) {
            activities.push({
              id: `lesson-${lessonId}`,
              type: 'lesson_completed',
              courseTitle: course.title,
              courseId: course._id || course.id,
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
      return courseProgress?.overallPercentage === 100;
    }).length;

    const inProgressCourses = enrolledCourses.filter(course => {
      const courseId = course._id || course.id;
      const courseProgress = progress[courseId];
      const percentage = courseProgress?.overallPercentage || 0;
      return percentage > 0 && percentage < 100;
    }).length;

    const totalHoursLearned = enrolledCourses.reduce((total, course) => {
      const courseId = course._id || course.id;
      const courseProgress = progress[courseId];
      const timeSpentMinutes = courseProgress?.timeSpent || 0;
      return total + (timeSpentMinutes / 60);
    }, 0);

    return {
      totalCourses,
      completedCourses,
      inProgressCourses,
      totalHoursLearned: Math.round(totalHoursLearned)
    };
  }, [enrolledCourses, progress]);

  // Get progress percentage for a course
  const getProgressPercentage = useCallback((courseId) => {
    const courseProgress = progress[courseId];
    return courseProgress?.overallPercentage || 0;
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

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      setLoading_(true);
      setError(null);
      
      try {
        console.log('Fetching student dashboard data...');
        
        // Fetch enrolled courses
        const courses = await fetchEnrolledCourses();
        setEnrolledCourses(courses);
        console.log('Enrolled courses loaded:', courses.length);

        // Fetch progress for enrolled courses
        if (courses.length > 0) {
          const courseIds = courses.map(course => course._id || course.id);
          const progressData = await fetchProgress(courseIds);
          setProgress(progressData);
          console.log('Progress data loaded for', Object.keys(progressData).length, 'courses');

          // Generate activity
          const activity = generateRecentActivity(courses, progressData);
          setRecentActivity(activity);
        }

        // Fetch recommended courses
        const recommended = await fetchRecommendedCourses();
        setRecommendedCourses(recommended);
        console.log('Recommended courses loaded:', recommended.length);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading_(false);
      }
    };

    fetchDashboardData();
  }, [user, fetchEnrolledCourses, fetchProgress, fetchRecommendedCourses, generateRecentActivity]);

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

  if (loading_ || loading) {
    return <Loading message="Loading dashboard..." />;
  }

  if (error || apiError) {
    return (
      <div className="error-state">
        <div className="error-content">
          <i className="fas fa-exclamation-triangle error-icon"></i>
          <h3>Error Loading Dashboard</h3>
          <p>{error || apiError?.message}</p>
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
          
          <Link to="/student/learning" className="header-button header-button--secondary">
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
                        return getProgressPercentage(courseId) > 0;
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
                const progressPercentage = getProgressPercentage(courseId);
                return progressPercentage > 0 && progressPercentage < 100;
              }).length > 0 ? (
                <div className="course-grid">
                  {enrolledCourses
                    .filter(course => {
                      const courseId = course._id || course.id;
                      const progressPercentage = getProgressPercentage(courseId);
                      return progressPercentage > 0 && progressPercentage < 100;
                    })
                    .map(course => {
                      const courseId = course._id || course.id;
                      const progressPercentage = getProgressPercentage(courseId);
                      return (
                        <div key={courseId} className="course-card">
                          <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="course-image"
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = '/placeholder-course.jpg';
                            }}
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
                              to={`/student/course/${courseId}/progress`}
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
                    const progressPercentage = getProgressPercentage(courseId);
                    const courseProgress = progress[courseId] || {};
                    const completedLessons = courseProgress.completedLessons?.length || 0;
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
                            to={`/student/course/${courseId}/progress`} 
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
                          src={course.thumbnail} 
                          alt={course.title}
                          className="course-image"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = '/placeholder-course.jpg';
                          }}
                        />
                        <div className="course-content">
                          <h4 className="course-title">{course.title}</h4>
                          <p className="course-instructor">By {course.instructor?.name || 'Unknown Instructor'}</p>
                          
                          <div className="course-meta">
                            <div className="course-rating">
                              <span className="star">★</span>
                              <span>{course.averageRating || '4.5'}</span>
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
          
          <Link to="/student/learning" className="quick-action quick-action--green">
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