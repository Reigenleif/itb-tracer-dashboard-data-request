import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
  }
];

export default function RequestManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at DESC');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [formatFilter, setFormatFilter] = useState('ALL');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // Debounce search query to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch requests from API - now uses debouncedSearchQuery and server-side filtering
  const fetchRequests = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search_query: debouncedSearchQuery,
        sort_by: sortBy,
        page: currentPage.toString(),
        limit: '10'
      });

      // Add filter parameters
      if (statusFilter && statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }
      if (formatFilter && formatFilter !== 'ALL') {
        params.append('format', formatFilter);
      }
      if (dateFromFilter) {
        params.append('date_from', dateFromFilter);
      }
      if (dateToFilter) {
        params.append('date_to', dateToFilter);
      }

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
      setRequests(data.data_requests || []);
      
      // Calculate total pages (you might want to get this from backend response)
      setTotalPages(Math.ceil((data.data_requests?.length || 0) / 10));
    } catch (err) {
      console.error('API Error, using mock data:', err);
      setError(null);
      
      // Apply client-side filtering to mock data as fallback
      let filteredRequests = [...mockRequests];
      
      if (debouncedSearchQuery) {
        filteredRequests = filteredRequests.filter(req => 
          req.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          req.nim.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          req.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        );
      }
      
      if (statusFilter !== 'ALL') {
        filteredRequests = filteredRequests.filter(req => req.status === statusFilter);
      }
      
      if (formatFilter !== 'ALL') {
        filteredRequests = filteredRequests.filter(req => req.format === formatFilter);
      }
      
      if (dateFromFilter) {
        filteredRequests = filteredRequests.filter(req => 
          new Date(req.created_at) >= new Date(dateFromFilter)
        );
      }
      
      if (dateToFilter) {
        filteredRequests = filteredRequests.filter(req => 
          new Date(req.created_at) <= new Date(dateToFilter)
        );
      }
      
      setRequests(filteredRequests);
      setTotalPages(Math.ceil(filteredRequests.length / 10));
    } finally {
      setLoading(false);
    }
  }, [API_URL, debouncedSearchQuery, sortBy, statusFilter, formatFilter, dateFromFilter, dateToFilter, currentPage]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Don't reset currentPage immediately - will reset when debounced search triggers
  };

  // Reset page to 1 when debounced search query changes
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      setCurrentPage(1);
    }
  }, [debouncedSearchQuery]);

  const handleSort = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  // Filter handlers
  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleFormatFilter = (e) => {
    setFormatFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleDateFromFilter = (e) => {
    setDateFromFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleDateToFilter = (e) => {
    setDateToFilter(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setStatusFilter('ALL');
    setFormatFilter('ALL');
    setDateFromFilter('');
    setDateToFilter('');
    setSearchQuery('');
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
        <h4 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Search & Filter Options</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {/* Search */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#2c3e50' }}>
              Search Requests
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, NIM, or email..."
              value={searchQuery}
              onChange={handleSearch}
            />
            {searchQuery !== debouncedSearchQuery && (
              <small style={{ color: '#6c757d', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                🔍 Searching...
              </small>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#2c3e50' }}>
              Filter by Status
            </label>
            <select 
              className="form-control"
              value={statusFilter}
              onChange={handleStatusFilter}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Format Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#2c3e50' }}>
              Filter by Format
            </label>
            <select 
              className="form-control"
              value={formatFilter}
              onChange={handleFormatFilter}
            >
              <option value="ALL">All Formats</option>
              <option value="CSV">CSV</option>
              <option value="Excel">Excel</option>
              <option value="JSON">JSON</option>
            </select>
          </div>

          {/* Sort */}
          <div>
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
        </div>

        {/* Date Range Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#2c3e50' }}>
              From Date
            </label>
            <input
              type="date"
              className="form-control"
              value={dateFromFilter}
              onChange={handleDateFromFilter}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#2c3e50' }}>
              To Date
            </label>
            <input
              type="date"
              className="form-control"
              value={dateToFilter}
              onChange={handleDateToFilter}
            />
          </div>

          <div style={{ alignSelf: 'flex-end' }}>
            <button 
              onClick={clearFilters}
              className="btn btn-secondary"
              style={{ marginRight: '1rem' }}
            >
              🧹 Clear Filters
            </button>
            <button 
              onClick={fetchRequests}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <span className="loading"></span> : '🔄'} Refresh
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(statusFilter !== 'ALL' || formatFilter !== 'ALL' || dateFromFilter || dateToFilter || searchQuery) && (
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <strong style={{ color: '#2c3e50' }}>Active Filters: </strong>
            {searchQuery && <span className="filter-tag">Search: "{searchQuery}"</span>}
            {statusFilter !== 'ALL' && <span className="filter-tag">Status: {statusFilter}</span>}
            {formatFilter !== 'ALL' && <span className="filter-tag">Format: {formatFilter}</span>}
            {dateFromFilter && <span className="filter-tag">From: {dateFromFilter}</span>}
            {dateToFilter && <span className="filter-tag">To: {dateToFilter}</span>}
          </div>
        )}
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
                  <th>Requester Info</th>
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
                          {(request.purpose ? request.purpose.length : 0) > 50
                            ? `${(request.purpose || '').substring(0, 50)}...`
                            : (request.purpose || '—')
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
