// mobile/src/api/axiosConfig.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Get the correct base URL for development/production
export const getBaseURL = () => {
  // Check if we're in development mode
  const isDev = __DEV__;
  
  if (isDev) {
    // Development URLs
    if (Device.isDevice) {
      // Physical device - use your computer's IP
      // IMPORTANT: Change this to your actual computer IP
      return 'http://192.168.1.100:666'; // ← CHANGE THIS
    } else {
      // Simulator/Emulator
      return 'http://localhost:666';
    }
  } else {
    // Production URL
    return 'https://api.techhaven.com'; // ← Update for production
  }
};

// Alternative: Use environment variables with Expo Constants
export const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || getBaseURL();

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log request in development
      if (__DEV__) {
        console.log(`🚀 ${config.method?.toUpperCase() || 'GET'} ${config.url}`);
      }
    } catch (error) {
      console.warn('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`✅ ${response.config.url}: Success`);
    }
    return response.data;
  },
  async (error) => {
    // Enhanced error logging for development
    if (__DEV__) {
      console.group(`❌ API Error: ${error.config?.url}`);
      console.log('Error:', error.message);
      console.log('Status:', error.response?.status);
      console.log('Data:', error.response?.data);
      console.groupEnd();
    }

    // Network error handling
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        isNetworkError: true,
      });
    }

    // Handle specific HTTP status codes
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 401:
        // Unauthorized - token expired or invalid
        // You might want to redirect to login here
        return Promise.reject({
          message: 'Session expired. Please login again.',
          status: 401,
          shouldLogout: true,
        });
        
      case 403:
        return Promise.reject({
          message: 'You do not have permission to perform this action.',
          status: 403,
        });
        
      case 404:
        return Promise.reject({
          message: 'Resource not found.',
          status: 404,
        });
        
      case 422:
        // Validation errors
        return Promise.reject({
          message: data.message || 'Validation failed',
          errors: data.errors,
          status: 422,
        });
        
      case 500:
        return Promise.reject({
          message: 'Server error. Please try again later.',
          status: 500,
        });
        
      default:
        return Promise.reject({
          message: data?.message || 'Something went wrong',
          status: status,
          data: data,
        });
    }
  }
);

export default axiosInstance;