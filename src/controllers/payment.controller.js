import Stripe from 'stripe';
import pool from '../config/database.js';
import { AppError } from '../utils/error.js';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_SECRET_KEY
    ? new Stripe(STRIPE_SECRET_KEY)
    : {
        paymentIntents: {
            create: () => { throw new Error('Stripe not configured') },
            retrieve: () => { throw new Error('Stripe not configured') }
        },
        webhooks: {
            constructEvent: () => { throw new Error('Stripe not configured') }
        },
        paymentMethods: {
            list: () => { throw new Error('Stripe not configured') },
            attach: () => { throw new Error('Stripe not configured') }
        },
        customers: {
            create: () => { throw new Error('Stripe not configured') }
        }
    };

const paymentController = {
    // Create a payment intent with Stripe
    async createPaymentIntent(req, res, next) {
        try {
            const { amount, currency = 'usd', orderId } = req.body;

            // Validate order ownership
            const [order] = await pool.query(
                'SELECT * FROM orders WHERE id = ? AND user_id = ?',
                [orderId, req.user.id]
            );

            if (!order[0]) {
                throw new AppError('Order not found or unauthorized', 404);
            }

            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency,
                metadata: { orderId },
                customer: req.user.stripe_customer_id
            });

            res.json({
                clientSecret: paymentIntent.client_secret
            });
        } catch (error) {
            next(error);
        }
    },

    // Confirm payment after client-side confirmation
    async confirmPayment(req, res, next) {
        try {
            const { paymentIntentId } = req.body;

            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

            if (paymentIntent.status !== 'succeeded') {
                throw new AppError('Payment not successful', 400);
            }

            // Update order status in database
            await pool.query(
                'UPDATE orders SET payment_status = "paid", payment_intent_id = ? WHERE id = ?',
                [paymentIntentId, paymentIntent.metadata.orderId]
            );

            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    },

    // Handle Stripe webhook events
    async handleWebhook(req, res, next) {
        try {
            const sig = req.headers['stripe-signature'];
            const event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );

            switch (event.type) {
                case 'payment_intent.succeeded':
                    await handlePaymentSuccess(event.data.object);
                    break;
                case 'payment_intent.payment_failed':
                    await handlePaymentFailure(event.data.object);
                    break;
                // Add other webhook events as needed
            }

            res.json({ received: true });
        } catch (error) {
            next(error);
        }
    },

    // Get user's saved payment methods
    async getPaymentMethods(req, res, next) {
        try {
            if (!req.user.stripe_customer_id) {
                return res.json({ paymentMethods: [] });
            }

            const paymentMethods = await stripe.paymentMethods.list({
                customer: req.user.stripe_customer_id,
                type: 'card'
            });

            res.json({ paymentMethods: paymentMethods.data });
        } catch (error) {
            next(error);
        }
    },

    // Add a new payment method
    async addPaymentMethod(req, res, next) {
        try {
            const { paymentMethodId } = req.body;

            // Create Stripe customer if not exists
            if (!req.user.stripe_customer_id) {
                const customer = await stripe.customers.create({
                    email: req.user.email,
                    payment_method: paymentMethodId
                });

                await pool.query(
                    'UPDATE users SET stripe_customer_id = ? WHERE id = ?',
                    [customer.id, req.user.id]
                );

                req.user.stripe_customer_id = customer.id;
            }

            // Attach payment method to customer
            await stripe.paymentMethods.attach(paymentMethodId, {
                customer: req.user.stripe_customer_id
            });

            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    },

    // Remove a payment method
    async removePaymentMethod(req, res, next) {
        try {
            const { methodId } = req.params;

            // Verify payment method belongs to user
            const paymentMethod = await stripe.paymentMethods.retrieve(methodId);
            if (paymentMethod.customer !== req.user.stripe_customer_id) {
                throw new AppError('Unauthorized', 403);
            }

            await stripe.paymentMethods.detach(methodId);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    },

    // Get user's payment history
    async getPaymentHistory(req, res, next) {
        try {
            const [payments] = await pool.query(
                `SELECT o.id as order_id, o.total_amount, o.payment_status, o.payment_intent_id, 
                 o.created_at, o.updated_at 
                 FROM orders o 
                 WHERE o.user_id = ? 
                 AND o.payment_status IS NOT NULL 
                 ORDER BY o.created_at DESC`,
                [req.user.id]
            );

            res.json({ payments });
        } catch (error) {
            next(error);
        }
    }
};

// Helper function to handle successful payment webhook
async function handlePaymentSuccess(paymentIntent) {
    await pool.query(
        'UPDATE orders SET payment_status = "paid", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [paymentIntent.metadata.orderId]
    );
}

// Helper function to handle failed payment webhook
async function handlePaymentFailure(paymentIntent) {
    await pool.query(
        'UPDATE orders SET payment_status = "failed", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [paymentIntent.metadata.orderId]
    );
}

export default paymentController;