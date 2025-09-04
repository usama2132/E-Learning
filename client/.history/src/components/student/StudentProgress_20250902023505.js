import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import Loading from '../common/Loading';
import ProgressBar, { CircularProgressBar } from './ProgressBar';

const StudentProgress = () => {
  const { getToken } = useAuth();
  const { isDarkMode, getCurrentColors } = useTheme();
  const navigate = useNavigate();
  
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [courseProgressData, setCourseProgressData] = useState({}); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const colors = getCurrentColors();

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getToken();
      
      const response = await fetch('http://localhost:5000/api/student/enrolled-courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const courses = data.courses || [];
        setEnrolledCourses(courses);
        
        await fetchProgressForAllCourses(courses, token);
      } else {
        setError('Failed to fetch enrolled courses');
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
      setError(error.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressForAllCourses = async (courses, token) => {
    try {
      const progressPromises = courses.map(async (course) => {
        try {
          const progressResponse = await fetch(`http://localhost:5000/api/progress/course/${course._id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });
          
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            return {
              courseId: course._id,
              progress: progressData.success ? progressData.data.progress : null
            };
          }
          
          return { courseId: course._id, progress: null };
        } catch (error) {
          console.error(`Failed to fetch progress for course ${course._id}:`, error);
          return { courseId: course._id, progress: null };
        }
      });

      const progressResults = await Promise.all(progressPromises);
      
      const progressMap = {};
      progressResults.forEach(({ courseId, progress }) => {
        progressMap[courseId] = progress;
      });
      
      setCourseProgressData(progressMap);
      console.log('Progress data loaded for', Object.keys(progressMap).length, 'courses');
      
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
    }
  };

  const getProgressPercentage = (course) => {
    const backendProgress = courseProgressData[course._id];
    
    if (backendProgress) {
      return backendProgress.completionPercentage || 0;
    }
    
    if (!course.totalLessons || course.totalLessons === 0) return 0;
    const completed = course.progress?.completedLessons || 0;
    return Math.round((completed / course.totalLessons) * 100);
  };

  const getCompletedLessons = (course) => {
    const backendProgress = courseProgressData[course._id];
    
    if (backendProgress) {
      return backendProgress.completedLessons || backendProgress.lessons?.filter(l => l.completed).length || 0;
    }
    
    return course.progress?.completedLessons || 0;
  };

  const getTotalLessons = (course) => {
    const backendProgress = courseProgressData[course._id];
    
    if (backendProgress) {
      return backendProgress.totalLessons || backendProgress.lessons?.length || course.totalLessons || 0;
    }
    
    return course.totalLessons || course.totalVideos || 0;
  };

  const getFilteredAndSortedCourses = () => {
    let filtered = [...enrolledCourses];

    switch (filter) {
      case 'completed':
        filtered = filtered.filter(course => getProgressPercentage(course) === 100);
        break;
      case 'in-progress':
        filtered = filtered.filter(course => {
          const progress = getProgressPercentage(course);
          return progress > 0 && progress < 100;
        });
        break;
      case 'not-started':
        filtered = filtered.filter(course => getProgressPercentage(course) === 0);
        break;
      default:
        break;
    }

    switch (sortBy) {
      case 'progress':
        filtered.sort((a, b) => getProgressPercentage(b) - getProgressPercentage(a));
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.enrollmentDate) - new Date(a.enrollmentDate));
        break;
    }

    return filtered;
  };

  const getOverallStats = () => {
    const total = enrolledCourses.length;
    const completed = enrolledCourses.filter(course => getProgressPercentage(course) === 100).length;
    const inProgress = enrolledCourses.filter(course => {
      const progress = getProgressPercentage(course);
      return progress > 0 && progress < 100;
    }).length;
    const notStarted = total - completed - inProgress;
    
    const totalLessons = enrolledCourses.reduce((sum, course) => sum + getTotalLessons(course), 0);
    const completedLessons = enrolledCourses.reduce((sum, course) => sum + getCompletedLessons(course), 0);
    const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return { total, completed, inProgress, notStarted, overallProgress, totalLessons, completedLessons };
  };

  const stats = getOverallStats();
  const filteredCourses = getFilteredAndSortedCourses();

  if (loading) return <Loading />;

  if (error) {
    return (
      <div style={{
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem',
        backgroundColor: colors.background,
        color: colors.text,
        borderRadius: '1rem',
        border: `1px solid ${colors.border}`
      }}>
        <div style={{ fontSize: '3rem' }}>😞</div>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>{error}</h3>
        <button
          onClick={fetchEnrolledCourses}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: colors.background,
      color: colors.text,
      minHeight: '100vh',
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: `2px solid ${colors.border}`
      }}>
        <h1 style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: '700',
          margin: '0 0 0.5rem 0',
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.info})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          My Learning Progress
        </h1>
        <p style={{
          fontSize: '1rem',
          color: colors.textSecondary,
          margin: 0
        }}>
          Track your journey across all enrolled courses • Live Progress Data
        </p>
      </div>

      {enrolledCourses.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          backgroundColor: colors.card,
          borderRadius: '1.5rem',
          border: `1px solid ${colors.border}`,
          boxShadow: `0 4px 20px ${colors.shadow}`
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📚</div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: colors.text
          }}>
            Start Your Learning Journey
          </h3>
          <p style={{
            fontSize: '1rem',
            color: colors.textSecondary,
            marginBottom: '2rem',
            maxWidth: '400px',
            margin: '0 auto 2rem auto'
          }}>
            Discover thousands of courses and begin building new skills today
          </p>
          <button 
            onClick={() => navigate('/courses')}
            style={{
              padding: '1rem 2rem',
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: `0 4px 15px ${colors.primary}33`
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = `0 6px 20px ${colors.primary}44`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = `0 4px 15px ${colors.primary}33`;
            }}
          >
            Browse Courses
          </button>
        </div>
      ) : (
        <>
          {/* Overall Statistics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
            marginLeft: '1rem',
            marginRight: '1rem'
          }}>
            <div style={{
              padding: '1.5rem',
              backgroundColor: colors.card,
              borderRadius: '1rem',
              border: `1px solid ${colors.border}`,
              boxShadow: `0 4px 20px ${colors.shadow}`,
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <h3 style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Overall Progress • Live Data
                </h3>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: `${colors.primary}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem'
                }}>
                  🔄
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <CircularProgressBar
                  completed={stats.completedLessons}
                  total={stats.totalLessons}
                  size={60}
                  strokeWidth={4}
                  color={colors.primary}
                />
              </div>
              
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: colors.primary,
                marginBottom: '0.5rem'
              }}>
                {stats.overallProgress}%
              </div>
              <p style={{
                fontSize: '0.875rem',
                color: colors.textSecondary,
                margin: 0
              }}>
                {stats.completedLessons} of {stats.totalLessons} lessons completed
              </p>
            </div>

            <div style={{
              padding: '1.5rem',
              backgroundColor: colors.card,
              borderRadius: '1rem',
              border: `1px solid ${colors.border}`,
              boxShadow: `0 4px 20px ${colors.shadow}`,
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <h3 style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Total Courses
                </h3>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: `${colors.info}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem'
                }}>
                  📖
                </div>
              </div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: colors.info,
                marginBottom: '0.5rem'
              }}>
                {stats.total}
              </div>
              <p style={{
                fontSize: '0.875rem',
                color: colors.textSecondary,
                margin: 0
              }}>
                Active enrollments
              </p>
            </div>

            <div style={{
              padding: '1.5rem',
              backgroundColor: colors.card,
              borderRadius: '1rem',
              border: `1px solid ${colors.border}`,
              boxShadow: `0 4px 20px ${colors.shadow}`,
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <h3 style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Completed
                </h3>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: `${colors.success}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem'
                }}>
                  🏆
                </div>
              </div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: colors.success,
                marginBottom: '0.5rem'
              }}>
                {stats.completed}
              </div>
              <p style={{
                fontSize: '0.875rem',
                color: colors.textSecondary,
                margin: 0
              }}>
                Courses finished
              </p>
            </div>

            <div style={{
              padding: '1.5rem',
              backgroundColor: colors.card,
              borderRadius: '1rem',
              border: `1px solid ${colors.border}`,
              boxShadow: `0 4px 20px ${colors.shadow}`,
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}>
                <h3 style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: colors.textSecondary,
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  In Progress
                </h3>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: `${colors.warning}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem'
                }}>
                  ⚡
                </div>
              </div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: colors.warning,
                marginBottom: '0.5rem'
              }}>
                {stats.inProgress}
              </div>
              <p style={{
                fontSize: '0.875rem',
                color: colors.textSecondary,
                margin: 0
              }}>
                Courses ongoing
              </p>
            </div>
          </div>

          {/* Filters and Sort */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            padding: '1.5rem',
            backgroundColor: colors.card,
            borderRadius: '1rem',
            border: `1px solid ${colors.border}`,
            boxShadow: `0 2px 10px ${colors.shadow}`
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: colors.textSecondary,
                marginRight: '0.5rem'
              }}>
                Filter:
              </span>
              {[
                { value: 'all', label: 'All Courses', count: stats.total },
                { value: 'completed', label: 'Completed', count: stats.completed },
                { value: 'in-progress', label: 'In Progress', count: stats.inProgress },
                { value: 'not-started', label: 'Not Started', count: stats.notStarted }
              ].map(({ value, label, count }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.75rem',
                    border: `2px solid ${filter === value ? colors.primary : colors.border}`,
                    backgroundColor: filter === value ? `${colors.primary}15` : 'transparent',
                    color: filter === value ? colors.primary : colors.text,
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {label}
                  <span style={{
                    backgroundColor: filter === value ? colors.primary : colors.border,
                    color: filter === value ? 'white' : colors.textSecondary,
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {count}
                  </span>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: colors.textSecondary
              }}>
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: `2px solid ${colors.border}`,
                  backgroundColor: colors.input,
                  color: colors.text,
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="recent">Recent</option>
                <option value="progress">Progress</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>

          {/* Course List */}
          {filteredCourses.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 2rem',
              backgroundColor: colors.card,
              borderRadius: '1rem',
              border: `1px solid ${colors.border}`,
              boxShadow: `0 4px 20px ${colors.shadow}`
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: colors.text
              }}>
                No courses found
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: colors.textSecondary,
                margin: 0
              }}>
                Try adjusting your filters to see more courses
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '1.5rem'
            }}>
              {filteredCourses.map(course => {
                const progressPercentage = getProgressPercentage(course);
                const completedLessons = getCompletedLessons(course);
                const totalLessons = getTotalLessons(course);
                const isCompleted = progressPercentage === 100;
                const isInProgress = progressPercentage > 0 && progressPercentage < 100;
                const hasBackendData = !!courseProgressData[course._id];

                return (
                  <div 
                    key={course._id} 
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: '1.5rem',
                      border: `1px solid ${colors.border}`,
                      boxShadow: `0 4px 20px ${colors.shadow}`,
                      padding: '2rem',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 8px 30px ${colors.shadowHover}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = `0 4px 20px ${colors.shadow}`;
                    }}
                  >
                    {/* Background Pattern */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '100px',
                      height: '100px',
                      background: `linear-gradient(45deg, ${colors.primary}10, ${colors.info}10)`,
                      borderRadius: '0 1.5rem 0 100%'
                    }} />

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto',
                      gap: '1.5rem',
                      alignItems: 'center',
                      position: 'relative',
                      zIndex: 1
                    }}>
                      {/* Course Thumbnail/Icon */}
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '1rem',
                        background: course.thumbnail 
                          ? `url(${course.thumbnail}) center/cover` 
                          : `linear-gradient(135deg, ${colors.primary}, ${colors.info})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        color: 'white',
                        flexShrink: 0,
                        boxShadow: `0 4px 15px ${colors.shadow}`
                      }}>
                        {!course.thumbnail && '📚'}
                      </div>

                      {/* Course Info */}
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          marginBottom: '0.75rem',
                          flexWrap: 'wrap'
                        }}>
                          <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: colors.text,
                            margin: 0,
                            lineHeight: '1.3'
                          }}>
                            {course.title}
                          </h3>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '50px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: isCompleted 
                              ? `${colors.success}20`
                              : isInProgress 
                                ? `${colors.warning}20`
                                : `${colors.textMuted}20`,
                            color: isCompleted 
                              ? colors.success
                              : isInProgress 
                                ? colors.warning
                                : colors.textMuted
                          }}>
                            {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started'}
                          </span>
                          {hasBackendData && (
                            <span style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '50px',
                              fontSize: '0.65rem',
                              fontWeight: '600',
                              backgroundColor: `${colors.success}15`,
                              color: colors.success
                            }}>
                              🔄 Live
                            </span>
                          )}
                        </div>
                        
                        <p style={{
                          color: colors.textSecondary,
                          margin: '0 0 1rem 0',
                          fontSize: '0.875rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span>👨‍🏫</span>
                          {course.instructor?.name || 'Unknown Instructor'}
                        </p>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          fontSize: '0.875rem',
                          color: colors.textSecondary,
                          marginBottom: '1rem'
                        }}>
                          <span>📊 {completedLessons} of {totalLessons} lessons</span>
                          <span>⏱️ {course.estimatedHours || 0} hours</span>
                          {hasBackendData && <span>🔄 Backend Data</span>}
                        </div>

                        {/* Progress bar */}
                        <ProgressBar 
                          courseId={course._id}
                          completed={completedLessons}
                          total={totalLessons}
                          showPercentage={true}
                          showNumbers={false}
                          size="medium"
                          animated={true}
                          realTime={hasBackendData}
                        />
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/student/course/${course._id}/progress`);
                        }}
                        style={{
                          padding: '1rem 1.5rem',
                          backgroundColor: colors.primary,
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.75rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          whiteSpace: 'nowrap',
                          boxShadow: `0 4px 15px ${colors.primary}33`
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = colors.primaryHover;
                          e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = colors.primary;
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        {isCompleted ? 'Review Course' : 'Continue Learning'}
                      </button>
                    </div>

                    {/* Progress Details Footer */}
                    <div style={{
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: `1px solid ${colors.border}`,
                      fontSize: '0.75rem',
                      color: colors.textSecondary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>
                        {hasBackendData ? 'Real-time progress data' : 'Using cached data'}
                      </span>
                      {courseProgressData[course._id]?.lastAccessedAt && (
                        <span>
                          Last activity: {new Date(courseProgressData[course._id].lastAccessedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Refresh Button */}
          <div style={{
            textAlign: 'center',
            marginTop: '2rem',
            padding: '1rem'
          }}>
            <button
              onClick={fetchEnrolledCourses}
              disabled={loading}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: loading ? colors.textMuted : colors.info,
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Refreshing...' : 'Refresh Progress Data'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentProgress;