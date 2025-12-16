// app/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update with your actual API URL
const API_URL = 'https://techaven-backend.onrender.com';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      // You might want to trigger a navigation to login screen here
      // navigation.navigate('Login');
    }
    return Promise.reject(error);
  }
);

// API functions
export const apiService = {
  // ==================== AUTH ====================
  async register(userData) {
    try {
      // Convert phone to international format for Malawi
      let phoneNumber = userData.phone || '';
      const cleaned = phoneNumber.replace(/\D/g, '');
      
      let formattedPhone;
      if (cleaned.startsWith('0')) {
        formattedPhone = '+265' + cleaned.substring(1);
      } else if (!cleaned.startsWith('+')) {
        formattedPhone = '+265' + cleaned;
      } else {
        formattedPhone = cleaned;
      }
      
      const formattedData = {
        name: userData.username, // Map username to name
        email: userData.email,
        password: userData.password,
        phone_number: formattedPhone, // Use formatted phone number
        type: 'customer', // Default type for registration
      };
      
      // Send to the correct endpoint
      const response = await api.post('/auth/signup', formattedData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async login(email, password) {
    try {
      // Your backend login uses OAuth2 form data
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      if (response.data.access_token) {
        await AsyncStorage.setItem('userToken', response.data.access_token);
        
        // Store basic user info
        const userData = {
          id: response.data.user_id,
          email: email,
          type: response.data.user_type,
          blockchain_tx_id: response.data.blockchain_tx_id,
        };
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async logout() {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      return { success: true };
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ==================== USERS ====================
  async getUsers(params = {}) {
    try {
      const response = await api.get('/users', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getUserById(userId) {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getUserProfile() {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async updateUserProfile(userId, profileData) {
    try {
      const response = await api.post(`/users/${userId}/profile-update`, profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async deleteUser(userId) {
    try {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async updateUserStatus(userId, status) {
    try {
      const response = await api.patch(`/users/${userId}/status`, null, {
        params: { status }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getUserBlockchainActivity(userId, params = {}) {
    try {
      const response = await api.get(`/users/${userId}/blockchain-activity`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },
  // ==================== CATEGORIES ====================
async getCategories(params = {}) {
  try {
    // Default include product count
    const defaultParams = { include_products_count: true, ...params };
    const response = await api.get('/categories/', { params: defaultParams });
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

async getCategoryById(categoryId, params = {}) {
  try {
    const response = await api.get(`/categories/${categoryId}`, { params });
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

async getProductsByCategory(categoryId, params = {}) {
  try {
    const response = await api.get(`/categories/${categoryId}/products`, { params });
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

  // ==================== SHOPS ====================
  async getShops(params = {}) {
    try {
      const response = await api.get('/shops', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async createShop(shopData) {
    try {
      const response = await api.post('/shops', shopData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getShopById(shopId) {
    try {
      const response = await api.get(`/shops/${shopId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async updateShop(shopId, shopData) {
    try {
      const response = await api.put(`/shops/${shopId}`, shopData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async deleteShop(shopId) {
    try {
      const response = await api.delete(`/shops/${shopId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },
  // ==================== REVIEWS ====================
async getReviews(params = {}) {
  try {
    const response = await api.get('/reviews/', { params });
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

async getReviewById(reviewId) {
  try {
    const response = await api.get(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

async getProductReviews(productId, params = {}) {
  try {
    const response = await api.get(`/reviews/product/${productId}`, { params });
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

async getProductReviewStats(productId) {
  try {
    const response = await api.get(`/reviews/product/${productId}/stats`);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

async getMyReviews(params = {}) {
  try {
    const response = await api.get('/reviews/user/me', { params });
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

async createReview(reviewData) {
  try {
    const response = await api.post('/reviews/', reviewData);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

async updateReview(reviewId, reviewData) {
  try {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

async deleteReview(reviewId) {
  try {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

async markReviewHelpful(reviewId, isHelpful = true) {
  try {
    const response = await api.post(`/reviews/${reviewId}/helpful`, null, {
      params: { is_helpful: isHelpful }
    });
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

async getRecentReviews(params = {}) {
  try {
    const defaultParams = { limit: 10, ...params };
    const response = await api.get('/reviews/recent', { params: defaultParams });
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

async reportReview(reviewId, reportData) {
  try {
    const response = await api.post(`/reviews/${reviewId}/report`, reportData);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},
// ==================== CART ====================
async getCart() {
  try {
    const response = await api.get('/cart/');
    return response.data;
  } catch (error) {
    // If cart is empty or not found, return empty cart
    if (error.response?.status === 404) {
      return { items: [], total_items: 0, total_price: 0 };
    }
    throw this.handleError(error);
  }
},

async addToCart(cartItem) {
  try {
    const response = await api.post('/cart/items', cartItem);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

async updateCartItem(itemId, quantity) {
  try {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

async removeCartItem(itemId) {
  try {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

async clearCart() {
  try {
    const response = await api.delete('/cart/');
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

async getCartCount() {
  try {
    const response = await api.get('/cart/count');
    return response.data;
  } catch (error) {
    // If error, return 0
    return { count: 0 };
  }
},

async getCartTotal() {
  try {
    const response = await api.get('/cart/total');
    return response.data;
  } catch (error) {
    // If error, return 0
    return { total: 0 };
  }
},
// ==================== FAVORITES ====================
async getFavorites(params = {}) {
  try {
    const defaultParams = { limit: 50, ...params };
    const response = await api.get('/favorites/', { params: defaultParams });
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

async getFavoriteById(productId) {
  try {
    const response = await api.get(`/favorites/check/${productId}`);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

async addToFavorites(productId) {
  try {
    const response = await api.post(`/favorites/${productId}`);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

async removeFromFavorites(productId) {
  try {
    const response = await api.delete(`/favorites/${productId}`);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

async getFavoritesCount() {
  try {
    const response = await api.get('/favorites/count');
    return response.data;
  } catch (error) {
    // If error, return 0
    return { count: 0 };
  }
},

async checkFavorite(productId) {
  try {
    const response = await api.get(`/favorites/check/${productId}`);
    // Assuming API returns whether product is favorited
    return response.data;
  } catch (error) {
    // If 404 or error, product is not favorited
    return { is_favorite: false };
  }
},
// ==================== NOTIFICATIONS ====================

// Get all notifications (admin only with filters)
async getNotificationsAdmin(params = {}) {
  try {
    const defaultParams = { limit: 50, offset: 0, ...params };
    const response = await api.get('/notifications/admin/all', { params: defaultParams });
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

// Get unread notification count for current user
async getUnreadNotificationCount() {
  try {
    const response = await api.get('/notifications/unread/count');
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

// Get specific notification by ID
async getNotificationById(notificationId) {
  try {
    const response = await api.get(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

// Create a new notification (admin/merchant only)
async createNotification(notificationData) {
  try {
    const response = await api.post('/notifications/', notificationData);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

// Update notification (if needed - not in docs but usually exists)
async updateNotification(notificationId, notificationData) {
  try {
    const response = await api.put(`/notifications/${notificationId}`, notificationData);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

// Delete a notification
async deleteNotification(notificationId) {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

// Mark a notification as read
async markNotificationAsRead(notificationId) {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

// Mark all notifications as read for current user
async markAllNotificationsAsRead() {
  try {
    const response = await api.put('/notifications/read/all');
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

// Bulk mark notifications as read
async bulkMarkNotificationsAsRead(notificationIds) {
  try {
    const response = await api.post('/notifications/bulk/read', notificationIds);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

// Bulk delete notifications
async bulkDeleteNotifications(notificationIds) {
  try {
    const response = await api.post('/notifications/bulk/delete', notificationIds);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

// Send broadcast notification to all users (admin only)
async broadcastNotification(notificationData) {
  try {
    const response = await api.post('/notifications/admin/broadcast', notificationData);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

// Get notification statistics (admin only)
async getNotificationStats(days = 30) {
  try {
    const response = await api.get('/notifications/admin/stats', {
      params: { days }
    });
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

// Get notification preferences for current user
async getNotificationPreferences() {
  try {
    const response = await api.get('/notifications/preferences');
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

// Update notification preferences for current user
async updateNotificationPreferences(preferencesData) {
  try {
    const response = await api.put('/notifications/preferences', preferencesData);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

// Get user's notifications (personal notifications - if exists)
async getUserNotifications(params = {}) {
  try {
    // Note: This endpoint isn't in your docs, but usually exists
    // You might need to adjust the endpoint based on your actual API
    const defaultParams = { limit: 50, offset: 0, ...params };
    const response = await api.get('/notifications/', { params: defaultParams });
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},
// ==================== RECENTLY VIEWED ====================

// Track a product view
async trackProductView(productId, sessionId = null) {
  try {
    const viewData = {
      product_id: productId,
      session_id: sessionId
    };
    
    const response = await api.post('/recently-viewed/track', viewData);
    return response.data;
  } catch (error) {
    // Don't throw error for tracking failures - just log it
    console.error('Failed to track product view:', error);
    return null;
  }
},

// Get recently viewed products for current user
async getRecentlyViewedProducts(params = {}) {
  try {
    const defaultParams = { 
      limit: 20, 
      days: 30, 
      include_product_details: true,
      ...params 
    };
    const response = await api.get('/recently-viewed/', { params: defaultParams });
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

// Clear recently viewed history
async clearRecentlyViewed() {
  try {
    const response = await api.delete('/recently-viewed/clear');
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

// Get viewing statistics for current user
async getUserViewStats(days = 30) {
  try {
    const response = await api.get('/recently-viewed/stats', {
      params: { days }
    });
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

// Get view statistics for a specific product (shop owner/admin only)
async getProductViewStats(productId, days = 30) {
  try {
    const response = await api.get(`/recently-viewed/product/${productId}/stats`, {
      params: { days }
    });
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

// Get personalized product recommendations
async getPersonalizedRecommendations(limit = 10) {
  try {
    const response = await api.get('/recently-viewed/recommendations', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

// Get similar product recommendations
async getSimilarProductRecommendations(productId, limit = 10) {
  try {
    const response = await api.get(`/recently-viewed/recommendations/similar/${productId}`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

// Get trending products
async getTrendingProducts(params = {}) {
  try {
    const defaultParams = { 
      hours: 24, 
      limit: 10,
      ...params 
    };
    const response = await api.get('/recently-viewed/trending', {
      params: defaultParams
    });
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

// Get session views (anonymous users)
async getSessionViews(sessionId, params = {}) {
  try {
    const defaultParams = { 
      limit: 20, 
      include_product_details: true,
      ...params 
    };
    const response = await api.get(`/recently-viewed/session/${sessionId}`, {
      params: defaultParams
    });
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

// Merge session views to user account
async mergeSessionToUser(sessionId) {
  try {
    const response = await api.post(`/recently-viewed/session/${sessionId}/merge`);
    return response.data;
  } catch (error) {
    throw this.handleError(error);
  }
},

// Helper to generate session ID for anonymous users
generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
},

  // ==================== PRODUCTS ====================
  async getProducts(params = {}) {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async createProduct(productData) {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getProductById(productId) {
    try {
      const response = await api.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async updateProduct(productId, productData) {
    try {
      const response = await api.put(`/products/${productId}`, productData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async deleteProduct(productId) {
    try {
      const response = await api.delete(`/products/${productId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ==================== ORDERS ====================
  async getOrders(params = {}) {
    try {
      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async createOrder(orderData) {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getOrderById(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async updateOrderStatus(orderId, status) {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ==================== PROMOTIONS ====================
  async getPromotions(params = {}) {
    try {
      const response = await api.get('/promotions', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async createPromotion(promotionData) {
    try {
      const response = await api.post('/promotions', promotionData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getPromotionById(promotionId) {
    try {
      const response = await api.get(`/promotions/${promotionId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async updatePromotion(promotionId, promotionData) {
    try {
      const response = await api.put(`/promotions/${promotionId}`, promotionData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async deletePromotion(promotionId) {
    try {
      const response = await api.delete(`/promotions/${promotionId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ==================== BLOCKCHAIN ====================
  async getBlockchainStats() {
    try {
      const response = await api.get('/blockchain/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getRecentTransactions() {
    try {
      const response = await api.get('/blockchain/recent-transactions');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async getUserBlockchainActivityFromAuth() {
    try {
      const response = await api.get('/auth/blockchain/activity');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async manualMineBlock() {
    try {
      const response = await api.post('/auth/blockchain/manual-mine');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ==================== UPLOADS ====================
  async uploadProfilePicture(formData) {
    try {
      const response = await api.post('/upload/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async uploadProductImages(formData) {
    try {
      const response = await api.post('/upload/product-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // ==================== HELPER FUNCTIONS ====================
  handleError(error) {
    console.error('API Error:', error);
    
    let errorMessage = 'Something went wrong';
    let statusCode = 500;
    
    if (error.response) {
      // Server responded with error
      statusCode = error.response.status;
      
      // Handle validation errors (array format)
      if (error.response.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail
            .map(err => `${err.loc?.join('.')}: ${err.msg}`)
            .join('\n');
        } else {
          errorMessage = error.response.data.detail;
        }
      } else {
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Request failed with status ${statusCode}`;
      }
    } else if (error.request) {
      // Request made but no response
      errorMessage = 'No response from server. Please check your connection.';
    } else {
      // Something else happened
      errorMessage = error.message || 'Unknown error occurred';
    }
    
    const formattedError = {
      message: errorMessage,
      status: statusCode,
      originalError: error,
    };
    
    return formattedError;
  },

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return !!token;
    } catch (error) {
      return false;
    }
  },

  // Get auth headers
  async getAuthHeaders() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return {
        Authorization: `Bearer ${token}`,
      };
    } catch (error) {
      return {};
    }
  },
};

export default apiService;