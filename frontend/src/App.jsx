import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Billing from './pages/Billing';
import Customers from './pages/Customer';
import Reports from './pages/Report';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Footer from './components/Footer';
import Technicians from './pages/Technicians';
import './index.css';

const App = () => {
  return (
  
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/services" element={<Services />} />
            <Route path="/technicians" element={<Technicians />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
            
          </Routes>
       
  );
};

export default App;

