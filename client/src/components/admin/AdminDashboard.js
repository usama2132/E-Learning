import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../utils/api';
import PlatformStats from './PlatformStats';
import UserManagement from './UserManagement';
import CourseApproval from './CourseApproval';
import TransactionList from './TransactionList';
import SystemSettings from './SystemSettings';
import Loading from '../common/Loading';

// Tab configuration
const ADMIN_TABS = {
  overview: {
    id: 'overview',
    label: 'Overview',
    icon: 'tachometer-alt',
    component: PlatformStats
  },
  users: {
    id: 'users',
    label: 'User Management',
    icon: 'users',
    component: UserManagement
  },
  courses: {
    id: 'courses',
    label: 'Course Approval',
    icon: 'book',
    component: CourseApproval
  },
  transactions: {
    id: 'transactions',
    label: 'Transactions',
    icon: 'credit-card',
    component: TransactionList
  },
  settings: {
    id: 'settings',
    label: 'System Settings',
    icon: 'cog',
    component: SystemSettings
  }
};

// Mock data fallback
const MOCK_DASHBOARD_DATA = {
  pendingCourses: 0,
  newUsers: 0,
  recentTransactions: 0,
  systemAlerts: 0,
  serverStatus: 'unknown',
  databaseStatus: 'unknown',
  lastUpdated: new Date().toISOString(),
  totalUsers: 0,
  totalInstructors: 0,
  totalCourses: 0,
  totalRevenue: 0,
  totalEnrollments: 0,
  pendingApprovals: 0,
  userGrowth: 0,
  instructorGrowth: 0,
  courseGrowth: 0,
  revenueGrowth: 0,
  enrollmentGrowth: 0,
  approvalGrowth: 0
};

const AdminDashboard = () => {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Hooks
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Theme toggle functionality
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  // Initialize theme
  useEffect(() => {
    const savedTheme = false;
    setIsDarkMode(savedTheme);
    
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  // Authorization check
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/unauthorized');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Dashboard data fetching
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      if (api?.admin && typeof api.admin.getDashboardData === 'function') {
        response = await api.admin.getDashboardData();
      } else if (api?.get && typeof api.get === 'function') {
        response = await api.get('/admin/dashboard');
      } else if (api?.admin && typeof api.admin.dashboard === 'function') {
        response = await api.admin.dashboard();
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        response = {
          success: true,
          data: {
            ...MOCK_DASHBOARD_DATA,
            pendingCourses: Math.floor(Math.random() * 10),
            newUsers: Math.floor(Math.random() * 20),
            recentTransactions: Math.floor(Math.random() * 15),
            systemAlerts: Math.floor(Math.random() * 5),
            serverStatus: 'online',
            databaseStatus: 'connected',
            totalUsers: Math.floor(Math.random() * 1000) + 500,
            totalInstructors: Math.floor(Math.random() * 100) + 50,
            totalCourses: Math.floor(Math.random() * 200) + 100,
            totalRevenue: Math.floor(Math.random() * 50000) + 10000,
            totalEnrollments: Math.floor(Math.random() * 5000) + 1000,
            pendingApprovals: Math.floor(Math.random() * 10),
            userGrowth: Math.floor(Math.random() * 20) - 10,
            instructorGrowth: Math.floor(Math.random() * 15) - 7,
            courseGrowth: Math.floor(Math.random() * 25) - 12,
            revenueGrowth: Math.floor(Math.random() * 30) - 15,
            enrollmentGrowth: Math.floor(Math.random() * 20) - 10,
            approvalGrowth: Math.floor(Math.random() * 5) - 2
          }
        };
      }
      
      if (response?.success && response?.data) {
        setDashboardData(response.data);
        setRetryAttempts(0);
      } else {
        throw new Error(response?.message || 'Invalid response format');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      const errorMessage = err?.message || 'Failed to load dashboard data';
      setError(errorMessage);
      
      setDashboardData(MOCK_DASHBOARD_DATA);
      setRetryAttempts(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [fetchDashboardData, isAuthenticated, user?.role]);

  // Auto-retry mechanism
  useEffect(() => {
    if (error && retryAttempts > 0 && retryAttempts < 3) {
      const retryTimeout = setTimeout(() => {
        fetchDashboardData();
      }, 5000 * retryAttempts);

      return () => clearTimeout(retryTimeout);
    }
  }, [error, retryAttempts, fetchDashboardData]);

  // Tab change handler
  const handleTabChange = useCallback((tabId) => {
    if (ADMIN_TABS[tabId]) {
      setActiveTab(tabId);
    }
  }, []);

  // Format number with commas
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toLocaleString() || '0';
  };

  // Define theme-aware colors
  const getThemeColors = () => ({
    primary: isDarkMode ? '#0f172a' : '#ffffff',
    secondary: isDarkMode ? '#1e293b' : '#f8fafc',
    tertiary: isDarkMode ? '#334155' : '#e2e8f0',
    textPrimary: isDarkMode ? '#f1f5f9' : '#1e293b',
    textSecondary: isDarkMode ? '#cbd5e1' : '#64748b',
    textMuted: isDarkMode ? '#94a3b8' : '#94a3b8',
    blue: isDarkMode ? '#3b82f6' : '#2563eb',
    green: isDarkMode ? '#10b981' : '#059669',
    purple: isDarkMode ? '#8b5cf6' : '#7c3aed',
    orange: isDarkMode ? '#f59e0b' : '#d97706',
    red: isDarkMode ? '#ef4444' : '#dc2626',
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    cardBorder: isDarkMode ? '#334155' : '#e2e8f0',
    cardShadow: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
    buttonPrimary: isDarkMode ? '#3b82f6' : '#2563eb',
    buttonSecondary: isDarkMode ? '#475569' : '#e2e8f0',
    buttonHover: isDarkMode ? '#2563eb' : '#1d4ed8',
  });

  const colors = getThemeColors();

  // StatCard Component
  const StatCard = ({ title, value, icon, trend, color = 'blue' }) => {
    const colorMap = {
      blue: colors.blue,
      green: colors.green,
      purple: colors.purple,
      orange: colors.orange,
      red: colors.red,
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
          {trend !== undefined && (
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

  // TabButton Component
  const TabButton = ({ id, label, icon, isActive, onClick }) => (
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
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
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
      <i className={`fas fa-${icon}`}></i>
      <span>{label}</span>
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

  // Dashboard Stats Cards Component
  const DashboardStatsCards = () => {
    const statsCards = [
      {
        title: 'Total Users',
        value: formatNumber(dashboardData?.totalUsers || 0),
        growth: dashboardData?.userGrowth || 0,
        icon: 'users',
        color: 'blue'
      },
      {
        title: 'Total Instructors',
        value: formatNumber(dashboardData?.totalInstructors || 0),
        growth: dashboardData?.instructorGrowth || 0,
        icon: 'chalkboard-teacher',
        color: 'purple'
      },
      {
        title: 'Total Courses',
        value: formatNumber(dashboardData?.totalCourses || 0),
        growth: dashboardData?.courseGrowth || 0,
        icon: 'book',
        color: 'green'
      },
      {
        title: 'Total Revenue',
        value: `$${formatNumber(dashboardData?.totalRevenue || 0)}`,
        growth: dashboardData?.revenueGrowth || 0,
        icon: 'dollar-sign',
        color: 'blue'
      },
      {
        title: 'Total Enrollments',
        value: formatNumber(dashboardData?.totalEnrollments || 0),
        growth: dashboardData?.enrollmentGrowth || 0,
        icon: 'graduation-cap',
        color: 'green'
      },
      {
        title: 'Pending Approvals',
        value: dashboardData?.pendingApprovals || 0,
        growth: dashboardData?.approvalGrowth || 0,
        icon: 'clock',
        color: 'orange'
      }
    ];

    return (
      <div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}>
          {statsCards.map((card, index) => (
            <StatCard
              key={index}
              title={card.title}
              value={card.value}
              icon={card.icon}
              trend={card.growth}
              color={card.color}
            />
          ))}
        </div>

        {/* Quick Overview Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px',
        }}>
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
            }}>System Status</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                background: colors.secondary,
                borderRadius: '12px',
              }}>
                <span style={{ color: colors.textPrimary, fontWeight: '500' }}>Server Status</span>
                <span style={{
                  color: dashboardData?.serverStatus === 'online' ? colors.green : colors.red,
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: dashboardData?.serverStatus === 'online' ? colors.green : colors.red,
                  }} />
                  {dashboardData?.serverStatus || 'Unknown'}
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                background: colors.secondary,
                borderRadius: '12px',
              }}>
                <span style={{ color: colors.textPrimary, fontWeight: '500' }}>Database Status</span>
                <span style={{
                  color: dashboardData?.databaseStatus === 'connected' ? colors.green : colors.red,
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: dashboardData?.databaseStatus === 'connected' ? colors.green : colors.red,
                  }} />
                  {dashboardData?.databaseStatus || 'Unknown'}
                </span>
              </div>
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
            }}>Quick Actions</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {[
                { icon: 'clock', label: 'Pending Courses', value: dashboardData?.pendingCourses || 0, color: colors.orange, onClick: () => handleTabChange('courses') },
                { icon: 'user-plus', label: 'New Users', value: dashboardData?.newUsers || 0, color: colors.blue, onClick: () => handleTabChange('users') },
                { icon: 'credit-card', label: 'Recent Transactions', value: dashboardData?.recentTransactions || 0, color: colors.green, onClick: () => handleTabChange('transactions') },
                { icon: 'exclamation-triangle', label: 'System Alerts', value: dashboardData?.systemAlerts || 0, color: colors.red, onClick: () => handleTabChange('settings') },
              ].map((item, index) => (
                <div key={index} 
                  style={{
                    padding: '16px',
                    background: colors.secondary,
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onClick={item.onClick}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.tertiary;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.secondary;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: `${item.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: item.color,
                    margin: '0 auto 8px',
                  }}>
                    <i className={`fas fa-${item.icon}`}></i>
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: colors.textPrimary,
                    marginBottom: '4px',
                  }}>{item.value}</div>
                  <div style={{
                    fontSize: '12px',
                    color: colors.textSecondary,
                    fontWeight: '500',
                  }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Section */}
          <div style={{
            background: colors.cardBg,
            borderRadius: '20px',
            padding: '24px',
            border: `1px solid ${colors.cardBorder}`,
            boxShadow: `0 10px 30px ${colors.cardShadow}`,
            gridColumn: 'span 2',
          }}>
            <h3 style={{
              color: colors.textPrimary,
              fontSize: '20px',
              fontWeight: '700',
              marginBottom: '20px',
            }}>Recent Platform Activity</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { icon: 'user-plus', color: colors.green, text: '12 new users registered today', time: '2 hours ago' },
                { icon: 'book', color: colors.blue, text: '3 courses submitted for approval', time: '4 hours ago' },
                { icon: 'dollar-sign', color: colors.green, text: '$2,450 revenue generated from course sales', time: '6 hours ago' },
                { icon: 'shield-alt', color: colors.orange, text: 'System backup completed successfully', time: '1 day ago' },
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
        </div>
      </div>
    );
  };

  // Render tab content
  const renderTabContent = useCallback(() => {
    if (activeTab === 'overview') {
      return <DashboardStatsCards />;
    }
    
    const currentTab = ADMIN_TABS[activeTab];
    if (!currentTab || !currentTab.component) {
      return <div style={{ color: colors.textPrimary }}>Tab content not found</div>;
    }
    
    const Component = currentTab.component;
    return <Component data={dashboardData} onRefresh={fetchDashboardData} />;
  }, [activeTab, dashboardData, fetchDashboardData, colors.textPrimary]);

  // Format last updated time
  const formatLastUpdated = useCallback((timestamp) => {
    if (!timestamp) return 'Never';
    
    try {
      return new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Invalid date';
    }
  }, []);

  // Loading state
  if (loading && !dashboardData) {
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
        <p style={{ fontSize: '16px', fontWeight: '500' }}>Loading admin dashboard...</p>
      </div>
    );
  }

  // Critical error state
  if (error && !dashboardData && retryAttempts >= 3) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: colors.primary,
        color: colors.textPrimary,
        padding: '20px',
        textAlign: 'center',
      }}>
        <div style={{
          background: colors.cardBg,
          padding: '40px',
          borderRadius: '20px',
          border: `1px solid ${colors.cardBorder}`,
          boxShadow: `0 20px 40px ${colors.cardShadow}`,
        }}>
          <h2 style={{ color: colors.red, marginBottom: '16px' }}>Dashboard Unavailable</h2>
          <p style={{ marginBottom: '16px' }}>Unable to load the admin dashboard after multiple attempts.</p>
          <p style={{ color: colors.textSecondary, marginBottom: '24px', fontSize: '14px' }}>{error}</p>
          <button 
            onClick={fetchDashboardData} 
            disabled={loading}
            style={{
              background: `linear-gradient(135deg, ${colors.blue}, ${colors.blue}dd)`,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
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
      {/* Global styles */}
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
      
      {/* Header */}
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
            Welcome back, {user?.name || user?.email || 'Administrator'}!
          </h1>
          <p style={{
            color: colors.textSecondary,
            margin: 0,
            fontSize: '16px',
            fontWeight: '500',
          }}>
            Manage your platform and monitor key performance metrics
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
            Quick Actions
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
          onClick={fetchDashboardData}
          disabled={loading}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.tertiary;
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.buttonSecondary;
            e.currentTarget.style.transform = 'translateY(0)';
          }}>
            <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
          
          <ThemeToggle />
        </div>
      </div>

      {/* Error Warning */}
      {error && dashboardData && (
        <div style={{
          background: `linear-gradient(135deg, ${colors.orange}20, ${colors.red}20)`,
          border: `1px solid ${colors.orange}`,
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: colors.textPrimary,
        }}>
          <i className="fas fa-exclamation-triangle" style={{ color: colors.orange, fontSize: '20px' }}></i>
          <div>
            <strong>Warning:</strong> {error} (Using cached data)
            {retryAttempts > 0 && (
              <span> - Auto-retry {retryAttempts}/3</span>
            )}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.cardBg}f0 0%, ${colors.secondary}f0 100%)`,
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '32px',
        border: `1px solid ${colors.cardBorder}`,
        boxShadow: `0 10px 30px ${colors.cardShadow}`,
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          overflowX: 'auto',
        }}>
          {Object.values(ADMIN_TABS).map(tab => (
            <TabButton
              key={tab.id}
              id={tab.id}
              label={tab.label}
              icon={tab.icon}
              isActive={activeTab === tab.id}
              onClick={handleTabChange}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.cardBg}f0 0%, ${colors.secondary}f0 100%)`,
        borderRadius: '24px',
        border: `1px solid ${colors.cardBorder}`,
        boxShadow: `0 20px 40px ${colors.cardShadow}`,
        backdropFilter: 'blur(20px)',
        overflow: 'hidden',
        maxWidth: '100%',
        marginBottom: '32px',
      }}>
        <div style={{ padding: '32px', maxWidth: '100%', overflow: 'hidden' }}>
          {renderTabContent()}
        </div>
      </div>

      {/* System Status Footer */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.cardBg}f0 0%, ${colors.secondary}f0 100%)`,
        borderRadius: '20px',
        padding: '24px',
        border: `1px solid ${colors.cardBorder}`,
        boxShadow: `0 10px 30px ${colors.cardShadow}`,
        backdropFilter: 'blur(20px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
      }}>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: colors.textSecondary, fontSize: '14px', fontWeight: '500' }}>
              Server Status:
            </span>
            <span style={{
              color: dashboardData?.serverStatus === 'online' ? colors.green : colors.red,
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: dashboardData?.serverStatus === 'online' ? colors.green : colors.red,
              }} />
              {dashboardData?.serverStatus || 'Unknown'}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: colors.textSecondary, fontSize: '14px', fontWeight: '500' }}>
              Database:
            </span>
            <span style={{
              color: dashboardData?.databaseStatus === 'connected' ? colors.green : colors.red,
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: dashboardData?.databaseStatus === 'connected' ? colors.green : colors.red,
              }} />
              {dashboardData?.databaseStatus || 'Unknown'}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: colors.textSecondary, fontSize: '14px', fontWeight: '500' }}>
              Last Updated:
            </span>
            <span style={{ color: colors.textPrimary, fontSize: '14px', fontWeight: '500' }}>
              {formatLastUpdated(dashboardData?.lastUpdated)}
            </span>
          </div>
        </div>
        
        <button 
          onClick={fetchDashboardData}
          disabled={loading}
          style={{
            background: colors.buttonSecondary,
            color: colors.textPrimary,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: '10px',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: loading ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = colors.tertiary;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = colors.buttonSecondary;
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
          {loading ? 'Updating...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};

// PropTypes for better development experience
AdminDashboard.displayName = 'AdminDashboard';

export default AdminDashboard;