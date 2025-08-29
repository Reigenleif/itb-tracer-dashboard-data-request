import React from 'react';
import { useNavigate } from 'react-router-dom';

const RequestTable = ({ requests, getStatusBadge, formatDate }) => {
  const navigate = useNavigate();

  return (
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
  );
};

export default RequestTable;
