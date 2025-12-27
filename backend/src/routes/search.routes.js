import express from 'express';
import searchController from '../controllers/search.controller.js';
import { validate, searchValidationRules, paginationRules } from '../middleware/validation.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

// ========== PUBLIC ROUTES ==========

// Search products
router.get(
    '/',
    validate(searchValidationRules.search),
    paginationRules,
    cacheMiddleware(300),
    searchController.searchProducts
);

// Search suggestions/autocomplete
router.get(
    '/suggestions',
    validate(searchValidationRules.suggestions),
    cacheMiddleware(300),
    searchController.getSearchSuggestions
);

export default router;
