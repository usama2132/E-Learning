import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProgress } from '../../hooks/useProgress';
import ProgressBar from './ProgressBar';
import VideoPlayer from '../common/VideoPlayer';
import '../../styles/components/CourseProgress.css';

const CourseProgress = () => {
  const { courseId } = useParams();
  const { progress, updateProgress, getProgressByCourse } = useProgress();
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseProgress = async () => {
      try {
        const courseProgress = await getProgressByCourse(courseId);
        setCourse(courseProgress.course);
        setCurrentLesson(courseProgress.currentLesson || courseProgress.course?.lessons[0]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching course progress:', error);
        setLoading(false);
      }
    };

    fetchCourseProgress();
  }, [courseId, getProgressByCourse]);

  const handleLessonComplete = async (lessonId) => {
    try {
      await updateProgress(courseId, lessonId, 'completed');
      // Move to next lesson
      const currentIndex = course.lessons.findIndex(l => l.id === lessonId);
      if (currentIndex < course.lessons.length - 1) {
        setCurrentLesson(course.lessons[currentIndex + 1]);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const selectLesson = (lesson) => {
    setCurrentLesson(lesson);
  };

  if (loading) {
    return (
      <div className="course-progress-loading">
        <div className="spinner"></div>
        <p>Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-progress-error">
        <h2>Course not found</h2>
        <p>The course you're looking for doesn't exist or you don't have access to it.</p>
      </div>
    );
  }

  return (
    <div className="course-progress">
      <div className="course-progress-header">
        <h1>{course.title}</h1>
        <ProgressBar 
          completed={progress?.completedLessons?.length || 0}
          total={course.lessons?.length || 0}
        />
      </div>

      <div className="course-progress-content">
        <div className="video-section">
          {currentLesson && (
            <>
              <VideoPlayer 
                src={currentLesson.videoUrl}
                title={currentLesson.title}
                onComplete={() => handleLessonComplete(currentLesson.id)}
              />
              <div className="lesson-info">
                <h2>{currentLesson.title}</h2>
                <p>{currentLesson.description}</p>
                <div className="lesson-duration">
                  Duration: {currentLesson.duration} minutes
                </div>
              </div>
            </>
          )}
        </div>

        <div className="lessons-sidebar">
          <h3>Course Content</h3>
          <div className="lessons-list">
            {course.lessons?.map((lesson, index) => (
              <div 
                key={lesson.id}
                className={`lesson-item ${
                  currentLesson?.id === lesson.id ? 'active' : ''
                } ${
                  progress?.completedLessons?.includes(lesson.id) ? 'completed' : ''
                }`}
                onClick={() => selectLesson(lesson)}
              >
                <div className="lesson-number">{index + 1}</div>
                <div className="lesson-content">
                  <h4>{lesson.title}</h4>
                  <span className="lesson-duration">{lesson.duration}m</span>
                </div>
                <div className="lesson-status">
                  {progress?.completedLessons?.includes(lesson.id) ? (
                    <span className="completed-icon">✓</span>
                  ) : (
                    <span className="play-icon">▶</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseProgress;