import express from 'express';
import wishlistController from '../controllers/wishlist.controller.js';
import { auth } from '../middleware/auth.js';
import { validate, wishlistValidationRules } from '../middleware/validation.js';

const router = express.Router();

// ========== PROTECTED ROUTES (All require authentication) ==========

// Get user's wishlist
router.get(
    '/',
    auth,
    wishlistController.getWishlist
);

// Add product to wishlist
router.post(
    '/',
    auth,
    validate(wishlistValidationRules.addItem),
    wishlistController.addToWishlist
);

// Remove product from wishlist
router.delete(
    '/:productId',
    auth,
    wishlistController.removeFromWishlist
);

export default router;
