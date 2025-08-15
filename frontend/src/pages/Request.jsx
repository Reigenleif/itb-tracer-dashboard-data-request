import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';

export default function Request() {
  const [sqlInput, setSqlInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render trigger
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  // Auto-fill SQL from localStorage (from request detail)
  useEffect(() => {
    try {
      console.log('=== SQL Query page loaded ===');
      
      const autoFillSQL = localStorage.getItem('autoFillSQL');
      console.log('Auto-fill SQL from localStorage:', autoFillSQL);
      
      if (autoFillSQL && autoFillSQL.length > 0) {
        console.log('Setting auto-filled SQL:', autoFillSQL);
        setSqlInput(autoFillSQL);
        setIsAutoFilled(true);
        setForceUpdate(prev => prev + 1); // Trigger re-render
        
        // Clear localStorage after a delay to ensure component is updated
        setTimeout(() => {
          localStorage.removeItem('autoFillSQL');
          console.log('localStorage cleared after successful auto-fill');
        }, 1000);
        
        setTimeout(() => {
          alert('✅ SQL query auto-filled from request details!');
        }, 1500);
      } else {
        console.log('No auto-fill found, using default query');
        const defaultQuery = 'SELECT name, nim, graduation_year, current_job, salary_range, company FROM tracer_data WHERE graduation_year >= 2023';
        setSqlInput(defaultQuery);
      }
    } catch (err) {
      console.error('Error in useEffect:', err);
      setSqlInput('SELECT name, nim FROM tracer_data LIMIT 10');
    }
  }, []);

  // Monitor sqlInput changes for debugging
  useEffect(() => {
    console.log('sqlInput state changed to:', sqlInput);
  }, [sqlInput]);

  const handleSubmit = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    
    // Mock data for demo
    const mockData = {
      data: [
        { name: "Ahmad Fauzi", nim: "13520001", graduation_year: 2024, current_job: "Software Engineer", salary_range: "10-15 juta", company: "Tokopedia" },
        { name: "Sari Dewi", nim: "13520002", graduation_year: 2024, current_job: "Data Scientist", salary_range: "12-18 juta", company: "Gojek" },
        { name: "Budi Santoso", nim: "13520003", graduation_year: 2023, current_job: "Product Manager", salary_range: "15-20 juta", company: "Traveloka" },
        { name: "Maya Putri", nim: "13520004", graduation_year: 2023, current_job: "UI/UX Designer", salary_range: "8-12 juta", company: "Blibli" },
        { name: "Rizki Anwar", nim: "13520005", graduation_year: 2024, current_job: "DevOps Engineer", salary_range: "13-17 juta", company: "Bukalapak" }
      ],
      columns: ["name", "nim", "graduation_year", "current_job", "salary_range", "company"]
    };
    
    setTimeout(() => {
      setResult(mockData);
      setLoading(false);
    }, 800);
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
          <p style={{ color: '#6c757d', marginTop: '0.5rem' }}>
            Execute database queries safely
            {isAutoFilled && (
              <span style={{ 
                marginLeft: '1rem', 
                padding: '0.25rem 0.75rem', 
                backgroundColor: '#d4edda', 
                color: '#155724',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                ✅ Query auto-filled from request
              </span>
            )}
          </p>
        </div>
        <div>
          <button onClick={() => navigate('/home')} className="btn btn-secondary" style={{ marginRight: '1rem' }}>
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
            key={`codemirror-${forceUpdate}-${sqlInput.substring(0, 50)}`} // Unique key for re-render
            value={sqlInput}
            height="200px"
            extensions={[sql()]}
            onChange={(value) => {
              console.log('CodeMirror onChange:', value);
              setSqlInput(value);
            }}
            editable={true}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              dropCursor: false,
              allowMultipleSelections: false,
              indentOnInput: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              highlightSelectionMatches: false,
              searchKeymap: true
            }}
          />
        </div>
        <button 
          onClick={handleSubmit} 
          className="btn btn-primary" 
          style={{ marginTop: '1rem', marginRight: '1rem' }}
          disabled={loading}
        >
          {loading ? <span className="loading"></span> : '▶️'} Execute Query
        </button>
        
        {/* Debug button for testing */}
        <button 
          onClick={() => {
            const testQuery = "SELECT * FROM graduates WHERE graduation_year = 2024";
            console.log('Manual test - setting query:', testQuery);
            setSqlInput(testQuery);
          }}
          className="btn btn-secondary" 
          style={{ marginTop: '1rem', marginRight: '1rem' }}
        >
          🧪 Test Query Change
        </button>
        
        <button 
          onClick={() => {
            console.log('Current sqlInput state:', sqlInput);
            console.log('Current localStorage:', localStorage.getItem('autoFillSQL'));
          }}
          className="btn btn-secondary" 
          style={{ marginTop: '1rem' }}
        >
          🔍 Debug State
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
