import Stripe from 'stripe';
import pool from '../config/database.js';
import { AppError } from '../utils/error.js';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ||'sk_test_51SZYt3Gw8axsDWqh254AUU2OZxv5TYd52FRXGnlhSYfIGlxZXmQNny9mYr3XGg2QDJVh8BlHreR00a3jH3ypABSn00ADYe9WyH'; // Replace with your actual test key  
const stripe = new Stripe(STRIPE_SECRET_KEY);

const paymentController = {
    // Create a payment intent with Stripe
    async createPaymentIntent(req, res, next) {
        try {
            const { amount, currency = 'usd', orderId } = req.body;

         

            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency,
                automatic_payment_methods: { enabled: true }, // Enable all relevant payment methods
                metadata: { 
                    orderId,
                    customerEmail: req.user.email,
                    customerName: req.user.name
                },
                receipt_email: req.user.email,
                customer: req.user.stripe_customer_id
            });

            // Store payment intent ID with the order
            await pool.query(
                'UPDATE orders SET payment_intent_id = ? WHERE id = ?',
                [paymentIntent.id, orderId]
            );

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
                'UPDATE orders SET payment_status = "paid", payment_intent_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [paymentIntentId, paymentIntent.metadata.orderId]
            );

            res.json({ success: true, paymentIntent });
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
                case 'charge.refunded':
                    await handleRefund(event.data.object);
                    break;
                case 'charge.dispute.created':
                    await handleDispute(event.data.object);
                    break;
                // Add other webhook events as needed
            }

            res.json({ received: true });
        } catch (error) {
            console.error('Webhook error:', error.message);
            return res.status(400).send(`Webhook Error: ${error.message}`);
        }
    },

    // Admin: Capture an authorized payment
    async capturePayment(req, res, next) {
        try {
            // Verify admin permissions
            if (!req.user.isAdmin) {
                throw new AppError('Unauthorized access', 403);
            }

            const { paymentIntentId, amount } = req.body;
            
            const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId, {
                amount_to_capture: amount ? Math.round(amount * 100) : undefined
            });

            // Update order status
            await pool.query(
                'UPDATE orders SET payment_status = "captured", updated_at = CURRENT_TIMESTAMP WHERE payment_intent_id = ?',
                [paymentIntentId]
            );

            res.json({ success: true, paymentIntent });
        } catch (error) {
            next(error);
        }
    },

    // Admin: Issue a refund
    async refundPayment(req, res, next) {
        try {
            // Verify admin permissions
            if (!req.user.isAdmin) {
                throw new AppError('Unauthorized access', 403);
            }

            const { paymentIntentId, amount, reason } = req.body;

            const refund = await stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount: amount ? Math.round(amount * 100) : undefined, // Full refund if no amount specified
                reason: reason || 'requested_by_customer'
            });

            // Update order status for partial or full refund
            const refundStatus = amount ? 'partially_refunded' : 'refunded';
            await pool.query(
                'UPDATE orders SET payment_status = ?, refund_id = ?, updated_at = CURRENT_TIMESTAMP WHERE payment_intent_id = ?',
                [refundStatus, refund.id, paymentIntentId]
            );

            res.json({ success: true, refund });
        } catch (error) {
            next(error);
        }
    },
    
    // Admin: View all payments with filtering options
    async getAllPayments(req, res, next) {
        try {
            // Verify admin permissions
            if (!req.user.isAdmin) {
                throw new AppError('Unauthorized access', 403);
            }

            const { status, startDate, endDate, limit = 50, page = 1 } = req.query;
            const offset = (page - 1) * limit;
            
            let query = `
                SELECT o.id as order_id, o.user_id, o.total_amount, o.payment_status, 
                o.payment_intent_id, o.refund_id, o.created_at, o.updated_at,
                u.email as customer_email, u.name as customer_name
                FROM orders o
                JOIN users u ON o.user_id = u.id
                WHERE o.payment_intent_id IS NOT NULL
            `;
            
            const params = [];
            
            if (status) {
                query += ' AND o.payment_status = ?';
                params.push(status);
            }
            
            if (startDate) {
                query += ' AND o.created_at >= ?';
                params.push(new Date(startDate));
            }
            
            if (endDate) {
                query += ' AND o.created_at <= ?';
                params.push(new Date(endDate));
            }
            
            query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
            params.push(parseInt(limit), offset);
            
            const [payments] = await pool.query(query, params);
            
            // Get total count for pagination
            const [countResult] = await pool.query(
                'SELECT COUNT(*) as total FROM orders WHERE payment_intent_id IS NOT NULL',
                []
            );
            
            res.json({
                payments,
                pagination: {
                    total: countResult[0].total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(countResult[0].total / limit)
                }
            });
        } catch (error) {
            next(error);
        }
    },
    
    // Admin: Get payment details including customer info
    async getPaymentDetails(req, res, next) {
        try {
            // Verify admin permissions
            if (!req.user.isAdmin) {
                throw new AppError('Unauthorized access', 403);
            }

            const { paymentIntentId } = req.params;
            
            // Get order details from database
            const [orders] = await pool.query(
                `SELECT o.*, u.email as customer_email, u.name as customer_name 
                 FROM orders o
                 JOIN users u ON o.user_id = u.id
                 WHERE o.payment_intent_id = ?`,
                [paymentIntentId]
            );
            
            if (!orders.length) {
                throw new AppError('Payment not found', 404);
            }
            
            // Get payment details from Stripe
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
                expand: ['payment_method', 'latest_charge', 'latest_charge.refunds']
            });
            
            // Get order items
            const [orderItems] = await pool.query(
                `SELECT oi.*, p.name as product_name 
                 FROM order_items oi
                 JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = ?`,
                [orders[0].id]
            );
            
            res.json({
                order: orders[0],
                orderItems,
                paymentIntent
            });
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
                    name: req.user.name,
                    payment_method: paymentMethodId,
                    metadata: {
                        user_id: req.user.id
                    }
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
            
            // Set as default payment method
            await stripe.customers.update(req.user.stripe_customer_id, {
                invoice_settings: {
                    default_payment_method: paymentMethodId
                }
            });

            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    },

    // Admin: Generate payment reports
    async generatePaymentReport(req, res, next) {
        try {
            // Verify admin permissions
            if (!req.user.isAdmin) {
                throw new AppError('Unauthorized access', 403);
            }
            
            const { startDate, endDate } = req.query;
            
            if (!startDate || !endDate) {
                throw new AppError('Start date and end date are required', 400);
            }
            
            // Get payment summary
            const [summary] = await pool.query(
                `SELECT 
                    COUNT(*) as total_transactions,
                    SUM(CASE WHEN payment_status = 'paid' OR payment_status = 'captured' THEN total_amount ELSE 0 END) as total_revenue,
                    SUM(CASE WHEN payment_status = 'refunded' OR payment_status = 'partially_refunded' THEN total_amount ELSE 0 END) as total_refunded,
                    COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as failed_payments
                FROM orders
                WHERE created_at BETWEEN ? AND ?`,
                [new Date(startDate), new Date(endDate)]
            );
            
            // Get payment breakdown by day
            const [dailyBreakdown] = await pool.query(
                `SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as transactions,
                    SUM(total_amount) as revenue
                FROM orders
                WHERE created_at BETWEEN ? AND ?
                    AND (payment_status = 'paid' OR payment_status = 'captured')
                GROUP BY DATE(created_at)
                ORDER BY date`,
                [new Date(startDate), new Date(endDate)]
            );
            
            res.json({
                summary: summary[0],
                dailyBreakdown
            });
        } catch (error) {
            next(error);
        }
    }
};

// Helper function to handle successful payment webhook
async function handlePaymentSuccess(paymentIntent) {
    await pool.query(
        'UPDATE orders SET payment_status = "paid", updated_at = CURRENT_TIMESTAMP WHERE payment_intent_id = ?',
        [paymentIntent.id]
    );
    
    // Additional business logic like sending confirmation emails, updating inventory, etc.
}

// Helper function to handle failed payment webhook
async function handlePaymentFailure(paymentIntent) {
    await pool.query(
        'UPDATE orders SET payment_status = "failed", updated_at = CURRENT_TIMESTAMP WHERE payment_intent_id = ?',
        [paymentIntent.id]
    );
    
    // Additional notification logic
}

// Helper function to handle refund webhook
async function handleRefund(charge) {
    const paymentIntentId = charge.payment_intent;
    const refundStatus = charge.refunded ? 'refunded' : 'partially_refunded';
    
    await pool.query(
        'UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE payment_intent_id = ?',
        [refundStatus, paymentIntentId]
    );
}

// Helper function to handle dispute webhook
async function handleDispute(charge) {
    const paymentIntentId = charge.payment_intent;
    
    await pool.query(
        'UPDATE orders SET payment_status = "disputed", updated_at = CURRENT_TIMESTAMP WHERE payment_intent_id = ?',
        [paymentIntentId]
    );
    
    // Alert administrators about the dispute
}

export default paymentController;