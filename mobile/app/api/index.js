// mobile/src/api/index.js
import axiosInstance, { getBaseURL } from './axiosConfig';
import productService from './productService';
import categoryService from './categoryService';
import userService from './userService';
import paymentService from './paymentService';
import shopService from './shopService';

// Export all services
export {
  axiosInstance,
  getBaseURL,
  productService,
  categoryService,
  userService,
  paymentService,
  shopService,
};

// Export as default object for easy imports
const api = {
  products: productService,
  categories: categoryService,
  users: userService,
  payments: paymentService,
  shops: shopService,
  axios: axiosInstance,
  getBaseURL,
};

export default api;