import React, { useState, useEffect } from 'react';
import '../../styles/dashboards/EarningsChart.css'; // ✅ CSS import

import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register all the chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);


const EarningsChart = ({ timeRange = '6months' }) => {
  const [earningsData, setEarningsData] = useState(null);
  const [chartType, setChartType] = useState('line');
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [growthRate, setGrowthRate] = useState(0);

  useEffect(() => {
    fetchEarningsData();
  }, [timeRange]);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      const response = await fetch(`/api/instructor/earnings?range=${timeRange}`);
      const data = await response.json();
      
      // Mock data for demonstration
      const mockData = generateMockEarningsData(timeRange);
      setEarningsData(mockData);
      setTotalEarnings(mockData.total);
      setGrowthRate(mockData.growth);
    } catch (error) {
      console.error('Error fetching earnings data:', error);
      // Use mock data on error
      const mockData = generateMockEarningsData(timeRange);
      setEarningsData(mockData);
      setTotalEarnings(mockData.total);
      setGrowthRate(mockData.growth);
    } finally {
      setLoading(false);
    }
  };

  const generateMockEarningsData = (range) => {
    const labels = [];
    const earnings = [];
    const courses = [];
    
    let periods;
    switch (range) {
      case '30days':
        periods = 30;
        for (let i = periods - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
          earnings.push(Math.random() * 200 + 50);
        }
        break;
      case '6months':
        periods = 6;
        for (let i = periods - 1; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
          earnings.push(Math.random() * 3000 + 1000);
        }
        break;
      case '1year':
        periods = 12;
        for (let i = periods - 1; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
          earnings.push(Math.random() * 5000 + 2000);
        }
        break;
      default:
        periods = 6;
    }

    // Generate course-wise earnings for pie chart
    const courseNames = ['React Fundamentals', 'Advanced JavaScript', 'Node.js Basics', 'Python for Beginners', 'Data Structures'];
    const courseEarnings = courseNames.map(() => Math.random() * 2000 + 500);

    return {
      labels,
      earnings,
      courses: courseNames,
      courseEarnings,
      total: earnings.reduce((sum, val) => sum + val, 0),
      growth: Math.random() * 20 + 5 // 5-25% growth
    };
  };

  const lineChartData = {
    labels: earningsData?.labels || [],
    datasets: [
      {
        label: 'Earnings ($)',
        data: earningsData?.earnings || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const barChartData = {
    labels: earningsData?.labels || [],
    datasets: [
      {
        label: 'Earnings ($)',
        data: earningsData?.earnings || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const doughnutChartData = {
    labels: earningsData?.courses || [],
    datasets: [
      {
        data: earningsData?.courseEarnings || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        font: {
          size: 12,
        },
        color: '#ffffff', // ✅ Add this
      },
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(0, 0, 0, 0.8)', // ✅ Add this
      titleColor: '#ffffff', // ✅ Add this
      bodyColor: '#ffffff', // ✅ Add this
      callbacks: {
        label: (context) => {
          return `$${context.parsed.y?.toFixed(2) || context.parsed}`;
        },
      },
    },
  },
  scales: chartType !== 'doughnut' ? {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => `$${value}`,
        color: '#ffffff', // ✅ Add this
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.1)', // ✅ Change this
      },
    },
    x: {
      ticks: {
        color: '#ffffff', // ✅ Add this
      },
      grid: {
        display: false,
      },
    },
  } : {},
};

  const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        font: {
          size: 12,
        },
        color: '#ffffff', // ✅ Add this
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)', // ✅ Add this
      titleColor: '#ffffff', // ✅ Add this
      bodyColor: '#ffffff', // ✅ Add this
      callbacks: {
        label: (context) => {
          const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
          const percentage = ((context.parsed / total) * 100).toFixed(1);
          return `${context.label}: $${context.parsed.toFixed(2)} (${percentage}%)`;
        },
      },
    },
  },
};

  if (loading) {
    return (
      <div className="earnings-chart">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading earnings data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="earnings-chart">
      <div className="earnings-header">
        <div className="earnings-stats">
          <div className="stat-card">
            <h3>Total Earnings</h3>
            <p className="stat-value">${totalEarnings.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3>Growth Rate</h3>
            <p className={`stat-value ${growthRate >= 0 ? 'positive' : 'negative'}`}>
              {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
            </p>
          </div>
        </div>
        
        <div className="chart-controls">
          <select 
            value={chartType} 
            onChange={(e) => setChartType(e.target.value)}
            className="chart-type-select"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="doughnut">Course Breakdown</option>
          </select>
        </div>
      </div>

      <div className="chart-container">
        {chartType === 'line' && (
          <Line data={lineChartData} options={chartOptions} />
        )}
        {chartType === 'bar' && (
          <Bar data={barChartData} options={chartOptions} />
        )}
        {chartType === 'doughnut' && (
          <Doughnut data={doughnutChartData} options={doughnutOptions} />
        )}
      </div>

      <div className="earnings-insights">
        <h4>Insights</h4>
        <div className="insights-grid">
          <div className="insight-card">
            <h5>Best Performing Course</h5>
            <p>{earningsData?.courses[0] || 'React Fundamentals'}</p>
          </div>
          <div className="insight-card">
            <h5>Average Monthly Earnings</h5>
            <p>${(totalEarnings / (earningsData?.labels?.length || 1)).toFixed(2)}</p>
          </div>
          <div className="insight-card">
            <h5>Peak Earnings Period</h5>
            <p>{earningsData?.labels[earningsData?.earnings?.indexOf(Math.max(...(earningsData?.earnings || []))) || 0]}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsChart;
