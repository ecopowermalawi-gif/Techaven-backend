import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/error.js';

class CartService {
    // Get user's cart
    async getCart(userId) {
        const connection = await pool.getConnection();
        try {
            // Get or create cart for user
            let [carts] = await connection.query(
                'SELECT id FROM carts WHERE user_id = ? AND status = "active"',
                [userId]
            );

            let cartId;
            if (carts.length === 0) {
                cartId = uuidv4();
                await connection.query(
                    'INSERT INTO carts (id, user_id, status) VALUES (?, ?, "active")',
                    [cartId, userId]
                );
            } else {
                cartId = carts[0].id;
            }

            // Get cart items with product details
            const [items] = await connection.query(`
                SELECT 
                    ci.id,
                    ci.product_id,
                    cp.title as product_name,
                    cpi.url as product_image,
                    ci.unit_price,
                    ci.quantity,
                    (ci.unit_price * ci.quantity) as subtotal,
                    CASE WHEN inv.quantity > 0 THEN true ELSE false END as is_available
                FROM cart_items ci
                JOIN catalog_products cp ON ci.product_id = cp.id
                LEFT JOIN catalog_product_images cpi ON cp.id = cpi.product_id AND cpi.sort_order = 0
                LEFT JOIN inventory_inventories inv ON cp.id = inv.product_id
                WHERE ci.cart_id = ?
                ORDER BY ci.created_at DESC
            `, [cartId]);

            // Calculate cart summary
            let subtotal = 0;
            let itemCount = 0;
            items.forEach(item => {
                subtotal += item.subtotal || 0;
                itemCount += item.quantity || 0;
            });

            const shipping = 5000; // Default shipping cost
            const discount = 0; // Can be extended for coupon logic
            const tax = 0; // Can be calculated based on rules
            const total = subtotal + shipping - discount + tax;

            return {
                id: cartId,
                items: items.map(item => ({
                    id: item.id,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    product_image: item.product_image,
                    unit_price: item.unit_price,
                    quantity: item.quantity,
                    subtotal: item.subtotal,
                    is_available: Boolean(item.is_available)
                })),
                summary: {
                    subtotal,
                    discount,
                    shipping,
                    tax,
                    total,
                    currency: 'MWK',
                    item_count: itemCount
                }
            };
        } finally {
            connection.release();
        }
    }

    // Add item to cart
    async addToCart(userId, productId, quantity) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Get or create cart
            let [carts] = await connection.query(
                'SELECT id FROM carts WHERE user_id = ? AND status = "active"',
                [userId]
            );

            let cartId;
            if (carts.length === 0) {
                cartId = uuidv4();
                await connection.query(
                    'INSERT INTO carts (id, user_id, status) VALUES (?, ?, "active")',
                    [cartId, userId]
                );
            } else {
                cartId = carts[0].id;
            }

            // Check if product exists and get price
            const [products] = await connection.query(
                'SELECT id, price FROM catalog_products WHERE id = ? AND is_active = 1',
                [productId]
            );

            if (products.length === 0) {
                throw new AppError('Product not found', 404);
            }

            const unitPrice = products[0].price;

            // Check if item already in cart
            const [existingItems] = await connection.query(
                'SELECT id FROM cart_items WHERE cart_id = ? AND product_id = ?',
                [cartId, productId]
            );

            if (existingItems.length > 0) {
                throw new AppError('Item already in cart. Use update instead', 409);
            }

            // Check stock
            const [inventory] = await connection.query(
                'SELECT quantity FROM inventory_inventories WHERE product_id = ?',
                [productId]
            );

            if (!inventory || inventory[0].quantity < quantity) {
                throw new AppError('Product out of stock', 400);
            }

            // Add item to cart
            const itemId = uuidv4();
            await connection.query(
                'INSERT INTO cart_items (id, cart_id, product_id, unit_price, quantity) VALUES (?, ?, ?, ?, ?)',
                [itemId, cartId, productId, unitPrice, quantity]
            );

            await connection.commit();

            // Get updated cart item count
            const [cartItems] = await connection.query(
                'SELECT COUNT(*) as count FROM cart_items WHERE cart_id = ?',
                [cartId]
            );

            return {
                item_id: itemId,
                cart_item_count: cartItems[0].count
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Update cart item quantity
    async updateCartItem(userId, itemId, quantity) {
        const connection = await pool.getConnection();
        try {
            // Verify item belongs to user's cart
            const [items] = await connection.query(`
                SELECT ci.id, ci.product_id, ci.unit_price, c.user_id
                FROM cart_items ci
                JOIN carts c ON ci.cart_id = c.id
                WHERE ci.id = ? AND c.user_id = ?
            `, [itemId, userId]);

            if (items.length === 0) {
                throw new AppError('Cart item not found', 404);
            }

            const item = items[0];

            // Check stock
            const [inventory] = await connection.query(
                'SELECT quantity FROM inventory_inventories WHERE product_id = ?',
                [item.product_id]
            );

            if (!inventory || inventory[0].quantity < quantity) {
                throw new AppError('Insufficient stock', 400);
            }

            // Update quantity
            await connection.query(
                'UPDATE cart_items SET quantity = ? WHERE id = ?',
                [quantity, itemId]
            );

            const subtotal = item.unit_price * quantity;

            return {
                item_id: itemId,
                quantity,
                subtotal
            };
        } finally {
            connection.release();
        }
    }

    // Remove item from cart
    async removeFromCart(userId, itemId) {
        const connection = await pool.getConnection();
        try {
            // Verify item belongs to user's cart
            const [items] = await connection.query(`
                SELECT ci.id, c.user_id
                FROM cart_items ci
                JOIN carts c ON ci.cart_id = c.id
                WHERE ci.id = ? AND c.user_id = ?
            `, [itemId, userId]);

            if (items.length === 0) {
                throw new AppError('Cart item not found', 404);
            }

            // Get cart ID before deletion
            const [cartData] = await connection.query(`
                SELECT c.id FROM carts c
                JOIN cart_items ci ON c.id = ci.cart_id
                WHERE ci.id = ?
            `, [itemId]);

            // Delete item
            await connection.query('DELETE FROM cart_items WHERE id = ?', [itemId]);

            // Get updated item count
            const [cartItems] = await connection.query(
                'SELECT COUNT(*) as count FROM cart_items WHERE cart_id = ?',
                [cartData[0].id]
            );

            return {
                cart_item_count: cartItems[0].count
            };
        } finally {
            connection.release();
        }
    }

    // Clear cart
    async clearCart(userId) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Get user's cart
            const [carts] = await connection.query(
                'SELECT id FROM carts WHERE user_id = ? AND status = "active"',
                [userId]
            );

            if (carts.length > 0) {
                // Delete all items in cart
                await connection.query(
                    'DELETE FROM cart_items WHERE cart_id = ?',
                    [carts[0].id]
                );
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

export default new CartService();
