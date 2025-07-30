import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useProgress from '../../hooks/useProgress';
import useCourses from '../../hooks/useCourses';
import ProgressBar, { CircularProgressBar } from './ProgressBar';
import Loading from '../common/Loading';
import '../../styles/dashboards/StudentDashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { getUserCourses, progress } = useProgress();
  const { getRecommendedCourses } = useCourses();
  
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
  const [activeTab, setActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Theme toggle
  const toggleTheme = useCallback(() => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  }, [isDarkMode]);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const isDark = savedTheme === 'dark';
    setIsDarkMode(isDark);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Memoized stats calculation
  const processedStats = useMemo(() => {
    const totalCourses = enrolledCourses.length;
    const completedCourses = enrolledCourses.filter(course => {
      const courseProgress = progress[course.id];
      const totalLessons = course.lessons?.length || 0;
      const completedLessons = courseProgress?.completedLessons?.length || 0;
      return totalLessons > 0 && completedLessons === totalLessons;
    }).length;

    const inProgressCourses = enrolledCourses.filter(course => {
      const courseProgress = progress[course.id];
      const completedLessons = courseProgress?.completedLessons?.length || 0;
      return completedLessons > 0 && completedLessons < (course.lessons?.length || 0);
    }).length;

    const totalHoursLearned = enrolledCourses.reduce((total, course) => {
      const courseProgress = progress[course.id];
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

  const generateRecentActivity = useCallback((courses, progressData) => {
    const activities = [];
    
    courses.forEach(course => {
      const courseProgress = progressData[course.id];
      if (courseProgress?.lastAccessed) {
        activities.push({
          id: `access-${course.id}`,
          type: 'course_access',
          courseTitle: course.title,
          courseId: course.id,
          timestamp: courseProgress.lastAccessed,
          description: `Continued learning ${course.title}`
        });
      }

      if (courseProgress?.completedLessons) {
        courseProgress.completedLessons.forEach((lessonId, index) => {
          const lesson = course.lessons?.find(l => l.id === lessonId);
          if (lesson) {
            activities.push({
              id: `lesson-${lessonId}`,
              type: 'lesson_completed',
              courseTitle: course.title,
              courseId: course.id,
              lessonTitle: lesson.title,
              timestamp: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
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

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        const [courses, recommended] = await Promise.all([
          getUserCourses(user.id),
          getRecommendedCourses(user.id)
        ]);

        setEnrolledCourses(courses);
        setRecommendedCourses(recommended);
        
        const activity = generateRecentActivity(courses, progress);
        setRecentActivity(activity);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, getUserCourses, getRecommendedCourses, progress, generateRecentActivity]);

  useEffect(() => {
    setStats(processedStats);
  }, [processedStats]);

  const getProgressPercentage = useCallback((courseId, totalLessons) => {
    const courseProgress = progress[courseId];
    if (!courseProgress || !totalLessons) return 0;
    return Math.round((courseProgress.completedLessons.length / totalLessons) * 100);
  }, [progress]);

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

  if (!user) {
    return <Loading message="Loading user data..." />;
  }

  if (loading) {
    return <Loading message="Loading dashboard..." />;
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
          
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            aria-label="Toggle theme"
          >
            <i className={`fas fa-${isDarkMode ? 'sun' : 'moon'}`}></i>
          </button>
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
                    description=""
                    actionText="Start learning now"
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
                      {enrolledCourses.filter(c => getProgressPercentage(c.id, c.lessons?.length) > 0).length}
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
                const progressPercentage = getProgressPercentage(course.id, course.lessons?.length);
                return progressPercentage > 0 && progressPercentage < 100;
              }).length > 0 ? (
                <div className="course-grid">
                  {enrolledCourses
                    .filter(course => {
                      const progressPercentage = getProgressPercentage(course.id, course.lessons?.length);
                      return progressPercentage > 0 && progressPercentage < 100;
                    })
                    .map(course => {
                      const progressPercentage = getProgressPercentage(course.id, course.lessons?.length);
                      return (
                        <div key={course.id} className="course-card">
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
                              to={`/course-progress/${course.id}`}
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
                    const progressPercentage = getProgressPercentage(course.id, course.lessons?.length);
                    const completedLessons = progress[course.id]?.completedLessons?.length || 0;
                    const totalLessons = course.lessons?.length || 0;
                    
                    return (
                      <div key={course.id} className="progress-item">
                        <div className="circular-progress">
                          <CircularProgressBar percentage={progressPercentage} />
                        </div>
                        
                        <div className="progress-details">
                          <h4 className="progress-course-title">{course.title}</h4>
                          <p className="progress-lesson-count">
                            {completedLessons} of {totalLessons} lessons completed
                          </p>
                          
                          <Link 
                            to={`/course-progress/${course.id}`} 
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
                  {recommendedCourses.map(course => (
                    <div key={course.id} className="course-card">
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
                            <span>{course.rating || '4.5'}</span>
                          </div>
                          <span className="course-price">
                            ${course.price || '99'}
                          </span>
                        </div>
                        
                        <Link 
                          to={`/courses/${course.id}`}
                          className="course-action"
                        >
                          View Course
                        </Link>
                      </div>
                    </div>
                  ))}
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