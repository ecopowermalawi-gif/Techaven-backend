import paymentMethodService from '../services/payment-method.service.js';
import { AppError } from '../middleware/error.js';

class PaymentMethodController {
    // Get payment methods
    async getPaymentMethods(req, res, next) {
        try {
            const userId = req.user.id;
            const result = await paymentMethodService.getPaymentMethods(userId);
            
            res.json({
                success: true,
                message: 'Payment methods retrieved',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Add payment method
    async addPaymentMethod(req, res, next) {
        try {
            const userId = req.user.id;
            const data = req.body;
            
            const result = await paymentMethodService.addPaymentMethod(userId, data);
            
            res.status(201).json({
                success: true,
                message: 'Payment method added',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    // Delete payment method
    async deletePaymentMethod(req, res, next) {
        try {
            const userId = req.user.id;
            const { paymentMethodId } = req.params;
            
            await paymentMethodService.deletePaymentMethod(userId, paymentMethodId);
            
            res.json({
                success: true,
                message: 'Payment method deleted',
                data: null
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new PaymentMethodController();
