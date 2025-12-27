import express from 'express';
import cartController from '../controllers/cart.controller.js';
import { auth } from '../middleware/auth.js';
import { validate, cartValidationRules, paginationRules } from '../middleware/validation.js';

const router = express.Router();

// ========== PROTECTED ROUTES (All require authentication) ==========

// Get user's cart
router.get(
    '/',
    auth,
    cartController.getCart
);

// Add item to cart
router.post(
    '/items',
    auth,
    validate(cartValidationRules.addItem),
    cartController.addToCart
);

// Update cart item quantity
router.put(
    '/items/:itemId',
    auth,
    validate(cartValidationRules.updateItem),
    cartController.updateCartItem
);

// Remove item from cart
router.delete(
    '/items/:itemId',
    auth,
    cartController.removeFromCart
);

// Clear entire cart
router.delete(
    '/',
    auth,
    cartController.clearCart
);

export default router;
