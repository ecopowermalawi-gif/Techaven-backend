import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div 
      className="flex flex-col h-screen bg-gray-50"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Compact Navbar */}
      <header className="bg-white shadow-sm z-4">
        <div className="flex items-center justify-between px-0.2 py-2 w-full">
          <div className="flex items-center space-x-2">
            <h1 
              className="text-sm font-semibold text-gray-800"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
            
            </h1>
            <span 
              className="text-sm text-gray-500"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
             
            </span>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main 
        className="flex-1"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
