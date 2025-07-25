import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import Loading from '../common/Loading';
import '../../styles/dashboards/PlatformStats.css';

const PlatformStats = ({ data }) => {
  const [stats, setStats] = useState(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30days');
  
  const { request } = useApi();

  useEffect(() => {
    if (!data) {
      fetchStats();
    }
  }, [data, timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await request(`/api/admin/stats?range=${timeRange}`, {
        method: 'GET'
      });
      
      if (response.success) {
        setStats(response.data);
      } else {
        setError('Failed to load platform statistics');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading statistics');
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getGrowthIndicator = (current, previous) => {
    if (!previous || previous === 0) return { percentage: 0, isPositive: true };
    
    const percentage = ((current - previous) / previous) * 100;
    return {
      percentage: Math.abs(percentage).toFixed(1),
      isPositive: percentage >= 0
    };
  };

  if (loading) {
    return <Loading message="Loading platform statistics..." />;
  }

  if (error) {
    return (
      <div className="stats-error">
        <h3>Error Loading Statistics</h3>
        <p>{error}</p>
        <button onClick={fetchStats} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="platform-stats">
      <div className="stats-header">
        <h2>Platform Overview</h2>
        <div className="time-range-selector">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        {/* Users Statistics */}
        <div className="stat-card">
          <div className="stat-icon users">
            <i className="icon-users"></i>
          </div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <div className="stat-value">{formatNumber(stats?.totalUsers)}</div>
            <div className="stat-growth">
              {(() => {
                const growth = getGrowthIndicator(stats?.totalUsers, stats?.previousUsers);
                return (
                  <span className={`growth ${growth.isPositive ? 'positive' : 'negative'}`}>
                    <i className={`icon-arrow-${growth.isPositive ? 'up' : 'down'}`}></i>
                    {growth.percentage}%
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Instructors Statistics */}
        <div className="stat-card">
          <div className="stat-icon instructors">
            <i className="icon-instructor"></i>
          </div>
          <div className="stat-content">
            <h3>Instructors</h3>
            <div className="stat-value">{formatNumber(stats?.totalInstructors)}</div>
            <div className="stat-growth">
              {(() => {
                const growth = getGrowthIndicator(stats?.totalInstructors, stats?.previousInstructors);
                return (
                  <span className={`growth ${growth.isPositive ? 'positive' : 'negative'}`}>
                    <i className={`icon-arrow-${growth.isPositive ? 'up' : 'down'}`}></i>
                    {growth.percentage}%
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Courses Statistics */}
        <div className="stat-card">
          <div className="stat-icon courses">
            <i className="icon-courses"></i>
          </div>
          <div className="stat-content">
            <h3>Total Courses</h3>
            <div className="stat-value">{formatNumber(stats?.totalCourses)}</div>
            <div className="stat-growth">
              {(() => {
                const growth = getGrowthIndicator(stats?.totalCourses, stats?.previousCourses);
                return (
                  <span className={`growth ${growth.isPositive ? 'positive' : 'negative'}`}>
                    <i className={`icon-arrow-${growth.isPositive ? 'up' : 'down'}`}></i>
                    {growth.percentage}%
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Revenue Statistics */}
        <div className="stat-card">
          <div className="stat-icon revenue">
            <i className="icon-money"></i>
          </div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <div className="stat-value">{formatCurrency(stats?.totalRevenue)}</div>
            <div className="stat-growth">
              {(() => {
                const growth = getGrowthIndicator(stats?.totalRevenue, stats?.previousRevenue);
                return (
                  <span className={`growth ${growth.isPositive ? 'positive' : 'negative'}`}>
                    <i className={`icon-arrow-${growth.isPositive ? 'up' : 'down'}`}></i>
                    {growth.percentage}%
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Enrollments Statistics */}
        <div className="stat-card">
          <div className="stat-icon enrollments">
            <i className="icon-enrollment"></i>
          </div>
          <div className="stat-content">
            <h3>Total Enrollments</h3>
            <div className="stat-value">{formatNumber(stats?.totalEnrollments)}</div>
            <div className="stat-growth">
              {(() => {
                const growth = getGrowthIndicator(stats?.totalEnrollments, stats?.previousEnrollments);
                return (
                  <span className={`growth ${growth.isPositive ? 'positive' : 'negative'}`}>
                    <i className={`icon-arrow-${growth.isPositive ? 'up' : 'down'}`}></i>
                    {growth.percentage}%
                  </span>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="stat-card">
          <div className="stat-icon pending">
            <i className="icon-pending"></i>
          </div>
          <div className="stat-content">
            <h3>Pending Approvals</h3>
            <div className="stat-value">{formatNumber(stats?.pendingApprovals)}</div>
            <div className="stat-subtitle">Courses awaiting review</div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="analytics-section">
        <div className="analytics-grid">
          {/* User Activity Chart */}
          <div className="analytics-card">
            <h3>User Activity</h3>
            <div className="activity-metrics">
              <div className="metric">
                <span className="metric-label">Daily Active Users</span>
                <span className="metric-value">{formatNumber(stats?.dailyActiveUsers)}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Weekly Active Users</span>
                <span className="metric-value">{formatNumber(stats?.weeklyActiveUsers)}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Monthly Active Users</span>
                <span className="metric-value">{formatNumber(stats?.monthlyActiveUsers)}</span>
              </div>
            </div>
          </div>

          {/* Course Performance */}
          <div className="analytics-card">
            <h3>Course Performance</h3>
            <div className="performance-metrics">
              <div className="metric">
                <span className="metric-label">Average Rating</span>
                <span className="metric-value rating">
                  {stats?.averageRating?.toFixed(1) || '0.0'}
                  <i className="icon-star"></i>
                </span>
              </div>
              <div className="metric">
                <span className="metric-label">Completion Rate</span>
                <span className="metric-value">{stats?.completionRate || '0'}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Popular Category</span>
                <span className="metric-value">{stats?.popularCategory || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="analytics-card">
            <h3>Financial Overview</h3>
            <div className="financial-metrics">
              <div className="metric">
                <span className="metric-label">Platform Commission</span>
                <span className="metric-value">{formatCurrency(stats?.platformCommission)}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Instructor Earnings</span>
                <span className="metric-value">{formatCurrency(stats?.instructorEarnings)}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Refunds Processed</span>
                <span className="metric-value">{formatCurrency(stats?.refundsProcessed)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="recent-activity">
        <h3>Recent Platform Activity</h3>
        <div className="activity-feed">
          {stats?.recentActivity?.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className={`activity-icon ${activity.type}`}>
                <i className={`icon-${activity.type}`}></i>
              </div>
              <div className="activity-content">
                <p className="activity-text">{activity.description}</p>
                <span className="activity-time">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          )) || (
            <div className="no-activity">
              <p>No recent activity to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformStats;