import reviewService from '../services/review.service.js';

class ReviewController {
    async createReview(req, res) {
        try {
            const userId = req.user.id;
            const { productId, rating, comment } = req.body;
            const review = await reviewService.createReview(userId, productId, rating, comment);
            res.status(201).json({
                success: true,
                data: review
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to create review'
            });
        }
    }

    async getProductReviews(req, res) {
        try {
            const { productId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const reviews = await reviewService.getProductReviews(
                productId,
                parseInt(page),
                parseInt(limit)
            );
            res.json({
                success: true,
                data: reviews
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch reviews'
            });
        }
    }

    async getUserReviews(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 10 } = req.query;
            const reviews = await reviewService.getUserReviews(
                userId,
                parseInt(page),
                parseInt(limit)
            );
            res.json({
                success: true,
                data: reviews
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch reviews'
            });
        }
    }

    async updateReview(req, res) {
        try {
            const { reviewId } = req.params;
            const userId = req.user.id;
            const { rating, comment } = req.body;
            await reviewService.updateReview(reviewId, userId, rating, comment);
            res.json({
                success: true,
                message: 'Review updated successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update review'
            });
        }
    }

    async deleteReview(req, res) {
        try {
            const { reviewId } = req.params;
            const userId = req.user.id;
            await reviewService.deleteReview(reviewId, userId);
            res.json({
                success: true,
                message: 'Review deleted successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to delete review'
            });
        }
    }

    async getReviewSummary(req, res) {
        try {
            const { productId } = req.params;
            const summary = await reviewService.getReviewSummary(productId);
            res.json({
                success: true,
                data: summary
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch review summary'
            });
        }
    }
}

export default new ReviewController();