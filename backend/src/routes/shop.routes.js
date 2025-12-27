import express from 'express';
import shopController from '../controllers/shop.controller.js';
import { auth, checkRole } from '../middleware/auth.js';
import { validate,  paginationRules } from '../middleware/validation.js';
import { cacheMiddleware, invalidateCache } from '../middleware/cache.js';

const router = express.Router();

// ========== PUBLIC ROUTES ==========

// Get all shops
router.get(
    '/',
    paginationRules,
    cacheMiddleware(300),
    shopController.getShops
);

// Get shop details
router.get(
    '/:shopId',
    cacheMiddleware(300),
    shopController.getShopDetails
);

// Get shop products
router.get(
    '/:shopId/products',
    paginationRules,
    cacheMiddleware(300),
    shopController.getShopProducts
);

// ========== PROTECTED ROUTES ==========

// Create shop (seller only)
router.post(
    '/',
    auth,
    checkRole(['seller', 'admin']),
   
    invalidateCache(['/shops']),
    shopController.createShop
);

// Update shop (seller only)
router.put(
    '/:shopId',
    auth,
    checkRole(['seller', 'admin']),
    
    invalidateCache(['/shops']),
    shopController.updateShop
);

// Delete shop (seller only)
router.delete(
    '/:shopId',
    auth,
    checkRole(['seller', 'admin']),
    invalidateCache(['/shops']),
    shopController.deleteShop
);

export default router;