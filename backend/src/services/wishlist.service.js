import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/error.js';

class WishlistService {
    // Get user's wishlist
    async getWishlist(userId) {
        const connection = await pool.getConnection();
        try {
            const [items] = await connection.query(`
                SELECT 
                    wl.id,
                    cp.id as product_id,
                    cp.title as product_name,
                    cp.price,
                    cp.price as original_price,
                    cpi.url as thumbnail,
                    CASE WHEN inv.quantity > 0 THEN true ELSE false END as is_in_stock,
                    COALESCE(AVG(rpr.rating), 0) as rating,
                    wl.created_at as added_at
                FROM wishlist wl
                JOIN catalog_products cp ON wl.product_id = cp.id
                LEFT JOIN catalog_product_images cpi ON cp.id = cpi.product_id AND cpi.sort_order = 0
                LEFT JOIN inventory_inventories inv ON cp.id = inv.product_id
                LEFT JOIN review_product_reviews rpr ON cp.id = rpr.product_id
                WHERE wl.user_id = ?
                GROUP BY wl.id, cp.id
                ORDER BY wl.created_at DESC
            `, [userId]);

            return {
                items: items.map(item => ({
                    id: item.id,
                    product: {
                        id: item.product_id,
                        name: item.product_name,
                        price: item.price,
                        original_price: item.original_price,
                        thumbnail: item.thumbnail,
                        is_in_stock: Boolean(item.is_in_stock),
                        rating: parseFloat(item.rating)
                    },
                    added_at: item.added_at
                })),
                total_items: items.length
            };
        } finally {
            connection.release();
        }
    }

    // Add to wishlist
    async addToWishlist(userId, productId) {
        const connection = await pool.getConnection();
        try {
            // Check if product exists
            const [products] = await connection.query(
                'SELECT id FROM catalog_products WHERE id = ? AND is_active = 1',
                [productId]
            );

            if (products.length === 0) {
                throw new AppError('Product not found', 404);
            }

            // Check if already in wishlist
            const [existing] = await connection.query(
                'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
                [userId, productId]
            );

            if (existing.length > 0) {
                throw new AppError('Product already in wishlist', 409);
            }

            // Add to wishlist
            const id = uuidv4();
            await connection.query(
                'INSERT INTO wishlist (id, user_id, product_id) VALUES (?, ?, ?)',
                [id, userId, productId]
            );

            // Get updated count
            const [count] = await connection.query(
                'SELECT COUNT(*) as total FROM wishlist WHERE user_id = ?',
                [userId]
            );

            return {
                wishlist_item_id: id,
                total_items: count[0].total
            };
        } finally {
            connection.release();
        }
    }

    // Remove from wishlist
    async removeFromWishlist(userId, productId) {
        const connection = await pool.getConnection();
        try {
            // Verify ownership
            const [items] = await connection.query(
                'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
                [userId, productId]
            );

            if (items.length === 0) {
                throw new AppError('Wishlist item not found', 404);
            }

            // Delete from wishlist
            await connection.query(
                'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
                [userId, productId]
            );

            // Get updated count
            const [count] = await connection.query(
                'SELECT COUNT(*) as total FROM wishlist WHERE user_id = ?',
                [userId]
            );

            return {
                total_items: count[0].total
            };
        } finally {
            connection.release();
        }
    }
}

export default new WishlistService();
