import wishlistService from '../services/wishlist.service.js';
import { AppError } from '../middleware/error.js';

class WishlistController {
    // Get user's wishlist
    async getWishlist(req, res, next) {
        try {
            const userId = req.user.id;
            const wishlist = await wishlistService.getWishlist(userId);
            
            res.json({
                success: true,
                message: 'Wishlist retrieved',
                data: wishlist
            });
        } catch (error) {
            next(error);
        }
    }

    // Add product to wishlist
    async addToWishlist(req, res, next) {
        try {
            const userId = req.user.id;
            const { product_id } = req.body;
            
            const result = await wishlistService.addToWishlist(userId, product_id);
            
            res.status(201).json({
                success: true,
                message: 'Added to wishlist',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Remove product from wishlist
    async removeFromWishlist(req, res, next) {
        try {
            const userId = req.user.id;
            const { productId } = req.params;
            
            const result = await wishlistService.removeFromWishlist(userId, productId);
            
            res.json({
                success: true,
                message: 'Removed from wishlist',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new WishlistController();
