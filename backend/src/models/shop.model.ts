import pool from '../config/database.js';
import type { Shop as ShopType, QueryResult, ResultSetHeader } from '../types/database';
import type { RowDataPacket } from 'mysql2';

class Shop {
    static async create({
        seller_id,
        name,
        description,
        category,
        address
    }: Omit<ShopType, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<ShopType> {
        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO shops (
                seller_id, name, description, category, 
                address, status
            ) VALUES (?, ?, ?, ?, ?, "pending")`,
            [seller_id, name, description, category, address]
        );

        const shop = await this.findById(result.insertId);
        if (!shop) throw new Error('Failed to create shop');
        return shop;
    }

    static async findById(id: number): Promise<ShopType | null> {
        const [rows] = await pool.query<RowDataPacket[] & ShopType[]>(
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
        return rows[0] as ShopType || null;
    }

    static async findBySeller(sellerId: number): Promise<ShopType | null> {
        const [rows] = await pool.query<RowDataPacket[] & ShopType[]>(
            'SELECT * FROM shops WHERE seller_id = ?',
            [sellerId]
        );
        return rows[0] as ShopType || null;
    }

    static async findAll({ 
        page = 1, 
        limit = 10,
        category = null,
        status = 'approved',
        search = ''
    }: {
        page?: number;
        limit?: number;
        category?: string | null;
        status?: string;
        search?: string;
    }): Promise<{
        shops: ShopType[];
        pagination: {
            page: number;
            limit: number;
            total: number;
        };
    }> {
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
        const params: any[] = [];

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

        const [rows] = await pool.query<RowDataPacket[] & ShopType[]>(query, params);
        const shops = rows as ShopType[];

        const [countRows] = await pool.query<(RowDataPacket & { total: number })[]>(
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
                total: countRows[0].total
            }
        };
    }

    // ... rest of the methods with similar type annotations
}

export default Shop;