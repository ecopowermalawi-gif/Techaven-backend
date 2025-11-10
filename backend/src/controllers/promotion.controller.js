import promotionService from '../services/promotion.service.js';

class PromotionController {
    async createPromotion(req, res) {
        try {
            const {
                code,
                discountType,
                discountValue,
                minPurchase,
                maxDiscount,
                startDate,
                endDate,
                usageLimit,
                productIds
            } = req.body;

            const promotion = await promotionService.createPromotion({
                code,
                discountType,
                discountValue,
                minPurchase,
                maxDiscount,
                startDate,
                endDate,
                usageLimit,
                productIds
            });

            res.status(201).json({
                success: true,
                data: promotion
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to create promotion'
            });
        }
    }

    async getPromotions(req, res) {
        try {
            const { page = 1, limit = 10, active } = req.query;
            const promotions = await promotionService.getPromotions(
                parseInt(page),
                parseInt(limit),
                active === 'true'
            );
            res.json({
                success: true,
                data: promotions
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch promotions'
            });
        }
    }

    async getPromotion(req, res) {
        try {
            const { promotionId } = req.params;
            const promotion = await promotionService.getPromotionById(promotionId);
            if (!promotion) {
                return res.status(404).json({
                    success: false,
                    message: 'Promotion not found'
                });
            }
            res.json({
                success: true,
                data: promotion
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch promotion'
            });
        }
    }

    async updatePromotion(req, res) {
        try {
            const { promotionId } = req.params;
            const updateData = req.body;
            await promotionService.updatePromotion(promotionId, updateData);
            res.json({
                success: true,
                message: 'Promotion updated successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update promotion'
            });
        }
    }

    async deletePromotion(req, res) {
        try {
            const { promotionId } = req.params;
            await promotionService.deletePromotion(promotionId);
            res.json({
                success: true,
                message: 'Promotion deleted successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to delete promotion'
            });
        }
    }

    async validatePromotion(req, res) {
        try {
            const { code } = req.params;
            const { items } = req.body;
            const result = await promotionService.validatePromotion(code, items);
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || 'Invalid promotion code'
            });
        }
    }

    async getActivePromotions(req, res) {
        try {
            const promotions = await promotionService.getActivePromotions();
            res.json({
                success: true,
                data: promotions
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch active promotions'
            });
        }
    }
}

export default new PromotionController();