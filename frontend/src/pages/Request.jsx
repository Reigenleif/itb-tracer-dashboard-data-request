import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataPreview from '../components/DataPreview';

export default function Request() {
  const [initialQuery, setInitialQuery] = useState('');
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const navigate = useNavigate();

  // Auto-fill SQL from localStorage (from request detail)
  useEffect(() => {
    try {
      console.log('=== SQL Query page loaded ===');
      
      const autoFillSQL = localStorage.getItem('autoFillSQL');
      console.log('Auto-fill SQL from localStorage:', autoFillSQL);
      
      if (autoFillSQL && autoFillSQL.length > 0) {
        console.log('Setting auto-filled SQL:', autoFillSQL);
        setInitialQuery(autoFillSQL);
        setIsAutoFilled(true);
        
        // Clear localStorage after setting
        localStorage.removeItem('autoFillSQL');
        console.log('localStorage cleared after successful auto-fill');
        
        setTimeout(() => {
          alert('✅ SQL query auto-filled from request details!');
        }, 1000);
      } else {
        console.log('No auto-fill found, using default query');
        const defaultQuery = 'SELECT name, nim, graduation_year, current_job, salary_range, company FROM tracer_data WHERE graduation_year >= 2023';
        setInitialQuery(defaultQuery);
      }
    } catch (err) {
      console.error('Error in useEffect:', err);
      setInitialQuery('SELECT name, nim FROM tracer_data LIMIT 10');
    }
  }, []);

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
      
      <DataPreview
        initialQuery={initialQuery}
        onQueryChange={(query) => {
          console.log('Query changed:', query);
        }}
        onExport={(format, data) => {
          console.log('Exported data:', format, data);
          alert(`✅ Data exported as ${format.toUpperCase()}!`);
        }}
        onEmail={(data) => {
          console.log('Email data:', data);
          alert('📧 Email functionality would be integrated here!');
        }}
      />
    </div>
  );
}
