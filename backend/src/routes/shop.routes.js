import express from 'express';
import shopController from '../controllers/shop.controller.js';
import { auth, checkRole } from '../middleware/auth.js';
import { validateShop } from '../middleware/validation.js';
import { cacheMiddleware, invalidateCache } from '../middleware/cache.js';

const router = express.Router();

// Public shop routes
router.get(
    '/shops',
   cacheMiddleware(300), // Cache for 5 minutes
    shopController.getShops
);

router.get(
    '/:shopId',
    cacheMiddleware(300),
    shopController.getShopDetails
);

router.get(
    '/:shopId/products',
    cacheMiddleware(300),
    shopController.getShopProducts
);

// Seller routes (protected)
router.post(
    '/add',
    //auth,
    //validateShop,
    shopController.createShop
);

router.put(
    '/:shopId',
    auth,
    validateShop,
    shopController.updateShop
);

router.delete(
    '/:shopId',
    auth,
    shopController.deleteShop
);

router.get(
    '/:shopId/orders',
    auth,
    shopController.getShopOrders
);

router.put(
    '/:shopId/orders/:orderId/status',
    auth,
    shopController.updateOrderStatus
);

// Admin routes
router.get(
    '/admin/pending',
    auth,
    checkRole(['admin']),
    shopController.getPendingShops
);

router.put(
    '/admin/:shopId/approve',
    auth,
    checkRole(['admin']),
    shopController.approveShop
);

router.put(
    '/admin/:shopId/reject',
    auth,
    checkRole(['admin']),
    shopController.rejectShop
);

router.put(
    '/admin/:shopId/suspend',
    auth,
    checkRole(['admin']),
    shopController.suspendShop
);

export default router;