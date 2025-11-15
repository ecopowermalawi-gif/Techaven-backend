import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Smartphone, Laptop, Headphones, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { isAuthenticated, login, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(credentials);
    
    if (result.success) {
      console.log('Login successful, redirecting...');
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }
    setLoading(false);
  };

  // Theme-based styles with responsive design
  const styles = {
    container: {
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-family, "Poppins", sans-serif)',
      overflow: 'auto',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      transition: 'all 0.3s ease',
    },
    // Mobile-first: Stack layout for small screens
    mobileLayout: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    // Desktop: Side-by-side layout for larger screens
    desktopLayout: {
      flex: 1,
      display: 'flex',
      flexDirection: 'row',
    },
    leftPanel: {
      width: '100%',
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      padding: '1.5rem',
      zIndex: 2,
    },
    leftPanelDesktop: {
      width: '400px',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      padding: '2rem',
      zIndex: 2,
      boxShadow: `4px 0 15px var(--shadow-color)`,
    },
    loginForm: {
      width: '100%',
      maxWidth: '350px',
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: '12px',
      boxShadow: `0 4px 12px var(--shadow-color)`,
      padding: '1.5rem',
      border: `1px solid var(--border-color)`,
    },
    loginFormMobile: {
      width: '100%',
      maxWidth: '100%',
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: '12px',
      boxShadow: `0 4px 12px var(--shadow-color)`,
      padding: '1.5rem',
      border: `1px solid var(--border-color)`,
    },
    heading: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: 'var(--text-primary)',
      marginBottom: '0.5rem',
      textAlign: 'center',
    },
    headingMobile: {
      fontSize: '1.3rem',
      fontWeight: '600',
      color: 'var(--text-primary)',
      marginBottom: '0.5rem',
      textAlign: 'center',
    },
    subtitle: {
      color: 'var(--text-secondary)',
      fontSize: '0.9rem',
      fontWeight: '400',
      textAlign: 'center',
    },
    subtitleMobile: {
      color: 'var(--text-secondary)',
      fontSize: '0.8rem',
      fontWeight: '400',
      textAlign: 'center',
    },
    input: {
      width: '100%',
      height: '45px',
      padding: '0 0.75rem',
      borderRadius: '6px',
      border: '1px solid var(--border-color)',
      outline: 'none',
      fontSize: '0.9rem',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      transition: 'all 0.2s ease',
    },
    inputMobile: {
      width: '100%',
      height: '50px',
      padding: '0 0.75rem',
      borderRadius: '6px',
      border: '1px solid var(--border-color)',
      outline: 'none',
      fontSize: '1rem',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      transition: 'all 0.2s ease',
    },
    button: {
      width: '100%',
      height: '45px',
      backgroundColor: loading ? '#60A5FA' : '#2563EB',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      fontWeight: '600',
      cursor: loading ? 'not-allowed' : 'pointer',
      boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)',
      transition: 'all 0.2s ease',
      fontSize: '0.9rem',
      fontFamily: 'inherit',
    },
    buttonMobile: {
      width: '100%',
      height: '50px',
      backgroundColor: loading ? '#60A5FA' : '#2563EB',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      fontWeight: '600',
      cursor: loading ? 'not-allowed' : 'pointer',
      boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)',
      transition: 'all 0.2s ease',
      fontSize: '1rem',
      fontFamily: 'inherit',
    },
    rightPanel: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #2563EB, #1E40AF)',
      padding: '2rem',
      color: '#fff',
      fontFamily: 'inherit',
      minHeight: '40vh',
    },
    rightPanelMobile: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #2563EB, #1E40AF)',
      padding: '1.5rem',
      color: '#fff',
      fontFamily: 'inherit',
      minHeight: '40vh',
    },
    themeToggle: {
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      background: 'var(--bg-secondary)',
      border: `1px solid var(--border-color)`,
      color: 'var(--text-primary)',
      cursor: 'pointer',
      padding: '0.5rem',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      zIndex: 1000,
    },
    iconContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    iconContainerMobile: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      marginBottom: '1.5rem',
    }
  };

  // Check if mobile screen
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={styles.container}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        style={styles.themeToggle}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      {isMobile ? (
        // Mobile Layout: Stacked vertically
        <div style={styles.mobileLayout}>
          {/* Top: Login form */}
          <div style={styles.leftPanel}>
            <div style={styles.loginFormMobile}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={styles.headingMobile}>
                  Techaven Admin
                </h1>
                <p style={styles.subtitleMobile}>
                  Sign in to your admin account
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.2rem',
                }}
              >
                {error && (
                  <div
                    style={{
                      backgroundColor: theme === 'light' ? '#FEF2F2' : '#7F1D1D',
                      border: '1px solid #FECACA',
                      color: '#DC2626',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Email Field */}
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <label
                    htmlFor="email"
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.3rem',
                    }}
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={credentials.email}
                    onChange={(e) =>
                      setCredentials({ ...credentials, email: e.target.value })
                    }
                    placeholder="admin@techaven.com"
                    style={styles.inputMobile}
                  />
                </div>

                {/* Password Field */}
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <label
                    htmlFor="password"
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.3rem',
                    }}
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({ ...credentials, password: e.target.value })
                    }
                    placeholder="Enter your password"
                    style={styles.inputMobile}
                  />
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={styles.buttonMobile}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            </div>
          </div>

          {/* Bottom: Blue background with branding */}
          <div style={styles.rightPanelMobile}>
            <div style={{ textAlign: 'center' }}>
              <div style={styles.iconContainerMobile}>
                <Smartphone style={{ width: '50px', height: '50px', opacity: 0.8 }} />
                <Laptop style={{ width: '50px', height: '50px', opacity: 0.8 }} />
                <Headphones style={{ width: '50px', height: '50px', opacity: 0.8 }} />
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                Techaven
              </h2>
              <p
                style={{
                  fontSize: '1.1rem',
                  opacity: 0.9,
                  marginBottom: '0.3rem',
                  fontWeight: '500',
                }}
              >
                Electronics Marketplace
              </p>
              <p style={{ fontSize: '0.9rem', opacity: 0.8, fontWeight: '400' }}>
                Admin Dashboard
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Desktop Layout: Side by side
        <div style={styles.desktopLayout}>
          {/* Left side - Login form */}
          <div style={styles.leftPanelDesktop}>
            <div style={styles.loginForm}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={styles.heading}>
                  Techaven Admin
                </h1>
                <p style={styles.subtitle}>
                  Sign in to your admin account
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.2rem',
                }}
              >
                {error && (
                  <div
                    style={{
                      backgroundColor: theme === 'light' ? '#FEF2F2' : '#7F1D1D',
                      border: '1px solid #FECACA',
                      color: '#DC2626',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Email Field */}
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <label
                    htmlFor="email"
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.3rem',
                    }}
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={credentials.email}
                    onChange={(e) =>
                      setCredentials({ ...credentials, email: e.target.value })
                    }
                    placeholder="admin@techaven.com"
                    style={styles.input}
                  />
                </div>

                {/* Password Field */}
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <label
                    htmlFor="password"
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      color: 'var(--text-secondary)',
                      marginBottom: '0.3rem',
                    }}
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({ ...credentials, password: e.target.value })
                    }
                    placeholder="Enter your password"
                    style={styles.input}
                  />
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={styles.button}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            </div>
          </div>

          {/* Right side - Blue background */}
          <div style={styles.rightPanel}>
            <div style={{ textAlign: 'center' }}>
              <div style={styles.iconContainer}>
                <Smartphone style={{ width: '80px', height: '80px', opacity: 0.8 }} />
                <Laptop style={{ width: '80px', height: '80px', opacity: 0.8 }} />
                <Headphones style={{ width: '80px', height: '80px', opacity: 0.8 }} />
              </div>
              <h2 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1rem' }}>
                Techaven
              </h2>
              <p
                style={{
                  fontSize: '1.4rem',
                  opacity: 0.9,
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                }}
              >
                Electronics Marketplace
              </p>
              <p style={{ fontSize: '1.1rem', opacity: 0.8, fontWeight: '400' }}>
                Admin Dashboard
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;