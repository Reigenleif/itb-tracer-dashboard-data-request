import React, { useState, useEffect } from 'react';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [refreshKey, setRefreshKey] = useState(0);

  // Mock analytics data generator
  const generateAnalytics = React.useCallback(() => {
    const now = new Date();
    const daysBack = parseInt(dateRange);
    
    return {
      overview: {
        totalRequests: 156 + Math.floor(Math.random() * 50),
        pendingRequests: 12 + Math.floor(Math.random() * 10),
        completedRequests: 134 + Math.floor(Math.random() * 30),
        rejectedRequests: 8 + Math.floor(Math.random() * 5),
        averageProcessingTime: '2.3 days',
        activeUsers: 45 + Math.floor(Math.random() * 20)
      },
      requestsByStatus: [
        { status: 'Completed', count: 134, percentage: 65.4, color: '#28a745' },
        { status: 'Pending', count: 42, percentage: 20.5, color: '#ffc107' },
        { status: 'In Progress', count: 21, percentage: 10.2, color: '#17a2b8' },
        { status: 'Rejected', count: 8, percentage: 3.9, color: '#dc3545' }
      ],
      requestsByFormat: [
        { format: 'CSV', count: 89, percentage: 57.1 },
        { format: 'Excel', count: 45, percentage: 28.8 },
        { format: 'JSON', count: 22, percentage: 14.1 }
      ],
      requestsByPurpose: [
        { purpose: 'Thesis Research', count: 67, percentage: 43.0 },
        { purpose: 'Final Project', count: 45, percentage: 28.8 },
        { purpose: 'Academic Research', count: 28, percentage: 17.9 },
        { purpose: 'Industry Analysis', count: 16, percentage: 10.3 }
      ],
      trendsData: Array.from({ length: parseInt(dateRange) }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (daysBack - i));
        return {
          date: date.toISOString().split('T')[0],
          requests: Math.floor(Math.random() * 10) + 1,
          completions: Math.floor(Math.random() * 8)
        };
      }),
      popularTables: [
        { table: 'graduates', requests: 98, percentage: 62.8 },
        { table: 'employment', requests: 87, percentage: 55.8 },
        { table: 'salary_data', requests: 76, percentage: 48.7 },
        { table: 'companies', requests: 54, percentage: 34.6 },
        { table: 'demographics', requests: 43, percentage: 27.6 }
      ],
      yearRangeDistribution: [
        { range: '2024', requests: 89 },
        { range: '2023-2024', requests: 67 },
        { range: '2022-2024', requests: 34 },
        { range: '2020-2024', requests: 23 },        { range: 'Before 2020', requests: 12 }
      ],
      performanceMetrics: {
        avgResponseTime: '1.2 hours',
        dataAccuracy: '99.7%',
        systemUptime: '99.9%',
        userSatisfaction: '4.8/5'
      }
    };
  }, [dateRange]);

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAnalytics(generateAnalytics());
      setLoading(false);
    }, 1000);
  }, [generateAnalytics, refreshKey]);

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  const StatCard = ({ title, value, subtitle, icon, color = '#007bff' }) => (
    <div className="card" style={{ 
      padding: '1.5rem',
      borderLeft: `4px solid ${color}`,
      height: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '2rem', color: color }}>{value}</h3>
          <p style={{ margin: '0.5rem 0 0 0', fontWeight: '600', color: '#2c3e50' }}>{title}</p>
          {subtitle && <small style={{ color: '#6c757d' }}>{subtitle}</small>}
        </div>
        <div style={{ fontSize: '2rem', opacity: 0.3 }}>{icon}</div>
      </div>
    </div>
  );

  const ProgressBar = ({ label, value, total, color = '#007bff' }) => {
    const percentage = (value / total) * 100;
    return (
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{label}</span>
          <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>{value} ({percentage.toFixed(1)}%)</span>
        </div>
        <div style={{ 
          width: '100%', 
          height: '8px', 
          backgroundColor: '#e9ecef', 
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: color,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>
    );
  };
  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="loading" style={{ margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: '#6c757d' }}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#2c3e50' }}>📊 Analytics Dashboard</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#6c757d' }}>
            Data request insights and performance metrics
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="form-control"
            style={{ width: 'auto' }}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          
          <button onClick={refreshData} className="btn btn-primary">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <StatCard
          title="Total Requests"
          value={analytics.overview.totalRequests}
          subtitle="All time requests"
          icon="📋"
          color="#007bff"
        />
        <StatCard
          title="Pending Requests"
          value={analytics.overview.pendingRequests}
          subtitle="Awaiting review"
          icon="⏳"
          color="#ffc107"
        />
        <StatCard
          title="Completed"
          value={analytics.overview.completedRequests}
          subtitle="Successfully processed"
          icon="✅"
          color="#28a745"
        />
        <StatCard
          title="Processing Time"
          value={analytics.overview.averageProcessingTime}
          subtitle="Average completion"
          icon="⚡"
          color="#17a2b8"
        />
      </div>
      {/* Charts Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {/* Requests by Status */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>📊 Requests by Status</h3>
          {analytics.requestsByStatus.map(item => (
            <ProgressBar
              key={item.status}
              label={item.status}
              value={item.count}
              total={analytics.overview.totalRequests}
              color={item.color}
            />
          ))}
        </div>

        {/* Requests by Format */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>📄 Preferred Formats</h3>
          {analytics.requestsByFormat.map(item => (
            <ProgressBar
              key={item.format}
              label={item.format}
              value={item.count}
              total={analytics.overview.totalRequests}
              color="#6f42c1"
            />
          ))}
        </div>
      </div>

      {/* Request Purpose Analysis */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>🎯 Request Purposes</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem'
        }}>
          {analytics.requestsByPurpose.map(item => (
            <div key={item.purpose} style={{
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #dee2e6'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#495057' }}>
                {item.count}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: '500', marginTop: '0.5rem' }}>
                {item.purpose}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.25rem' }}>
                {item.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}