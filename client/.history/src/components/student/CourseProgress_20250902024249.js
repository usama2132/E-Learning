import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Lock, CheckCircle, Clock, FileText, Video } from 'lucide-react';
import Loading from '../common/Loading';
import ProgressBar from './ProgressBar';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/components/CourseProgress.css';

const CourseProgress = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { isDarkMode } = useTheme();
  
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

      console.log('Fetching course and progress for courseId:', courseId);

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
        console.log('Enrollment data:', enrollmentData);
        
        const isEnrolled = enrollmentData.success && enrollmentData.courses && 
          enrollmentData.courses.some(c => (c._id === courseId || c.id === courseId));
        
        if (!isEnrolled) {
          console.log('User not enrolled, redirecting to course page');
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
      console.log('Course data received:', courseData);
      
      if (!courseData.success || !courseData.data) {
        throw new Error('Course not found');
      }

      let courseInfo = courseData.data.course || courseData.data;

      // Process course sections and lessons
      if (courseInfo.sections && courseInfo.sections.length > 0) {
        console.log('Processing course sections:', courseInfo.sections.length);
        
        courseInfo.sections = courseInfo.sections.map((section, sectionIndex) => {
          console.log(`Processing section ${sectionIndex}:`, section.title, 'with', section.lessons?.length || 0, 'lessons');
          
          return {
            id: section._id || section.id || `section-${sectionIndex}`,
            title: section.title || `Section ${sectionIndex + 1}`,
            description: section.description || '',
            lessons: (section.lessons || []).map((lesson, lessonIndex) => {
              console.log(`Processing lesson ${lessonIndex}:`, lesson.title);
              
              let videoUrl = '';
              let thumbnail = '';
              let duration = lesson.duration || 0;
              
              if (lesson.videos && lesson.videos.length > 0) {
                const video = lesson.videos[0];
                videoUrl = video.url || video.videoUrl || '';
                thumbnail = video.thumbnail?.url || video.thumbnailUrl || '';
                duration = video.duration || duration;
                console.log('Found video in lesson:', videoUrl);
              }
              else if (lesson.videoUrl || lesson.video_url) {
                videoUrl = lesson.videoUrl || lesson.video_url;
                thumbnail = lesson.thumbnailUrl || lesson.thumbnail_url || lesson.thumbnail || '';
                console.log('Found direct video URL:', videoUrl);
              }
              else if (lesson.content && (lesson.content.includes('http') || lesson.content.includes('video'))) {
                videoUrl = lesson.content;
                console.log('Found video URL in content:', videoUrl);
              }
              
              const processedLesson = {
                id: lesson._id || lesson.id || `lesson-${sectionIndex}-${lessonIndex}`,
                title: lesson.title || `Lesson ${lessonIndex + 1}`,
                type: videoUrl ? 'video' : 'content',
                duration: duration,
                description: lesson.description || lesson.content || '',
                videoUrl: videoUrl,
                thumbnail: thumbnail || courseInfo.thumbnail?.url || courseInfo.thumbnail || '',
                isPreview: lesson.isPreview || false,
                resources: lesson.resources || [],
                quiz: lesson.quiz || null
              };
              
              console.log('Processed lesson:', processedLesson.title, 'has video:', !!processedLesson.videoUrl);
              return processedLesson;
            })
          };
        });
      } else {
        console.log('No sections found, creating fallback structure');
        
        const sections = [];
        
        if (courseInfo.previewVideo?.url || courseInfo.preview_video?.url) {
          const previewUrl = courseInfo.previewVideo?.url || courseInfo.preview_video?.url;
          console.log('Found course preview video:', previewUrl);
          
          sections.push({
            id: 'preview-section',
            title: 'Course Introduction', 
            description: 'Get started with this course',
            lessons: [
              {
                id: courseInfo.previewVideo?.public_id || 'preview-lesson',
                title: courseInfo.title + ' - Course Preview',
                type: 'video',
                duration: courseInfo.previewVideo?.duration || 300,
                description: courseInfo.shortDescription || courseInfo.description || 'Course overview',
                videoUrl: previewUrl,
                thumbnail: courseInfo.thumbnail?.url || courseInfo.thumbnail || '',
                isPreview: true,
                resources: [],
                quiz: null
              }
            ]
          });
        }
        
        if (courseInfo.curriculum && courseInfo.curriculum.length > 0) {
          console.log('Found course curriculum:', courseInfo.curriculum.length);
          
          courseInfo.curriculum.forEach((currSection, index) => {
            if (currSection.lectures && currSection.lectures.length > 0) {
              sections.push({
                id: currSection._id || `curriculum-section-${index}`,
                title: currSection.title || `Section ${index + 1}`,
                description: currSection.description || '',
                lessons: currSection.lectures.map((lecture, lectureIndex) => ({
                  id: lecture._id || `lecture-${index}-${lectureIndex}`,
                  title: lecture.title || `Lecture ${lectureIndex + 1}`,
                  type: lecture.video_url || lecture.videoUrl ? 'video' : 'content',
                  duration: lecture.duration || 0,
                  description: lecture.description || '',
                  videoUrl: lecture.video_url || lecture.videoUrl || '',
                  thumbnail: lecture.thumbnail || courseInfo.thumbnail?.url || '',
                  isPreview: lecture.is_preview || false,
                  resources: lecture.resources || [],
                  quiz: lecture.quiz || null
                }))
              });
            }
          });
        }
        
        if (sections.length === 0) {
          sections.push({
            id: 'empty-section',
            title: 'Course Content',
            description: 'Course content will be available soon',
            lessons: []
          });
        }

        courseInfo.sections = sections;
      }

      console.log('Final processed course sections:', courseInfo.sections.length);
      courseInfo.sections.forEach((section, i) => {
        console.log(`Section ${i}: ${section.title} - ${section.lessons.length} lessons`);
        section.lessons.forEach((lesson, j) => {
          console.log(`  Lesson ${j}: ${lesson.title} - Video: ${!!lesson.videoUrl}`);
        });
      });

      setCourse(courseInfo);

      // FIXED: Fetch progress using correct endpoint that exists in your routes
      try {
        const progressResponse = await fetch(`http://localhost:5000/api/progress/course/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          console.log('Progress data received:', progressData);
          
          if (progressData.success && progressData.data) {
            const progressInfo = progressData.data.progress || progressData.data;
            setProgress(progressInfo);
            
            // Extract completed lessons from progress data
            const completed = new Set();
            
            if (progressInfo.lessons && Array.isArray(progressInfo.lessons)) {
              progressInfo.lessons.forEach(lesson => {
                if (lesson.completed) {
                  completed.add(lesson.lessonId.toString());
                }
              });
            }
            
            setCompletedLessons(completed);
            console.log('Completed lessons from progress:', Array.from(completed));
          }
        } else {
          console.warn('Progress fetch failed, using default progress');
          setProgress({
            completionPercentage: 0,
            completedLessons: 0,
            totalLessons: calculateTotalLessons(courseInfo),
            totalTimeSpent: 0
          });
        }
      } catch (progressError) {
        console.warn('Could not fetch progress:', progressError.message);
        setProgress({
          completionPercentage: 0,
          completedLessons: 0,
          totalLessons: calculateTotalLessons(courseInfo),
          totalTimeSpent: 0
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
    // Use backend progress if available
    if (progress && progress.completionPercentage !== undefined) {
      return Math.round(progress.completionPercentage);
    }
    
    // Fallback to frontend calculation
    const totalLessons = calculateTotalLessons(course);
    if (totalLessons === 0) return 0;
    return Math.round((completedLessons.size / totalLessons) * 100);
  };

  const handleLessonClick = (lesson, sectionIndex, lessonIndex) => {
    console.log('Lesson clicked:', lesson.title, 'has video:', !!lesson.videoUrl);
    
    if (lesson.videoUrl || lesson.type === 'video') {
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

      console.log('Marking lesson completed:', lessonId);

      const response = await fetch(`http://localhost:5000/api/progress/courses/${courseId}/videos/${lessonId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          watchTime: 100,
          completed: true,
          totalDuration: 100
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Lesson marked complete:', result);
        
        if (result.success) {
          setCompletedLessons(prev => new Set([...prev, lessonId]));
          
          // Update progress state
          if (progress) {
            const newCompletedCount = completedLessons.size + 1;
            const totalLessons = calculateTotalLessons(course);
            const newPercentage = Math.round((newCompletedCount / totalLessons) * 100);
            
            setProgress(prev => ({
              ...prev,
              completionPercentage: newPercentage,
              completedLessons: newCompletedCount
            }));
          }
        }
      } else {
        console.warn('Failed to mark lesson complete:', response.status);
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

      <div className="progress-bar-section">
        <ProgressBar 
          current={completedLessons.size} 
          total={totalLessons}
          showPercentage={true}
        />
        <div className="progress-stats">
          <span>{completedLessons.size} of {totalLessons} lessons completed</span>
          {progress && progress.totalTimeSpent && (
            <span> • {Math.round(progress.totalTimeSpent)} minutes spent</span>
          )}
        </div>
      </div>

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
                        onClick={() => lesson.videoUrl || lesson.type === 'video' ? handleLessonClick(lesson, sectionIndex, lessonIndex) : null}
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
            <p>The instructor is preparing the course materials. Check back later!</p>
          </div>
        )}
      </div>

      <div className="continue-section">
        <button 
          className="continue-btn"
          onClick={() => {
            console.log('Continue learning clicked');
            
            let foundLesson = null;
            for (const section of course.sections || []) {
              for (const lesson of section.lessons || []) {
                if (lesson.videoUrl && !completedLessons.has(lesson.id)) {
                  foundLesson = lesson;
                  break;
                }
              }
              if (foundLesson) break;
            }
            
            if (foundLesson) {
              console.log('Found next lesson:', foundLesson.title);
              handleLessonClick(foundLesson);
            } else {
              const hasVideoLessons = course.sections?.some(section => 
                section.lessons?.some(lesson => lesson.videoUrl)
              );
              
              if (hasVideoLessons) {
                alert('All lessons completed! Great job!');
              } else {
                alert('No video lessons available yet. The instructor is still uploading content. Please check back later!');
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