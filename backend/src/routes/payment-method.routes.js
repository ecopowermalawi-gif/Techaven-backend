import express from 'express';
import paymentMethodController from '../controllers/payment-method.controller.js';
import { auth } from '../middleware/auth.js';
import { validate, paymentMethodValidationRules } from '../middleware/validation.js';

const router = express.Router();

// ========== PROTECTED ROUTES (All require authentication) ==========

// Get payment methods
router.get(
    '/',
    auth,
    paymentMethodController.getPaymentMethods
);

// Add payment method
router.post(
    '/',
    auth,
    validate(paymentMethodValidationRules.create),
    paymentMethodController.addPaymentMethod
);

// Delete payment method
router.delete(
    '/:paymentMethodId',
    auth,
    paymentMethodController.deletePaymentMethod
);

export default router;
