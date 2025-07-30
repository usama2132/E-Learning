import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import useCourses from '../../hooks/useCourses';
import CourseAnalytics from './CourseAnalytics';
import EarningsChart from './EarningsChart';
import MyCourses from './MyCourses';


const InstructorDashboard = () => {
  const { user } = useAuth();
  const { courses, loading, fetchInstructorCourses } = useCourses();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalEarnings: 0,
    pendingApproval: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Theme toggle functionality
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    // Apply theme to document
    if (newTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  // Initialize theme on component mount
  useEffect(() => {
    // Check if user has a theme preference (you can expand this to use localStorage alternative)
    const savedTheme = false; // Set default to light mode
    setIsDarkMode(savedTheme);
    
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  // Debug logging
  console.log('InstructorDashboard - User:', user);
  console.log('InstructorDashboard - User ID:', user?.id);
  console.log('InstructorDashboard - Courses:', courses);
  console.log('InstructorDashboard - Loading:', loading);

  useEffect(() => {
    // Add safety checks and better error handling
    if (user && (user.id || user._id)) {
      const userId = user.id || user._id;
      console.log('Fetching instructor courses for user ID:', userId);
      
      try {
        fetchInstructorCourses(userId);
        fetchInstructorStats(userId);
      } catch (error) {
        console.error('Error in useEffect:', error);
      }
    } else {
      console.warn('User or User ID not available:', user);
    }
  }, [user, fetchInstructorCourses]);

  const fetchInstructorStats = async (userId) => {
    try {
      console.log('Fetching stats for user ID:', userId);
      // Mock data for now to prevent API errors
      const mockStats = {
        totalCourses: 5,
        totalStudents: 150,
        totalEarnings: 2500,
        pendingApproval: 2
      };
      setStats(mockStats);
      
      // Uncomment this when your API is working
      // const response = await fetch(`/api/instructors/${userId}/stats`);
      // if (response.ok) {
      //   const data = await response.json();
      //   setStats(data);
      // } else {
      //   console.error('Failed to fetch stats:', response.statusText);
      // }
    } catch (error) {
      console.error('Error fetching instructor stats:', error);
      // Set default stats on error
      setStats({
        totalCourses: 0,
        totalStudents: 0,
        totalEarnings: 0,
        pendingApproval: 0
      });
    }
  };

  // Define theme-aware colors
  const getThemeColors = () => ({
    // Background colors
    primary: isDarkMode ? '#0f172a' : '#ffffff',
    secondary: isDarkMode ? '#1e293b' : '#f8fafc',
    tertiary: isDarkMode ? '#334155' : '#e2e8f0',
    
    // Text colors
    textPrimary: isDarkMode ? '#f1f5f9' : '#1e293b',
    textSecondary: isDarkMode ? '#cbd5e1' : '#64748b',
    textMuted: isDarkMode ? '#94a3b8' : '#94a3b8',
    
    // Accent colors
    blue: isDarkMode ? '#3b82f6' : '#2563eb',
    green: isDarkMode ? '#10b981' : '#059669',
    purple: isDarkMode ? '#8b5cf6' : '#7c3aed',
    orange: isDarkMode ? '#f59e0b' : '#d97706',
    
    // Card colors
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    cardBorder: isDarkMode ? '#334155' : '#e2e8f0',
    cardShadow: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
    
    // Button colors
    buttonPrimary: isDarkMode ? '#3b82f6' : '#2563eb',
    buttonSecondary: isDarkMode ? '#475569' : '#e2e8f0',
    buttonHover: isDarkMode ? '#2563eb' : '#1d4ed8',
  });

  const colors = getThemeColors();

  const StatCard = ({ title, value, icon, trend, color = 'blue' }) => {
    const colorMap = {
      blue: colors.blue,
      green: colors.green,
      purple: colors.purple,
      orange: colors.orange,
    };

    return (
      <div style={{
        background: `linear-gradient(135deg, ${colors.cardBg} 0%, ${isDarkMode ? '#2d3748' : '#f7fafc'} 100%)`,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '20px',
        padding: '24px',
        boxShadow: `0 10px 30px ${colors.cardShadow}, 0 0 0 1px ${colors.cardBorder}`,
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        minHeight: '140px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = `0 20px 40px ${colors.cardShadow}, 0 0 0 1px ${colorMap[color]}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = `0 10px 30px ${colors.cardShadow}, 0 0 0 1px ${colors.cardBorder}`;
      }}>
        {/* Decorative gradient overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: `linear-gradient(135deg, ${colorMap[color]}20, transparent)`,
          borderRadius: '0 20px 0 100px',
        }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            background: `linear-gradient(135deg, ${colorMap[color]}, ${colorMap[color]}dd)`,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '20px',
            boxShadow: `0 4px 20px ${colorMap[color]}40`,
          }}>
            <i className={`fas fa-${icon}`}></i>
          </div>
          {trend && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              backgroundColor: trend > 0 ? '#10b98120' : '#ef444420',
              color: trend > 0 ? '#10b981' : '#ef4444',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
            }}>
              <i className={`fas fa-arrow-${trend > 0 ? 'up' : 'down'}`}></i>
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        
        <div>
          <h3 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: colors.textPrimary,
            margin: '0 0 4px 0',
            lineHeight: '1',
          }}>{value || 0}</h3>
          <p style={{
            color: colors.textSecondary,
            margin: 0,
            fontSize: '14px',
            fontWeight: '500',
          }}>{title}</p>
        </div>
      </div>
    );
  };

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      style={{
        background: isActive 
          ? `linear-gradient(135deg, ${colors.blue}, ${colors.blue}dd)` 
          : 'transparent',
        color: isActive ? 'white' : colors.textSecondary,
        border: `1px solid ${isActive ? colors.blue : colors.cardBorder}`,
        borderRadius: '12px',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={() => onClick(id)}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = colors.secondary;
          e.currentTarget.style.color = colors.textPrimary;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = colors.textSecondary;
        }
      }}
    >
      {label}
    </button>
  );

  // Theme Toggle Button Component
  const ThemeToggle = () => (
    <button 
      style={{
        minWidth: '50px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0',
        marginLeft: '0.5rem',
        background: `linear-gradient(135deg, ${colors.buttonSecondary}, ${isDarkMode ? '#64748b' : '#cbd5e1'})`,
        border: `1px solid ${colors.cardBorder}`,
        color: colors.textPrimary,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: `0 4px 15px ${colors.cardShadow}`,
      }}
      onClick={toggleTheme}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = `0 8px 25px ${colors.cardShadow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = `0 4px 15px ${colors.cardShadow}`;
      }}
    >
      <i className={`fas fa-${isDarkMode ? 'sun' : 'moon'}`}></i>
    </button>
  );

  // Add safety check for user
  if (!user) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: colors.primary,
        color: colors.textPrimary,
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: `3px solid ${colors.blue}`,
          borderTop: '3px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px',
        }} />
        <p style={{ fontSize: '16px', fontWeight: '500' }}>Loading user data...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: colors.primary,
        color: colors.textPrimary,
      }}>
        <div style={{
          width: '50px',
          height: '50px',
        
          border: `3px solid ${colors.blue}`,
          borderTop: '3px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px',
        }} />
        <p style={{ fontSize: '16px', fontWeight: '500' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: '100%',
      overflow: 'hidden',
    }}>
      {/* Global styles for animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .fade-in-up {
            animation: fadeInUp 0.6s ease-out;
          }
        `}
      </style>
      
      <div style={{
        background: `linear-gradient(135deg, ${colors.cardBg}f0 0%, ${colors.secondary}f0 100%)`,
        borderRadius: '24px',
        padding: '32px',
        marginBottom: '32px',
        border: `1px solid ${colors.cardBorder}`,
        boxShadow: `0 20px 40px ${colors.cardShadow}`,
        backdropFilter: 'blur(20px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
      }}>
        <div className="fade-in-up">
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 36px)',
            fontWeight: '800',
           color: isDarkMode ? colors.blue : colors.blue,
             margin: '0 0 8px 0',
            lineHeight: '1.2',
          }}>
            Welcome back, {user?.firstName || user?.name || 'Instructor'}!
          </h1>
          <p style={{
            color: colors.textSecondary,
            margin: 0,
            fontSize: '16px',
            fontWeight: '500',
          }}>
            Manage your courses and track your teaching performance
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button style={{
            background: `linear-gradient(135deg, ${colors.blue}, ${colors.blue}dd)`,
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: `0 4px 20px ${colors.blue}40`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 8px 30px ${colors.blue}50`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 4px 20px ${colors.blue}40`;
          }}>
            <i className="fas fa-plus"></i>
            Create New Course
          </button>
          
          <button style={{
            background: colors.buttonSecondary,
            color: colors.textPrimary,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: '12px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.tertiary;
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.buttonSecondary;
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            <i className="fas fa-chart-line"></i>
            View Analytics
          </button>
          
          <ThemeToggle />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px',
        maxWidth: '100%',
      }}>
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          icon="book"
          trend={12}
          color="blue"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents ? stats.totalStudents.toLocaleString() : '0'}
          icon="users"
          trend={8}
          color="green"
        />
        <StatCard
          title="Total Earnings"
          value={`$${stats.totalEarnings ? stats.totalEarnings.toLocaleString() : '0'}`}
          icon="dollar-sign"
          trend={15}
          color="purple"
        />
        <StatCard
          title="Pending Approval"
          value={stats.pendingApproval}
          icon="clock"
          color="orange"
        />
      </div>

      <div style={{
        background: `linear-gradient(135deg, ${colors.cardBg}f0 0%, ${colors.secondary}f0 100%)`,
        borderRadius: '24px',
        border: `1px solid ${colors.cardBorder}`,
        boxShadow: `0 20px 40px ${colors.cardShadow}`,
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
        maxWidth: '100%',
      }}>
        <div style={{
          padding: '24px 32px',
          borderBottom: `1px solid ${colors.cardBorder}`,
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          overflowX: 'auto',
        }}>
          <TabButton
            id="overview"
            label="Overview"
            isActive={activeTab === 'overview'}
            onClick={setActiveTab}
          />
          <TabButton
            id="courses"
            label="My Courses"
            isActive={activeTab === 'courses'}
            onClick={setActiveTab}
          />
          <TabButton
            id="analytics"
            label="Analytics"
            isActive={activeTab === 'analytics'}
            onClick={setActiveTab}
          />
          <TabButton
            id="earnings"
            label="Earnings"
            isActive={activeTab === 'earnings'}
            onClick={setActiveTab}
          />
        </div>

        <div style={{ padding: '32px', maxWidth: '100%', overflow: 'hidden' }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
              <div style={{
                background: colors.cardBg,
                borderRadius: '20px',
                padding: '24px',
                border: `1px solid ${colors.cardBorder}`,
                boxShadow: `0 10px 30px ${colors.cardShadow}`,
              }}>
                <h3 style={{
                  color: colors.textPrimary,
                  fontSize: '20px',
                  fontWeight: '700',
                  marginBottom: '20px',
                }}>Recent Activity</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { icon: 'user-plus', color: colors.green, text: '5 new students enrolled in "React Fundamentals"', time: '2 hours ago' },
                    { icon: 'star', color: colors.orange, text: 'New 5-star review on "JavaScript Mastery"', time: '1 day ago' },
                    { icon: 'dollar-sign', color: colors.green, text: '$150 earned from course sales', time: '2 days ago' },
                  ].map((activity, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'flex-start',
                      padding: '16px',
                      background: colors.secondary,
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: `${activity.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: activity.color,
                      }}>
                        <i className={`fas fa-${activity.icon}`}></i>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          color: colors.textPrimary,
                          margin: '0 0 4px 0',
                          fontSize: '14px',
                          fontWeight: '500',
                        }}>{activity.text}</p>
                        <span style={{
                          color: colors.textMuted,
                          fontSize: '12px',
                        }}>{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{
                background: colors.cardBg,
                borderRadius: '20px',
                padding: '24px',
                border: `1px solid ${colors.cardBorder}`,
                boxShadow: `0 10px 30px ${colors.cardShadow}`,
              }}>
                <h3 style={{
                  color: colors.textPrimary,
                  fontSize: '20px',
                  fontWeight: '700',
                  marginBottom: '20px',
                }}>This Month</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '20px' }}>
                  {[
                    { value: '24', label: 'New Enrollments', color: colors.blue },
                    { value: '4.8', label: 'Avg Rating', color: colors.orange },
                    { value: '89%', label: 'Completion Rate', color: colors.green },
                  ].map((stat, index) => (
                    <div key={index} style={{
                      textAlign: 'center',
                      padding: '16px',
                      background: colors.secondary,
                      borderRadius: '12px',
                    }}>
                      <span style={{
                        display: 'block',
                        fontSize: '24px',
                        fontWeight: '700',
                        color: stat.color,
                        marginBottom: '4px',
                      }}>{stat.value}</span>
                      <span style={{
                        fontSize: '12px',
                        color: colors.textSecondary,
                        fontWeight: '500',
                      }}>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'courses' && <MyCourses />}
          {activeTab === 'analytics' && <CourseAnalytics />}
          {activeTab === 'earnings' && <EarningsChart />}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;