import express from 'express';
import categoryController from '../controllers/category.controller.js';
import { auth, checkRole } from '../middleware/auth.js';
import { validate, categoryValidationRules, paginationRules } from '../middleware/validation.js';
import { cacheMiddleware, invalidateCache } from '../middleware/cache.js';

const router = express.Router();

// ========== PUBLIC ROUTES ==========

// Get all categories
router.get(
    '/',
    cacheMiddleware(300),
    categoryController.getAllCategories
);

// Get category products
router.get(
    '/:categoryId/products',
    paginationRules,
    cacheMiddleware(300),
    categoryController.getCategoryProducts
);

// ========== ADMIN ROUTES ==========

// Create category (admin only)
router.post(
    '/',
    auth,
    checkRole(['admin']),
    validate(categoryValidationRules.create),
    invalidateCache(['/categories']),
    categoryController.createCategory
);

// Update category (admin only)
router.put(
    '/:categoryId',
    auth,
    checkRole(['admin']),
    validate(categoryValidationRules.update),
    invalidateCache(['/categories']),
    categoryController.updateCategory
);

// Delete category (admin only)
router.delete(
    '/:categoryId',
    auth,
    checkRole(['admin']),
    invalidateCache(['/categories']),
    categoryController.deleteCategory
);

export default router;