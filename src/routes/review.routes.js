import express from 'express';
import reviewController from '../controllers/review.controller.js';
import { auth } from '../middleware/auth.js';
import { validate, reviewValidationRules, paginationRules } from '../middleware/validation.js';
import { cacheMiddleware, invalidateCache } from '../middleware/cache.js';

const router = express.Router();

// Public routes
router.get(
    '/product/:productId',
    paginationRules,
    cacheMiddleware(300), // Cache for 5 minutes
    reviewController.getProductReviews
);

router.get(
    '/product/:productId/summary',
    cacheMiddleware(300),
    reviewController.getReviewSummary
);

// Customer routes
router.post(
    '/',
    auth,
    validate(reviewValidationRules.create),
    invalidateCache(['/reviews/product']),
    reviewController.createReview
);

router.get(
    '/my-reviews',
    auth,
    paginationRules,
    reviewController.getUserReviews
);

router.put(
    '/:reviewId',
    auth,
    validate(reviewValidationRules.update),
    invalidateCache(['/reviews/product']),
    reviewController.updateReview
);

router.delete(
    '/:reviewId',
    auth,
    invalidateCache(['/reviews/product']),
    reviewController.deleteReview
);

export default router;