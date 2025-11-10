import express from 'express';
import promotionController from '../controllers/promotion.controller.js';
import { auth, checkRole } from '../middleware/auth.js';
import { validate, promotionValidationRules, paginationRules } from '../middleware/validation.js';
import { cacheMiddleware, invalidateCache } from '../middleware/cache.js';

const router = express.Router();

// Public routes
router.get(
    '/active',
    cacheMiddleware(300), // Cache for 5 minutes
    promotionController.getActivePromotions
);

router.post(
    '/validate/:code',
    auth,
    promotionController.validatePromotion
);

// Admin routes
router.post(
    '/',
    auth,
    checkRole(['admin']),
    validate(promotionValidationRules.create),
    invalidateCache(['/promotions/active']),
    promotionController.createPromotion
);

router.get(
    '/',
    auth,
    checkRole(['admin']),
    paginationRules,
    promotionController.getPromotions
);

router.get(
    '/:promotionId',
    auth,
    checkRole(['admin']),
    promotionController.getPromotion
);

router.put(
    '/:promotionId',
    auth,
    checkRole(['admin']),
    invalidateCache(['/promotions/active']),
    promotionController.updatePromotion
);

router.delete(
    '/:promotionId',
    auth,
    checkRole(['admin']),
    invalidateCache(['/promotions/active']),
    promotionController.deletePromotion
);

export default router;