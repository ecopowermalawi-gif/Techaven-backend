// mobile/src/api/categoryService.js
import axiosInstance from './axiosConfig';

const categoryService = {
  // Get all categories
  getAllCategories: () => 
    axiosInstance.get('/api/categories'),
  
  // Get category by ID
  getCategoryById: (id) => 
    axiosInstance.get(`/api/categories/${id}`),
  
  // Create category
  createCategory: (categoryData) => 
    axiosInstance.post('/api/categories', categoryData),
  
  // Update category
  updateCategory: (id, categoryData) => 
    axiosInstance.put(`/api/categories/${id}`, categoryData),
  
  // Delete category
  deleteCategory: (id) => 
    axiosInstance.delete(`/api/categories/${id}`),
  
  // Get category products
  getCategoryProducts: (id) => 
    axiosInstance.get(`/api/categories/${id}/products`),
};

export default categoryService;