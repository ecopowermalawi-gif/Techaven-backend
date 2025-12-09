// mobile/src/api/shopService.js
import axiosInstance from './axiosConfig';

const shopService = {
  // Get all shops
  getAllShops: () => 
    axiosInstance.get('/api/shops'),
  
  // Get shop by ID
  getShopById: (id) => 
    axiosInstance.get(`/api/shops/${id}`),
  
  // Create shop
  createShop: (shopData) => 
    axiosInstance.post('/api/shops', shopData),
  
  // Update shop
  updateShop: (id, shopData) => 
    axiosInstance.put(`/api/shops/${id}`, shopData),
  
  // Delete shop
  deleteShop: (id) => 
    axiosInstance.delete(`/api/shops/${id}`),
  
  // Get shop products
  getShopProducts: (id) => 
    axiosInstance.get(`/api/shops/${id}/products`),
  
  // Get shop by owner
  getShopByOwner: (ownerId) => 
    axiosInstance.get(`/api/shops/owner/${ownerId}`),
};

export default shopService;