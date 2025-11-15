import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Shops from './pages/Shops';
import Promotions from './pages/Promotions';
import Login from './pages/Login';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const ProtectedRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Poppins', sans-serif",
          fontSize: '1.1rem',
          color: '#4B5563',
        }}
      >
        Checking authentication...
      </div>
    );
  }

  return isAuthenticated ? (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/products" element={<Products />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/shops" element={<Shops />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default App;
