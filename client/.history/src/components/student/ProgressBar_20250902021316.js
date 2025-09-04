import React, { useState, useEffect } from 'react';
import useProgress from '../../hooks/useProgress';
import '../../styles/components/CourseProgress.css';
import '../../styles/dashboards/ProgressBar.css';

const ProgressBar = ({ 
  courseId = null,
  lessonId = null,
  completed = null, 
  total = null, 
  showPercentage = false, 
  showNumbers = false,
  size = 'medium',
  color = 'primary',
  animated = false,
  label = null,
  realTime = false // Enable real-time backend updates
}) => {
  const {
    currentProgress,
    loading,
    error,
    fetchCourseProgress,
    calculateProgressPercentage
  } = useProgress(courseId);
  
  const [displayData, setDisplayData] = useState({
    completed: completed || 0,
    total: total || 0,
    percentage: 0
  });

  // FIXED: Fetch real progress data when courseId is provided
  useEffect(() => {
    if (courseId && realTime) {
      fetchCourseProgress(courseId);
    }
  }, [courseId, realTime, fetchCourseProgress]);

  // FIXED: Update display data from backend or props
  useEffect(() => {
    if (courseId && currentProgress && realTime) {
      // Use backend data
      const backendCompleted = currentProgress.completedLessons || currentProgress.completedVideos?.length || 0;
      const backendTotal = currentProgress.totalLessons || currentProgress.lessons?.length || 1;
      const backendPercentage = calculateProgressPercentage(currentProgress);
      
      setDisplayData({
        completed: backendCompleted,
        total: backendTotal,
        percentage: backendPercentage
      });
    } else {
      // Use prop data
      const propCompleted = completed || 0;
      const propTotal = total || 0;
      const propPercentage = propTotal > 0 ? Math.round((propCompleted / propTotal) * 100) : 0;
      
      setDisplayData({
        completed: propCompleted,
        total: propTotal,
        percentage: propPercentage
      });
    }
  }, [currentProgress, completed, total, courseId, realTime, calculateProgressPercentage]);

  const getProgressBarClass = () => {
    let classes = ['progress-bar'];
    classes.push(`progress-bar-${size}`);
    classes.push(`progress-bar-${color}`);
    if (animated) classes.push('progress-bar-animated');
    if (loading) classes.push('progress-bar-loading');
    return classes.join(' ');
  };

  const getStatusText = () => {
    if (loading) return 'Loading...';
    if (error) return 'Error loading progress';
    if (displayData.percentage === 100) return 'Completed';
    if (displayData.percentage > 0) return 'In Progress';
    return 'Not Started';
  };

  const getStatusColor = () => {
    if (loading) return '#6b7280';
    if (error) return '#ef4444';
    if (displayData.percentage === 100) return '#22c55e';
    if (displayData.percentage > 0) return '#3b82f6';
    return '#6b7280';
  };

  return (
    <div className="progress-bar-container">
      {label && (
        <div className="progress-label">
          <span>{label}</span>
          {showPercentage && (
            <span className="progress-percentage">
              {displayData.percentage}%
            </span>
          )}
          {realTime && courseId && (
            <span className="progress-source">
              {loading ? '⏳' : '🔄'} Live
            </span>
          )}
        </div>
      )}
      
      <div className={getProgressBarClass()}>
        <div className="progress-track">
          <div 
            className="progress-fill"
            style={{ 
              width: `${displayData.percentage}%`,
              backgroundColor: getStatusColor()
            }}
          >
            {animated && <div className="progress-shine"></div>}
          </div>
        </div>
      </div>
      
      <div className="progress-info">
        {showNumbers && (
          <span className="progress-numbers">
            {displayData.completed} of {displayData.total} lessons
          </span>
        )}
        
        {showPercentage && !label && (
          <span className="progress-percentage">{displayData.percentage}%</span>
        )}
        
        {!showNumbers && !showPercentage && (
          <span className="progress-status" style={{ color: getStatusColor() }}>
            {getStatusText()}
          </span>
        )}
        
        {error && (
          <span className="progress-error" title={error}>
            ⚠️ {error}
          </span>
        )}
      </div>
    </div>
  );
};

// FIXED: Circular progress bar with backend integration
export const CircularProgressBar = ({
  courseId = null,
  completed = 0,
  total = 0,
  size = 80,
  strokeWidth = 8,
  color = '#3b82f6',
  backgroundColor = '#e5e7eb',
  realTime = false
}) => {
  const { currentProgress, calculateProgressPercentage } = useProgress(courseId);
  
  const [percentage, setPercentage] = useState(0);
  
  useEffect(() => {
    if (courseId && currentProgress && realTime) {
      const backendPercentage = calculateProgressPercentage(currentProgress);
      setPercentage(backendPercentage);
    } else {
      const propPercentage = total > 0 ? (completed / total) * 100 : 0;
      setPercentage(propPercentage);
    }
  }, [currentProgress, completed, total, courseId, realTime, calculateProgressPercentage]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
      </svg>
      <div className="circular-progress-text">
        <span className="percentage">{Math.round(percentage)}%</span>
        {realTime && courseId && <span className="live-indicator">●</span>}
      </div>
    </div>
  );
};

// FIXED: Step progress bar with backend lesson data
export const StepProgressBar = ({ 
  courseId = null,
  steps = [], 
  currentStep = 0,
  realTime = false
}) => {
  const { currentProgress } = useProgress(courseId);
  const [displaySteps, setDisplaySteps] = useState(steps);
  const [currentStepIndex, setCurrentStepIndex] = useState(currentStep);
  
  useEffect(() => {
    if (courseId && currentProgress && realTime && currentProgress.lessons) {
      // Convert lessons to steps
      const lessonSteps = currentProgress.lessons.map((lesson, index) => ({
        label: lesson.title || `Lesson ${index + 1}`,
        id: lesson.lessonId,
        completed: lesson.completed
      }));
      
      setDisplaySteps(lessonSteps);
      
      // Find current step (first incomplete lesson)
      const currentIndex = lessonSteps.findIndex(step => !step.completed);
      setCurrentStepIndex(currentIndex >= 0 ? currentIndex : lessonSteps.length - 1);
    }
  }, [currentProgress, courseId, realTime]);

  const stepsToDisplay = displaySteps.length > 0 ? displaySteps : steps;

  return (
    <div className="step-progress-bar">
      {stepsToDisplay.map((step, index) => (
        <div
          key={step.id || index}
          className={`step ${
            realTime 
              ? (step.completed ? 'completed' : (index === currentStepIndex ? 'active' : ''))
              : (index < currentStepIndex ? 'completed' : (index === currentStepIndex ? 'active' : ''))
          }`}
        >
          <div className="step-indicator">
            {(realTime ? step.completed : index < currentStepIndex) ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
          <div className="step-label">{step.label || step}</div>
          {index < stepsToDisplay.length - 1 && <div className="step-connector"></div>}
        </div>
      ))}
      
      {realTime && courseId && (
        <div className="step-progress-footer">
          <small>Live Progress • Course ID: {courseId}</small>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;