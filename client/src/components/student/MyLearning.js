import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useProgress from '../../hooks/useProgress';
import ProgressBar from './ProgressBar';
import SearchBar from '../common/SearchBar';
import CourseFilters from '../common/CourseFilters';
import Loading from '../common/Loading';
import '../../styles/dashboards/MyLearning.css';

const MyLearning = () => {
  const { user } = useAuth();
  const { getUserCourses, progress } = useProgress();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const courses = await getUserCourses(user.id);
        setEnrolledCourses(courses);
        setFilteredCourses(courses);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchEnrolledCourses();
    }
  }, [user, getUserCourses]);

  useEffect(() => {
    let filtered = enrolledCourses;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(course => {
        const courseProgress = progress[course.id];
        const completionRate = courseProgress ? 
          (courseProgress.completedLessons.length / course.lessons.length) * 100 : 0;

        switch (filterType) {
          case 'in-progress':
            return completionRate > 0 && completionRate < 100;
          case 'completed':
            return completionRate === 100;
          case 'not-started':
            return completionRate === 0;
          default:
            return true;
        }
      });
    }

    setFilteredCourses(filtered);
  }, [searchTerm, filterType, enrolledCourses, progress]);

  const getProgressPercentage = (courseId, totalLessons) => {
    const courseProgress = progress[courseId];
    if (!courseProgress || !totalLessons) return 0;
    return Math.round((courseProgress.completedLessons.length / totalLessons) * 100);
  };

  const getCourseStatus = (progressPercentage) => {
    if (progressPercentage === 0) return 'Not Started';
    if (progressPercentage === 100) return 'Completed';
    return 'In Progress';
  };

  const filterOptions = [
    { value: 'all', label: 'All Courses' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'not-started', label: 'Not Started' }
  ];

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="my-learning">
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
          <h3>{enrolledCourses.length}</h3>
          <p>Total Courses</p>
        </div>
        <div className="stat-card">
          <h3>
            {enrolledCourses.filter(course => 
              getProgressPercentage(course.id, course.lessons?.length) > 0
            ).length}
          </h3>
          <p>Courses Started</p>
        </div>
        <div className="stat-card">
          <h3>
            {enrolledCourses.filter(course => 
              getProgressPercentage(course.id, course.lessons?.length) === 100
            ).length}
          </h3>
          <p>Courses Completed</p>
        </div>
        <div className="stat-card">
          <h3>
            {enrolledCourses.reduce((total, course) => {
              return total + (course.lessons?.length || 0);
            }, 0)}
          </h3>
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
          filteredCourses.map(course => {
            const progressPercentage = getProgressPercentage(course.id, course.lessons?.length);
            const status = getCourseStatus(progressPercentage);
            
            return (
              <div key={course.id} className="course-card">
                <div className="course-image">
                  <img src={course.thumbnail} alt={course.title} />
                  <div className="course-status">
                    <span className={`status-badge ${status.toLowerCase().replace(' ', '-')}`}>
                      {status}
                    </span>
                  </div>
                </div>
                
                <div className="course-content">
                  <h3>{course.title}</h3>
                  <p className="instructor">By {course.instructor?.name}</p>
                  
                  <ProgressBar
                    completed={progress[course.id]?.completedLessons?.length || 0}
                    total={course.lessons?.length || 0}
                    showPercentage={true}
                  />
                  
                  <div className="course-info">
                    <span>{course.lessons?.length || 0} lessons</span>
                    <span>{course.duration} hours</span>
                    <span>{course.level}</span>
                  </div>
                  
                  <div className="course-actions">
                    <Link 
                      to={`/course-progress/${course.id}`}
                      className="btn btn-primary"
                    >
                      {progressPercentage === 0 ? 'Start Course' : 'Continue Learning'}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
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
