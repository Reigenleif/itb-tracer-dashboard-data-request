import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';

export default function Request() {
  const [sqlInput, setSqlInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async () => {
    setError(null);
    setResult(null);
    try {
      const response = await fetch(`${API_URL}/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // If your backend requires authentication, uncomment below:
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ sql: sqlInput }),
      });

      if (!response.ok) {
        const errData = await response.json();
        setError(errData.message || 'SQL request failed');
        return;
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>SQL Request</h2>
        <button onClick={handleLogout} style={{ padding: '0.5rem 1rem' }}>Logout</button>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <CodeMirror
          value={sqlInput}
          height="200px"
          extensions={[sql()]}
          onChange={(value) => setSqlInput(value)}
        />
      </div>
      <button onClick={handleSubmit} style={{ padding: '0.5rem 1rem' }}>Create</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && (
        <div style={{ marginTop: '1rem' }}>
          <a
            href={`${API_URL}/sql/result`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button style={{ padding: '0.5rem 1rem' }}>Download</button>
          </a>
        </div>
      )}
    </div>
  );
}
