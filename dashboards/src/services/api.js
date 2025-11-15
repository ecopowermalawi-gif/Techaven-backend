// services/api.js
import axios from 'axios';

const API_BASE_URL = 'https://techaven-backend.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// 🔐 Add Auth Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚫 Handle Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ------------------------- AUTH -------------------------
// Admin Authentication API
export const authAPI = {
  // 🔐 Login using form-urlencoded
  login: async ({ email, password }) => {
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', email);
    formData.append('password', password);
    formData.append('scope', '');
    formData.append('client_id', '');
    formData.append('client_secret', '');

    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    // Save token after login
    if (response.data?.access_token) {
      localStorage.setItem('admin_token', response.data.access_token);
    }

    return response.data;
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    return Promise.resolve();
  },

  getProfile: () => api.get('/auth/me'),
};

// ------------------------- USERS -------------------------
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  getUser: (id) => api.get(`/users/${id}`),
  
  // ✅ Get all users with search and filters
  getUsers: async (params = {}) => {
    const { search, role, status, skip = 0, limit = 100 } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('skip', skip);
    queryParams.append('limit', limit);
    
    if (search) queryParams.append('search', search);
    if (role) queryParams.append('type', role);
    
    const response = await api.get(`/users?${queryParams}`);
    return response.data;
  },

  // ✅ Delete user
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  // ✅ Update user status
  updateUserStatus: async (userId, status) => {
    const response = await api.patch(`/users/${userId}/status`, { status });
    return response.data;
  }
};

// ------------------------- SHOPS -------------------------
export const shopsAPI = {
  // ✅ Create shop (regular user)
  createShop: (data) => api.post('/shops/', data),
  
  // ✅ Admin create shop
  createShopAdmin: async (data, userId = null, verified = true) => {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    params.append('verified', verified.toString());
    
    const response = await api.post(`/shops/admin/create?${params}`, data);
    return response.data;
  },
  
  // ✅ Get all shops with pagination and filters
  getShops: async (params = {}) => {
    const { 
      search, 
      verified, 
      status, 
      skip = 0, 
      limit = 100,
      sort_by = 'created_at',
      order = 'desc'
    } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('skip', skip);
    queryParams.append('limit', limit);
    queryParams.append('sort_by', sort_by);
    queryParams.append('order', order);
    
    if (search) queryParams.append('search', search);
    if (verified !== undefined) queryParams.append('verified', verified.toString());
    if (status) queryParams.append('status', status);
    
    const response = await api.get(`/shops?${queryParams}`);
    return response.data;
  },
  
  // ✅ Get single shop
  getShop: (id) => api.get(`/shops/${id}`),
  
  // ✅ Update shop (regular user)
  updateShop: (id, data) => api.put(`/shops/${id}`, data),
  
  // ✅ Admin update shop
  updateShopAdmin: async (id, data, verified = null) => {
    const params = new URLSearchParams();
    if (verified !== null) params.append('verified', verified.toString());
    
    const response = await api.put(`/shops/admin/${id}?${params}`, data);
    return response.data;
  },
  
  // ✅ Delete shop
  deleteShop: (id) => api.delete(`/shops/${id}`),
  
  // ✅ Admin delete shop
  deleteShopAdmin: (id) => api.delete(`/shops/admin/${id}`),
  
  // ✅ Get pending shops for admin approval
  getPendingShops: async (params = {}) => {
    const { skip = 0, limit = 100 } = params;
    const queryParams = new URLSearchParams();
    queryParams.append('skip', skip);
    queryParams.append('limit', limit);
    
    const response = await api.get(`/admin/shops/pending?${queryParams}`);
    return response.data;
  },
  
  // ✅ Verify/approve shop
  verifyShop: (id) => api.post(`/admin/shops/${id}/verify`),
  
  // ✅ Reject shop
  rejectShop: (id, reason = '') => api.post(`/admin/shops/${id}/reject`, { reason }),
  
  // ✅ Get shop statistics
  getShopStats: (id) => api.get(`/shops/${id}/stats`),
  
  // ✅ Get shop products
  getShopProducts: async (shopId, params = {}) => {
    const { skip = 0, limit = 100, category, status } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('skip', skip);
    queryParams.append('limit', limit);
    
    if (category) queryParams.append('category', category);
    if (status) queryParams.append('status', status);
    
    const response = await api.get(`/shops/${shopId}/products?${queryParams}`);
    return response.data;
  }
};

// ------------------------- PRODUCTS -------------------------
export const productsAPI = {
  createProduct: (data) => api.post('/products/', data),
  
  // ✅ Get products with filters and pagination
  getProducts: async (params = {}) => {
    const { 
      search, 
      category, 
      min_price, 
      max_price, 
      status,
      skip = 0, 
      limit = 100,
      sort_by = 'created_at',
      order = 'desc'
    } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('skip', skip);
    queryParams.append('limit', limit);
    queryParams.append('sort_by', sort_by);
    queryParams.append('order', order);
    
    if (search) queryParams.append('search', search);
    if (category) queryParams.append('category', category);
    if (min_price) queryParams.append('min_price', min_price);
    if (max_price) queryParams.append('max_price', max_price);
    if (status) queryParams.append('status', status);
    
    const response = await api.get(`/products?${queryParams}`);
    return response.data;
  },
  
  getProduct: (id) => api.get(`/products/${id}`),
  
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  
  deleteProduct: (id) => api.delete(`/products/${id}`),
  
  uploadImages: (id, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return api.post(`/products/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ------------------------- ORDERS -------------------------
export const ordersAPI = {
  // ✅ Get orders with filters and pagination
  getOrders: async (params = {}) => {
    const { 
      status, 
      shop_id,
      user_id,
      skip = 0, 
      limit = 100,
      sort_by = 'created_at',
      order = 'desc'
    } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('skip', skip);
    queryParams.append('limit', limit);
    queryParams.append('sort_by', sort_by);
    queryParams.append('order', order);
    
    if (status) queryParams.append('status', status);
    if (shop_id) queryParams.append('shop_id', shop_id);
    if (user_id) queryParams.append('user_id', user_id);
    
    const response = await api.get(`/orders?${queryParams}`);
    return response.data;
  },
  
  createOrder: (data) => api.post('/orders/', data),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrder: (id, data) => api.put(`/orders/${id}`, data),
  
  // ✅ Update order status
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

// ------------------------- PROMOTIONS -------------------------
export const promotionsAPI = {
  getPromotions: async (params = {}) => {
    const { skip = 0, limit = 100, active } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('skip', skip);
    queryParams.append('limit', limit);
    
    if (active !== undefined) queryParams.append('active', active.toString());
    
    const response = await api.get(`/promotions?${queryParams}`);
    return response.data;
  },
  
  createPromotion: (data) => api.post('/promotions/', data),
  getPromotion: (id) => api.get(`/promotions/${id}`),
  updatePromotion: (id, data) => api.put(`/promotions/${id}`, data),
  deletePromotion: (id) => api.delete(`/promotions/${id}`),
  
  // ✅ Activate/deactivate promotion
  togglePromotion: (id, active) => api.patch(`/promotions/${id}/active`, { active }),
};

// ------------------------- ADMIN METRICS -------------------------
export const adminAPI = {
  getMetrics: async () => {
    try {
      const response = await api.get('/admin/metrics');
      console.log('📊 Metrics API Response:', response.data);
      
      // Handle different response structures
      if (typeof response.data === 'string') {
        console.warn('⚠️ Metrics endpoint returned string instead of JSON');
        try {
          const parsedData = JSON.parse(response.data);
          return parsedData;
        } catch (parseError) {
          console.error('❌ Failed to parse metrics response as JSON:', parseError);
          return {
            data: {
              totalUsers: 0,
              totalProducts: 0,
              totalOrders: 0,
              totalShops: 0,
              totalRevenue: 0,
              pendingShops: 0,
              userGrowth: 0,
              productGrowth: 0,
              orderGrowth: 0,
              shopGrowth: 0,
              revenueGrowth: 0,
              monthlyData: [],
              categoryDistribution: []
            }
          };
        }
      }
      
      if (response.data && typeof response.data === 'object') {
        if (response.data.totalUsers !== undefined) {
          return { data: response.data };
        }
        if (response.data.data) {
          return response.data;
        }
      }
      
      console.warn('⚠️ Unexpected metrics response structure:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Metrics API Error:', error);
      throw error;
    }
  },
  
  // ✅ Get admin dashboard stats
  getDashboardStats: () => api.get('/admin/dashboard'),
  
  // ✅ Get recent activities
  getRecentActivities: async (params = {}) => {
    const { skip = 0, limit = 50 } = params;
    const queryParams = new URLSearchParams();
    queryParams.append('skip', skip);
    queryParams.append('limit', limit);
    
    const response = await api.get(`/admin/activities?${queryParams}`);
    return response.data;
  }
};

export default api;