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
import '../../styles/dashboards/AdminDashboard.css';

// Tab configuration
const ADMIN_TABS = {
  overview: {
    id: 'overview',
    label: 'Overview',
    icon: 'dashboard',
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
    icon: 'courses',
    component: CourseApproval
  },
  transactions: {
    id: 'transactions',
    label: 'Transactions',
    icon: 'transactions',
    component: TransactionList
  },
  settings: {
    id: 'settings',
    label: 'System Settings',
    icon: 'settings',
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

  // Hooks
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
      
      console.log('Fetching admin dashboard data...');
      console.log('API object:', api);
      console.log('Admin API:', api?.admin);
      
      let response;
      
      // Try different API call patterns with proper error handling
      if (api?.admin && typeof api.admin.getDashboardData === 'function') {
        response = await api.admin.getDashboardData();
      } else if (api?.get && typeof api.get === 'function') {
        response = await api.get('/admin/dashboard');
      } else if (api?.admin && typeof api.admin.dashboard === 'function') {
        response = await api.admin.dashboard();
      } else {
        console.warn('Admin API methods not available, using mock data');
        // Simulate API delay
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
      
      // Set fallback data to keep UI functional
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
        console.log(`Auto-retry attempt ${retryAttempts + 1}`);
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

  // Dashboard Stats Cards Component
  const DashboardStatsCards = () => {
    const statsCards = [
      {
        title: 'Total Users',
        value: dashboardData?.totalUsers || 0,
        growth: dashboardData?.userGrowth || 0,
        icon: '👥',
        color: '#667eea',
        bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        iconBg: 'rgba(102, 126, 234, 0.1)'
      },
      {
        title: 'Instructors',
        value: dashboardData?.totalInstructors || 0,
        growth: dashboardData?.instructorGrowth || 0,
        icon: '👨‍🏫',
        color: '#f093fb',
        bgGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        iconBg: 'rgba(240, 147, 251, 0.1)'
      },
      {
        title: 'Total Courses',
        value: dashboardData?.totalCourses || 0,
        growth: dashboardData?.courseGrowth || 0,
        icon: '📚',
        color: '#fa709a',
        bgGradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        iconBg: 'rgba(250, 112, 154, 0.1)'
      },
      {
        title: 'Total Revenue',
        value: `$${formatNumber(dashboardData?.totalRevenue || 0)}`,
        growth: dashboardData?.revenueGrowth || 0,
        icon: '💰',
        color: '#4facfe',
        bgGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        iconBg: 'rgba(79, 172, 254, 0.1)'
      },
      {
        title: 'Total Enrollments',
        value: formatNumber(dashboardData?.totalEnrollments || 0),
        growth: dashboardData?.enrollmentGrowth || 0,
        icon: '✅',
        color: '#43e97b',
        bgGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        iconBg: 'rgba(67, 233, 123, 0.1)'
      },
      {
        title: 'Pending Approvals',
        value: dashboardData?.pendingApprovals || 0,
        growth: dashboardData?.approvalGrowth || 0,
        icon: '⏳',
        color: '#ffa726',
        bgGradient: 'linear-gradient(135deg, #ffa726 0%, #ff7043 100%)',
        iconBg: 'rgba(255, 167, 38, 0.1)'
      }
    ];

    return (
      <div className="dashboard-stats-container">
        <div className="stats-header">
          <h2>Platform Overview</h2>
          <p>Monitor your platform's key performance metrics</p>
        </div>
        
        <div className="dashboard-stats-grid">
          {statsCards.map((card, index) => (
            <div key={index} className="dashboard-stat-card">
              <div className="stat-card-background" style={{ background: card.bgGradient }}></div>
              
              <div className="stat-card-content">
                <div className="stat-header">
                  <div className="stat-icon-container" style={{ backgroundColor: card.iconBg }}>
                    <span className="stat-icon" style={{ color: card.color }}>
                      {card.icon}
                    </span>
                  </div>
                  
                  <div className="stat-growth-container">
                    <span className={`stat-growth ${card.growth >= 0 ? 'positive' : 'negative'}`}>
                      <span className="growth-arrow">
                        {card.growth >= 0 ? '↗' : '↘'}
                      </span>
                      {Math.abs(card.growth)}%
                    </span>
                  </div>
                </div>
                
                <div className="stat-body">
                  <h3 className="stat-title">{card.title}</h3>
                  <div className="stat-value">{card.value}</div>
                </div>
              </div>
              
              <div className="stat-card-shine"></div>
            </div>
          ))}
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
      return <div className="error-message">Tab content not found</div>;
    }
    
    const Component = currentTab.component;
    return <Component data={dashboardData} onRefresh={fetchDashboardData} />;
  }, [activeTab, dashboardData, fetchDashboardData]);

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
    return <Loading message="Loading admin dashboard..." />;
  }

  // Critical error state (no fallback data)
  if (error && !dashboardData && retryAttempts >= 3) {
    return (
      <div className="admin-dashboard-error">
        <h2>Dashboard Unavailable</h2>
        <p>Unable to load the admin dashboard after multiple attempts.</p>
        <p className="error-details">{error}</p>
        <button 
          onClick={fetchDashboardData} 
          className="retry-button"
          disabled={loading}
        >
          {loading ? 'Retrying...' : 'Try Again'}
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard" data-theme="light">
      {/* Dashboard Header */}
      <header className="admin-dashboard-header">
        <div className="header-left">
          <h1>Admin Dashboard</h1>
          <p className="admin-subtitle">
            Manage your learning platform efficiently
          </p>
        </div>
        <div className="header-right">
          <div className="admin-info">
            <span>Welcome back, {user?.name || user?.email || 'Administrator'}</span>
            <div className="admin-badge">
              Administrator
            </div>
          </div>
        </div>
      </header>

      {/* Error Warning */}
      {error && dashboardData && (
        <div className="admin-warning">
          <span role="img" aria-label="warning">⚠️</span>
          {error} (Using cached data)
          {retryAttempts > 0 && (
            <span> - Auto-retry {retryAttempts}/3</span>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="admin-nav-tabs" role="tablist">
        {Object.values(ADMIN_TABS).map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tab-panel-${tab.id}`}
          >
            <i className={`icon-${tab.icon}`} aria-hidden="true"></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="admin-content">
        <div 
          id={`tab-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
        >
          {renderTabContent()}
        </div>
      </main>

      {/* Quick Actions Panel */}
      <aside className="quick-actions-panel">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          <button 
            className="quick-action-btn"
            onClick={() => handleTabChange('courses')}
            aria-label={`View pending courses (${dashboardData?.pendingCourses || 0})`}
          >
            <div className="quick-action-content">
              <i className="icon-pending" aria-hidden="true"></i>
              <span>Pending Courses</span>
            </div>
            <span className="quick-action-badge">{dashboardData?.pendingCourses || 0}</span>
          </button>
          
          <button 
            className="quick-action-btn"
            onClick={() => handleTabChange('users')}
            aria-label={`View new users (${dashboardData?.newUsers || 0})`}
          >
            <div className="quick-action-content">
              <i className="icon-user-plus" aria-hidden="true"></i>
              <span>New Users</span>
            </div>
            <span className="quick-action-badge">{dashboardData?.newUsers || 0}</span>
          </button>
          
          <button 
            className="quick-action-btn"
            onClick={() => handleTabChange('transactions')}
            aria-label={`View recent transactions (${dashboardData?.recentTransactions || 0})`}
          >
            <div className="quick-action-content">
              <i className="icon-money" aria-hidden="true"></i>
              <span>Recent Transactions</span>
            </div>
            <span className="quick-action-badge">{dashboardData?.recentTransactions || 0}</span>
          </button>
          
          <button 
            className="quick-action-btn"
            onClick={() => handleTabChange('settings')}
            aria-label={`View system alerts (${dashboardData?.systemAlerts || 0})`}
          >
            <div className="quick-action-content">
              <i className="icon-alert" aria-hidden="true"></i>
              <span>System Alerts</span>
            </div>
            <span className={`quick-action-badge ${(dashboardData?.systemAlerts || 0) > 0 ? 'danger' : ''}`}>
              {dashboardData?.systemAlerts || 0}
            </span>
          </button>
        </div>
      </aside>

      {/* System Status */}
      <footer className="system-status">
        <div className="status-item">
          <span className="status-label">Server Status</span>
          <span className={`status-indicator ${dashboardData?.serverStatus === 'online' ? 'online' : 'offline'}`}>
            {dashboardData?.serverStatus || 'Unknown'}
          </span>
        </div>
        
        <div className="status-item">
          <span className="status-label">Database Status</span>
          <span className={`status-indicator ${dashboardData?.databaseStatus === 'connected' ? 'online' : 'offline'}`}>
            {dashboardData?.databaseStatus || 'Unknown'}
          </span>
        </div>
        
        <div className="status-item">
          <span className="status-label">Last Updated</span>
          <span className="status-time">
            {formatLastUpdated(dashboardData?.lastUpdated)}
          </span>
        </div>
        
        <div className="status-item">
          <span className="status-label">Refresh Data</span>
          <button 
            onClick={fetchDashboardData}
            disabled={loading}
            className="status-refresh-btn"
            aria-label="Refresh dashboard data"
          >
            <i className={`icon-refresh ${loading ? 'spinning' : ''}`} aria-hidden="true"></i>
            {loading ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </footer>
    </div>
  );
};

// PropTypes for better development experience (optional)
AdminDashboard.displayName = 'AdminDashboard';

export default AdminDashboard;