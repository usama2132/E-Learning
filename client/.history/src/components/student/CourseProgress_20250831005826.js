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

      // Check enrollment first
      const enrollmentResponse = await fetch(`http://localhost:5000/api/student/enrolled-courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (enrollmentResponse.ok) {
        const enrollmentData = await enrollmentResponse.json();
        const isEnrolled = enrollmentData.success && enrollmentData.courses && 
          enrollmentData.courses.some(c => (c._id === courseId || c.id === courseId));
        
        if (!isEnrolled) {
          navigate(`/courses/${courseId}`);
          return;
        }
      }

      // Fetch course details
      const courseResponse = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!courseResponse.ok) {
        throw new Error(`Failed to fetch course: ${courseResponse.status}`);
      }

      const courseData = await courseResponse.json();
      
      if (!courseData.success || !courseData.data) {
        throw new Error('Course not found');
      }

      let courseInfo = courseData.data.course || courseData.data;

      // FIXED: Process the actual course sections created by instructor
      if (courseInfo.sections && courseInfo.sections.length > 0) {
        // Course has actual sections from instructor - process them properly
        courseInfo.sections = courseInfo.sections.map((section, sectionIndex) => ({
          id: section._id || section.id || `section-${sectionIndex}`,
          title: section.title || `Section ${sectionIndex + 1}`,
          description: section.description || '',
          lessons: (section.lessons || []).map((lesson, lessonIndex) => {
            // FIXED: Extract video from lesson.videos array (backend structure)
            const lessonVideo = lesson.videos && lesson.videos.length > 0 ? lesson.videos[0] : null;
            
            return {
              id: lesson._id || lesson.id || `lesson-${sectionIndex}-${lessonIndex}`,
              title: lesson.title || `Lesson ${lessonIndex + 1}`,
              type: lessonVideo ? 'video' : 'content',
              duration: lesson.duration || (lessonVideo ? lessonVideo.duration : 300),
              description: lesson.description || lesson.content || '',
              // FIXED: Use actual video URL from instructor upload
              videoUrl: lessonVideo ? lessonVideo.url : '',
              thumbnail: lessonVideo?.thumbnail?.url || 
                        lesson.thumbnail || 
                        courseInfo.thumbnail?.url || 
                        courseInfo.thumbnail || '',
              isPreview: lesson.isPreview || lessonVideo?.isPreview || false,
              resources: lesson.resources || [],
              quiz: lesson.quiz || null
            };
          })
        }));
      } else {
        // No sections - create fallback with preview video
        const sections = [];
        
        if (courseInfo.previewVideo?.url) {
          sections.push({
            id: 'preview-section',
            title: 'Course Preview', 
            description: 'Get started with this course',
            lessons: [
              {
                id: courseInfo.previewVideo.public_id || 'preview-lesson',
                title: courseInfo.title + ' - Preview',
                type: 'video',
                duration: courseInfo.previewVideo.duration || 300,
                description: courseInfo.description || courseInfo.shortDescription || 'Course overview',
                videoUrl: courseInfo.previewVideo.url,
                thumbnail: courseInfo.thumbnail?.url || courseInfo.thumbnail || '',
                isPreview: true
              }
            ]
          });
        } else {
          // No content available
          sections.push({
            id: 'empty-section',
            title: 'Course Content',
            description: 'Course content will be available soon',
            lessons: []
          });
        }

        courseInfo.sections = sections;
      }

      console.log('Processed course with sections:', courseInfo.sections.length);
      setCourse(courseInfo);

      // Fetch progress
      try {
        const progressResponse = await fetch(`http://localhost:5000/api/student/courses/${courseId}/progress`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
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

  const handleLessonClick = (lesson, sectionIndex, lessonIndex) => {
    if (lesson.videoUrl || lesson.type === 'video') {
      // FIXED: Navigate to video lesson with proper state
      navigate(`/student/course/${courseId}/lesson/${lesson.id}`, {
        state: { 
          course, 
          lesson, 
          sectionIndex, 
          lessonIndex,
          courseId 
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
        credentials: 'include',
        body: JSON.stringify({
          watchTime: 100,
          completed: true
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCompletedLessons(prev => new Set([...prev, lessonId]));
        }
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
  const totalLessons = calculateTotalLessons(course);

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
              {totalLessons} lessons
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
          total={totalLessons}
          showPercentage={true}
        />
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
                    {section.lessons.length} lessons
                    {section.lessons.some(l => l.videoUrl) && (
                      <span> • Videos available</span>
                    )}
                  </div>
                </div>
                
                <div className="lessons-list">
                  {section.lessons.length > 0 ? (
                    section.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id || lessonIndex}
                        className={`lesson-item ${completedLessons.has(lesson.id) ? 'completed' : ''} ${lesson.videoUrl ? 'clickable' : ''}`}
                        onClick={() => lesson.videoUrl ? handleLessonClick(lesson, sectionIndex, lessonIndex) : null}
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
                            {lesson.videoUrl && (
                              <div className="play-overlay">
                                <Play className="w-6 h-6" />
                              </div>
                            )}
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
                              {lesson.type === 'video' ? 'Video' : 'Content'}
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
                                <span className="video-available">▶ Watch Now</span>
                              </>
                            )}
                            {lesson.quiz && (
                              <>
                                <span className="meta-divider">•</span>
                                <span className="quiz-available">📝 Quiz</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="lesson-status">
                          {completedLessons.has(lesson.id) ? (
                            <span className="status-completed">✓ Completed</span>
                          ) : lesson.videoUrl ? (
                            <span className="status-pending">▶ Watch</span>
                          ) : (
                            <span className="status-pending">📄 Read</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-lessons">
                      <p>No lessons in this section yet.</p>
                    </div>
                  )}
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
            // Find first available video lesson
            for (const section of course.sections || []) {
              for (const lesson of section.lessons || []) {
                if (lesson.videoUrl && !completedLessons.has(lesson.id)) {
                  handleLessonClick(lesson);
                  return;
                }
              }
            }
            alert('No video lessons available yet. Check back later!');
          }}
        >
          {progressPercentage === 100 ? 'Review Course' : 'Continue Learning'}
        </button>
      </div>
    </div>
  );
};

export default CourseProgress;