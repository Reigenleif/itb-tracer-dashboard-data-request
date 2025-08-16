import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DataPreview from '../components/DataPreview';
import StatusManager from '../components/StatusManager';
import EmailManager from '../components/EmailManager';

// Mock data with more comprehensive details
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
    purpose: "Data analysis for final project on salary distribution across different engineering majors. Focus on gender pay gap and career progression patterns.",
    format: "Excel",
    year_from: 2021,
    year_to: 2024,
    table: "graduates, salary_data, demographics",
    columns: "name, major, graduation_year, gender, current_salary, years_experience, position_level",
    status: "APPROVED",
    created_at: "2025-08-09T14:20:00Z",
    updated_at: "2025-08-09T15:45:00Z"
  }
};

export default function RequestDetail() {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'preview', 'status', 'email'
  const [queryResults, setQueryResults] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const API_URL = import.meta.env.VITE_API_URL;

  // Generate realistic SQL query based on request data
  const generateSQLQuery = (request) => {
    if (!request.table || !request.columns) {
      return "-- SQL query will be generated based on requested tables and columns";
    }

    const tables = request.table.split(',').map(t => t.trim());
    const columns = request.columns.split(',').map(c => c.trim());
    
    let selectClause = "SELECT ";
    if (columns.length === 0 || columns[0] === '') {
      selectClause += "*";
    } else {
      selectClause += columns.join(", ");
    }
    
    const mainTable = tables[0];
    let fromClause = `FROM ${mainTable}`;
    
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
    
    let whereClause = "";
    const conditions = [];
    
    if (request.year_from && request.year_to) {
      conditions.push(`graduation_year BETWEEN ${request.year_from} AND ${request.year_to}`);
    }
    
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
    
    let orderClause = "\nORDER BY graduation_year DESC, name ASC";
    
    const query = selectClause + "\n" + fromClause + joinClause + whereClause + orderClause + ";";
    
    return query;
  };

  const fetchRequest = React.useCallback(async () => {
    try {
      setLoading(true);
      
      // Try API first
      const response = await fetch(`${API_URL}/data-requests/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequest(data);
      } else {
        throw new Error('API not available');
      }
    } catch {
      console.log('Using mock data for demo');
      // Use mock data
      const mockRequest = mockRequests[id] || mockRequests[1];
      setRequest(mockRequest);
    } finally {
      setLoading(false);
    }
  }, [API_URL, id]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

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
        borderRadius: '12px',
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

  const handleStatusUpdate = (updatedRequest) => {
    setRequest(prev => ({
      ...prev,
      ...updatedRequest
    }));
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
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>❌ Request not found</h3>
          <p style={{ color: '#6c757d' }}>The requested data request could not be found.</p>
          <button onClick={() => navigate('/request-management')} className="btn btn-primary">
            ← Back to Request Management
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <div>
          <h1>📄 Request Details</h1>
          <p style={{ color: '#6c757d', marginTop: '0.5rem' }}>
            Managing request from {request.name} ({request.nim})
          </p>
        </div>
        <div>
          <button onClick={() => navigate('/request-management')} className="btn btn-secondary" style={{ marginRight: '1rem' }}>
            ← Back to Management
          </button>
          <button onClick={handleLogout} className="btn btn-danger">Logout</button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #dee2e6', marginBottom: '0' }}>
          {[
            { key: 'details', label: '📋 Details', icon: '📋' },
            { key: 'preview', label: '🔍 Data Preview', icon: '🔍' },
            { key: 'status', label: '⚙️ Status Management', icon: '⚙️' },
            { key: 'email', label: '📧 Email', icon: '📧' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                backgroundColor: activeTab === tab.key ? '#007bff' : 'transparent',
                color: activeTab === tab.key ? '#fff' : '#6c757d',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontWeight: activeTab === tab.key ? '600' : '400',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>
            📋 Request Information
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* Student Information */}
            <div style={{ 
              padding: '1.5rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <h4 style={{ marginBottom: '1rem', color: '#495057' }}>👤 Student Information</h4>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div><strong>Name:</strong> {request.name}</div>
                <div><strong>NIM:</strong> {request.nim}</div>
                <div><strong>Email:</strong> {request.email}</div>
                <div><strong>Phone:</strong> {request.phone_number}</div>
              </div>
            </div>

            {/* Request Details */}
            <div style={{ 
              padding: '1.5rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <h4 style={{ marginBottom: '1rem', color: '#495057' }}>📊 Data Request</h4>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div><strong>Format:</strong> {request.format}</div>
                <div><strong>Year Range:</strong> {request.year_from} - {request.year_to}</div>
                <div><strong>Tables:</strong> {request.table}</div>
                <div><strong>Columns:</strong> {request.columns}</div>
              </div>
            </div>

            {/* Status Information */}
            <div style={{ 
              padding: '1.5rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <h4 style={{ marginBottom: '1rem', color: '#495057' }}>📈 Status & Timeline</h4>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div><strong>Current Status:</strong> {getStatusBadge(request.status)}</div>
                <div><strong>Submitted:</strong> {formatDate(request.created_at)}</div>
                <div><strong>Last Updated:</strong> {formatDate(request.updated_at)}</div>
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', color: '#495057' }}>🎯 Research Purpose</h4>
            <div style={{ 
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              lineHeight: '1.6'
            }}>
              {request.purpose}
            </div>
          </div>

          {/* Generated SQL Query */}
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', color: '#495057' }}>🔍 Generated SQL Query</h4>
            <div style={{ 
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              overflow: 'auto'
            }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {generateSQLQuery(request)}
              </pre>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <button 
                onClick={() => {
                  localStorage.setItem('autoFillSQL', generateSQLQuery(request));
                  setActiveTab('preview');
                }}
                className="btn btn-primary"
              >
                🔍 Preview This Query
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <DataPreview
          initialQuery={generateSQLQuery(request)}
          requestData={request}
          onQueryChange={() => {
            // Handle query changes if needed
          }}
          onExport={(format, data) => {
            console.log('Exported data:', format, data);
            alert(`Data exported as ${format.toUpperCase()}!`);
          }}
          onEmail={(data) => {
            setQueryResults(data);
            setActiveTab('email');
          }}
        />
      )}

      {activeTab === 'status' && (
        <StatusManager
          currentStatus={request.status}
          requestId={request.id}
          onStatusUpdate={handleStatusUpdate}
          onSendEmail={(emailData) => {
            console.log('Email sent:', emailData);
          }}
        />
      )}

      {activeTab === 'email' && (
        <EmailManager
          requestData={request}
          queryResults={queryResults}
          onEmailSent={(emailData) => {
            console.log('Email sent:', emailData);
            alert('📧 Email sent successfully!');
          }}
        />
      )}
    </div>
  );
}