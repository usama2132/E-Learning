import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [courses, recommended] = await Promise.all([
          getUserCourses(user.id),
          getRecommendedCourses(user.id)
        ]);

        setEnrolledCourses(courses);
        setRecommendedCourses(recommended);
        
        // Calculate stats
        const totalCourses = courses.length;
        const completedCourses = courses.filter(course => {
          const courseProgress = progress[course.id];
          const totalLessons = course.lessons?.length || 0;
          const completedLessons = courseProgress?.completedLessons?.length || 0;
          return totalLessons > 0 && completedLessons === totalLessons;
        }).length;

        const inProgressCourses = courses.filter(course => {
          const courseProgress = progress[course.id];
          const completedLessons = courseProgress?.completedLessons?.length || 0;
          return completedLessons > 0 && completedLessons < (course.lessons?.length || 0);
        }).length;

        const totalHoursLearned = courses.reduce((total, course) => {
          const courseProgress = progress[course.id];
          const completedLessons = courseProgress?.completedLessons?.length || 0;
          return total + (completedLessons * (course.avgLessonDuration || 20) / 60);
        }, 0);

        setStats({
          totalCourses,
          completedCourses,
          inProgressCourses,
          totalHoursLearned: Math.round(totalHoursLearned)
        });

        // Generate recent activity
        const activity = generateRecentActivity(courses, progress);
        setRecentActivity(activity);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user, getUserCourses, getRecommendedCourses, progress]);

  const generateRecentActivity = (courses, progressData) => {
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
  };

  const getProgressPercentage = (courseId, totalLessons) => {
    const courseProgress = progress[courseId];
    if (!courseProgress || !totalLessons) return 0;
    return Math.round((courseProgress.completedLessons.length / totalLessons) * 100);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - new Date(date)) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.firstName || user?.name}!</h1>
        <p>Continue your learning journey</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>{stats.totalCourses}</h3>
            <p>Enrolled Courses</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completedCourses}</h3>
            <p>Completed</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <h3>{stats.inProgressCourses}</h3>
            <p>In Progress</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <h3>{stats.totalHoursLearned}</h3>
            <p>Hours Learned</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Continue Learning */}
        <div className="dashboard-section continue-learning">
          <div className="section-header">
            <h2>Continue Learning</h2>
            <Link to="/my-learning" className="see-all">See all</Link>
          </div>
          
          <div className="courses-list">
            {enrolledCourses
              .filter(course => {
                const progressPercentage = getProgressPercentage(course.id, course.lessons?.length);
                return progressPercentage > 0 && progressPercentage < 100;
              })
              .slice(0, 3)
              .map(course => {
                const progressPercentage = getProgressPercentage(course.id, course.lessons?.length);
                return (
                  <div key={course.id} className="course-item">
                    <img src={course.thumbnail} alt={course.title} />
                    <div className="course-info">
                      <h4>{course.title}</h4>
                      <p>By {course.instructor?.name}</p>
                      <ProgressBar
                        completed={progress[course.id]?.completedLessons?.length || 0}
                        total={course.lessons?.length || 0}
                        showPercentage
                      />
                    </div>
                    <Link 
                      to={`/course-progress/${course.id}`}
                      className="continue-btn"
                    >
                      Continue
                    </Link>
                  </div>
                );
              })}
            
            {enrolledCourses.filter(course => {
              const progressPercentage = getProgressPercentage(course.id, course.lessons?.length);
              return progressPercentage > 0 && progressPercentage < 100;
            }).length === 0 && (
              <div className="empty-state">
                <p>No courses in progress</p>
                <Link to="/courses" className="btn btn-primary">
                  Browse Courses
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-section recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {recentActivity.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className={`activity-icon ${activity.type}`}>
                  {activity.type === 'lesson_completed' ? '✓' : '📖'}
                </div>
                <div className="activity-content">
                  <p>{activity.description}</p>
                  <span className="activity-time">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            
            {recentActivity.length === 0 && (
              <div className="empty-activity">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="dashboard-section progress-overview">
        <h2>Learning Progress Overview</h2>
        <div className="progress-grid">
          {enrolledCourses.slice(0, 6).map(course => {
            const progressPercentage = getProgressPercentage(course.id, course.lessons?.length);
            return (
              <div key={course.id} className="progress-item">
                <CircularProgressBar
                  completed={progress[course.id]?.completedLessons?.length || 0}
                  total={course.lessons?.length || 0}
                  size={60}
                />
                <div className="progress-details">
                  <h4>{course.title}</h4>
                  <p>{progressPercentage}% Complete</p>
                  <Link to={`/course-progress/${course.id}`} className="progress-link">
                    {progressPercentage === 0 ? 'Start' : 'Continue'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Courses */}
      {recommendedCourses.length > 0 && (
        <div className="dashboard-section recommended-courses">
          <div className="section-header">
            <h2>Recommended for You</h2>
            <Link to="/courses" className="see-all">See all</Link>
          </div>
          
          <div className="courses-grid">
            {recommendedCourses.slice(0, 4).map(course => (
              <div key={course.id} className="course-card">
                <img src={course.thumbnail} alt={course.title} />
                <div className="course-content">
                  <h4>{course.title}</h4>
                  <p>By {course.instructor?.name}</p>
                  <div className="course-meta">
                    <span>{course.rating} ⭐</span>
                    <span>${course.price}</span>
                  </div>
                  <Link to={`/courses/${course.id}`} className="view-course">
                    View Course
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="dashboard-section quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/courses" className="action-card">
            <div className="action-icon">🔍</div>
            <h3>Browse Courses</h3>
            <p>Discover new courses to expand your skills</p>
          </Link>
          
          <Link to="/my-learning" className="action-card">
            <div className="action-icon">📚</div>
            <h3>My Learning</h3>
            <p>View all your enrolled courses</p>
          </Link>
          
          <Link to="/profile" className="action-card">
            <div className="action-icon">👤</div>
            <h3>Profile</h3>
            <p>Update your profile and preferences</p>
          </Link>
          
          <Link to="/certificates" className="action-card">
            <div className="action-icon">🏆</div>
            <h3>Certificates</h3>
            <p>View your earned certificates</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;