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
    /* Function to test or preview a query, hits an endpoint that returns table in an array format */

    if (!sqlQuery.trim()) {
      setError('Please enter a SQL query');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/sql/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ sql: sqlQuery })
      });

      const data = await response.json();
      console.log('Raw backend response:', data);
      
      if (response.ok) {
        // Backend returns {table: [[headers], [row1], [row2], ...]}
        // We need to transform it to the expected format
        const table = data.table;
        console.log('Backend table data:', table);
        
        if (table && Array.isArray(table) && table.length > 0) {
          const columns = table[0]; // First row contains headers
          const rows = table.slice(1); // Remaining rows are data
          
          console.log('Extracted columns:', columns);
          console.log('Extracted rows:', rows);
          console.log('columns type:', typeof columns, 'is array:', Array.isArray(columns));
          console.log('rows type:', typeof rows, 'is array:', Array.isArray(rows));
          
          // Validate columns is an array
          if (!Array.isArray(columns)) {
            console.error('Columns is not an array:', columns);
            setError('Invalid data format received from server');
            setQueryResult(null);
            return;
          }
          
          // Transform rows from array format to object format
          const transformedRows = rows.map((row, index) => {
            const rowObj = {};
            if (Array.isArray(row)) {
              columns.forEach((col, colIndex) => {
                rowObj[col] = row[colIndex];
              });
            } else {
              console.warn(`Row ${index} is not an array:`, row);
              // If row is already an object, use it as is
              return row;
            }
            return rowObj;
          });

          const transformedResult = {
            data: transformedRows,
            columns: columns,
            total_rows: rows.length,
            execution_time: "< 0.1s" // We don't get this from backend, so use a default
          };

          console.log('Final transformed result:', transformedResult);
          setQueryResult(transformedResult);
        } else {
          // Empty result set
          console.log('Empty result set received');
          setQueryResult({
            data: [],
            columns: [],
            total_rows: 0,
            execution_time: "< 0.1s"
          });
        }
      } else {
        // Display backend error message if available
        setError(data.error || data.message || 'API not available');
        setQueryResult(null);
      }
    } catch (err) {
      console.error('Query execution error:', err);
      // If fetch fails, fallback to mock data
      console.log('Using mock data for preview');
      setTimeout(() => {
        const mockResult = generateMockData();
        setQueryResult(mockResult);
        setLoading(false);
      }, 800);
      setError(err?.message || 'Failed to fetch data. Using mock data for demo.');
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
    console.log('Exporting CSV with queryResult:', queryResult);
    if (!queryResult?.data || !queryResult?.columns) {
      console.error('No data available for CSV export');
      return;
    }
    
    const dataToExport = selectedRows.length > 0 
      ? selectedRows.map(index => queryResult.data[index])
      : queryResult.data;
    
    console.log('Data to export:', dataToExport);
    
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
            {queryResult && queryResult.data && (
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
          {console.log('Rendering query results section with:', queryResult)}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <h3 style={{ color: '#2c3e50', margin: 0 }}>
              📊 Query Results ({queryResult.data ? queryResult.data.length : 0} rows)
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

          {previewMode === 'table' && queryResult.data && queryResult.columns && (
            <div style={{ overflowX: 'auto' }}>
              {queryResult.data.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2rem',
                  color: '#6c757d',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6'
                }}>
                  <h4>📋 No Results Found</h4>
                  <p>Your query executed successfully but returned no data.</p>
                </div>
              ) : (
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
              )}
            </div>
          )}

          {previewMode === 'json' && queryResult.data && (
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