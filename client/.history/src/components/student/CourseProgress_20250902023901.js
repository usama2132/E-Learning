import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useProgress from '../../hooks/useProgress';
import ProgressBar, { CircularProgressBar } from './ProgressBar';
import Button from '../common/Button';
import Loading from '../common/Loading';
import { Play, CheckCircle, Clock, BookOpen, Award } from 'lucide-react';
import '../../styles/components/CourseProgress.css';

const CourseProgress = ({ courseId, showHeader = true, compact = false }) => {
  const navigate = useNavigate();
  const {
    currentProgress,
    loading,
    error,
    fetchCourseProgress,
    calculateProgressPercentage,
    getNextLesson,
    isCourseCompleted,
    getProgressStats
  } = useProgress(courseId);

  const [progressStats, setProgressStats] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);

  // Fetch course progress on component mount
  useEffect(() => {
    if (courseId) {
      console.log('CourseProgress: Fetching progress for course', courseId);
      fetchCourseProgress(courseId);
    }
  }, [courseId, fetchCourseProgress]);

  // Calculate progress statistics
  useEffect(() => {
    if (currentProgress) {
      const stats = getProgressStats();
      setProgressStats(stats);
      
      // Get next lesson to continue
      const next = getNextLesson();
      setNextLesson(next);
      
      console.log('CourseProgress: Updated stats', stats);
    }
  }, [currentProgress, getProgressStats, getNextLesson]);

  const handleContinueLearning = () => {
    if (nextLesson && nextLesson._id) {
      navigate(`/student/course/${courseId}/lesson/${nextLesson._id}`, {
        state: { 
          lesson: nextLesson,
          courseId: courseId
        }
      });
    } else {
      navigate(`/student/course/${courseId}/content`);
    }
  };

  const handleViewCertificate = () => {
    navigate(`/student/certificates/${courseId}`);
  };

  if (loading) {
    return (
      <div className={`course-progress ${compact ? 'compact' : ''}`}>
        {showHeader && <h3>Course Progress</h3>}
        <Loading size="small" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`course-progress ${compact ? 'compact' : ''} error`}>
        {showHeader && <h3>Course Progress</h3>}
        <div className="error-message">
          <span>Failed to load progress: {error}</span>
          <Button 
            size="small" 
            onClick={() => fetchCourseProgress(courseId)}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!currentProgress) {
    return (
      <div className={`course-progress ${compact ? 'compact' : ''}`}>
        {showHeader && <h3>Course Progress</h3>}
        <div className="no-progress">
          <p>No progress data available</p>
          <Button 
            size="small" 
            onClick={() => fetchCourseProgress(courseId)}
          >
            Load Progress
          </Button>
        </div>
      </div>
    );
  }

  const isCompleted = isCourseCompleted();
  const completionPercentage = calculateProgressPercentage(currentProgress);

  if (compact) {
    return (
      <div className="course-progress compact">
        <div className="compact-progress">
          <CircularProgressBar
            courseId={courseId}
            size={60}
            strokeWidth={4}
            realTime={true}
          />
          <div className="compact-info">
            <div className="progress-text">{completionPercentage}% Complete</div>
            <div className="lessons-text">
              {progressStats?.completedLessons || 0} of {progressStats?.totalLessons || 0} lessons
            </div>
          </div>
        </div>
        
        {!isCompleted && (
          <Button 
            size="small" 
            className="primary"
            onClick={handleContinueLearning}
            disabled={!nextLesson}
          >
            Continue
          </Button>
        )}
        
        {isCompleted && (
          <Button 
            size="small" 
            className="success"
            onClick={handleViewCertificate}
          >
            <Award size={16} />
            Certificate
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="course-progress">
      {showHeader && (
        <div className="progress-header">
          <h3>Course Progress</h3>
          {isCompleted && (
            <div className="completed-badge">
              <CheckCircle size={20} />
              Completed
            </div>
          )}
        </div>
      )}

      <div className="progress-overview">
        <div className="progress-circle">
          <CircularProgressBar
            courseId={courseId}
            size={120}
            strokeWidth={8}
            color={isCompleted ? '#22c55e' : '#3b82f6'}
            realTime={true}
          />
        </div>

        <div className="progress-details">
          <div className="progress-stat">
            <div className="stat-icon">
              <BookOpen size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">
                {progressStats?.completedLessons || 0}/{progressStats?.totalLessons || 0}
              </span>
              <span className="stat-label">Lessons Completed</span>
            </div>
          </div>

          <div className="progress-stat">
            <div className="stat-icon">
              <Clock size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">
                {Math.round((progressStats?.totalTimeSpent || 0) / 60)}h
              </span>
              <span className="stat-label">Time Spent</span>
            </div>
          </div>

          {progressStats?.averageWatchTime && (
            <div className="progress-stat">
              <div className="stat-icon">
                <Play size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-value">
                  {Math.round(progressStats.averageWatchTime)}min
                </span>
                <span className="stat-label">Avg. per Lesson</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="progress-bar-section">
        <ProgressBar
          courseId={courseId}
          showPercentage={true}
          showNumbers={true}
          size="large"
          animated={true}
          label="Overall Progress"
          realTime={true}
        />
      </div>

      {progressStats?.lastAccessedAt && (
        <div className="last-activity">
          <span>
            Last activity: {new Date(progressStats.lastAccessedAt).toLocaleDateString()}
          </span>
        </div>
      )}

      <div className="progress-actions">
        {!isCompleted ? (
          <>
            <Button 
              className="primary large"
              onClick={handleContinueLearning}
              disabled={!nextLesson}
            >
              <Play size={20} />
              {nextLesson ? `Continue: ${nextLesson.title}` : 'Continue Learning'}
            </Button>
            
            {nextLesson && (
              <div className="next-lesson-info">
                <small>Next: {nextLesson.title}</small>
              </div>
            )}
          </>
        ) : (
          <div className="completion-actions">
            <Button 
              className="success large"
              onClick={handleViewCertificate}
            >
              <Award size={20} />
              View Certificate
            </Button>
            
            <div className="completion-message">
              <CheckCircle size={16} />
              Congratulations! You've completed this course.
            </div>
          </div>
        )}
      </div>

      {/* Progress Timeline */}
      {currentProgress?.lessons && currentProgress.lessons.length > 0 && (
        <div className="progress-timeline">
          <h4>Lesson Progress</h4>
          <div className="timeline-list">
            {currentProgress.lessons.map((lesson, index) => (
              <div 
                key={lesson.lessonId || index} 
                className={`timeline-item ${lesson.completed ? 'completed' : 'pending'}`}
              >
                <div className="timeline-marker">
                  {lesson.completed ? (
                    <CheckCircle size={16} />
                  ) : (
                    <span className="lesson-number">{index + 1}</span>
                  )}
                </div>
                
                <div className="timeline-content">
                  <div className="lesson-title">
                    {lesson.title || `Lesson ${index + 1}`}
                  </div>
                  
                  {lesson.completed ? (
                    <div className="lesson-stats">
                      <span>Completed</span>
                      {lesson.completedAt && (
                        <span> • {new Date(lesson.completedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  ) : (
                    <div className="lesson-progress">
                      <ProgressBar
                        completed={lesson.watchedPercentage || 0}
                        total={100}
                        size="small"
                        showPercentage={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseProgress;