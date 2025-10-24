import mysql from 'mysql2/promise';
import config from '../config/config.js';

const pool = mysql.createPool(config.database);

class PromotionService {
    async createPromotion({
        code,
        discountType,
        discountValue,
        minPurchase,
        maxDiscount,
        startDate,
        endDate,
        usageLimit,
        productIds
    }) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Check if code already exists
            const [existingPromos] = await connection.query(
                'SELECT id FROM promotions WHERE code = ?',
                [code]
            );

            if (existingPromos.length) {
                throw new Error('Promotion code already exists');
            }

            // Create promotion
            const [result] = await connection.query(
                `INSERT INTO promotions (
                    code,
                    discount_type,
                    discount_value,
                    min_purchase,
                    max_discount,
                    start_date,
                    end_date,
                    usage_limit,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    code,
                    discountType,
                    discountValue,
                    minPurchase || 0,
                    maxDiscount || null,
                    startDate,
                    endDate,
                    usageLimit || null
                ]
            );

            const promotionId = result.insertId;

            // Add product restrictions if specified
            if (productIds && productIds.length > 0) {
                const values = productIds.map(productId => [promotionId, productId]);
                await connection.query(
                    'INSERT INTO promotion_products (promotion_id, product_id) VALUES ?',
                    [values]
                );
            }

            await connection.commit();

            // Get complete promotion details
            const [promotions] = await connection.query(
                `SELECT p.*, 
                    COALESCE(
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', pp.product_id,
                                'name', pr.name
                            )
                        ),
                        JSON_ARRAY()
                    ) as products
                 FROM promotions p
                 LEFT JOIN promotion_products pp ON p.id = pp.promotion_id
                 LEFT JOIN products pr ON pp.product_id = pr.id
                 WHERE p.id = ?
                 GROUP BY p.id`,
                [promotionId]
            );

            return promotions[0];
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async getPromotions(page, limit, activeOnly = false) {
        const connection = await pool.getConnection();
        try {
            const offset = (page - 1) * limit;
            let query = `
                SELECT p.*, 
                    COALESCE(
                        JSON_ARRAYAGG(
                            CASE 
                                WHEN pp.product_id IS NOT NULL 
                                THEN JSON_OBJECT(
                                    'id', pp.product_id,
                                    'name', pr.name
                                )
                                ELSE NULL
                            END
                        ),
                        JSON_ARRAY()
                    ) as products
                FROM promotions p
                LEFT JOIN promotion_products pp ON p.id = pp.promotion_id
                LEFT JOIN products pr ON pp.product_id = pr.id
            `;

            const params = [];
            if (activeOnly) {
                query += ' WHERE p.start_date <= NOW() AND p.end_date >= NOW()';
            }

            query += ' GROUP BY p.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const [promotions] = await connection.query(query, params);

            const [totalCount] = await connection.query(
                'SELECT COUNT(*) as count FROM promotions' +
                (activeOnly ? ' WHERE start_date <= NOW() AND end_date >= NOW()' : '')
            );

            return {
                promotions,
                total: totalCount[0].count,
                page,
                totalPages: Math.ceil(totalCount[0].count / limit)
            };
        } finally {
            connection.release();
        }
    }

    async getPromotionById(promotionId) {
        const connection = await pool.getConnection();
        try {
            const [promotions] = await connection.query(
                `SELECT p.*, 
                    COALESCE(
                        JSON_ARRAYAGG(
                            CASE 
                                WHEN pp.product_id IS NOT NULL 
                                THEN JSON_OBJECT(
                                    'id', pp.product_id,
                                    'name', pr.name
                                )
                                ELSE NULL
                            END
                        ),
                        JSON_ARRAY()
                    ) as products
                FROM promotions p
                LEFT JOIN promotion_products pp ON p.id = pp.promotion_id
                LEFT JOIN products pr ON pp.product_id = pr.id
                WHERE p.id = ?
                GROUP BY p.id`,
                [promotionId]
            );

            return promotions.length ? promotions[0] : null;
        } finally {
            connection.release();
        }
    }

    async updatePromotion(promotionId, updateData) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Check if promotion exists
            const [promotions] = await connection.query(
                'SELECT id FROM promotions WHERE id = ?',
                [promotionId]
            );

            if (!promotions.length) {
                throw new Error('Promotion not found');
            }

            // If updating code, check if new code already exists
            if (updateData.code) {
                const [existingPromos] = await connection.query(
                    'SELECT id FROM promotions WHERE code = ? AND id != ?',
                    [updateData.code, promotionId]
                );

                if (existingPromos.length) {
                    throw new Error('Promotion code already exists');
                }
            }

            // Update promotion
            const allowedUpdates = [
                'code',
                'discount_type',
                'discount_value',
                'min_purchase',
                'max_discount',
                'start_date',
                'end_date',
                'usage_limit'
            ];

            const updates = {};
            for (const [key, value] of Object.entries(updateData)) {
                const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                if (allowedUpdates.includes(snakeKey)) {
                    updates[snakeKey] = value;
                }
            }

            if (Object.keys(updates).length > 0) {
                await connection.query(
                    'UPDATE promotions SET ? WHERE id = ?',
                    [updates, promotionId]
                );
            }

            // Update product restrictions if specified
            if (updateData.productIds !== undefined) {
                // Remove existing product restrictions
                await connection.query(
                    'DELETE FROM promotion_products WHERE promotion_id = ?',
                    [promotionId]
                );

                // Add new product restrictions if any
                if (updateData.productIds && updateData.productIds.length > 0) {
                    const values = updateData.productIds.map(productId => [promotionId, productId]);
                    await connection.query(
                        'INSERT INTO promotion_products (promotion_id, product_id) VALUES ?',
                        [values]
                    );
                }
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async deletePromotion(promotionId) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Delete product restrictions
            await connection.query(
                'DELETE FROM promotion_products WHERE promotion_id = ?',
                [promotionId]
            );

            // Delete promotion
            const [result] = await connection.query(
                'DELETE FROM promotions WHERE id = ?',
                [promotionId]
            );

            if (result.affectedRows === 0) {
                throw new Error('Promotion not found');
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async validatePromotion(code, items) {
        const connection = await pool.getConnection();
        try {
            // Get promotion details
            const [promotions] = await connection.query(
                `SELECT p.*, 
                    JSON_ARRAYAGG(pp.product_id) as applicable_products
                FROM promotions p
                LEFT JOIN promotion_products pp ON p.id = pp.promotion_id
                WHERE p.code = ?
                GROUP BY p.id`,
                [code]
            );

            if (!promotions.length) {
                throw new Error('Invalid promotion code');
            }

            const promotion = promotions[0];

            // Check if promotion is active
            const now = new Date();
            if (now < new Date(promotion.start_date) || now > new Date(promotion.end_date)) {
                throw new Error('Promotion is not active');
            }

            // Check usage limit
            if (promotion.usage_limit !== null && promotion.usage_count >= promotion.usage_limit) {
                throw new Error('Promotion usage limit reached');
            }

            // Calculate total purchase amount and validate products
            let totalAmount = 0;
            const applicableProducts = JSON.parse(promotion.applicable_products).filter(Boolean);
            const validItems = [];
            const invalidItems = [];

            for (const item of items) {
                const [products] = await connection.query(
                    'SELECT id, price FROM products WHERE id = ?',
                    [item.productId]
                );

                if (!products.length) {
                    invalidItems.push({
                        productId: item.productId,
                        reason: 'Product not found'
                    });
                    continue;
                }

                const product = products[0];
                if (applicableProducts.length > 0 && !applicableProducts.includes(product.id)) {
                    invalidItems.push({
                        productId: item.productId,
                        reason: 'Product not eligible for promotion'
                    });
                    continue;
                }

                totalAmount += product.price * item.quantity;
                validItems.push(item);
            }

            // Check minimum purchase requirement
            if (totalAmount < promotion.min_purchase) {
                throw new Error(`Minimum purchase amount of ${promotion.min_purchase} required`);
            }

            // Calculate discount
            let discountAmount;
            if (promotion.discount_type === 'percentage') {
                discountAmount = (totalAmount * promotion.discount_value) / 100;
                if (promotion.max_discount !== null) {
                    discountAmount = Math.min(discountAmount, promotion.max_discount);
                }
            } else { // fixed amount
                discountAmount = promotion.discount_value;
            }

            return {
                valid: true,
                discountAmount,
                totalAmount,
                finalAmount: totalAmount - discountAmount,
                validItems,
                invalidItems
            };
        } finally {
            connection.release();
        }
    }

    async getActivePromotions() {
        const connection = await pool.getConnection();
        try {
            const [promotions] = await connection.query(
                `SELECT p.*, 
                    COALESCE(
                        JSON_ARRAYAGG(
                            CASE 
                                WHEN pp.product_id IS NOT NULL 
                                THEN JSON_OBJECT(
                                    'id', pp.product_id,
                                    'name', pr.name
                                )
                                ELSE NULL
                            END
                        ),
                        JSON_ARRAY()
                    ) as products
                FROM promotions p
                LEFT JOIN promotion_products pp ON p.id = pp.promotion_id
                LEFT JOIN products pr ON pp.product_id = pr.id
                WHERE p.start_date <= NOW() AND p.end_date >= NOW()
                GROUP BY p.id
                ORDER BY p.created_at DESC`
            );

            return promotions;
        } finally {
            connection.release();
        }
    }
}

export default new PromotionService();