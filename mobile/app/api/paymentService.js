// mobile/src/api/paymentService.js
import axiosInstance from './axiosConfig';

const paymentService = {
  // Create payment intent
  createPaymentIntent: (paymentData) => 
    axiosInstance.post('/api/payments/create-intent', paymentData),
  
  // Get payment history
  getPaymentHistory: () => 
    axiosInstance.get('/api/payments/history'),
  
  // Get payment by ID
  getPaymentById: (id) => 
    axiosInstance.get(`/api/payments/${id}`),
  
  // Process payment
  processPayment: (paymentData) => 
    axiosInstance.post('/api/payments/process', paymentData),
  
  // Refund payment
  refundPayment: (paymentId) => 
    axiosInstance.post(`/api/payments/${paymentId}/refund`),
};

export default paymentService;