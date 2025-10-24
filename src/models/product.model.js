import pool from '../config/database.js';

class Product {
    static async create({
        seller_id,
        sku,
        title,
        description,
        price,
        currency = 'USD',
        stock,
        category_id,
        brand = null,
        specifications = null,
        image_url = null
    }) {
        const [result] = await pool.query(
            `INSERT INTO products (
                seller_id, sku, title, description, price, 
                currency, stock, category_id, brand, specifications, 
                image_url, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "active")`,
            [
                seller_id, sku, title, description, price,
                currency, stock, category_id, brand, JSON.stringify(specifications),
                image_url
            ]
        );
        return this.findById(result.insertId);
    }

    static async findById(id) {
        const [products] = await pool.query(
            `SELECT p.*, c.name as category_name, s.name as seller_name
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             LEFT JOIN shops s ON p.seller_id = s.id
             WHERE p.id = ?`,
            [id]
        );
        return products[0];
    }

    static async findAll({ 
        page = 1, 
        limit = 10,
        search = '',
        category_id = null,
        seller_id = null,
        min_price = null,
        max_price = null,
        sort = 'created_at',
        order = 'DESC'
    }) {
        let query = `
            SELECT p.*, c.name as category_name, s.name as seller_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN shops s ON p.seller_id = s.id
            WHERE p.status = 'active'
        `;
        const params = [];

        if (search) {
            query += ' AND (p.title LIKE ? OR p.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (category_id) {
            query += ' AND p.category_id = ?';
            params.push(category_id);
        }

        if (seller_id) {
            query += ' AND p.seller_id = ?';
            params.push(seller_id);
        }

        if (min_price) {
            query += ' AND p.price >= ?';
            params.push(min_price);
        }

        if (max_price) {
            query += ' AND p.price <= ?';
            params.push(max_price);
        }

        // Add sorting
        const validSortColumns = ['created_at', 'price', 'title'];
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
            'SELECT COUNT(*) as total FROM products WHERE status = "active"'
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

    static async update(id, {
        title,
        description,
        price,
        stock,
        category_id,
        brand,
        specifications,
        image_url,
        status
    }) {
        const updates = [];
        const params = [];

        if (title !== undefined) {
            updates.push('title = ?');
            params.push(title);
        }

        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }

        if (price !== undefined) {
            updates.push('price = ?');
            params.push(price);
        }

        if (stock !== undefined) {
            updates.push('stock = ?');
            params.push(stock);
        }

        if (category_id !== undefined) {
            updates.push('category_id = ?');
            params.push(category_id);
        }

        if (brand !== undefined) {
            updates.push('brand = ?');
            params.push(brand);
        }

        if (specifications !== undefined) {
            updates.push('specifications = ?');
            params.push(JSON.stringify(specifications));
        }

        if (image_url !== undefined) {
            updates.push('image_url = ?');
            params.push(image_url);
        }

        if (status !== undefined) {
            updates.push('status = ?');
            params.push(status);
        }

        if (updates.length === 0) {
            return this.findById(id);
        }

        params.push(id);
        await pool.query(
            `UPDATE products SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            params
        );

        return this.findById(id);
    }

    static async delete(id) {
        await pool.query('DELETE FROM products WHERE id = ?', [id]);
        return true;
    }

    static async updateStock(id, quantity, type = 'increment') {
        const operation = type === 'increment' ? '+' : '-';
        await pool.query(
            `UPDATE products SET stock = stock ${operation} ? WHERE id = ?`,
            [quantity, id]
        );
        return this.findById(id);
    }

    static async findByCategory(categoryId, { page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
        const [products] = await pool.query(
            `SELECT p.*, c.name as category_name, s.name as seller_name
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             LEFT JOIN shops s ON p.seller_id = s.id
             WHERE p.category_id = ? AND p.status = 'active'
             ORDER BY p.created_at DESC
             LIMIT ? OFFSET ?`,
            [categoryId, limit, offset]
        );

        const [{ total }] = await pool.query(
            'SELECT COUNT(*) as total FROM products WHERE category_id = ? AND status = "active"',
            [categoryId]
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

    static async findBySeller(sellerId, { page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
        const [products] = await pool.query(
            `SELECT p.*, c.name as category_name, s.name as seller_name
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             LEFT JOIN shops s ON p.seller_id = s.id
             WHERE p.seller_id = ?
             ORDER BY p.created_at DESC
             LIMIT ? OFFSET ?`,
            [sellerId, limit, offset]
        );

        const [{ total }] = await pool.query(
            'SELECT COUNT(*) as total FROM products WHERE seller_id = ?',
            [sellerId]
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

    static async searchProducts(query, { page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;
        const [products] = await pool.query(
            `SELECT p.*, c.name as category_name, s.name as seller_name
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             LEFT JOIN shops s ON p.seller_id = s.id
             WHERE p.status = 'active'
             AND (
                 p.title LIKE ? OR
                 p.description LIKE ? OR
                 p.sku LIKE ? OR
                 c.name LIKE ?
             )
             ORDER BY p.created_at DESC
             LIMIT ? OFFSET ?`,
            [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, limit, offset]
        );

        const [{ total }] = await pool.query(
            `SELECT COUNT(*) as total 
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.status = 'active'
             AND (
                 p.title LIKE ? OR
                 p.description LIKE ? OR
                 p.sku LIKE ? OR
                 c.name LIKE ?
             )`,
            [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
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
}

export default Product;