// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin_theme') || 
                      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.style.setProperty('--bg-primary', '#1f2937');
      root.style.setProperty('--bg-secondary', '#374151');
      root.style.setProperty('--bg-tertiary', '#4b5563');
      root.style.setProperty('--text-primary', '#f9fafb');
      root.style.setProperty('--text-secondary', '#e5e7eb');
      root.style.setProperty('--text-muted', '#9ca3af');
      root.style.setProperty('--border-color', '#4b5563');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.2)');
      document.body.style.backgroundColor = '#1f2937';
      document.body.style.color = '#f9fafb';
    } else {
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f9fafb');
      root.style.setProperty('--bg-tertiary', '#f3f4f6');
      root.style.setProperty('--text-primary', '#111827');
      root.style.setProperty('--text-secondary', '#374151');
      root.style.setProperty('--text-muted', '#6b7280');
      root.style.setProperty('--border-color', '#d1d5db');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.08)');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#111827';
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('admin_theme', newTheme);
    applyTheme(newTheme);
  };

  // Initialize font and base styles
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    document.body.style.margin = '0';
    document.body.style.height = '100vh';
    document.documentElement.style.height = '100vh';
    document.body.style.fontFamily = "'Poppins', sans-serif";
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';

    return () => {
      document.head.removeChild(link);
      document.body.style = {};
    };
  }, []);

  // Auth management
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      try {
        // Verify token is valid by making a profile request
        const response = await authAPI.getProfile();
        if (response.data && response.data.type === 'admin') {
          setUser(response.data);
          setIsAuthenticated(true);
        } else {
          throw new Error('User is not an admin');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Token is invalid or user is not admin, clear it
        localStorage.removeItem('admin_token');
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      
      // Call the API service which already handles FormData and token storage
      const response = await authAPI.login(credentials);
      
      console.log('Login response:', response); // For debugging
      
      if (!response) {
        throw new Error('No response received');
      }

      // The API service already stores the token, now verify user type
      if (response.user_type !== 'admin') {
        // Remove token if user is not admin
        localStorage.removeItem('admin_token');
        throw new Error('Access denied. Admin privileges required.');
      }
      
      // Create user object from response
      const userData = {
        id: response.user_id,
        email: credentials.email,
        type: response.user_type
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      // Clear token on error
      localStorage.removeItem('admin_token');
      setIsAuthenticated(false);
      setUser(null);
      
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('admin_token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    updateUser,
    theme,
    toggleTheme,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};