import pool from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';


class ProductModel {
    static async create(
        productData) {
                const connection = await pool.getConnection();
      console.log("here comes produc service", productData)
        try {
            await connection.beginTransaction();

            const productId = uuidv4();
            await connection.query(`
                INSERT INTO catalog_products (
                    id, seller_id, sku, title, short_description, 
                    long_description, price, currency, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                productId,
                productData.seller_id,
                productData.sku,
                productData.title,
                productData.short_description,
                productData.long_description || productData.short_description,
                productData.price,
                productData.currency || 'MWK',
                productData.is_active ?? 1
            ]);

            console.log("Inserted product with ID:", productId);
            console.log("products data ", productData);
            
            if (productData.categories?.length) {
                const categoryValues = productData.categories.map(cat => [productId, cat.id]);
                await connection.query(`
                    INSERT INTO catalog_product_categories (product_id, category_id)
                    VALUES ?
                `, [categoryValues]);
            }

            await connection.commit();
            return productId;
        } catch (error) {
            console.log(error);
            await connection.rollback();
            throw new Error('Error creating product');
        } finally {
            connection.release();
        }
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

    //SELECT `id`, `product_id`, `url`, `alt_text`, `sort_order`,
    // `created_at` FROM `catalog_product_images` WHERE 1

    static async updateProductImage(productImageData) {
        const updates = [];
        const params = [];
const db = await pool.getConnection();
db.beginTransaction();
try {
    const id = uuidv4();
const results = await db.query(`INSERT INTO
     catalog_product_images(id, product_id, url,alt_text, sort_order) VALUES(?,?,?,?,?)`, [id, productImageData.product_id, productImageData.url, productImageData.alt_text, productImageData.sort_order]);

   console.log("'Results from catalog produt images ", results);

} catch (error) {
    console.log("prooduct images  insertion error ", error );
}
        await pool.query(
            `UPDATE products SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            params
        );

        return this.findById(id);
    }

    static async  updateProduct(product_id, url,alt_text){
        const id = await pool.query(`INSERT INTO catalog_product_images()`);
        console.log("Id results ::", id);

    }
    static async delete(id) {
        const delProd =  await pool.query('DELETE FROM products WHERE id = ?', [id]);
       console.log("Delete the user with id :: ", delProd);

        return true;
    }

    static async updateStock(productId, quantity, type = 'increment') {
        const operation = type === 'increment' ? '+' : '-';

        console.log("operation :;:", operation);
           try {
            const [result] = await pool.query(`
                UPDATE catalog_products 
                SET stock = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [quantity, productId]);

            return result.affectedRows > 0;
        } catch (error) {
            console.log("Error update :=", error);
            throw new Error('Error updating product stock');
        }
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

        const [total ] = await pool.query(
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

export default ProductModel;