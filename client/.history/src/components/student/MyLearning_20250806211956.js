import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import useProgress from '../../hooks/useProgress';
import ProgressBar from './ProgressBar';
import SearchBar from '../common/SearchBar';
import CourseFilters from '../common/CourseFilters';
import Loading from '../common/Loading';
import '../../styles/dashboards/MyLearning.css';

const MyLearning = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { getUserCourses, progress } = useProgress();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Fetch courses only once
  useEffect(() => {
    if (!user) return;
    
    const fetchEnrolledCourses = async () => {
      try {
        const courses = await getUserCourses(user.id);
        setEnrolledCourses(courses);
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [user?.id]); // Only depend on user.id

  // Single memoized computation for everything
  const courseData = useMemo(() => {
    if (!enrolledCourses.length) return { filtered: [], stats: { totalCourses: 0, coursesStarted: 0, coursesCompleted: 0, totalLessons: 0 } };

    // Pre-calculate progress for all courses
    const coursesWithProgress = enrolledCourses.map(course => {
      const totalLessons = course.lessons?.length || 0;
      const completedCount = progress[course.id]?.completedLessons?.length || 0;
      const progressPercentage = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;
      
      let status;
      if (progressPercentage === 0) status = 'Not Started';
      else if (progressPercentage === 100) status = 'Completed';
      else status = 'In Progress';

      return {
        ...course,
        totalLessons,
        completedCount,
        progressPercentage,
        status
      };
    });

    // Apply filters
    let filtered = coursesWithProgress;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchLower) ||
        course.instructor.name.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(course => {
        switch (filterType) {
          case 'in-progress': return course.progressPercentage > 0 && course.progressPercentage < 100;
          case 'completed': return course.progressPercentage === 100;
          case 'not-started': return course.progressPercentage === 0;
          default: return true;
        }
      });
    }

    // Calculate stats
    const stats = {
      totalCourses: coursesWithProgress.length,
      coursesStarted: coursesWithProgress.filter(c => c.progressPercentage > 0).length,
      coursesCompleted: coursesWithProgress.filter(c => c.progressPercentage === 100).length,
      totalLessons: coursesWithProgress.reduce((sum, c) => sum + c.totalLessons, 0)
    };

    return { filtered, stats };
  }, [enrolledCourses, progress, searchTerm, filterType]);

  // Static filter options
  const filterOptions = [
    { value: 'all', label: 'All Courses' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'not-started', label: 'Not Started' }
  ];

  if (loading) return <Loading />;

  const { filtered: filteredCourses, stats } = courseData;
  const themeClass = theme === 'dark' ? 'dark-theme' : '';

  return (
    <div className={`my-learning ${themeClass}`}>
      <div className="my-learning-header">
        <h1>My Learning</h1>
        <p>Continue your learning journey</p>
      </div>

      <div className="my-learning-controls">
        <SearchBar
          placeholder="Search your courses..."
          value={searchTerm}
          onChange={setSearchTerm}
        />
        <CourseFilters
          filters={filterOptions}
          activeFilter={filterType}
          onFilterChange={setFilterType}
        />
      </div>

      <div className="my-learning-stats">
        <div className="stat-card">
          <h3>{stats.totalCourses}</h3>
          <p>Total Courses</p>
        </div>
        <div className="stat-card">
          <h3>{stats.coursesStarted}</h3>
          <p>Courses Started</p>
        </div>
        <div className="stat-card">
          <h3>{stats.coursesCompleted}</h3>
          <p>Courses Completed</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalLessons}</h3>
          <p>Total Lessons</p>
        </div>
      </div>

      <div className="courses-grid">
        {filteredCourses.length === 0 ? (
          <div className="no-courses">
            <h3>No courses found</h3>
            <p>
              {enrolledCourses.length === 0 
                ? "You haven't enrolled in any courses yet."
                : "No courses match your current filters."
              }
            </p>
            {enrolledCourses.length === 0 && (
              <Link to="/courses" className="btn btn-primary">
                Browse Courses
              </Link>
            )}
          </div>
        ) : (
          filteredCourses.map(course => (
            <div key={course.id} className="course-card">
              <div className="course-image">
                <img src={course.thumbnail} alt={course.title} loading="lazy" />
                <div className="course-status">
                  <span className={`status-badge ${course.status.toLowerCase().replace(' ', '-')}`}>
                    {course.status}
                  </span>
                </div>
              </div>
              
              <div className="course-content">
                <h3>{course.title}</h3>
                <p className="instructor">By {course.instructor?.name}</p>
                
                <ProgressBar
                  completed={course.completedCount}
                  total={course.totalLessons}
                  showPercentage={true}
                />
                
                <div className="course-info">
                  <span>{course.totalLessons} lessons</span>
                  <span>{course.duration} hours</span>
                  <span>{course.level}</span>
                </div>
                
                <div className="course-actions">
                  <Link 
                    to={`/course-progress/${course.id}`}
                    className="btn btn-primary"
                  >
                    {course.progressPercentage === 0 ? 'Start Course' : 'Continue Learning'}
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {filteredCourses.length > 0 && (
        <div className="my-learning-footer">
          <p>Keep up the great work! 🎉</p>
        </div>
      )}
    </div>
  );
};

export default MyLearning;