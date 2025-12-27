import express from 'express';
import productController from '../controllers/product.controller.js';
import { auth, checkRole } from '../middleware/auth.js';
import { validate, productValidationRules, paginationRules } from '../middleware/validation.js';
import { uploadSingleFile } from '../middleware/upload.js';
import { cacheMiddleware, invalidateCache } from '../middleware/cache.js';

const router = express.Router();

// ========== PUBLIC ROUTES ==========

// Get all products with pagination, filtering, and sorting
router.get(
    '/',
    paginationRules,
    cacheMiddleware(300),
    productController.getAllProducts
);

// Get featured products
router.get(
    '/featured',
    paginationRules,
    cacheMiddleware(300),
    productController.getFeaturedProducts
);

// Get hot sales
router.get(
    '/hot-sales',
    paginationRules,
    cacheMiddleware(300),
    productController.getHotSales
);

// Get special offers
router.get(
    '/special-offers',
    paginationRules,
    cacheMiddleware(300),
    productController.getSpecialOffers
);

// Get new arrivals
router.get(
    '/new-arrivals',
    paginationRules,
    cacheMiddleware(300),
    productController.getNewArrivals
);

// Search products
router.get(
    '/search',
    paginationRules,
    productController.searchProducts
);

// Get single product by ID
router.get(
    '/:productId',
    cacheMiddleware(300),
    productController.getProductById
);

// Get product reviews
router.get(
    '/:productId/reviews',
    paginationRules,
    productController.getProductReviews
);

// ========== PROTECTED ROUTES ==========

// Add product review (authenticated users)
router.post(
    '/:productId/reviews',
    auth,
    validate(productValidationRules.createReview),
    productController.addProductReview
);

// Create product (seller/admin only)
router.post(
    '/',
    auth,
    checkRole(['seller', 'admin']),
    uploadSingleFile('image'),
    validate(productValidationRules.create),
    invalidateCache(['/products']),
    productController.createProduct
);

// Update product (seller/admin only)
router.put(
    '/:productId',
    auth,
    checkRole(['seller', 'admin']),
    uploadSingleFile('image'),
    validate(productValidationRules.update),
    invalidateCache(['/products']),
    productController.updateProduct
);

// Delete product (seller/admin only)
router.delete(
    '/:productId',
    auth,
    checkRole(['seller', 'admin']),
    invalidateCache(['/products']),
    productController.deleteProduct
);

// Update product stock (seller only)
router.put(
    '/:productId/stock',
    auth,
    checkRole(['seller']),
    validate(productValidationRules.updateStock),
    invalidateCache(['/products']),
    productController.updateStock
);

export default router;