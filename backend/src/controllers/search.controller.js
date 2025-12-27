import searchService from '../services/search.service.js';

class SearchController {
    // Search products
    async searchProducts(req, res, next) {
        try {
            const query = req.query.q;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const categoryId = req.query.category_id;
            const minPrice = req.query.min_price;
            const maxPrice = req.query.max_price;
            const sort = req.query.sort || 'relevance';
            
            const result = await searchService.searchProducts({
                query,
                page,
                limit,
                categoryId,
                minPrice,
                maxPrice,
                sort
            });
            
            res.json({
                success: true,
                message: 'Search results',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Get search suggestions
    async getSearchSuggestions(req, res, next) {
        try {
            const query = req.query.q;
            
            const suggestions = await searchService.getSearchSuggestions(query);
            
            res.json({
                success: true,
                message: 'Suggestions retrieved',
                data: { suggestions }
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new SearchController();
