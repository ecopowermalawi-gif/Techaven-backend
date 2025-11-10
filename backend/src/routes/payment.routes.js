import express from 'express';
import paymentController from '../controllers/payment.controller.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Regular payment routes
router.post(
    '/create-payment-intent',
    auth,
    paymentController.createPaymentIntent
);

router.post(
    '/confirm-payment',
    auth,
    paymentController.confirmPayment
);

// Webhook route for Stripe
router.post(
    '/webhook',
    paymentController.handleWebhook
);

// Payment methods
router.get(
    '/methods',
    auth,
    paymentController.getPaymentMethods
);

router.post(
    '/methods',
    auth,
    paymentController.addPaymentMethod
);

router.delete(
    '/methods/:methodId',
    auth,
    paymentController.removePaymentMethod
);

// Payment history
router.get(
    '/history',
    auth,
    paymentController.getPaymentHistory
);

export default router;