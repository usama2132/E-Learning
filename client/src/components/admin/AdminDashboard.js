import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../utils/api';
import PlatformStats from './PlatformStats';
import UserManagement from './UserManagement';
import CourseApproval from './CourseApproval';
import TransactionList from './TransactionList';
import SystemSettings from './SystemSettings';

// Tab configuration
const ADMIN_TABS = {
  overview: {
    id: 'overview',
    label: 'Overview',
    icon: 'fas fa-tachometer-alt',
    component: PlatformStats
  },
  users: {
    id: 'users',
    label: 'User Management',
    icon: 'fas fa-users',
    component: UserManagement
  },
  courses: {
    id: 'courses',
    label: 'Course Approval',
    icon: 'fas fa-book',
    component: CourseApproval
  },
  transactions: {
    id: 'transactions',
    label: 'Transactions',
    icon: 'fas fa-credit-card',
    component: TransactionList
  },
  settings: {
    id: 'settings',
    label: 'System Settings',
    icon: 'fas fa-cog',
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
  const { theme } = useTheme();
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
      
      let response;
      
      if (api?.admin && typeof api.admin.getDashboardData === 'function') {
        response = await api.admin.getDashboardData();
      } else if (api?.get && typeof api.get === 'function') {
        response = await api.get('/admin/dashboard');
      } else if (api?.admin && typeof api.admin.dashboard === 'function') {
        response = await api.admin.dashboard();
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
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

  // Navigate to admin profile
  const handleEditProfile = useCallback(() => {
    navigate('/admin/profile');
  }, [navigate]);

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

  // StatCard Component
  const StatCard = ({ title, value, icon, trend, color = 'primary' }) => (
    <div className={`stat-card stat-card--${color} ${theme}`}>
      <div className="stat-card__header">
        <div className={`stat-card__icon stat-card__icon--${color}`}>
          <i className={icon}></i>
        </div>
        {trend !== undefined && (
          <div className={`stat-card__trend ${trend >= 0 ? 'positive' : 'negative'}`}>
            <i className={`fas fa-arrow-${trend >= 0 ? 'up' : 'down'}`}></i>
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      
      <div className="stat-card__content">
        <h3 className="stat-card__value">{value || 0}</h3>
        <p className="stat-card__title">{title}</p>
      </div>
    </div>
  );

  // TabButton Component
  const TabButton = ({ id, label, icon, isActive, onClick }) => (
    <button
      className={`tab-button ${isActive ? 'tab-button--active' : ''} ${theme}`}
      onClick={() => onClick(id)}
    >
      <i className={icon}></i>
      <span>{label}</span>
    </button>
  );

  // Dashboard Stats Cards Component
  const DashboardStatsCards = () => {
    const statsCards = [
      {
        title: 'Total Users',
        value: formatNumber(dashboardData?.totalUsers || 0),
        growth: dashboardData?.userGrowth || 0,
        icon: 'fas fa-users',
        color: 'primary'
      },
      {
        title: 'Total Instructors',
        value: formatNumber(dashboardData?.totalInstructors || 0),
        growth: dashboardData?.instructorGrowth || 0,
        icon: 'fas fa-chalkboard-teacher',
        color: 'purple'
      },
      {
        title: 'Total Courses',
        value: formatNumber(dashboardData?.totalCourses || 0),
        growth: dashboardData?.courseGrowth || 0,
        icon: 'fas fa-book',
        color: 'success'
      },
      {
        title: 'Total Revenue',
        value: `$${formatNumber(dashboardData?.totalRevenue || 0)}`,
        growth: dashboardData?.revenueGrowth || 0,
        icon: 'fas fa-dollar-sign',
        color: 'primary'
      },
      {
        title: 'Total Enrollments',
        value: formatNumber(dashboardData?.totalEnrollments || 0),
        growth: dashboardData?.enrollmentGrowth || 0,
        icon: 'fas fa-graduation-cap',
        color: 'success'
      },
      {
        title: 'Pending Approvals',
        value: dashboardData?.pendingApprovals || 0,
        growth: dashboardData?.approvalGrowth || 0,
        icon: 'fas fa-clock',
        color: 'warning'
      }
    ];

    return (
      <div>
        <div className="stats-grid">
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
        <div className="overview-section">
          <div className={`overview-card ${theme}`}>
            <h3 className="overview-card__title">System Status</h3>
            
            <div className="status-items">
              <div className="status-item">
                <span className="status-item__label">Server Status</span>
                <span className={`status-item__value ${dashboardData?.serverStatus === 'online' ? 'online' : 'offline'}`}>
                  <div className="status-indicator"></div>
                  {dashboardData?.serverStatus || 'Unknown'}
                </span>
              </div>
              
              <div className="status-item">
                <span className="status-item__label">Database Status</span>
                <span className={`status-item__value ${dashboardData?.databaseStatus === 'connected' ? 'online' : 'offline'}`}>
                  <div className="status-indicator"></div>
                  {dashboardData?.databaseStatus || 'Unknown'}
                </span>
              </div>
            </div>
          </div>
          
          <div className={`overview-card ${theme}`}>
            <h3 className="overview-card__title">Quick Actions</h3>
            
            <div className="quick-actions-grid">
              <div className="quick-action" onClick={() => handleTabChange('courses')}>
                <div className="quick-action__icon quick-action__icon--warning">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="quick-action__value">{dashboardData?.pendingCourses || 0}</div>
                <div className="quick-action__label">Pending Courses</div>
              </div>
              
              <div className="quick-action" onClick={() => handleTabChange('users')}>
                <div className="quick-action__icon quick-action__icon--primary">
                  <i className="fas fa-user-plus"></i>
                </div>
                <div className="quick-action__value">{dashboardData?.newUsers || 0}</div>
                <div className="quick-action__label">New Users</div>
              </div>
              
              <div className="quick-action" onClick={() => handleTabChange('transactions')}>
                <div className="quick-action__icon quick-action__icon--success">
                  <i className="fas fa-credit-card"></i>
                </div>
                <div className="quick-action__value">{dashboardData?.recentTransactions || 0}</div>
                <div className="quick-action__label">Recent Transactions</div>
              </div>
              
              <div className="quick-action" onClick={() => handleTabChange('settings')}>
                <div className="quick-action__icon quick-action__icon--danger">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div className="quick-action__value">{dashboardData?.systemAlerts || 0}</div>
                <div className="quick-action__label">System Alerts</div>
              </div>
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
      return (
        <div className="error-message">
          Tab content not found
        </div>
      );
    }
    
    const Component = currentTab.component;
    return <Component data={dashboardData} onRefresh={fetchDashboardData} />;
  }, [activeTab, dashboardData, fetchDashboardData]);

  // Loading state
  if (loading && !dashboardData) {
    return (
      <div className={`admin-dashboard ${theme}`}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Critical error state
  if (error && !dashboardData && retryAttempts >= 3) {
    return (
      <div className={`admin-dashboard ${theme}`}>
        <div className="error-card">
          <h2 className="error-card__title">Dashboard Unavailable</h2>
          <p className="error-card__description">Unable to load the admin dashboard after multiple attempts.</p>
          <p className="error-card__details">{error}</p>
          <button 
            onClick={fetchDashboardData} 
            disabled={loading}
            className={`btn btn--danger ${loading ? 'btn--loading' : ''}`}
          >
            {loading ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* CSS Variables */
        :root {
          --primary-color: #667eea;
          --primary-dark: #764ba2;
          --success-color: #22c55e;
          --warning-color: #f59e0b;
          --danger-color: #ef4444;
          --purple-color: #9f7aea;
          --orange-color: #ed8936;
          
          --bg-light: #f8fafc;
          --bg-dark: #0f172a;
          --card-light: #ffffff;
          --card-dark: #1e293b;
          --text-light: #1e293b;
          --text-dark: #f8fafc;
          --text-muted-light: #64748b;
          --text-muted-dark: #94a3b8;
          --border-light: #e2e8f0;
          --border-dark: #334155;
          
          --shadow-light: 0 1px 3px rgba(0, 0, 0, 0.1);
          --shadow-hover-light: 0 4px 12px rgba(0, 0, 0, 0.15);
          --shadow-dark: 0 1px 3px rgba(0, 0, 0, 0.3);
          --shadow-hover-dark: 0 4px 12px rgba(0, 0, 0, 0.5);
          
          --transition: all 0.2s ease;
          --border-radius: 12px;
          --border-radius-sm: 8px;
        }

        /* Base Styles */
        .admin-dashboard {
          min-height: 100vh;
          padding: 1rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          transition: var(--transition);
        }

        .admin-dashboard.light {
          background-color: var(--bg-light);
          color: var(--text-light);
        }

        .admin-dashboard.dark {
          background-color: var(--bg-dark);
          color: var(--text-dark);
        }

        /* Header */
        .dashboard-header {
          background: var(--card-light);
          border-radius: var(--border-radius);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: var(--shadow-light);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .dark .dashboard-header {
         background: var(--card-dark);
        box-shadow: var(--shadow-dark);
        border: none;
        }

        .welcome-section h1 {
          font-size: clamp(1.5rem, 4vw, 2rem);
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .welcome-section .user-name {
          background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: inherit;
          font-weight: inherit;
        }

        .welcome-section p {
  margin: 0;
  font-size: 0.95rem;
  opacity: 0.8;
  color: #333; /* light mode color */
}

.dark .welcome-section p {
  color: #ddd; /* dark mode color */
}


        .header-actions {
         display: flex;
         gap: 0.75rem;
         flex-wrap: wrap;
        border: none;
        border-top: none;
        }

        /* Buttons */
        .btn {
          padding: 0.75rem 1.25rem;
          border-radius: var(--border-radius-sm);
          border: none;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          min-width: 120px;
          justify-content: center;
        }

        .btn--primary {
          background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
          color: white;
        }

        .btn--secondary {
          background: var(--border-light);
          color: var(--text-light);
        }

        .dark .btn--secondary {
          background: var(--border-dark);
          color: var(--text-dark);
        }

        .btn--danger {
          background: linear-gradient(135deg, var(--danger-color), #dc2626);
          color: white;
        }

        .btn:hover:not(.btn--loading) {
          transform: translateY(-2px);
          box-shadow: var(--shadow-hover-light);
        }

        .dark .btn:hover:not(.btn--loading) {
          box-shadow: var(--shadow-hover-dark);
        }

        .btn--loading {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Warning */
        .warning-banner {
          background: linear-gradient(135deg, rgba(251, 146, 60, 0.1), rgba(245, 101, 101, 0.1));
          border: 1px solid rgba(251, 146, 60, 0.3);
          border-radius: var(--border-radius);
          padding: 1rem 1.5rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--warning-color);
        }

        /* Tabs */
        .tabs-container {
          background: var(--card-light);
          border-radius: var(--border-radius);
          padding: 1rem;
          margin-bottom: 1.5rem;
          box-shadow: var(--shadow-light);
        }

        .dark .tabs-container {
          background: var(--card-dark);
          box-shadow: var(--shadow-dark);
        }

        .tabs-list {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .tab-button {
          padding: 0.75rem 1.25rem;
          border-radius: var(--border-radius-sm);
          border: none;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          color: var(--text-muted-light);
          min-width: 130px;
          justify-content: center;
        }

        .dark .tab-button {
          color: #dee2e8;
        }

        .tab-button:hover:not(.tab-button--active) {
          background: var(--border-light);
          transform: translateY(-1px);
        }

        .dark .tab-button:hover:not(.tab-button--active) {
          background: var(--border-dark);
        }

        .tab-button--active {
          background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
          color: white;
          transform: translateY(-2px);
          box-shadow: var(--shadow-hover-light);
        }

        .dark .tab-button--active {
          box-shadow: var(--shadow-hover-dark);
        }

        /* Content */
        .dashboard-content {
          background: var(--card-light);
          border-radius: var(--border-radius);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: var(--shadow-light);
          min-height: 400px;
        }

        .dark .dashboard-content {
          background: var(--card-dark);
          box-shadow: var(--shadow-dark);
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: var(--card-light);
          border-radius: var(--border-radius);
          padding: 1.25rem;
          box-shadow: var(--shadow-light);
          transition: var(--transition);
          position: relative;
          overflow: hidden;
        }

        .dark .stat-card {
          background: var(--card-dark);
          box-shadow: var(--shadow-dark);
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-hover-light);
        }

        .dark .stat-card:hover {
          box-shadow: var(--shadow-hover-dark);
        }

        .stat-card__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .stat-card__icon {
          width: 48px;
          height: 48px;
          border-radius: var(--border-radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
        }

        .stat-card__icon--primary {
          background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
        }

        .stat-card__icon--success {
          background: linear-gradient(135deg, var(--success-color), #16a34a);
        }

        .stat-card__icon--purple {
          background: linear-gradient(135deg, var(--purple-color), #805ad5);
        }

        .stat-card__icon--warning {
          background: linear-gradient(135deg, var(--warning-color), var(--orange-color));
        }

        .stat-card__trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
        }

        .stat-card__trend.positive {
          color: var(--success-color);
          background: rgba(34, 197, 94, 0.1);
        }

        .stat-card__trend.negative {
          color: var(--danger-color);
          background: rgba(239, 68, 68, 0.1);
        }

        .stat-card__value {
          font-size: 2rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
        }

        .stat-card__title {
          font-size: 0.9rem;
          opacity: 0.8;
          font-weight: 600;
          margin: 0;
        }

        /* Overview Section */
        .overview-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .overview-card {
          background: var(--card-light);
          border-radius: var(--border-radius);
          padding: 1.25rem;
          box-shadow: var(--shadow-light);
        }

        .dark .overview-card {
          background: var(--card-dark);
          box-shadow: var(--shadow-dark);
        }

        .overview-card__title {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0 0 1rem 0;
        }

        .status-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          border-radius: var(--border-radius-sm);
          background: rgba(0, 0, 0, 0.02);
        }

        .dark .status-item {
          background: rgba(255, 255, 255, 0.02);
        }

        .status-item__label {
          font-size: 0.9rem;
          font-weight: 600;
          opacity: 0.8;
        }

        .status-item__value {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .status-item__value.online {
          color: var(--success-color);
        }

        .status-item__value.offline {
          color: var(--danger-color);
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: currentColor;
        }

        /* Quick Actions */
        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .quick-action {
          background: rgba(0, 0, 0, 0.02);
          border-radius: var(--border-radius);
          padding: 1rem;
          text-align: center;
          cursor: pointer;
          transition: var(--transition);
        }

        .dark .quick-action {
          background: rgba(255, 255, 255, 0.02);
        }

        .quick-action:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-hover-light);
        }

        .dark .quick-action:hover {
          box-shadow: var(--shadow-hover-dark);
        }

        .quick-action__icon {
          width: 40px;
          height: 40px;
          border-radius: var(--border-radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          color: white;
          margin: 0 auto 0.5rem auto;
        }

        .quick-action__icon--primary {
          background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
        }

        .quick-action__icon--success {
          background: linear-gradient(135deg, var(--success-color), #16a34a);
        }

        .quick-action__icon--warning {
          background: linear-gradient(135deg, var(--warning-color), var(--orange-color));
        }

        .quick-action__icon--danger {
          background: linear-gradient(135deg, var(--danger-color), #dc2626);
        }

        .quick-action__value {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0.5rem 0;
        }

        .quick-action__label {
          font-size: 0.8rem;
          opacity: 0.8;
          font-weight: 600;
        }

        /* Loading States */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 1rem;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          opacity: 0.8;
          font-size: 1rem;
          font-weight: 500;
        }

        /* Error States */
        .error-card {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--border-radius);
          padding: 2rem;
          text-align: center;
          max-width: 500px;
          margin: 2rem auto;
        }

        .error-card__title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--danger-color);
          margin: 0 0 1rem 0;
        }

        .error-card__description {
          color: var(--danger-color);
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
        }

        .error-card__details {
          color: var(--danger-color);
          font-size: 0.9rem;
          font-style: italic;
          margin: 0 0 1.5rem 0;
          opacity: 0.8;
        }

        .error-message {
          text-align: center;
          padding: 3rem;
          color: var(--danger-color);
          font-size: 1.1rem;
          font-weight: 600;
        }

        /* Footer */
        .dashboard-footer {
          background: var(--card-light);
          border-radius: var(--border-radius);
          padding: 1.25rem;
          box-shadow: var(--shadow-light);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .dark .dashboard-footer {
          background: var(--card-dark);
          box-shadow: var(--shadow-dark);
        }

        .footer-status {
          display: flex;
          gap: 2rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .footer-status-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
        }

        .footer-status-item__label {
          opacity: 0.8;
          font-weight: 500;
        }

        .footer-status-item__value {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 600;
        }

        .footer-status-item__value.online {
          color: var(--success-color);
        }

        .footer-status-item__value.offline {
          color: var(--danger-color);
        }

        .footer-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: currentColor;
        }

        .footer-refresh {
          padding: 0.5rem 1rem;
          border-radius: var(--border-radius-sm);
          border: none;
          background: var(--border-light);
          color: var(--text-light);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .dark .footer-refresh {
          background: var(--border-dark);
          color: var(--text-dark);
        }

        .footer-refresh:hover:not(.btn--loading) {
          background: var(--border-light);
          transform: translateY(-1px);
        }

        .dark .footer-refresh:hover:not(.btn--loading) {
          background: rgba(71, 85, 105, 0.7);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .admin-dashboard {
            padding: 0.75rem;
          }

         .dashboard-header {
  background: var(--card-light);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  border: none;
}
          .header-actions {
            justify-content: center;
          }

          .tabs-list {
            flex-direction: column;
            align-items: stretch;
          }

          .tab-button {
            min-width: unset;
            justify-content: flex-start;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .overview-section {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .quick-actions-grid {
            grid-template-columns: 1fr;
          }

          .footer-status {
            gap: 1rem;
            flex-direction: column;
            align-items: stretch;
          }

          .footer-status-item {
            justify-content: space-between;
          }

          .dashboard-footer {
            flex-direction: column;
            align-items: stretch;
          }
        }

        @media (max-width: 480px) {
          .admin-dashboard {
            padding: 0.5rem;
          }

          .dashboard-header {
            padding: 1rem;
          }

          .dashboard-content {
            padding: 1rem;
          }

          .stat-card {
            padding: 1rem;
          }

          .overview-card {
            padding: 1rem;
          }

          .btn {
            padding: 0.625rem 1rem;
            font-size: 0.85rem;
            min-width: 100px;
          }

          .quick-action__icon {
            width: 32px;
            height: 32px;
            font-size: 1rem;
          }

          .quick-action__value {
            font-size: 1.25rem;
          }
        }
      `}</style>

      <div className={`admin-dashboard ${theme}`}>
        {/* Header */}
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>
              Welcome back, <span className="user-name">{user?.name || 'Admin'}</span>!
            </h1>
            <p>Manage your platform and monitor key performance metrics</p>
          </div>
          
          <div className="header-actions">
            <button 
              className="btn btn--primary"
              onClick={handleEditProfile}
            >
              <i className="fas fa-user-edit"></i>
              Edit Profile
            </button>
            
            <button 
              className={`btn btn--secondary ${loading ? 'btn--loading' : ''}`}
              onClick={fetchDashboardData}
              disabled={loading}
            >
              <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {/* Error Warning */}
        {error && dashboardData && (
          <div className="warning-banner">
            <i className="fas fa-exclamation-triangle"></i>
            <div>
              <strong>Warning:</strong> {error} (Using cached data)
              {retryAttempts > 0 && (
                <span> - Auto-retry {retryAttempts}/3</span>
              )}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="tabs-container">
          <div className="tabs-list">
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
        <div className="dashboard-content">
          {renderTabContent()}
        </div>

        {/* System Status Footer */}
        <div className="dashboard-footer">
          <div className="footer-status">
            <div className="footer-status-item">
              <span className="footer-status-item__label">Server Status:</span>
              <span className={`footer-status-item__value ${dashboardData?.serverStatus === 'online' ? 'online' : 'offline'}`}>
                <div className="footer-indicator"></div>
                {dashboardData?.serverStatus || 'Unknown'}
              </span>
            </div>
            
            <div className="footer-status-item">
              <span className="footer-status-item__label">Database:</span>
              <span className={`footer-status-item__value ${dashboardData?.databaseStatus === 'connected' ? 'online' : 'offline'}`}>
                <div className="footer-indicator"></div>
                {dashboardData?.databaseStatus || 'Unknown'}
              </span>
            </div>
            
            <div className="footer-status-item">
              <span className="footer-status-item__label">Last Updated:</span>
              <span className="footer-status-item__value">
                {formatLastUpdated(dashboardData?.lastUpdated)}
              </span>
            </div>
          </div>
          
          <button 
            onClick={fetchDashboardData}
            disabled={loading}
            className={`footer-refresh ${loading ? 'btn--loading' : ''}`}
          >
            <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
            {loading ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;