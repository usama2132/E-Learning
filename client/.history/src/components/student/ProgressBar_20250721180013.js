import React from 'react';
import '../../styles/components/CourseProgress.css';
import '../../styles/dashboards/ProgressBar.css';

const ProgressBar = ({ 
  completed = 0, 
  total = 0, 
  showPercentage = false, 
  showNumbers = false,
  size = 'medium',
  color = 'primary',
  animated = false,
  label = null
}) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  const getProgressBarClass = () => {
    let classes = ['progress-bar'];
    classes.push(`progress-bar-${size}`);
    classes.push(`progress-bar-${color}`);
    if (animated) classes.push('progress-bar-animated');
    return classes.join(' ');
  };

  const getStatusText = () => {
    if (percentage === 100) return 'Completed';
    if (percentage > 0) return 'In Progress';
    return 'Not Started';
  };

  const getStatusColor = () => {
    if (percentage === 100) return '#22c55e';
    if (percentage > 0) return '#3b82f6';
    return '#6b7280';
  };

  return (
    <div className="progress-bar-container">
      {label && (
        <div className="progress-label">
          <span>{label}</span>
          {showPercentage && (
            <span className="progress-percentage">{percentage}%</span>
          )}
        </div>
      )}
      
      <div className={getProgressBarClass()}>
        <div className="progress-track">
          <div 
            className="progress-fill"
            style={{ 
              width: `${percentage}%`,
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
            {completed} of {total} lessons
          </span>
        )}
        
        {showPercentage && !label && (
          <span className="progress-percentage">{percentage}%</span>
        )}
        
        {!showNumbers && !showPercentage && (
          <span className="progress-status" style={{ color: getStatusColor() }}>
            {getStatusText()}
          </span>
        )}
      </div>
    </div>
  );
};

// Circular progress bar variant
export const CircularProgressBar = ({
  completed = 0,
  total = 0,
  size = 80,
  strokeWidth = 8,
  color = '#3b82f6',
  backgroundColor = '#e5e7eb'
}) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
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
      </div>
    </div>
  );
};

// Step progress bar for multi-step processes
export const StepProgressBar = ({ steps = [], currentStep = 0 }) => {
  return (
    <div className="step-progress-bar">
      {steps.map((step, index) => (
        <div
          key={index}
          className={`step ${index < currentStep ? 'completed' : ''} ${
            index === currentStep ? 'active' : ''
          }`}
        >
          <div className="step-indicator">
            {index < currentStep ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
          <div className="step-label">{step.label || step}</div>
          {index < steps.length - 1 && <div className="step-connector"></div>}
        </div>
      ))}
    </div>
  );
};

export default ProgressBar;
