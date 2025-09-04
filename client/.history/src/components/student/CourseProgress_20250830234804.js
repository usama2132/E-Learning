import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Lock, CheckCircle, Clock, FileText, Video } from 'lucide-react';
import Loading from '../common/Loading';
import ProgressBar from './ProgressBar';
import { useAuth } from '../../hooks/useAuth';

const CourseProgress = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  
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
      const token = getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // FIXED: Use correct backend endpoint that exists
      const courseResponse = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!courseResponse.ok) {
        throw new Error(`Failed to fetch course: ${courseResponse.status}`);
      }

      const courseData = await courseResponse.json();
      
      if (!courseData.success || !courseData.data) {
        throw new Error('Course not found');
      }

      let courseInfo = courseData.data.course || courseData.data;

      // Ensure proper structure for video display
      if (courseInfo.sections && courseInfo.sections.length > 0) {
        courseInfo.sections = courseInfo.sections.map(section => ({
          ...section,
          lessons: (section.lessons || []).map(lesson => {
            // FIXED: Handle both video structures
            let videoUrl = '';
            let thumbnail = '';
            
            if (lesson.videos && lesson.videos.length > 0) {
              // Use first video from videos array
              videoUrl = lesson.videos[0].url;
              thumbnail = lesson.videos[0].thumbnail?.url || lesson.videos[0].thumbnail;
            } else if (lesson.videoUrl) {
              // Direct video URL
              videoUrl = lesson.videoUrl;
            } else if (lesson.video?.url) {
              // Nested video object
              videoUrl = lesson.video.url;
            }
            
            return {
              ...lesson,
              id: lesson._id || lesson.id,
              videoUrl,
              thumbnail: thumbnail || courseInfo.thumbnail?.url || courseInfo.thumbnail,
              type: videoUrl ? 'video' : 'content',
              description: lesson.description || lesson.content || lesson.title
            };
          })
        }));
      } else {
        // Create a default structure if no sections exist
        courseInfo.sections = [
          {
            id: 'main-content',
            title: 'Course Content',
            lessons: [
              {
                id: courseInfo._id,
                title: courseInfo.title,
                type: 'video',
                videoUrl: courseInfo.previewVideo?.url || '',
                thumbnail: courseInfo.thumbnail?.url || courseInfo.thumbnail,
                description: courseInfo.description
              }
            ]
          }
        ];
      }

      setCourse(courseInfo);

      // Fetch progress data
      try {
        const progressResponse = await fetch(`http://localhost:5000/api/student/courses/${courseId}/progress`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          if (progressData.success && progressData.data) {
            setProgress(progressData.data);
            if (progressData.data.completedLessons) {
              setCompletedLessons(new Set(progressData.data.completedLessons));
            }
          }
        }
      } catch (progressError) {
        console.warn('Could not fetch progress:', progressError.message);
        setProgress({
          overallProgress: 0,
          completedLessons: [],
          totalLessons: calculateTotalLessons(courseInfo),
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
    if (!courseData?.sections) return 0;
    return courseData.sections.reduce((total, section) => {
      return total + (section.lessons ? section.lessons.length : 0);
    }, 0);
  };

  const calculateProgress = () => {
    const totalLessons = calculateTotalLessons(course);
    if (totalLessons === 0) return 0;
    return Math.round((completedLessons.size / totalLessons) * 100);
  };

  // FIXED: Navigate to video player page instead of lecture
  const handleLessonClick = (lesson, sectionIndex, lessonIndex) => {
    if (lesson.videoUrl) {
      // Navigate to video player page with proper route
      navigate(`/student/course/${courseId}/video/${lesson.id}`, {
        state: {
          lesson,
          course,
          sectionIndex,
          lessonIndex
        }
      });
    } else {
      markLessonCompleted(lesson.id);
    }
  };

  const markLessonCompleted = async (lessonId) => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/student/courses/${courseId}/videos/${lessonId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          watchTime: 100,
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
    
    if (lesson.videoUrl) {
      return <Video className="w-5 h-5 text-blue-500" />;
    }
    
    return <FileText className="w-5 h-5 text-gray-500" />;
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
        {course.thumbnail && (
          <div className="course-thumbnail">
            <img 
              src={typeof course.thumbnail === 'string' ? course.thumbnail : course.thumbnail.url} 
              alt={course.title}
              className="course-header-image"
              onError={(e) => {
                e.target.src = '/placeholder-course.png';
              }}
            />
          </div>
        )}
        
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
          
          {course.description && (
            <p className="course-description">
              {course.shortDescription || course.description}
            </p>
          )}
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
      </div>

      {/* Course Content with Videos */}
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
                </div>
                
                <div className="lessons-list">
                  {(section.lessons || []).map((lesson, lessonIndex) => (
                    <div
                      key={lesson.id || lessonIndex}
                      className={`lesson-item ${completedLessons.has(lesson.id) ? 'completed' : ''} clickable`}
                      onClick={() => handleLessonClick(lesson, sectionIndex, lessonIndex)}
                    >
                      {lesson.thumbnail && (
                        <div className="lesson-thumbnail">
                          <img 
                            src={lesson.thumbnail} 
                            alt={lesson.title}
                            className="lesson-thumb-image"
                            onError={(e) => {
                              e.target.src = '/placeholder-video.png';
                            }}
                          />
                          <div className="play-overlay">
                            <Play className="w-6 h-6" />
                          </div>
                        </div>
                      )}
                      
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
                            {lesson.videoUrl ? 'Video' : 'Content'}
                          </span>
                          {lesson.duration && (
                            <>
                              <span className="meta-divider">•</span>
                              <span className="lesson-duration">
                                {formatDuration(lesson.duration)}
                              </span>
                            </>
                          )}
                          {lesson.videoUrl && (
                            <>
                              <span className="meta-divider">•</span>
                              <span className="video-available">Video Available</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="lesson-status">
                        {completedLessons.has(lesson.id) ? (
                          <span className="status-completed">Completed</span>
                        ) : (
                          <span className="status-pending">
                            {lesson.videoUrl ? 'Watch Video' : 'Start'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-content">
            <div className="no-content-icon">📚</div>
            <h3>Course Content Coming Soon</h3>
            <p>The instructor is preparing the course materials.</p>
          </div>
        )}
      </div>

      {/* Continue Learning Button */}
      <div className="continue-section">
        <button 
          className="continue-btn"
          onClick={() => {
            for (const section of course.sections || []) {
              for (const lesson of section.lessons || []) {
                if (lesson.videoUrl && !completedLessons.has(lesson.id)) {
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
    </div>
  );
};

export default CourseProgress;