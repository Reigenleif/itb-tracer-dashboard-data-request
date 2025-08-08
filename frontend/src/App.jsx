import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Request from './pages/Request';

// Component to redirect based on login status
function HomeRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/home');  // Changed from /dashboard to /home
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
      <Route path="/home" element={<Dashboard />} />  {/* This becomes the Home page */}
      <Route path="/sql-query" element={<Request />} />
      <Route path="/request-management" element={<Request />} />  {/* We'll build this next */}
      <Route path="/request" element={<Request />} />
    </Routes>
  );
}