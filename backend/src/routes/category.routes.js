import express from 'express';
import categoryController from '../controllers/category.controller.js';
import { auth, checkRole } from '../middleware/auth.js';
import { cacheMiddleware, invalidateCache } from '../middleware/cache.js';

const router = express.Router();

// Public routes
router.get(
    '/',
    cacheMiddleware(300), // Cache for 5 minutes
    categoryController.getAllCategories
);

router.get(
    '/:categoryId',
    cacheMiddleware(300),
    categoryController.getCategoryById
);

// Admin routes
router.post(
    '/',
    auth,
    checkRole(['admin']),
    invalidateCache(['/categories']),
    categoryController.createCategory
);

router.put(
    '/:categoryId',
    auth,
    checkRole(['admin']),
    invalidateCache(['/categories']),
    categoryController.updateCategory
);

router.delete(
    '/:categoryId',
    auth,
    checkRole(['admin']),
    invalidateCache(['/categories']),
    categoryController.deleteCategory
);

export default router;