import express from 'express';
import Stripe from 'stripe';
import paymentController from '../controllers/payment.controller.js';
import { auth } from '../middleware/auth.js';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_51SZYt3Gw8axsDWqh254AUU2OZxv5TYd52FRXGnlhSYfIGlxZXmQNny9mYr3XGg2QDJVh8BlHreR00a3jH3ypABSn00ADYe9WyH'; // Replace with your actual test key

const stripe = new Stripe(STRIPE_SECRET_KEY);

const router = express.Router()

router.post('/checkout', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Product Name',
                        images: ['https://example.com/image.jpg'],
                    },
                    unit_amount: 10000,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'http://localhost:666/api/payments/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:666/api/payments/cancel',
            
            // Add metadata to track the order
            metadata: {
                order_id: '123', // Add your order ID here
                user_id: 'user_123' // Add user ID if available
            },
            
            // Add customer email if available
            customer_email: req.body.email || "buyer1@gmail.com",
            
            // Enable automatic tax if needed
            automatic_tax: { enabled: false },
        });
        
        console.log('Checkout session created:', session.id);
        
        // Redirect to Stripe checkout
        res.redirect(303, session.url);
        
    } catch (error) {
        console.error('Error creating checkout session:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        }
    }
});

router.get('/success', async (req, res) => {
    try {
        const { session_id } = req.query;
        
        if (!session_id) {
            return res.send('Payment successful! Thank you for your purchase.');
        }
        
        // Retrieve the session to check payment status
        const session = await stripe.checkout.sessions.retrieve(session_id);
        
        console.log('Payment successful! Session:', {
            id: session.id,
            payment_status: session.payment_status,
            amount_total: session.amount_total,
            customer: session.customer_details
        });
        
        if (session.payment_status === 'paid') {
            // Here you should update your database order status
            res.send(`
                <h1>Payment Successful!</h1>
                <p>Thank you for your purchase of $${session.amount_total / 100}.</p>
                <p>Order ID: ${session.metadata?.order_id || 'N/A'}</p>
            `);
        } else {
            res.send('Payment is processing. We will notify you when it\'s complete.');
        }
        
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.send('Payment successful! Thank you for your purchase.');
    }
});


router.get('/cancel', (req, res) => {
    console.log('Payment canceled by user.', req.query);
   // res.send('Payment canceled. You can try again.');
     REMOVE: res.redirect('/'); // This causes double response
});
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
   // auth,
    paymentController.getPaymentMethods
);



router.post(
    '/methods',
    auth,
    paymentController.addPaymentMethod
);


// // Payment history
// router.get(
//     '/history',
//     auth,
//     paymentController.getPaymentHistory
// );

export default router;