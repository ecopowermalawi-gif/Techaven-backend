import express from 'express';
import shippingController from '../controllers/shipping.controller.js';
import { auth, checkRole } from '../middleware/auth.js';
import { cacheMiddleware, invalidateCache } from '../middleware/cache.js';

const router = express.Router();

// Public routes
router.post(
    '/calculate',
    shippingController.calculateShipping
);

router.post(
    '/validate-address',
    shippingController.validateAddress
);

router.get(
    '/methods',
    cacheMiddleware(600), // Cache for 10 minutes
    shippingController.getShippingMethods
);

// Admin routes
router.post(
    '/methods',
    auth,
    checkRole(['admin']),
    invalidateCache(['/shipping/methods']),
    shippingController.addShippingMethod
);

router.put(
    '/methods/:methodId',
    auth,
    checkRole(['admin']),
    invalidateCache(['/shipping/methods']),
    shippingController.updateShippingMethod
);

router.delete(
    '/methods/:methodId',
    auth,
    checkRole(['admin']),
    invalidateCache(['/shipping/methods']),
    shippingController.deleteShippingMethod
);

router.post(
    '/zones',
    auth,
    checkRole(['admin']),
    shippingController.addShippingZone
);

router.put(
    '/zones/:zoneId',
    auth,
    checkRole(['admin']),
    shippingController.updateShippingZone
);

router.delete(
    '/zones/:zoneId',
    auth,
    checkRole(['admin']),
    shippingController.deleteShippingZone
);

router.get(
    '/zones',
    auth,
    checkRole(['admin']),
    shippingController.getShippingZones
);

export default router;