// mobile/src/api/productService.js
import axiosInstance from './axiosConfig';

const productService = {
  // Get all products
  getAllProducts: (params = {}) => 
    axiosInstance.get('/api/products', { params }),
  
  // Get product by ID
  getProductById: (id) => 
    axiosInstance.get(`/api/products/${id}`),
  
  // Create new product
  createProduct: (productData) => 
    axiosInstance.post('/api/products', productData),
  
  // Update product
  updateProduct: (id, productData) => 
    axiosInstance.put(`/api/products/${id}`, productData),
  
  // Delete product
  deleteProduct: (id) => 
    axiosInstance.delete(`/api/products/${id}`),
  
  // Search products
  searchProducts: (query, filters = {}) => 
    axiosInstance.get('/api/products/search', { 
      params: { q: query, ...filters } 
    }),
  
  // Upload product image
  uploadProductImage: (productId, imageUri) => {
    const formData = new FormData();
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('image', {
      uri: imageUri,
      type,
      name: filename || 'product-image.jpg'
    });
    
    return axiosInstance.post(
      `/api/products/${productId}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },
  
  // Get products by category
  getProductsByCategory: (categoryId) => 
    axiosInstance.get(`/api/products/category/${categoryId}`),
};

export default productService;