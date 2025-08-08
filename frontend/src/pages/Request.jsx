import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';

export default function Request() {
  const [sqlInput, setSqlInput] = useState('SELECT name, nim, graduation_year, current_job, salary_range, company FROM tracer_data WHERE graduation_year >= 2023');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    
    // Mock data for demo (replace with real API later)
    const mockData = {
      data: [
        { name: "Ahmad Fauzi", nim: "13520001", graduation_year: 2024, current_job: "Software Engineer", salary_range: "10-15 juta", company: "Tokopedia" },
        { name: "Sari Dewi", nim: "13520002", graduation_year: 2024, current_job: "Data Scientist", salary_range: "12-18 juta", company: "Gojek" },
        { name: "Budi Santoso", nim: "13520003", graduation_year: 2023, current_job: "Product Manager", salary_range: "15-20 juta", company: "Traveloka" },
        { name: "Maya Putri", nim: "13520004", graduation_year: 2023, current_job: "UI/UX Designer", salary_range: "8-12 juta", company: "Blibli" },
        { name: "Rizki Anwar", nim: "13520005", graduation_year: 2024, current_job: "DevOps Engineer", salary_range: "13-17 juta", company: "Bukalapak" },
        { name: "Indra Pratama", nim: "13520006", graduation_year: 2023, current_job: "Machine Learning Engineer", salary_range: "14-18 juta", company: "Shopee" },
        { name: "Lisa Permata", nim: "13520007", graduation_year: 2024, current_job: "Frontend Developer", salary_range: "9-13 juta", company: "OVO" }
      ],
      columns: ["name", "nim", "graduation_year", "current_job", "salary_range", "company"]
    };
    
    // Simulate API delay
    setTimeout(() => {
      setResult(mockData);
      setLoading(false);
    }, 800);
    
    return;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>🔍 SQL Query Interface</h1>
          <p style={{ color: '#6c757d', marginTop: '0.5rem' }}>Execute database queries safely</p>
        </div>
        <div>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ marginRight: '1rem' }}>
            ← Back to Dashboard
          </button>
          <button onClick={handleLogout} className="btn btn-danger">Logout</button>
        </div>
      </div>
      
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>📝 Query Editor</h3>
        <p style={{ color: '#6c757d', marginBottom: '1rem', fontSize: '0.9rem' }}>
          ⚠️ Only SELECT statements are allowed for security purposes
        </p>
        <div className="sql-editor">
          <CodeMirror
            value={sqlInput}
            height="200px"
            extensions={[sql()]}
            onChange={(value) => setSqlInput(value)}
            style={{ fontSize: '14px' }}
          />
        </div>
        <button 
          onClick={handleSubmit} 
          className="btn btn-primary" 
          style={{ marginTop: '1rem' }}
          disabled={loading}
        >
          {loading ? <span className="loading"></span> : '▶️'} Execute Query
        </button>
        
        {error && <div className="error-message" style={{ marginTop: '1rem' }}>{error}</div>}
      </div>

      {result && (
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>
            📊 Query Results ({result.data.length} rows found)
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="results-table">
              <thead>
                <tr>
                  {result.columns.map((col, i) => (
                    <th key={i}>{col.replace(/_/g, ' ').toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.data.map((row, i) => (
                  <tr key={i}>
                    {result.columns.map((col, j) => (
                      <td key={j}>
                        {col === 'salary_range' ? `💰 ${row[col]}` : 
                         col === 'company' ? `🏢 ${row[col]}` :
                         col === 'current_job' ? `💼 ${row[col]}` :
                         row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-success">📄 Export as CSV</button>
            <button className="btn btn-primary">📊 Generate Report</button>
            <button className="btn btn-secondary">📧 Share Results</button>
          </div>
        </div>
      )}
    </div>
  );
}
