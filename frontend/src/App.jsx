import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/Login';
import Request from './pages/Request';

// Component to redirect based on login status
function HomeRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/request');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return null; // Nothing renders
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/request" element={<Request />} />
    </Routes>
  );
}