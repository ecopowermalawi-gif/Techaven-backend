import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';


//SELECT `id`, `user_id`, `business_name`, `registration_number`,
//  `created_at`, `updated_at` FROM `catalog_sellers` WHERE 1
class Shop {    
    
    //Shop CRUD Operations
    async createShop(shopData) {
        const connection =  await pool.getConnection();
          const id = uuidv4();
        try {
             const {user_id , business_name, registration_number} = shopData;
             const [result] = await connection.query(`INSERT INTO catalog_sellers (id, user_id, business_name, registration_number) 
        VALUES (?, ?,?,?)`, [id,user_id, business_name, registration_number]);
      
            console.log("here comes the data ", result);

        } catch (error) {
            
        }

        return this.findById(result.insertId);
    }

    static async findById(id) {
        const [shops] = await pool.query(
            `SELECT s.*, 
                    u.email as seller_email,
                    u.username as seller_username,
                    (SELECT COUNT(*) FROM products WHERE seller_id = s.id) as product_count,
                    (
                        SELECT AVG(rating)
                        FROM product_reviews pr
                        INNER JOIN products p ON pr.product_id = p.id
                        WHERE p.seller_id = s.id
                    ) as rating
             FROM shops s
             LEFT JOIN users u ON s.seller_id = u.id
             WHERE s.id = ?`,
            [id]
        );
        return shops[0];
    }

    static async findBySeller(sellerId) {
        const [shops] = await pool.query(
            'SELECT * FROM shops WHERE seller_id = ?',
            [sellerId]
        );
        return shops[0];
    }

    static async findAll({ 
        page = 1, 
        limit = 10,
        category = null,
        status = 'approved',
        search = ''
    }) {
        let query = `
            SELECT s.*, 
                   u.email as seller_email,
                   u.username as seller_username,
                   (SELECT COUNT(*) FROM products WHERE seller_id = s.id) as product_count,
                   (
                       SELECT AVG(rating)
                       FROM product_reviews pr
                       INNER JOIN products p ON pr.product_id = p.id
                       WHERE p.seller_id = s.id
                   ) as rating
            FROM shops s
            LEFT JOIN users u ON s.seller_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND s.status = ?';
            params.push(status);
        }

        if (category) {
            query += ' AND s.category = ?';
            params.push(category);
        }

        if (search) {
            query += ' AND (s.name LIKE ? OR s.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        const offset = (page - 1) * limit;
        query += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
        params.push(Number(limit), offset);

        const [shops] = await pool.query(query, params);
        const [{ total }] = await pool.query(
            'SELECT COUNT(*) as total FROM shops s WHERE 1=1' +
            (status ? ' AND s.status = ?' : '') +
            (category ? ' AND s.category = ?' : '') +
            (search ? ' AND (s.name LIKE ? OR s.description LIKE ?)' : ''),
            params.slice(0, -2) // Remove limit and offset
        );

        return {
            shops,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total
            }
        };
    }

    static async update(id, {
        name,
        description,
        category,
        address
    }) {
        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }

        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }

        if (category !== undefined) {
            updates.push('category = ?');
            params.push(category);
        }

        if (address !== undefined) {
            updates.push('address = ?');
            params.push(address);
        }

        if (updates.length === 0) {
            return this.findById(id);
        }

        params.push(id);
        await pool.query(
            `UPDATE shops SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            params
        );

        return this.findById(id);
    }

    static async updateStatus(id, status, reason = null) {
        const updates = ['status = ?'];
        const params = [status];

        if (status === 'rejected' && reason) {
            updates.push('rejection_reason = ?');
            params.push(reason);
        } else if (status === 'suspended' && reason) {
            updates.push('suspension_reason = ?');
            params.push(reason);
        }

        params.push(id);
        await pool.query(
            `UPDATE shops SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            params
        );

        return this.findById(id);
    }

    static async delete(id) {
        await pool.query('DELETE FROM shops WHERE id = ?', [id]);
        return true;
    }

    static async getShopProducts(shopId, { 
        page = 1, 
        limit = 10,
        category = null,
        sort = 'created_at',
        order = 'DESC' 
    }) {
        let query = `
            SELECT p.*, 
                   c.name as category_name,
                   (
                       SELECT AVG(rating)
                       FROM product_reviews
                       WHERE product_id = p.id
                   ) as rating,
                   (
                       SELECT COUNT(*)
                       FROM product_reviews
                       WHERE product_id = p.id
                   ) as review_count
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.seller_id = ? AND p.status = 'active'
        `;
        const params = [shopId];

        if (category) {
            query += ' AND p.category_id = ?';
            params.push(category);
        }

        // Add sorting
        const validSortColumns = ['created_at', 'price', 'title', 'rating'];
        const validOrders = ['ASC', 'DESC'];
        
        const sortColumn = validSortColumns.includes(sort) ? sort : 'created_at';
        const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';
        
        query += ` ORDER BY p.${sortColumn} ${sortOrder}`;

        // Add pagination
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        params.push(Number(limit), offset);

        const [products] = await pool.query(query, params);
        const [{ total }] = await pool.query(
            'SELECT COUNT(*) as total FROM products WHERE seller_id = ? AND status = "active"' +
            (category ? ' AND category_id = ?' : ''),
            category ? [shopId, category] : [shopId]
        );

        return {
            products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total
            }
        };
    }

    static async getShopOrders(shopId, { 
        page = 1, 
        limit = 10,
        status = null
    }) {
        let query = `
            SELECT o.*,
                   u.email as buyer_email,
                   sa.address_line1 as shipping_address
            FROM orders o
            INNER JOIN order_items oi ON o.id = oi.order_id
            INNER JOIN products p ON oi.product_id = p.id
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN user_addresses sa ON o.shipping_address_id = sa.id
            WHERE p.seller_id = ?
        `;
        const params = [shopId];

        if (status) {
            query += ' AND o.status = ?';
            params.push(status);
        }

        query += ' GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
        const offset = (page - 1) * limit;
        params.push(Number(limit), offset);

        const [orders] = await pool.query(query, params);

        // Get order items for each order
        for (const order of orders) {
            const [items] = await pool.query(
                `SELECT oi.*, p.title as product_title
                 FROM order_items oi
                 INNER JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = ? AND p.seller_id = ?`,
                [order.id, shopId]
            );
            order.items = items;
        }

        const [{ total }] = await pool.query(
            `SELECT COUNT(DISTINCT o.id) as total
             FROM orders o
             INNER JOIN order_items oi ON o.id = oi.order_id
             INNER JOIN products p ON oi.product_id = p.id
             WHERE p.seller_id = ?` +
            (status ? ' AND o.status = ?' : ''),
            status ? [shopId, status] : [shopId]
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

    static async getShopStats(shopId, start_date = null, end_date = null) {
        let query = `
            SELECT 
                COUNT(DISTINCT o.id) as total_orders,
                COUNT(DISTINCT o.user_id) as unique_customers,
                SUM(oi.quantity * oi.price) as total_revenue,
                AVG(oi.quantity * oi.price) as average_order_value,
                (
                    SELECT AVG(rating)
                    FROM product_reviews pr
                    INNER JOIN products p ON pr.product_id = p.id
                    WHERE p.seller_id = ?
                ) as average_rating
            FROM orders o
            INNER JOIN order_items oi ON o.id = oi.order_id
            INNER JOIN products p ON oi.product_id = p.id
            WHERE p.seller_id = ? AND o.status = 'completed'
        `;
        const params = [shopId, shopId];

        if (start_date) {
            query += ' AND o.created_at >= ?';
            params.push(start_date);
        }

        if (end_date) {
            query += ' AND o.created_at <= ?';
            params.push(end_date);
        }

        const [stats] = await pool.query(query, params);
        return stats[0];
    }

    static async getTopShops(limit = 10) {
        const [shops] = await pool.query(
            `SELECT s.*, 
                    COUNT(DISTINCT o.id) as order_count,
                    SUM(oi.quantity * oi.price) as total_revenue,
                    AVG(pr.rating) as average_rating
             FROM shops s
             INNER JOIN products p ON s.id = p.seller_id
             INNER JOIN order_items oi ON p.id = oi.product_id
             INNER JOIN orders o ON oi.order_id = o.id
             LEFT JOIN product_reviews pr ON p.id = pr.product_id
             WHERE s.status = 'approved' AND o.status = 'completed'
             GROUP BY s.id
             ORDER BY total_revenue DESC
             LIMIT ?`,
            [limit]
        );
        return shops;
    }
}

export default Shop;