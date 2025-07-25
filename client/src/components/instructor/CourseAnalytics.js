import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/dashboards/CourseAnalytics.css';

const CourseAnalytics = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalEnrollments: 0,
      totalRevenue: 0,
      averageRating: 0,
      completionRate: 0
    },
    courses: [],
    enrollmentTrend: [],
    revenueTrend: [],
    topPerformingCourses: [],
    studentEngagement: {}
  });
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('all');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod, selectedCourse]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Mock API call - replace with actual API
      const response = await fetch(`/api/instructors/${user.id}/analytics?period=${selectedPeriod}&course=${selectedCourse}`);
      const data = await response.json();
      
      // Mock data for demonstration
      const mockData = {
        overview: {
          totalEnrollments: 1234,
          totalRevenue: 15670,
          averageRating: 4.8,
          completionRate: 78
        },
        courses: [
          { id: 1, title: 'React Fundamentals', enrollments: 456, revenue: 6840, rating: 4.9 },
          { id: 2, title: 'JavaScript Mastery', enrollments: 389, revenue: 5445, rating: 4.7 },
          { id: 3, title: 'Node.js Backend', enrollments: 278, revenue: 2780, rating: 4.8 },
          { id: 4, title: 'MongoDB Essentials', enrollments: 167, revenue: 1670, rating: 4.6 }
        ],
        enrollmentTrend: [
          { date: '2024-01-01', enrollments: 23 },
          { date: '2024-01-08', enrollments: 45 },
          { date: '2024-01-15', enrollments: 67 },
          { date: '2024-01-22', enrollments: 89 },
          { date: '2024-01-29', enrollments: 112 }
        ],
        revenueTrend: [
          { date: '2024-01-01', revenue: 345 },
          { date: '2024-01-08', revenue: 675 },
          { date: '2024-01-15', revenue: 1005 },
          { date: '2024-01-22', revenue: 1335 },
          { date: '2024-01-29', revenue: 1680 }
        ],
        topPerformingCourses: [
          { title: 'React Fundamentals', metric: 'enrollments', value: 456 },
          { title: 'JavaScript Mastery', metric: 'rating', value: 4.9 },
          { title: 'Node.js Backend', metric: 'completion', value: '85%' }
        ],
        studentEngagement: {
          averageWatchTime: '45 min',
          averageCompletionTime: '3.2 weeks',
          mostEngagingChapter: 'React Hooks',
          dropOffPoint: 'Chapter 4: State Management'
        }
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, change, icon, color = 'blue' }) => (
    <div className={`metric-card metric-${color}`}>
      <div className="metric-header">
        <div className="metric-icon">
          <i className={`fas fa-${icon}`}></i>
        </div>
        {change && (
          <div className={`metric-change ${change > 0 ? 'positive' : 'negative'}`}>
            <i className={`fas fa-arrow-${change > 0 ? 'up' : 'down'}`}></i>
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div className="metric-content">
        <h3 className="metric-value">{value}</h3>
        <p className="metric-title">{title}</p>
      </div>
    </div>
  );

  const SimpleChart = ({ data, type = 'line', title }) => (
    <div className="simple-chart">
      <h4>{title}</h4>
      <div className="chart-container">
        <div className="chart-bars">
          {data.map((item, index) => {
            const maxValue = Math.max(...data.map(d => type === 'line' ? d.enrollments || d.revenue : d.value || 0));
            const height = type === 'line' 
              ? ((item.enrollments || item.revenue) / maxValue) * 100
              : ((item.value || 0) / maxValue) * 100;
            
            return (
              <div key={index} className="chart-bar">
                <div 
                  className="bar-fill"
                  style={{ height: `${height}%` }}
                ></div>
                <span className="bar-label">
                  {type === 'line' ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : item.title?.substring(0, 10) + '...'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="course-analytics">
      <div className="analytics-header">
        <h2>Course Analytics</h2>
        <div className="analytics-filters">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="period-select"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="1y">Last year</option>
          </select>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="course-select"
          >
            <option value="all">All Courses</option>
            {analyticsData.courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Enrollments"
          value={analyticsData.overview.totalEnrollments.toLocaleString()}
          change={12}
          icon="users"
          color="blue"
        />
        <MetricCard
          title="Total Revenue"
          value={`$${analyticsData.overview.totalRevenue.toLocaleString()}`}
          change={8}
          icon="dollar-sign"
          color="green"
        />
        <MetricCard
          title="Average Rating"
          value={analyticsData.overview.averageRating.toFixed(1)}
          change={5}
          icon="star"
          color="yellow"
        />
        <MetricCard
          title="Completion Rate"
          value={`${analyticsData.overview.completionRate}%`}
          change={-3}
          icon="chart-line"
          color="purple"
        />
      </div>

      <div className="analytics-content">
        <div className="analytics-row">
          {/* Enrollment Trend */}
          <div className="analytics-card">
            <SimpleChart
              data={analyticsData.enrollmentTrend}
              type="line"
              title="Enrollment Trend"
            />
          </div>

          {/* Revenue Trend */}
          <div className="analytics-card">
            <SimpleChart
              data={analyticsData.revenueTrend}
              type="line"
              title="Revenue Trend"
            />
          </div>
        </div>

        <div className="analytics-row">
          {/* Course Performance */}
          <div className="analytics-card">
            <h4>Course Performance</h4>
            <div className="course-performance-table">
              <div className="table-header">
                <span>Course</span>
                <span>Enrollments</span>
                <span>Revenue</span>
                <span>Rating</span>
              </div>
              {analyticsData.courses.map(course => (
                <div key={course.id} className="table-row">
                  <span className="course-title">{course.title}</span>
                  <span>{course.enrollments}</span>
                  <span>${course.revenue.toLocaleString()}</span>
                  <span className="rating">
                    <i className="fas fa-star"></i>
                    {course.rating}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Student Engagement */}
          <div className="analytics-card">
            <h4>Student Engagement</h4>
            <div className="engagement-metrics">
              <div className="engagement-item">
                <span className="engagement-label">Average Watch Time</span>
                <span className="engagement-value">{analyticsData.studentEngagement.averageWatchTime}</span>
              </div>
              <div className="engagement-item">
                <span className="engagement-label">Completion Time</span>
                <span className="engagement-value">{analyticsData.studentEngagement.averageCompletionTime}</span>
              </div>
              <div className="engagement-item">
                <span className="engagement-label">Most Engaging</span>
                <span className="engagement-value">{analyticsData.studentEngagement.mostEngagingChapter}</span>
              </div>
              <div className="engagement-item">
                <span className="engagement-label">Drop-off Point</span>
                <span className="engagement-value warning">{analyticsData.studentEngagement.dropOffPoint}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Courses */}
        <div className="analytics-row">
          <div className="analytics-card full-width">
            <h4>Top Performing Courses</h4>
            <div className="top-courses">
              {analyticsData.topPerformingCourses.map((course, index) => (
                <div key={index} className="top-course-item">
                  <div className="rank">#{index + 1}</div>
                  <div className="course-info">
                    <h5>{course.title}</h5>
                    <p>Best in {course.metric}</p>
                  </div>
                  <div className="course-metric">
                    <span className="metric-value">{course.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights & Recommendations */}
        <div className="analytics-row">
          <div className="analytics-card full-width">
            <h4>Insights & Recommendations</h4>
            <div className="insights-list">
              <div className="insight-item positive">
                <i className="fas fa-lightbulb"></i>
                <div className="insight-content">
                  <h5>Great Performance!</h5>
                  <p>Your React Fundamentals course has the highest enrollment rate. Consider creating advanced React content.</p>
                </div>
              </div>
              <div className="insight-item warning">
                <i className="fas fa-exclamation-triangle"></i>
                <div className="insight-content">
                  <h5>Attention Needed</h5>
                  <p>Chapter 4 has a high drop-off rate. Consider adding more interactive content or breaking it into smaller sections.</p>
                </div>
              </div>
              <div className="insight-item info">
                <i className="fas fa-chart-line"></i>
                <div className="insight-content">
                  <h5>Growth Opportunity</h5>
                  <p>Your completion rate is above average. Promote your courses more to increase enrollments.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseAnalytics;
