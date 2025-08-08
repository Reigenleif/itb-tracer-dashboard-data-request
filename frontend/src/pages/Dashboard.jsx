import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Mock analytics data
    setStats({
      totalRequests: 156,
      pendingRequests: 12,
      completedRequests: 134,
      activeUsers: 45
    });

    // Mock recent requests
    setRecentRequests([
      { id: 1, name: "Ahmad Fauzi", type: "Graduate Employment Data", status: "Pending", date: "2025-08-07" },
      { id: 2, name: "Sari Dewi", type: "Salary Analysis", status: "Completed", date: "2025-08-06" },
      { id: 3, name: "Budi Santoso", type: "Job Placement Report", status: "In Progress", date: "2025-08-06" },
      { id: 4, name: "Maya Putri", type: "Industry Distribution", status: "Completed", date: "2025-08-05" },
      { id: 5, name: "Rizki Anwar", type: "Alumni Contact Info", status: "Pending", date: "2025-08-05" }
    ]);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!stats) return <div className="container"><div className="loading"></div></div>;

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>🏠 Admin Dashboard</h1>
          <p style={{ color: '#6c757d', marginTop: '0.5rem' }}>ITB Tracer Study - Data Management System</p>
        </div>
        <div>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{stats.totalRequests}</span>
          <span className="stat-label">Total Requests</span>
        </div>
        <div className="stat-card">
          <span className="stat-number" style={{ color: '#ffc107' }}>{stats.pendingRequests}</span>
          <span className="stat-label">Pending Requests</span>
        </div>
        <div className="stat-card">
          <span className="stat-number" style={{ color: '#28a745' }}>{stats.completedRequests}</span>
          <span className="stat-label">Completed Requests</span>
        </div>
        <div className="stat-card">
          <span className="stat-number" style={{ color: '#667eea' }}>{stats.activeUsers}</span>
          <span className="stat-label">Active Users</span>
        </div>
      </div>

      {/* Admin Tools Navigation */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>🛠️ Admin Tools</h3>
        <div className="stats-grid">
          <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} 
               onClick={() => navigate('/request-management')}
               onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
               onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}>
            <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</span>
            <span className="stat-label" style={{ fontSize: '1rem', fontWeight: '600', color: '#2c3e50' }}>
              Request Management
            </span>
            <span className="stat-label" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
              Review and approve data requests
            </span>
          </div>
          
          <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} 
               onClick={() => navigate('/sql-query')}
               onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
               onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}>
            <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</span>
            <span className="stat-label" style={{ fontSize: '1rem', fontWeight: '600', color: '#2c3e50' }}>
              SQL Query Tool
            </span>
            <span className="stat-label" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
              Execute database queries safely
            </span>
          </div>
          
          <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} 
               onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
               onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}>
            <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</span>
            <span className="stat-label" style={{ fontSize: '1rem', fontWeight: '600', color: '#2c3e50' }}>
              Analytics & Reports
            </span>
            <span className="stat-label" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
              Generate data insights
            </span>
          </div>
          
          <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} 
               onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
               onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}>
            <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</span>
            <span className="stat-label" style={{ fontSize: '1rem', fontWeight: '600', color: '#2c3e50' }}>
              System Settings
            </span>
            <span className="stat-label" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
              Configure system parameters
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>📈 Recent Activity</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="results-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Activity</th>
                <th>User/Requester</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map(request => (
                <tr key={request.id}>
                  <td>{request.date}</td>
                  <td>{request.type}</td>
                  <td>{request.name}</td>
                  <td>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      backgroundColor: 
                        request.status === 'Completed' ? '#d4edda' :
                        request.status === 'Pending' ? '#fff3cd' : '#cff4fc',
                      color:
                        request.status === 'Completed' ? '#155724' :
                        request.status === 'Pending' ? '#856404' : '#0c5460'
                    }}>
                      {request.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
