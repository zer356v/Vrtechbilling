
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn, initializeUsers } from '../utils/authUtils';
import AuthForm from '../components/AuthForm';

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Initialize with sample users if needed
    initializeUsers();
    
    // Check if user is already logged in
    if (isLoggedIn()) {
      navigate('/dashboard');
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-5xl flex flex-col md:flex-row rounded-lg shadow-xl overflow-hidden">
        <div className="bg-blue-600 text-white p-12 flex flex-col justify-center items-center md:w-1/2">
          <div className="mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">AC Billing Software</h1>
          <p className="text-blue-100 text-center mb-8">
            Comprehensive AC service billing and management solution for HVAC professionals
          </p>
          <div className="bg-white/10 p-4 rounded-lg">
            <h3 className="font-semibold text-xl mb-2">Features:</h3>
            <ul className="list-disc list-inside text-blue-100 space-y-1">
              <li>Simplified billing and invoicing</li>
              <li>Service tracking and management</li>
              <li>Financial analytics and reporting</li>
              <li>Customer management</li>
              <li>Technician scheduling</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-white p-12 flex items-center justify-center md:w-1/2">
          <AuthForm onSuccess={handleLoginSuccess} />
        </div>
      </div>
    </div>
  );
};

export default Index;
