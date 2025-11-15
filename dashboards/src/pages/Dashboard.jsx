import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users as UsersIcon,
  Package,
  ShoppingCart,
  Store,
  LayoutDashboard,
  Settings,
  LogOut,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Tag,
  Moon,
  Sun,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import { adminAPI } from "../services/api";
import Orders from "./Orders";
import Products from "./Products";
import Promotions from "./Promotions";
import Shops from "./Shops";
import Users from "./Users";

const Dashboard = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: adminAPI.getMetrics,
    refetchInterval: 30000,
  });

  // Handle the current backend response structure
  const stats = React.useMemo(() => {
    if (!apiResponse) return {};
    
    // If the backend returns the new structure with "data" property
    if (apiResponse.data) {
      return apiResponse.data;
    }
    
    // If the backend returns the old structure (direct fields)
    // This handles the current response until you update the backend
    if (apiResponse.total_users !== undefined) {
      return {
        totalUsers: apiResponse.total_users || 0,
        totalShops: apiResponse.total_shops || 0,
        totalProducts: apiResponse.total_products || 0,
        totalOrders: apiResponse.total_orders || 0,
        totalRevenue: 0, // Not available in current response
        pendingShops: apiResponse.pending_verifications || 0,
        userGrowth: 0,
        productGrowth: 0,
        orderGrowth: 0,
        shopGrowth: 0,
        revenueGrowth: 0,
        monthlyData: [],
        categoryDistribution: []
      };
    }
    
    return {};
  }, [apiResponse]);

  const chartData = stats?.monthlyData || [];

  // Theme-based colors
  const theme = {
    light: {
      background: "#f5f7fb",
      navbar: "#ffffff",
      sidebar: "#004aad",
      card: "#ffffff",
      text: {
        primary: "#1f2937",
        secondary: "#6b7280",
        inverse: "#ffffff"
      },
      border: "#e5e7eb",
      shadow: "0 2px 8px rgba(0,0,0,0.1)"
    },
    dark: {
      background: "#1a1a1a",
      navbar: "#2d2d2d",
      sidebar: "#0a2540",
      card: "#2d2d2d",
      text: {
        primary: "#ffffff",
        secondary: "#a0a0a0",
        inverse: "#ffffff"
      },
      border: "#404040",
      shadow: "0 2px 8px rgba(0,0,0,0.3)"
    }
  };

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: <UsersIcon size={24} />,
      color: "#004aad",
      change: stats?.userGrowth || 0,
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: <Package size={24} />,
      color: "#00b4d8",
      change: stats?.productGrowth || 0,
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: <ShoppingCart size={24} />,
      color: "#0077b6",
      change: stats?.orderGrowth || 0,
    },
    {
      title: "Total Shops",
      value: stats?.totalShops || 0,
      icon: <Store size={24} />,
      color: "#0096c7",
      change: stats?.shopGrowth || 0,
    },
    {
  title: "Revenue",
  value: stats?.totalRevenue ? `MWK ${stats.totalRevenue.toLocaleString()}` : "MWK 0",
  //icon: <DollarSign size={24} />,
  color: "#48cae4",
  change: stats?.revenueGrowth || 0,
},
    {
      title: "Pending Shops",
      value: stats?.pendingShops || 0,
      icon: <ShoppingBag size={24} />,
      color: "#ff6b6b",
      change: 0,
    },
  ];

  const navItems = [
    { id: "dashboard", name: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "products", name: "Products", icon: <Package size={18} /> },
    { id: "orders", name: "Orders", icon: <ShoppingCart size={18} /> },
    { id: "shops", name: "Shops", icon: <Store size={18} /> },
    { id: "promotions", name: "Promotions", icon: <Tag size={18} /> },
    { id: "users", name: "Users", icon: <UsersIcon size={18} /> },
    { id: "settings", name: "Settings", icon: <Settings size={18} /> },
  ];

  const styles = {
    layout: {
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      width: "100vw",
      backgroundColor: currentTheme.background,
      overflow: "hidden",
      fontFamily: "'Poppins', sans-serif",
      color: currentTheme.text.primary,
      transition: "all 0.3s ease",
    },
    navbar: {
      backgroundColor: currentTheme.navbar,
      boxShadow: currentTheme.shadow,
      zIndex: 4,
      padding: "8px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      borderBottom: `1px solid ${currentTheme.border}`,
      transition: "all 0.3s ease",
    },
    navbarContent: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
    },
    navbarTitle: {
      fontSize: "14px",
      fontWeight: "600",
      color: currentTheme.text.primary,
      fontFamily: "'Poppins', sans-serif",
    },
    navbarWelcome: {
      fontSize: "14px",
      color: currentTheme.text.secondary,
      fontFamily: "'Poppins', sans-serif",
    },
    mainContainer: {
      display: "flex",
      flex: 1,
      overflow: "hidden",
    },
    sidebar: {
      width: "230px",
      backgroundColor: currentTheme.sidebar,
      color: currentTheme.text.inverse,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "20px",
      boxShadow: "2px 0 6px rgba(0,0,0,0.1)",
      transition: "all 0.3s ease",
    },
    link: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px 15px",
      borderRadius: "8px",
      color: currentTheme.text.inverse,
      cursor: "pointer",
      fontSize: "0.95rem",
      transition: "all 0.3s ease",
    },
    activeLink: {
      backgroundColor: "rgba(255,255,255,0.2)",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px 15px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "0.95rem",
      transition: "all 0.3s ease",
    },
    main: {
      flex: 1,
      padding: "20px",
      overflowY: "auto",
      transition: "all 0.3s ease",
      maxHeight: "calc(100vh - 60px)",
    },
    themeToggle: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px 15px",
      borderRadius: "8px",
      color: currentTheme.text.inverse,
      cursor: "pointer",
      fontSize: "0.95rem",
      transition: "all 0.3s ease",
      marginBottom: "10px",
    },
    emptyState: {
      backgroundColor: currentTheme.card,
      padding: "40px",
      borderRadius: "12px",
      textAlign: "center",
      border: `1px solid ${currentTheme.border}`,
      marginBottom: "20px",
    },
  };

  const renderActivePage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: "20px"
            }}>
              <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", color: currentTheme.text.primary }}>
                Dashboard Analytics
              </h1>
              <span style={{ color: currentTheme.text.secondary, fontSize: "0.9rem" }}>
                Last updated: {new Date().toLocaleString()}
              </span>
            </div>

            {/* Stats Cards - 3 in a row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              {statCards.map((stat, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: currentTheme.card,
                    borderRadius: "12px",
                    padding: "15px",
                    boxShadow: currentTheme.shadow,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: `1px solid ${currentTheme.border}`,
                    transition: "all 0.3s ease",
                    minHeight: "120px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.9rem", color: currentTheme.text.secondary }}>{stat.title}</div>
                    <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: currentTheme.text.primary }}>
                      {stat.value}
                    </div>
                    {stat.change !== 0 && (
                      <div style={{ fontSize: "0.8rem", color: "#00a86b" }}>
                        <TrendingUp size={14} /> {stat.change}% from last month
                      </div>
                    )}
                  </div>
                  <div style={{ color: stat.color }}>{stat.icon}</div>
                </div>
              ))}
            </div>

            {/* Charts - Only show if we have data */}
            {chartData.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                  height: "320px",
                }}
              >
                <div
                  style={{
                    backgroundColor: currentTheme.card,
                    borderRadius: "12px",
                    padding: "15px",
                    boxShadow: currentTheme.shadow,
                    border: `1px solid ${currentTheme.border}`,
                    transition: "all 0.3s ease",
                  }}
                >
                  <h3 style={{ color: currentTheme.text.primary, marginBottom: "10px", fontSize: "1rem" }}>Monthly Growth</h3>
                  <ResponsiveContainer width="100%" height="85%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={currentTheme.border} />
                      <XAxis dataKey="name" stroke={currentTheme.text.secondary} fontSize={12} />
                      <YAxis stroke={currentTheme.text.secondary} fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: currentTheme.card,
                          border: `1px solid ${currentTheme.border}`,
                          color: currentTheme.text.primary,
                          fontSize: "12px"
                        }} 
                      />
                      <Line type="monotone" dataKey="users" stroke="#004aad" strokeWidth={2} />
                      <Line type="monotone" dataKey="orders" stroke="#00b4d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="products" stroke="#0077b6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div
                  style={{
                    backgroundColor: currentTheme.card,
                    borderRadius: "12px",
                    padding: "15px",
                    boxShadow: currentTheme.shadow,
                    border: `1px solid ${currentTheme.border}`,
                    transition: "all 0.3s ease",
                  }}
                >
                  <h3 style={{ color: currentTheme.text.primary, marginBottom: "10px", fontSize: "1rem" }}>Monthly Overview</h3>
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={currentTheme.border} />
                      <XAxis dataKey="name" stroke={currentTheme.text.secondary} fontSize={12} />
                      <YAxis stroke={currentTheme.text.secondary} fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: currentTheme.card,
                          border: `1px solid ${currentTheme.border}`,
                          color: currentTheme.text.primary,
                          fontSize: "12px"
                        }} 
                      />
                      <Bar dataKey="products" fill="#004aad" />
                      <Bar dataKey="shops" fill="#00b4d8" />
                      <Bar dataKey="orders" fill="#0077b6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div style={styles.emptyState}>
                <h3 style={{ color: currentTheme.text.primary, marginBottom: "10px" }}>
                  Analytics Charts
                </h3>
                <p style={{ color: currentTheme.text.secondary }}>
                  Monthly analytics charts will appear here once implemented in the backend.
                </p>
              </div>
            )}
          </>
        );
      case "users":
        return <Users isDarkMode={isDarkMode} />;
      case "products":
        return <Products isDarkMode={isDarkMode} />;
      case "orders":
        return <Orders isDarkMode={isDarkMode} />;
      case "shops":
        return <Shops isDarkMode={isDarkMode} />;
      case "promotions":
        return <Promotions isDarkMode={isDarkMode} />;
      case "settings":
        return (
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: currentTheme.text.primary, marginBottom: "24px" }}>
              Settings
            </h1>
            <div style={{ 
              backgroundColor: currentTheme.card, 
              padding: "32px", 
              borderRadius: "8px", 
              boxShadow: currentTheme.shadow,
              border: `1px solid ${currentTheme.border}`,
              textAlign: "center" 
            }}>
              <p style={{ color: currentTheme.text.secondary }}>Settings page - Under development</p>
            </div>
          </div>
        );
      default:
        return <div>Page not found</div>;
    }
  };

  if (isLoading && activePage === "dashboard") {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: currentTheme.text.secondary,
          backgroundColor: currentTheme.background,
          transition: "all 0.3s ease",
        }}
      >
        <RefreshCw style={{ marginRight: "8px", animation: "spin 1s linear infinite" }} />
        Loading dashboard data...
      </div>
    );
  }

  if (error && activePage === "dashboard") {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: currentTheme.background,
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ color: "#dc2626", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertCircle />
          <span>Error loading dashboard data</span>
        </div>
        <div style={{ color: currentTheme.text.secondary, marginBottom: "20px", textAlign: "center" }}>
          {error.response?.data?.detail || error.message}
        </div>
        <button
          onClick={() => refetch()}
          style={{
            backgroundColor: "#004aad",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.layout}>
      <header style={styles.navbar}>
        <div style={styles.navbarContent}>
          <h1 style={styles.navbarTitle}>
          </h1>
          <span style={styles.navbarWelcome}>
            Welcome, {user?.name || 'Admin'}
          </span>
        </div>
      </header>

      <div style={styles.mainContainer}>
        <aside style={styles.sidebar}>
          <div>
            <h2 style={{ fontSize: "1.4rem", textAlign: "center", marginBottom: "25px" }}>Techaven</h2>
            {navItems.map((item) => (
              <div
                key={item.id}
                style={activePage === item.id ? styles.activeLink : styles.link}
                onClick={() => setActivePage(item.id)}
                onMouseEnter={(e) => {
                  if (activePage !== item.id) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activePage !== item.id) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {item.icon}
                {item.name}
              </div>
            ))}
          </div>

          <div>
            <div
              style={styles.themeToggle}
              onClick={toggleTheme}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </div>

            <div
              style={{
                ...styles.link,
                backgroundColor: "rgba(255,255,255,0.2)",
              }}
              onClick={handleLogout}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.2)";
              }}
            >
              <LogOut size={18} />
              Logout
            </div>
          </div>
        </aside>

        <main style={styles.main}>{renderActivePage()}</main>
      </div>
    </div>
  );
};

export default Dashboard;