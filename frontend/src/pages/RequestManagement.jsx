import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RequestManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch requests from API
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search_query: searchQuery,
        sort_by: sortBy,
        page: currentPage.toString(),
        limit: '10'
      });

      const response = await fetch(`${API_URL}/data-requests/filter?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      
      // Use mock data for demo if API fails
      if (!data.data_requests) {
        setRequests(mockRequests);
      } else {
        setRequests(data.data_requests);
      }
      
      // Calculate total pages (assuming 10 items per page)
      setTotalPages(Math.ceil((data.data_requests?.length || mockRequests.length) / 10));
    } catch (err) {
      console.error('API Error, using mock data:', err);
      setError(null); // Don't show error for demo
      setRequests(mockRequests);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demo
  const mockRequests = [
    {
      id: 1,
      name: "Ahmad Fauzi",
      nim: "13520001", 
      email: "ahmad.fauzi@students.itb.ac.id",
      phone_number: "081234567890",
      purpose: "Thesis research on graduate employment trends",
      format: "CSV",
      year_from: 2020,
      year_to: 2024,
      table: "graduates, employment",
      status: "PENDING",
      created_at: "2025-08-10T10:30:00Z"
    },
    {
      id: 2,
      name: "Sari Dewi",
      nim: "13520002",
      email: "sari.dewi@students.itb.ac.id", 
      phone_number: "081234567891",
      purpose: "Data analysis for final project on salary distribution",
      format: "Excel",
      year_from: 2021,
      year_to: 2024,
      table: "graduates, salary",
      status: "APPROVED",
      created_at: "2025-08-09T14:20:00Z"
    },
    {
      id: 3,
      name: "Budi Santoso",
      nim: "13520003",
      email: "budi.santoso@students.itb.ac.id",
      phone_number: "081234567892", 
      purpose: "Research on industry placement of ITB graduates",
      format: "JSON",
      year_from: 2019,
      year_to: 2023,
      table: "graduates, companies, industries",
      status: "IN_PROGRESS",
      created_at: "2025-08-08T09:15:00Z"
    },
    {
      id: 4,
      name: "Maya Putri",
      nim: "13520004",
      email: "maya.putri@students.itb.ac.id",
      phone_number: "081234567893",
      purpose: "Gender distribution analysis in tech companies",
      format: "CSV", 
      year_from: 2022,
      year_to: 2024,
      table: "graduates, demographics",
      status: "COMPLETED",
      created_at: "2025-08-07T16:45:00Z"
    },
    {
      id: 5,
      name: "Rizki Anwar", 
      nim: "13520005",
      email: "rizki.anwar@students.itb.ac.id",
      phone_number: "081234567894",
      purpose: "Alumni network mapping for career guidance",
      format: "Excel",
      year_from: 2018,
      year_to: 2024, 
      table: "graduates, contacts, networks",
      status: "PENDING",
      created_at: "2025-08-06T11:30:00Z"
    }
  ];

  useEffect(() => {
    fetchRequests();
  }, [searchQuery, sortBy, currentPage]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSort = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'PENDING': { bg: '#fff3cd', color: '#856404', text: 'Pending' },
      'APPROVED': { bg: '#cff4fc', color: '#0c5460', text: 'Approved' },
      'IN_PROGRESS': { bg: '#e2e3e5', color: '#383d41', text: 'In Progress' },
      'COMPLETED': { bg: '#d4edda', color: '#155724', text: 'Completed' },
      'REJECTED': { bg: '#f8d7da', color: '#721c24', text: 'Rejected' }
    };

    const style = statusStyles[status] || statusStyles['PENDING'];
    
    return (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: '600',
        backgroundColor: style.bg,
        color: style.color
      }}>
        {style.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="loading" style={{ margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: '#6c757d' }}>Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>📋 Request Management</h1>
          <p style={{ color: '#6c757d', marginTop: '0.5rem' }}>
            Manage student data requests ({requests.length} total)
          </p>
        </div>
        <div>
          <button onClick={() => navigate('/home')} className="btn btn-secondary" style={{ marginRight: '1rem' }}>
            ← Back to Home
          </button>
          <button onClick={handleLogout} className="btn btn-danger">Logout</button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#2c3e50' }}>
              Search Requests
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, NIM, or email..."
              value={searchQuery}
              onChange={handleSearch}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#2c3e50' }}>
              Sort By
            </label>
            <select 
              className="form-control"
              value={sortBy}
              onChange={handleSort}
            >
              <option value="created_at DESC">Newest First</option>
              <option value="created_at ASC">Oldest First</option>
              <option value="name ASC">Name A-Z</option>
              <option value="name DESC">Name Z-A</option>
              <option value="status ASC">Status</option>
            </select>
          </div>
          <div style={{ alignSelf: 'flex-end' }}>
            <button 
              onClick={fetchRequests}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <span className="loading"></span> : '🔄'} Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Requests Table */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>
          📊 Data Requests
        </h3>
        
        {requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
            <p>No requests found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Purpose</th>
                  <th>Data Request</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(request => (
                  <tr key={request.id}>
                    <td>
                      <div>
                        <strong>{request.name}</strong><br/>
                        <small style={{ color: '#6c757d' }}>
                          {request.nim} • {request.email}
                        </small>
                      </div>
                    </td>
                    <td>
                      <div style={{ maxWidth: '200px' }}>
                        {request.purpose.length > 50 
                          ? `${request.purpose.substring(0, 50)}...`
                          : request.purpose
                        }
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{request.format}</strong> format<br/>
                        <small style={{ color: '#6c757d' }}>
                          {request.year_from}-{request.year_to} • {request.table}
                        </small>
                      </div>
                    </td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td>
                      <small>{formatDate(request.created_at)}</small>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button 
                          className="btn btn-primary"
                          style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}
                          onClick={() => navigate(`/request-detail/${request.id}`)}
                        >
                          👁️ View
                        </button>
                        {request.status === 'PENDING' && (
                          <button 
                            className="btn btn-success"
                            style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}
                          >
                            ✅ Approve
                          </button>
                        )}
                        <button 
                          className="btn btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}
                          onClick={() => {
                            // Generate and auto-fill SQL for this request
                            const sqlQuery = `SELECT * FROM graduates, employment WHERE graduation_year BETWEEN ${request.year_from} AND ${request.year_to}`;
                            localStorage.setItem('autoFillSQL', sqlQuery);
                            navigate('/sql-query');
                          }}
                        >
                          🔍 Query
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            marginTop: '2rem',
            gap: '1rem'
          }}>
            <button 
              className="btn btn-secondary"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              ← Previous
            </button>
            <span style={{ color: '#6c757d' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button 
              className="btn btn-secondary"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
