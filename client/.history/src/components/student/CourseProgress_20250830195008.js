import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Lock, CheckCircle, Clock, FileText, Video } from 'lucide-react';
import Loading from '../common/Loading';
import ProgressBar from './ProgressBar';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../utils/api';
import '../styles/dashboards/CourseProgress.css';

const CourseProgress = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, getToken } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());

  useEffect(() => {
    fetchCourseAndProgress();
  }, [courseId]);

  const fetchCourseAndProgress = async () => {
    if (!courseId) {
      setError('Course ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch course details
      const courseResponse = await api.courses.getCourseById(courseId);
      
      if (!courseResponse.success || !courseResponse.data) {
        throw new Error('Course not found');
      }

      const courseData = courseResponse.data.course || courseResponse.data;
      
      // If course has no content, create mock structure for display
      if (!courseData.sections || courseData.sections.length === 0) {
        courseData.sections = [
          {
            id: 'section-1',
            title: 'Course Introduction',
            description: 'Getting started with this course',
            order: 1,
            lessons: [
              {
                id: 'lesson-1',
                title: 'Welcome to the Course',
                type: 'video',
                duration: 300, // 5 minutes
                order: 1,
                isPreview: true,
                videoUrl: courseData.previewVideo?.url || '',
                description: 'Course overview and what you will learn'
              },
              {
                id: 'lesson-2', 
                title: 'Course Materials',
                type: 'text',
                duration: 120, // 2 minutes
                order: 2,
                description: 'Access your course materials and resources'
              }
            ]
          },
          {
            id: 'section-2',
            title: 'Main Content',
            description: 'Core learning materials',
            order: 2,
            lessons: [
              {
                id: 'lesson-3',
                title: 'Chapter 1: Fundamentals',
                type: 'video',
                duration: 900, // 15 minutes
                order: 1,
                description: 'Learn the fundamental concepts'
              },
              {
                id: 'lesson-4',
                title: 'Practice Exercises',
                type: 'assignment',
                duration: 1800, // 30 minutes
                order: 2,
                description: 'Apply what you have learned'
              }
            ]
          }
        ];
      }

      setCourse(courseData);

      // Fetch progress data
      try {
        const token = getToken();
        if (token) {
          const progressResponse = await fetch(`http://localhost:5000/api/student/course/${courseId}/progress`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            if (progressData.success) {
              setProgress(progressData.data);
              if (progressData.data.completedLessons) {
                setCompletedLessons(new Set(progressData.data.completedLessons));
              }
            }
          }
        }
      } catch (progressError) {
        console.log('Progress fetch failed, using default progress');
        setProgress({
          overallProgress: 0,
          completedLessons: [],
          totalLessons: calculateTotalLessons(courseData),
          timeSpent: 0
        });
      }

    } catch (error) {
      console.error('Error fetching course:', error);
      setError(error.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalLessons = (courseData) => {
    if (!courseData.sections) return 0;
    return courseData.sections.reduce((total, section) => {
      return total + (section.lessons ? section.lessons.length : 0);
    }, 0);
  };

  const calculateProgress = () => {
    const totalLessons = calculateTotalLessons(course);
    if (totalLessons === 0) return 0;
    return Math.round((completedLessons.size / totalLessons) * 100);
  };

  const handleLessonClick = (lesson, sectionIndex, lessonIndex) => {
    if (lesson.type === 'video' && lesson.videoUrl) {
      // Navigate to video player
      navigate(`/student/course/${courseId}/lecture/${lesson.id}`);
    } else {
      // Mark as completed for non-video lessons
      markLessonCompleted(lesson.id);
    }
  };

  const markLessonCompleted = async (lessonId) => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/student/mark-lesson-complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseId,
          lessonId,
          completed: true
        })
      });

      if (response.ok) {
        setCompletedLessons(prev => new Set([...prev, lessonId]));
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0 min';
    const minutes = Math.floor(seconds / 60);
    return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
  };

  const getLessonIcon = (lesson) => {
    if (completedLessons.has(lesson.id)) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    
    switch (lesson.type) {
      case 'video':
        return <Video className="w-5 h-5 text-blue-500" />;
      case 'text':
        return <FileText className="w-5 h-5 text-gray-500" />;
      case 'assignment':
        return <FileText className="w-5 h-5 text-orange-500" />;
      default:
        return <Play className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return <Loading message="Loading course content..." />;
  }

  if (error || !course) {
    return (
      <div className="course-progress-error">
        <div className="error-content">
          <h2>Unable to Load Course</h2>
          <p>{error || 'Course not found'}</p>
          <button 
            onClick={() => navigate('/student/learning')}
            className="btn-primary"
          >
            Back to My Learning
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = calculateProgress();

  return (
    <div className="course-progress-container">
      {/* Course Header */}
      <div className="course-header">
        <div className="course-info">
          <h1 className="course-title">{course.title}</h1>
          <p className="course-instructor">
            by {course.instructor?.name || 'Unknown Instructor'}
          </p>
          <div className="course-meta">
            <span className="meta-item">
              <Clock className="w-4 h-4" />
              {formatDuration(course.totalDuration || 3600)}
            </span>
            <span className="meta-item">
              {calculateTotalLessons(course)} lessons
            </span>
            <span className="meta-item">
              {course.level || 'Beginner'}
            </span>
          </div>
        </div>
        
        <div className="progress-summary">
          <div className="progress-circle">
            <div className="progress-text">
              <span className="progress-percent">{progressPercentage}%</span>
              <span className="progress-label">Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-section">
        <ProgressBar 
          current={completedLessons.size} 
          total={calculateTotalLessons(course)}
          showPercentage={true}
        />
        <p className="progress-stats">
          {completedLessons.size} of {calculateTotalLessons(course)} lessons completed
        </p>
      </div>

      {/* Course Content */}
      <div className="course-content">
        <h2 className="content-title">Course Content</h2>
        
        {course.sections && course.sections.length > 0 ? (
          <div className="sections-list">
            {course.sections.map((section, sectionIndex) => (
              <div key={section.id || sectionIndex} className="section-card">
                <div className="section-header">
                  <h3 className="section-title">{section.title}</h3>
                  {section.description && (
                    <p className="section-description">{section.description}</p>
                  )}
                  <div className="section-meta">
                    {section.lessons?.length || 0} lessons
                  </div>
                </div>
                
                <div className="lessons-list">
                  {(section.lessons || []).map((lesson, lessonIndex) => {
                    const isCompleted = completedLessons.has(lesson.id);
                    const isClickable = lesson.type === 'video' || !isCompleted;
                    
                    return (
                      <div
                        key={lesson.id || lessonIndex}
                        className={`lesson-item ${isCompleted ? 'completed' : ''} ${isClickable ? 'clickable' : ''}`}
                        onClick={() => isClickable ? handleLessonClick(lesson, sectionIndex, lessonIndex) : null}
                      >
                        <div className="lesson-icon">
                          {getLessonIcon(lesson)}
                        </div>
                        
                        <div className="lesson-info">
                          <h4 className="lesson-title">{lesson.title}</h4>
                          {lesson.description && (
                            <p className="lesson-description">{lesson.description}</p>
                          )}
                          <div className="lesson-meta">
                            <span className="lesson-type">
                              {lesson.type === 'video' ? 'Video' : 
                               lesson.type === 'assignment' ? 'Assignment' : 'Reading'}
                            </span>
                            {lesson.duration && (
                              <>
                                <span className="meta-divider">•</span>
                                <span className="lesson-duration">
                                  {formatDuration(lesson.duration)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="lesson-status">
                          {isCompleted ? (
                            <span className="status-completed">Completed</span>
                          ) : (
                            <span className="status-pending">
                              {lesson.type === 'video' ? 'Watch' : 'Start'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-content">
            <div className="no-content-icon">📚</div>
            <h3>Course Content Coming Soon</h3>
            <p>The instructor is still preparing the course materials. Check back soon!</p>
          </div>
        )}
      </div>

      {/* Continue Learning Button */}
      {course.sections && course.sections.length > 0 && (
        <div className="continue-section">
          <button 
            className="continue-btn"
            onClick={() => {
              // Find first incomplete lesson
              for (const section of course.sections) {
                for (const lesson of section.lessons || []) {
                  if (!completedLessons.has(lesson.id)) {
                    handleLessonClick(lesson);
                    return;
                  }
                }
              }
            }}
          >
            {progressPercentage === 100 ? 'Review Course' : 'Continue Learning'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseProgress;