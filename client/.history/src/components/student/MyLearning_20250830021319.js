import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useApiRequest } from '../../hooks/useApi';
import ProgressBar from './ProgressBar';
import SearchBar from '../common/SearchBar';
import CourseFilters from '../common/CourseFilters';
import Loading from '../common/Loading';
import '../../styles/dashboards/MyLearning.css';

const MyLearning = () => {
  const { user, getToken } = useAuth();
  const { theme } = useTheme();
  const { get, loading, error: apiError } = useApiRequest();
  
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading_, setLoading_] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Fetch enrolled courses from backend
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user) return;
      
      console.log('🎓 Fetching enrolled courses for user:', user.id);
      setLoading_(true);
      setError(null);
      
      try {
        // Use the correct student endpoint
        const response = await get('/student/courses');
        console.log('📚 Student courses API response:', response);
        
        if (response.success && response.data) {
          const courses = response.data.courses || [];
          console.log('✅ Successfully fetched enrolled courses:', courses.length);
          
          // Transform courses to match frontend expectations
          const transformedCourses = courses.map(course => {
            // Handle different possible course structures
            const courseData = course.course || course;
            
            return {
              id: courseData._id || courseData.id,
              _id: courseData._id || courseData.id,
              title: courseData.title || 'Untitled Course',
              description: courseData.description || '',
              thumbnail: courseData.thumbnail?.url || courseData.thumbnail || '/placeholder-course.jpg',
              instructor: {
                name: courseData.instructor?.name || 
                      `${courseData.instructor?.firstName || ''} ${courseData.instructor?.lastName || ''}`.trim() ||
                      'Unknown Instructor',
                avatar: courseData.instructor?.avatar || courseData.instructor?.profile?.avatar
              },
              category: courseData.category,
              level: courseData.level || 'Beginner',
              duration: courseData.estimatedHours || 1,
              averageRating: courseData.averageRating || 4.5,
              // Enrollment info
              enrollmentDate: course.enrolledAt || course.enrollmentDate || new Date(),
              // Course structure info
              lessons: courseData.lessons || courseData.sections?.reduce((acc, section) => {
                return acc.concat(section.lessons || []);
              }, []) || [],
              sections: courseData.sections || []
            };
          });
          
          setEnrolledCourses(transformedCourses);
          
          // Fetch progress for each course
          if (transformedCourses.length > 0) {
            await fetchProgressForCourses(transformedCourses);
          }
          
        } else {
          console.log('📝 No enrolled courses found or empty response');
          setEnrolledCourses([]);
        }
        
      } catch (fetchError) {
        console.error('❌ Error fetching enrolled courses:', fetchError);
        setError('Failed to load your courses. Please try refreshing the page.');
        setEnrolledCourses([]);
      } finally {
        setLoading_(false);
      }
    };

    fetchEnrolledCourses();
  }, [user, get]);

  // Fetch progress for each enrolled course
  const fetchProgressForCourses = async (courses) => {
    if (!courses.length) return;
    
    console.log('📊 Fetching progress for courses...');
    const progressData = {};
    
    // Fetch progress for each course
    for (const course of courses) {
      try {
        const response = await get(`/student/courses/${course.id}/progress`);
        
        if (response.success && response.data) {
          progressData[course.id] = {
            completedLessons: response.data.progress?.completedVideos || [],
            overallPercentage: response.data.progress?.completionPercentage || 0,
            lastAccessed: response.data.progress?.lastAccessed || course.enrollmentDate,
            timeSpent: response.data.progress?.timeSpent || 0
          };
        } else {
          // Default progress if not found
          progressData[course.id] = {
            completedLessons: [],
            overallPercentage: 0,
            lastAccessed: course.enrollmentDate,
            timeSpent: 0
          };
        }
      } catch (progressError) {
        console.warn(`⚠️ Could not fetch progress for course ${course.id}:`, progressError);
        // Set default progress
        progressData[course.id] = {
          completedLessons: [],
          overallPercentage: 0,
          lastAccessed: course.enrollmentDate,
          timeSpent: 0
        };
      }
    }
    
    console.log('✅ Progress data fetched:', Object.keys(progressData).length, 'courses');
    setProgress(progressData);
  };

  // Memoized course data with filtering and progress calculation
  const courseData = useMemo(() => {
    if (!enrolledCourses.length) return { filtered: [], stats: { totalCourses: 0, coursesStarted: 0, coursesCompleted: 0, totalLessons: 0 } };

    // Pre-calculate progress for all courses
    const coursesWithProgress = enrolledCourses.map(course => {
      const totalLessons = course.lessons?.length || 0;
      const courseProgress = progress[course.id] || {};
      const completedCount = courseProgress.completedLessons?.length || 0;
      const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
      
      let status;
      if (progressPercentage === 0) status = 'Not Started';
      else if (progressPercentage === 100) status = 'Completed';
      else status = 'In Progress';

      return {
        ...course,
        totalLessons,
        completedCount,
        progressPercentage,
        status,
        lastAccessed: courseProgress.lastAccessed || course.enrollmentDate,
        timeSpent: courseProgress.timeSpent || 0
      };
    });

    // Apply search filter
    let filtered = coursesWithProgress;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchLower) ||
        course.instructor.name.toLowerCase().includes(searchLower) ||
        course.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
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

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All Courses' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'not-started', label: 'Not Started' }
  ];

  // Loading state
  if (loading_ || loading) {
    return <Loading message="Loading your courses..." />;
  }

  // Error state
  if (error || apiError) {
    return (
      <div className="my-learning-error">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h3>Unable to Load Courses</h3>
          <p>{error || apiError?.message || 'Something went wrong while loading your courses.'}</p>
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

  const { filtered: filteredCourses, stats } = courseData;
  const themeClass = theme === 'dark' ? 'dark-theme' : '';

  return (
    <div className={`my-learning ${themeClass}`}>
      {/* Header */}
      <div className="my-learning-header">
        <h1>My Learning</h1>
        <p>Continue your learning journey</p>
      </div>

      {/* Controls */}
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

      {/* Stats */}
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

      {/* Courses Grid */}
      <div className="courses-grid">
        {filteredCourses.length === 0 ? (
          <div className="no-courses">
            <div className="no-courses-icon">📚</div>
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
                <img 
                  src={course.thumbnail} 
                  alt={course.title} 
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = '/placeholder-course.jpg';
                  }}
                />
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
                    to={`/student/course/${course.id}/progress`}
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
          <p>Keep up the great work!</p>
        </div>
      )}
    </div>
  );
};

export default MyLearning;