import cartService from '../services/cart.service.js';
import { AppError } from '../middleware/error.js';

class CartController {
    // Get user's cart
    async getCart(req, res, next) {
        try {
            const userId = req.user.id;
            const cart = await cartService.getCart(userId);
            
            res.json({
                success: true,
                message: 'Cart retrieved',
                data: cart
            });
        } catch (error) {
            next(error);
        }
    }

    // Add item to cart
    async addToCart(req, res, next) {
        try {
            const userId = req.user.id;
            const { product_id, quantity } = req.body;
            
            const result = await cartService.addToCart(userId, product_id, quantity);
            
            res.status(201).json({
                success: true,
                message: 'Item added to cart',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Update cart item quantity
    async updateCartItem(req, res, next) {
        try {
            const userId = req.user.id;
            const { itemId } = req.params;
            const { quantity } = req.body;
            
            const result = await cartService.updateCartItem(userId, itemId, quantity);
            
            res.json({
                success: true,
                message: 'Cart item updated',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Remove item from cart
    async removeFromCart(req, res, next) {
        try {
            const userId = req.user.id;
            const { itemId } = req.params;
            
            const result = await cartService.removeFromCart(userId, itemId);
            
            res.json({
                success: true,
                message: 'Item removed from cart',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Clear entire cart
    async clearCart(req, res, next) {
        try {
            const userId = req.user.id;
            
            await cartService.clearCart(userId);
            
            res.json({
                success: true,
                message: 'Cart cleared',
                data: null
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new CartController();
