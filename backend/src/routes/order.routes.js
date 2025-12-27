import express from 'express';
import orderController from '../controllers/order.controller.js';
import { auth, checkRole } from '../middleware/auth.js';
import { validate, orderValidationRules, paginationRules } from '../middleware/validation.js';

const router = express.Router();

// ========== PROTECTED ROUTES (All require authentication) ==========

// Create order
router.post(
    '/',
    auth,
    validate(orderValidationRules.create),
    orderController.createOrder
);

// Get user's orders
router.get(
    '/',
    auth,
    paginationRules,
    orderController.getUserOrders
);

// Get single order
router.get(
    '/:orderId',
    auth,
    orderController.getOrderByID
);

// Cancel order
router.post(
    '/:orderId/cancel',
    auth,
    validate(orderValidationRules.cancel),
    orderController.cancelOrder
);

// ========== ADMIN ROUTES ==========

// Get all orders (admin only)
router.get(
    '/admin/all',
    auth,
    checkRole(['admin']),
    paginationRules,
    orderController.getAllOrders
);

// Update order status (admin only)
router.put(
    '/admin/:orderId/status',
    auth,
    checkRole(['admin']),
    validate(orderValidationRules.updateStatus),
    orderController.updateOrderStatus
);

export default router;