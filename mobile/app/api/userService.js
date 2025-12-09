// mobile/app/api/userService.js
import axiosInstance from './axiosConfig';

const userService = {
  // Register user - matches your backend
  register: (userData) => 
    axiosInstance.post('/api/users/register', {
      email: userData.email,
      password: userData.password,
      username: userData.username,
      role: userData.role || 'customer' // Default role
    }),
  
  // Login user - matches your backend
  login: (email, password) => 
    axiosInstance.post('/api/users/login', { email, password }),
  
  // Get user profile - matches your backend
  getProfile: () => 
    axiosInstance.get('/api/users/profile'),
  
  // Update user profile - matches your backend
  updateProfile: (userData) => 
    axiosInstance.put('/api/users/profile', {
      full_name: userData.full_name,
      phone: userData.phone,
      dob: userData.dob,
      locale: userData.locale
    }),
  
  // Change password - matches your backend
  changePassword: (currentPassword, newPassword) => 
    axiosInstance.post('/api/users/change-password', {
      currentPassword,
      newPassword
    }),
  
  // Logout (client-side only)
  logout: () => {
    // This clears the token locally
    // You might want to also call backend logout endpoint if you have one
    return Promise.resolve();
  },
  
  // Get user by ID (admin feature)
  getUserById: (id) => 
    axiosInstance.get(`/api/users/${id}`),
  
  // Get all users (admin feature)
  getAllUsers: () => 
    axiosInstance.get('/api/users'),
  
  // Add role to user (admin feature)
  addUserRole: (userId, roleName) => 
    axiosInstance.post(`/api/users/${userId}/roles`, { roleName }),
};

export default userService;