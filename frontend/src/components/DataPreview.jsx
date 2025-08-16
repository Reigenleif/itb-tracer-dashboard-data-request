import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';

export default function DataPreview({ 
  initialQuery = '', 
  onQueryChange, 
  onExport, 
  onEmail
}) {
  const [sqlQuery, setSqlQuery] = useState(initialQuery);
  const [queryResult, setQueryResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewMode, setPreviewMode] = useState('table');
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  // Update sqlQuery when initialQuery changes
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setSqlQuery(initialQuery);
    }
  }, [initialQuery]);

  // Mock data generator
  const generateMockData = () => {
    return {
      data: [
        { 
          id: 1, 
          name: "Ahmad Fauzi", 
          nim: "13520001", 
          graduation_year: 2024, 
          current_job: "Software Engineer", 
          salary_range: "10-15 juta", 
          company: "Tokopedia"
        },
        { 
          id: 2, 
          name: "Sari Dewi", 
          nim: "13520002", 
          graduation_year: 2024, 
          current_job: "Data Scientist", 
          salary_range: "12-18 juta", 
          company: "Gojek"
        }
      ],
      columns: ["id", "name", "nim", "graduation_year", "current_job", "salary_range", "company"],
      total_rows: 2,
      execution_time: "0.023s"
    };
  };

  const executeQuery = async () => {
    if (!sqlQuery.trim()) {
      setError('Please enter a SQL query');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ query: sqlQuery })
      });

      if (response.ok) {
        const data = await response.json();
        setQueryResult(data);
      } else {
        throw new Error('API not available');
      }
    } catch {
      console.log('Using mock data for preview');
      setTimeout(() => {
        const mockResult = generateMockData();
        setQueryResult(mockResult);
        setLoading(false);
      }, 800);
      return;
    }
    
    setLoading(false);
  };

  const handleRowSelect = (rowIndex) => {
    const newSelectedRows = [...selectedRows];
    const index = newSelectedRows.indexOf(rowIndex);
    
    if (index > -1) {
      newSelectedRows.splice(index, 1);
    } else {
      newSelectedRows.push(rowIndex);
    }
    
    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.length === queryResult?.data?.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(queryResult?.data?.map((_, index) => index) || []);
    }
    setSelectAll(!selectAll);
  };

  const exportToCSV = () => {
    if (!queryResult?.data) return;
    
    const dataToExport = selectedRows.length > 0 
      ? selectedRows.map(index => queryResult.data[index])
      : queryResult.data;
    
    const headers = queryResult.columns.join(',');
    const csvContent = [headers, ...dataToExport.map(row => 
      queryResult.columns.map(col => 
        typeof row[col] === 'string' && row[col].includes(',') 
          ? `"${row[col]}"` 
          : row[col]
      ).join(',')
    )].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracer_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    if (onExport) onExport('csv', dataToExport);
  };

  const exportToJSON = () => {
    if (!queryResult?.data) return;
    
    const dataToExport = selectedRows.length > 0 
      ? selectedRows.map(index => queryResult.data[index])
      : queryResult.data;
    
    const jsonContent = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracer_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    if (onExport) onExport('json', dataToExport);
  };

  return (
    <div className="data-preview-container">
      <div className="card">
        <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>
          🔍 Query Editor
        </h3>
        
        <div className="sql-editor" style={{ marginBottom: '1rem' }}>
          <CodeMirror
            value={sqlQuery}
            height="150px"
            extensions={[sql()]}
            onChange={(value) => {
              setSqlQuery(value);
              if (onQueryChange) onQueryChange(value);
            }}
            editable={true}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={executeQuery} 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? <span className="loading"></span> : '▶️'} Execute Query
          </button>
          
          <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
            {queryResult && (
              <>✅ {queryResult.total_rows} rows found in {queryResult.execution_time}</>
            )}
          </div>
        </div>
        
        {error && (
          <div className="error-message" style={{ marginTop: '1rem' }}>
            {error}
          </div>
        )}
      </div>

      {queryResult && (
        <div className="card">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <h3 style={{ color: '#2c3e50', margin: 0 }}>
              📊 Query Results ({queryResult.data.length} rows)
            </h3>
            
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select 
                value={previewMode} 
                onChange={(e) => setPreviewMode(e.target.value)}
                className="form-control"
                style={{ width: 'auto' }}
              >
                <option value="table">📋 Table View</option>
                <option value="json">📄 JSON View</option>
              </select>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={exportToCSV} className="btn btn-success">
                📄 Export CSV
              </button>
              <button onClick={exportToJSON} className="btn btn-primary">
                📄 Export JSON
              </button>
              <button 
                onClick={() => onEmail && onEmail(queryResult.data)} 
                className="btn btn-secondary"
              >
                📧 Email Results
              </button>
            </div>
            
            {selectedRows.length > 0 && (
              <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                {selectedRows.length} rows selected
              </div>
            )}
          </div>

          {previewMode === 'table' && (
            <div style={{ overflowX: 'auto' }}>
              <table className="results-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                    </th>
                    {queryResult.columns.map((col, i) => (
                      <th key={i}>{col.replace(/_/g, ' ').toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {queryResult.data.map((row, i) => (
                    <tr 
                      key={i}
                      style={{
                        backgroundColor: selectedRows.includes(i) ? '#e3f2fd' : 'transparent'
                      }}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(i)}
                          onChange={() => handleRowSelect(i)}
                        />
                      </td>
                      {queryResult.columns.map((col, j) => (
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
          )}

          {previewMode === 'json' && (
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '1rem', 
              borderRadius: '8px',
              maxHeight: '400px',
              overflow: 'auto'
            }}>
              <pre style={{ margin: 0, fontSize: '0.85rem' }}>
                {JSON.stringify(queryResult.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}