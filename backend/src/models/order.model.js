import pool from '../config/database.js';

class Order {
    static async create({
        user_id,
        shipping_address_id,
        billing_address_id = null,
        items,
        payment_method = 'credit_card',
        shipping_method = 'standard',
        notes = null
    }) {
        // Start transaction
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Calculate total amount
            let total_amount = 0;
            for (const item of items) {
                const [product] = await connection.query(
                    'SELECT price, stock FROM products WHERE id = ?',
                    [item.product_id]
                );

                if (!product[0] || product[0].stock < item.quantity) {
                    throw new Error(`Product ${item.product_id} is out of stock`);
                }

                total_amount += product[0].price * item.quantity;
            }

            // 2. Create order
            const [orderResult] = await connection.query(
                `INSERT INTO orders (
                    user_id, shipping_address_id, billing_address_id,
                    total_amount, status, payment_method, shipping_method,
                    notes
                ) VALUES (?, ?, ?, ?, "pending", ?, ?, ?)`,
                [
                    user_id, shipping_address_id, billing_address_id,
                    total_amount, payment_method, shipping_method, notes
                ]
            );

            const orderId = orderResult.insertId;

            // 3. Create order items and update product stock
            for (const item of items) {
                await connection.query(
                    `INSERT INTO order_items (
                        order_id, product_id, quantity, price
                    ) VALUES (?, ?, ?, (
                        SELECT price FROM products WHERE id = ?
                    ))`,
                    [orderId, item.product_id, item.quantity, item.product_id]
                );

                await connection.query(
                    'UPDATE products SET stock = stock - ? WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }

            await connection.commit();
            return this.findById(orderId);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async findById(id) {
        const [orders] = await pool.query(
            `SELECT o.*, 
                    u.email as user_email,
                    sa.address_line1 as shipping_address_line1,
                    sa.city as shipping_city,
                    sa.state as shipping_state,
                    sa.postal_code as shipping_postal_code,
                    sa.country as shipping_country,
                    ba.address_line1 as billing_address_line1,
                    ba.city as billing_city,
                    ba.state as billing_state,
                    ba.postal_code as billing_postal_code,
                    ba.country as billing_country
             FROM orders o
             LEFT JOIN users u ON o.user_id = u.id
             LEFT JOIN user_addresses sa ON o.shipping_address_id = sa.id
             LEFT JOIN user_addresses ba ON o.billing_address_id = ba.id
             WHERE o.id = ?`,
            [id]
        );

        if (!orders[0]) return null;

        // Get order items
        const [items] = await pool.query(
            `SELECT oi.*, 
                    p.title as product_title,
                    p.sku as product_sku,
                    p.image_url as product_image
             FROM order_items oi
             LEFT JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = ?`,
            [id]
        );

        orders[0].items = items;
        return orders[0];
    }

    static async findByUser(userId, { page = 1, limit = 10, status = null }) {
        let query = `
            SELECT o.*, 
                   sa.address_line1 as shipping_address_line1,
                   sa.city as shipping_city
            FROM orders o
            LEFT JOIN user_addresses sa ON o.shipping_address_id = sa.id
            WHERE o.user_id = ?
        `;
        const params = [userId];

        if (status) {
            query += ' AND o.status = ?';
            params.push(status);
        }

        const offset = (page - 1) * limit;
        query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), offset);

        const [orders] = await pool.query(query, params);

        // Get items for each order
        for (const order of orders) {
            const [items] = await pool.query(
                `SELECT oi.*, p.title as product_title, p.image_url as product_image
                 FROM order_items oi
                 LEFT JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = ?`,
                [order.id]
            );
            order.items = items;
        }

        const [{ total }] = await pool.query(
            'SELECT COUNT(*) as total FROM orders WHERE user_id = ?' +
            (status ? ' AND status = ?' : ''),
            status ? [userId, status] : [userId]
        );

        return {
            orders,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total
            }
        };
    }

    static async updateStatus(id, status, notes = null) {
        const updates = ['status = ?'];
        const params = [status];

        if (notes !== null) {
            updates.push('notes = ?');
            params.push(notes);
        }

        params.push(id);
        await pool.query(
            `UPDATE orders SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            params
        );

        return this.findById(id);
    }

    static async findAll({ 
        page = 1, 
        limit = 10,
        status = null,
        start_date = null,
        end_date = null,
        search = ''
    }) {
        let query = `
            SELECT o.*, 
                   u.email as user_email,
                   sa.address_line1 as shipping_address
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN user_addresses sa ON o.shipping_address_id = sa.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND o.status = ?';
            params.push(status);
        }

        if (start_date) {
            query += ' AND o.created_at >= ?';
            params.push(start_date);
        }

        if (end_date) {
            query += ' AND o.created_at <= ?';
            params.push(end_date);
        }

        if (search) {
            query += ` AND (o.id LIKE ? OR u.email LIKE ? OR sa.address_line1 LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const offset = (page - 1) * limit;
        query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), offset);

        const [orders] = await pool.query(query, params);

        // Get items for each order
        for (const order of orders) {
            const [items] = await pool.query(
                `SELECT oi.*, p.title as product_title
                 FROM order_items oi
                 LEFT JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = ?`,
                [order.id]
            );
            order.items = items;
        }

        const [{ total }] = await pool.query(
            'SELECT COUNT(*) as total FROM orders o ' +
            'LEFT JOIN users u ON o.user_id = u.id ' +
            'LEFT JOIN user_addresses sa ON o.shipping_address_id = sa.id ' +
            'WHERE 1=1' +
            (status ? ' AND o.status = ?' : '') +
            (start_date ? ' AND o.created_at >= ?' : '') +
            (end_date ? ' AND o.created_at <= ?' : '') +
            (search ? ' AND (o.id LIKE ? OR u.email LIKE ? OR sa.address_line1 LIKE ?)' : ''),
            params.slice(0, -2) // Remove limit and offset
        );

        return {
            orders,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total
            }
        };
    }

    static async getOrderStats(start_date = null, end_date = null) {
        let query = `
            SELECT 
                COUNT(*) as total_orders,
                SUM(total_amount) as total_revenue,
                COUNT(DISTINCT user_id) as unique_customers,
                AVG(total_amount) as average_order_value
            FROM orders
            WHERE 1=1
        `;
        const params = [];

        if (start_date) {
            query += ' AND created_at >= ?';
            params.push(start_date);
        }

        if (end_date) {
            query += ' AND created_at <= ?';
            params.push(end_date);
        }

        const [stats] = await pool.query(query, params);
        return stats[0];
    }

    static async getTopProducts(limit = 10) {
        const [products] = await pool.query(
            `SELECT p.*, 
                    COUNT(oi.id) as order_count,
                    SUM(oi.quantity) as total_quantity,
                    SUM(oi.quantity * oi.price) as total_revenue
             FROM products p
             INNER JOIN order_items oi ON p.id = oi.product_id
             INNER JOIN orders o ON oi.order_id = o.id
             WHERE o.status = 'completed'
             GROUP BY p.id
             ORDER BY total_revenue DESC
             LIMIT ?`,
            [limit]
        );
        return products;
    }
}

export default Order;