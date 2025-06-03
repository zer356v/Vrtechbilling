import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-blue-100 py-6">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-blue-600 font-bold text-xl flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">AC Billing System</span>
            </Link>
          </div>

          <div className="flex space-x-6 mb-4 md:mb-0">
            <Link to="/privacy-policy" className="text-gray-600 hover:text-blue-600 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-gray-600 hover:text-blue-600 transition-colors">
              Terms of Service
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </div>

          <div className="text-gray-500 text-sm">
            © {currentYear} AC Billing Solutions. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;