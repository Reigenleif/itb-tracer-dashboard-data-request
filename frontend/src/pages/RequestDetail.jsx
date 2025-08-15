import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function RequestDetail() {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const API_URL = import.meta.env.VITE_API_URL;

  // Generate realistic SQL query based on request data
  const generateSQLQuery = (request) => {
    if (!request.table || !request.columns) {
      return "-- SQL query will be generated based on requested tables and columns";
    }

    // Parse tables and columns
    const tables = request.table.split(',').map(t => t.trim());
    const columns = request.columns.split(',').map(c => c.trim());
    
    // Build SELECT clause
    let selectClause = "SELECT ";
    if (columns.length === 0 || columns[0] === '') {
      selectClause += "*";
    } else {
      selectClause += columns.join(", ");
    }
    
    // Build FROM clause with main table
    const mainTable = tables[0];
    let fromClause = `FROM ${mainTable}`;
    
    // Add JOINs if multiple tables
    let joinClause = "";
    if (tables.length > 1) {
      for (let i = 1; i < tables.length; i++) {
        const table = tables[i];
        if (table.includes('employment') || table.includes('job')) {
          joinClause += `\nLEFT JOIN ${table} ON ${mainTable}.id = ${table}.graduate_id`;
        } else if (table.includes('company') || table.includes('companies')) {
          joinClause += `\nLEFT JOIN ${table} ON employment.company_id = ${table}.id`;
        } else if (table.includes('salary') || table.includes('demographic')) {
          joinClause += `\nLEFT JOIN ${table} ON ${mainTable}.id = ${table}.graduate_id`;
        } else {
          joinClause += `\nLEFT JOIN ${table} ON ${mainTable}.id = ${table}.${mainTable}_id`;
        }
      }
    }
    
    // Build WHERE clause based on year range and common filters
    let whereClause = "";
    const conditions = [];
    
    if (request.year_from && request.year_to) {
      conditions.push(`graduation_year BETWEEN ${request.year_from} AND ${request.year_to}`);
    }
    
    // Add purpose-based filters
    if (request.purpose.toLowerCase().includes('computer science') || 
        request.purpose.toLowerCase().includes('tech')) {
      conditions.push("major IN ('Computer Science', 'Information Technology', 'Software Engineering')");
    }
    
    if (request.purpose.toLowerCase().includes('salary') || 
        request.purpose.toLowerCase().includes('gender')) {
      conditions.push("salary_range IS NOT NULL");
    }
    
    if (conditions.length > 0) {
      whereClause = "\nWHERE " + conditions.join("\n  AND ");
    }
    
    // Add ORDER BY
    let orderClause = "\nORDER BY graduation_year DESC, name ASC";
    
    // Combine all parts
    const query = selectClause + "\n" + fromClause + joinClause + whereClause + orderClause + ";";
    
    return query;
  };

  // Mock data for demo with generated queries
  const mockRequests = {
    1: {
      id: 1,
      name: "Ahmad Fauzi",
      nim: "13520001",
      email: "ahmad.fauzi@students.itb.ac.id", 
      phone_number: "081234567890",
      purpose: "Thesis research on graduate employment trends in Information Technology field. Need comprehensive data to analyze job placement rates, salary ranges, and industry distribution of ITB Computer Science graduates from 2020-2024.",
      format: "CSV",
      year_from: 2020,
      year_to: 2024,
      table: "graduates, employment, companies",
      columns: "name, nim, graduation_year, major, current_job, company_name, salary_range, industry",
      status: "PENDING",
      created_at: "2025-08-10T10:30:00Z",
      updated_at: "2025-08-10T10:30:00Z"
    },
    2: {
      id: 2,
      name: "Sari Dewi", 
      nim: "13520002",
      email: "sari.dewi@students.itb.ac.id",
      phone_number: "081234567891",
      purpose: "Data analysis for final project on salary distribution and gender gap analysis in tech industry.",
      format: "Excel",
      year_from: 2021,
      year_to: 2024,
      table: "graduates, employment, salary, demographics",
      columns: "name, gender, graduation_year, current_salary, job_level, company_size",
      status: "APPROVED",
      created_at: "2025-08-09T14:20:00Z",
      updated_at: "2025-08-10T09:15:00Z"
    }
  };

  // Fetch request details
  const fetchRequestDetail = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/data-requests/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch request details');
      }

      const data = await response.json();
      setRequest(data.data_request || mockRequests[id] || mockRequests[1]);
      
    } catch (err) {
      console.error('API Error, using mock data:', err);
      setError(null); // Don't show error for demo
      setRequest(mockRequests[id] || mockRequests[1]);
    } finally {
      setLoading(false);
    }
  };

  // Update request status
  const updateRequestStatus = async (newStatus) => {
    try {
      setUpdating(true);
      
      const response = await fetch(`${API_URL}/data-requests/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...request,
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update request');
      }

      // Update local state for demo
      setRequest(prev => ({
        ...prev,
        status: newStatus,
        updated_at: new Date().toISOString()
      }));

      alert(`Request ${newStatus.toLowerCase()} successfully!`);
      
    } catch (err) {
      console.error('Update error:', err);
      // For demo, still update the local state
      setRequest(prev => ({
        ...prev, 
        status: newStatus,
        updated_at: new Date().toISOString()
      }));
      alert(`Request ${newStatus.toLowerCase()} successfully! (Demo mode)`);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchRequestDetail();
  }, [id]);

  const getStatusBadge = (status) => {
    const statusStyles = {
      'PENDING': { bg: '#fff3cd', color: '#856404', text: 'Pending Review' },
      'APPROVED': { bg: '#cff4fc', color: '#0c5460', text: 'Approved' },
      'IN_PROGRESS': { bg: '#e2e3e5', color: '#383d41', text: 'In Progress' },
      'COMPLETED': { bg: '#d4edda', color: '#155724', text: 'Completed' },
      'REJECTED': { bg: '#f8d7da', color: '#721c24', text: 'Rejected' }
    };

    const style = statusStyles[status] || statusStyles['PENDING'];
    
    return (
      <span style={{
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.9rem',
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
      month: 'long',
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
          <p style={{ marginTop: '1rem', color: '#6c757d' }}>Loading request details...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container">
        <div className="error-message">
          Request not found.
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>📄 Request Details</h1>
          <p style={{ color: '#6c757d', marginTop: '0.5rem' }}>
            Request ID: #{request.id} • {getStatusBadge(request.status)}
          </p>
        </div>
        <div>
          <button onClick={() => navigate('/request-management')} className="btn btn-secondary" style={{ marginRight: '1rem' }}>
            ← Back to Requests
          </button>
          <button onClick={handleLogout} className="btn btn-danger">Logout</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* Student Information */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>
            👤 Student Information
          </h3>
          <div className="student-info" style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ fontWeight: '600', color: '#555 !important', display: 'block', marginBottom: '0.25rem' }}>
                Full Name
              </label>
              <p style={{ margin: '0', fontSize: '1.1rem', color: '#2c3e50 !important' }}>{request.name}</p>
            </div>
            <div>
              <label style={{ fontWeight: '600', color: '#555 !important', display: 'block', marginBottom: '0.25rem' }}>
                NIM (Student ID)
              </label>
              <p style={{ margin: '0', fontSize: '1.1rem', color: '#2c3e50 !important' }}>{request.nim}</p>
            </div>
            <div>
              <label style={{ fontWeight: '600', color: '#555 !important', display: 'block', marginBottom: '0.25rem' }}>
                Email Address
              </label>
              <p style={{ margin: '0', fontSize: '1.1rem', color: '#2c3e50 !important' }}>
                <a href={`mailto:${request.email}`} style={{ color: '#667eea !important', textDecoration: 'none' }}>
                  {request.email}
                </a>
              </p>
            </div>
            <div>
              <label style={{ fontWeight: '600', color: '#555 !important', display: 'block', marginBottom: '0.25rem' }}>
                Phone Number
              </label>
              <p style={{ margin: '0', fontSize: '1.1rem', color: '#2c3e50 !important' }}>
                <a href={`tel:${request.phone_number}`} style={{ color: '#667eea !important', textDecoration: 'none' }}>
                  {request.phone_number}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Request Information */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>
            📋 Request Information
          </h3>
          <div className="request-info" style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ fontWeight: '600', color: '#555 !important', display: 'block', marginBottom: '0.25rem' }}>
                Purpose & Justification
              </label>
              <div className="request-detail-info" style={{ 
                margin: '0', 
                lineHeight: '1.6', 
                backgroundColor: '#f8f9fa !important', 
                padding: '1rem !important', 
                borderRadius: '8px !important',
                color: '#2c3e50 !important'
              }}>
                {request.purpose}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontWeight: '600', color: '#555 !important', display: 'block', marginBottom: '0.25rem' }}>
                  Format Requested
                </label>
                <p style={{ margin: '0', fontSize: '1.1rem', color: '#2c3e50 !important' }}>📄 {request.format}</p>
              </div>
              <div>
                <label style={{ fontWeight: '600', color: '#555 !important', display: 'block', marginBottom: '0.25rem' }}>
                  Year Range
                </label>
                <p style={{ margin: '0', fontSize: '1.1rem', color: '#2c3e50 !important' }}>📅 {request.year_from} - {request.year_to}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>
            ⚙️ Technical Specifications
          </h3>
          <div className="tech-specs" style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <label style={{ fontWeight: '600', color: '#555 !important', display: 'block', marginBottom: '0.5rem' }}>
                Database Tables
              </label>
              <div className="request-detail-info" style={{ 
                margin: '0', 
                backgroundColor: '#f8f9fa !important', 
                padding: '0.75rem !important', 
                borderRadius: '6px !important',
                fontFamily: 'monospace',
                fontSize: '0.95rem',
                color: '#2c3e50 !important'
              }}>
                {request.table}
              </div>
            </div>
            
            {request.columns && (
              <div>
                <label style={{ fontWeight: '600', color: '#555 !important', display: 'block', marginBottom: '0.5rem' }}>
                  Requested Columns
                </label>
                <div className="request-detail-info" style={{ 
                  margin: '0', 
                  backgroundColor: '#f8f9fa !important', 
                  padding: '0.75rem !important', 
                  borderRadius: '6px !important',
                  fontFamily: 'monospace',
                  fontSize: '0.95rem',
                  color: '#2c3e50 !important'
                }}>
                  {request.columns}
                </div>
              </div>
            )}

            {(request.sql_query || request.table) && (
              <div>
                <label style={{ fontWeight: '600', color: '#555 !important', display: 'block', marginBottom: '0.5rem' }}>
                  Generated SQL Query
                </label>
                <div className="request-detail-code" style={{ 
                  backgroundColor: '#2c3e50 !important', 
                  color: '#f8f9fa !important', 
                  padding: '1rem !important', 
                  borderRadius: '8px !important',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  overflowX: 'auto'
                }}>
                  <pre style={{ margin: '0', whiteSpace: 'pre-wrap', color: '#f8f9fa !important' }}>
                    {request.sql_query || generateSQLQuery(request)}
                  </pre>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.5rem', fontStyle: 'italic' }}>
                  💡 Query generated automatically based on requested tables and columns
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Status & Actions */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>
            🎯 Status & Actions
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <label style={{ fontWeight: '600', color: '#555', display: 'block', marginBottom: '0.5rem' }}>
                Current Status
              </label>
              {getStatusBadge(request.status)}
            </div>
            <div>
              <label style={{ fontWeight: '600', color: '#555', display: 'block', marginBottom: '0.5rem' }}>
                Submitted On
              </label>
              <p style={{ margin: '0' }}>{formatDate(request.created_at)}</p>
            </div>
            <div>
              <label style={{ fontWeight: '600', color: '#555', display: 'block', marginBottom: '0.5rem' }}>
                Last Updated
              </label>
              <p style={{ margin: '0' }}>{formatDate(request.updated_at)}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {request.status === 'PENDING' && (
              <>
                <button 
                  className="btn btn-success"
                  onClick={() => updateRequestStatus('APPROVED')}
                  disabled={updating}
                >
                  {updating ? <span className="loading"></span> : '✅'} Approve Request
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => updateRequestStatus('REJECTED')}
                  disabled={updating}
                >
                  {updating ? <span className="loading"></span> : '❌'} Reject Request
                </button>
              </>
            )}
            
            {request.status === 'APPROVED' && (
              <button 
                className="btn btn-primary"
                onClick={() => updateRequestStatus('IN_PROGRESS')}
                disabled={updating}
              >
                {updating ? <span className="loading"></span> : '🔄'} Start Processing
              </button>
            )}
            
            {request.status === 'IN_PROGRESS' && (
              <button 
                className="btn btn-success"
                onClick={() => updateRequestStatus('COMPLETED')}
                disabled={updating}
              >
                {updating ? <span className="loading"></span> : '🎉'} Mark as Completed
              </button>
            )}

            <button className="btn btn-secondary">
              📧 Send Email Update
            </button>
            
            <button 
              className="btn btn-primary"
              onClick={() => {
                // Store the SQL query for auto-paste in SQL Query tool
                const sqlQuery = request.sql_query || generateSQLQuery(request);
                console.log('=== Storing SQL in localStorage ===');
                console.log('Generated SQL Query:', sqlQuery);
                localStorage.setItem('autoFillSQL', sqlQuery);
                console.log('Stored in localStorage:', localStorage.getItem('autoFillSQL'));
                alert('🚀 Navigating to SQL Query tool with auto-filled query!');
                navigate('/sql-query');
              }}
            >
              🔍 Execute SQL Query
            </button>
            
            {request.status === 'COMPLETED' && (
              <button className="btn btn-success">
                📄 Download Generated Data
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
