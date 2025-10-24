import mysql from 'mysql2/promise';
import config from '../config/config.js';

const pool = mysql.createPool(config.database);

class ReviewService {
    async createReview(userId, productId, rating, comment) {
        const connection = await pool.getConnection();
        try {
            // Check if user has purchased the product
            const [orders] = await connection.query(
                `SELECT o.id 
                 FROM orders o
                 JOIN order_items oi ON o.id = oi.order_id
                 WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'delivered'
                 LIMIT 1`,
                [userId, productId]
            );

            if (!orders.length) {
                throw new Error('You can only review products you have purchased');
            }

            // Check if user has already reviewed this product
            const [existingReviews] = await connection.query(
                'SELECT id FROM reviews WHERE user_id = ? AND product_id = ?',
                [userId, productId]
            );

            if (existingReviews.length) {
                throw new Error('You have already reviewed this product');
            }

            // Create review
            const [result] = await connection.query(
                `INSERT INTO reviews (user_id, product_id, rating, comment, created_at)
                 VALUES (?, ?, ?, ?, NOW())`,
                [userId, productId, rating, comment]
            );

            // Update product rating
            await this.updateProductRating(connection, productId);

            // Get the created review with user details
            const [reviews] = await connection.query(
                `SELECT r.*, u.username, u.email
                 FROM reviews r
                 JOIN users u ON r.user_id = u.id
                 WHERE r.id = ?`,
                [result.insertId]
            );

            return reviews[0];
        } finally {
            connection.release();
        }
    }

    async getProductReviews(productId, page, limit) {
        const connection = await pool.getConnection();
        try {
            const offset = (page - 1) * limit;

            const [reviews] = await connection.query(
                `SELECT r.*, u.username
                 FROM reviews r
                 JOIN users u ON r.user_id = u.id
                 WHERE r.product_id = ?
                 ORDER BY r.created_at DESC
                 LIMIT ? OFFSET ?`,
                [productId, limit, offset]
            );

            const [totalCount] = await connection.query(
                'SELECT COUNT(*) as count FROM reviews WHERE product_id = ?',
                [productId]
            );

            return {
                reviews,
                total: totalCount[0].count,
                page,
                totalPages: Math.ceil(totalCount[0].count / limit)
            };
        } finally {
            connection.release();
        }
    }

    async getUserReviews(userId, page, limit) {
        const connection = await pool.getConnection();
        try {
            const offset = (page - 1) * limit;

            const [reviews] = await connection.query(
                `SELECT r.*, p.name as product_name, p.image_url as product_image
                 FROM reviews r
                 JOIN products p ON r.product_id = p.id
                 WHERE r.user_id = ?
                 ORDER BY r.created_at DESC
                 LIMIT ? OFFSET ?`,
                [userId, limit, offset]
            );

            const [totalCount] = await connection.query(
                'SELECT COUNT(*) as count FROM reviews WHERE user_id = ?',
                [userId]
            );

            return {
                reviews,
                total: totalCount[0].count,
                page,
                totalPages: Math.ceil(totalCount[0].count / limit)
            };
        } finally {
            connection.release();
        }
    }

    async updateReview(reviewId, userId, rating, comment) {
        const connection = await pool.getConnection();
        try {
            // Check if review exists and belongs to user
            const [reviews] = await connection.query(
                'SELECT product_id FROM reviews WHERE id = ? AND user_id = ?',
                [reviewId, userId]
            );

            if (!reviews.length) {
                throw new Error('Review not found or unauthorized');
            }

            // Update review
            await connection.query(
                'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?',
                [rating, comment, reviewId]
            );

            // Update product rating
            await this.updateProductRating(connection, reviews[0].product_id);
        } finally {
            connection.release();
        }
    }

    async deleteReview(reviewId, userId) {
        const connection = await pool.getConnection();
        try {
            // Check if review exists and belongs to user
            const [reviews] = await connection.query(
                'SELECT product_id FROM reviews WHERE id = ? AND user_id = ?',
                [reviewId, userId]
            );

            if (!reviews.length) {
                throw new Error('Review not found or unauthorized');
            }

            // Delete review
            await connection.query(
                'DELETE FROM reviews WHERE id = ?',
                [reviewId]
            );

            // Update product rating
            await this.updateProductRating(connection, reviews[0].product_id);
        } finally {
            connection.release();
        }
    }

    async getReviewSummary(productId) {
        const connection = await pool.getConnection();
        try {
            // Get average rating and count by rating value
            const [summary] = await connection.query(
                `SELECT 
                    COUNT(*) as total_reviews,
                    AVG(rating) as average_rating,
                    SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
                    SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
                    SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
                    SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
                    SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
                 FROM reviews
                 WHERE product_id = ?`,
                [productId]
            );

            return {
                ...summary[0],
                average_rating: Number(summary[0].average_rating).toFixed(1)
            };
        } finally {
            connection.release();
        }
    }

    async updateProductRating(connection, productId) {
        // Calculate new average rating
        const [ratings] = await connection.query(
            'SELECT AVG(rating) as avg_rating FROM reviews WHERE product_id = ?',
            [productId]
        );

        // Update product rating
        await connection.query(
            'UPDATE products SET rating = ? WHERE id = ?',
            [ratings[0].avg_rating || 0, productId]
        );
    }
}

export default new ReviewService();