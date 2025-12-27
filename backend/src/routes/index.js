import express from 'express';
import userRoutes from './user.routes.js';
import productRoutes from './product.routes.js';
import orderRoutes from './order.routes.js';
import reviewRoutes from './review.routes.js';
import promotionRoutes from './promotion.routes.js';
import supportRoutes from './support.routes.js';
import shippingRoutes from './shipping.routes.js';
import shopRoutes from './shop.routes.js';
import inventoryRoutes from './inventory.routes.js';
import cartRoutes from './cart.routes.js';
import wishlistRoutes from './wishlist.routes.js';
import walletRoutes from './wallet.routes.js';
import addressRoutes from './address.routes.js';
import paymentMethodRoutes from './payment-method.routes.js';
import notificationRoutes from './notification.routes.js';
import categoryRoutes from './category.routes.js';
import searchRoutes from './search.routes.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// ========== MOUNT ROUTES ==========

// Authentication routes (prefix: /api/auth)
router.use('/auth', userRoutes);

// User routes (prefix: /api/user)
router.use('/user', userRoutes);

// Customer feature routes
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/wallet', walletRoutes);
router.use('/addresses', addressRoutes);
router.use('/payment-methods', paymentMethodRoutes);
router.use('/notifications', notificationRoutes);
router.use('/search', searchRoutes);

// Order and transaction routes
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);

// Shop/Vendor routes
router.use('/shops', shopRoutes);

// Admin/Management routes
router.use('/promotions', promotionRoutes);
router.use('/support', supportRoutes);
router.use('/shipping', shippingRoutes);
router.use('/inventory', inventoryRoutes);

export default router;