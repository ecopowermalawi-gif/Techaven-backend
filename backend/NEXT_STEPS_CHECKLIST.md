# Next Steps & Validation Checklist

**Date:** December 26, 2025  
**Status:** Route structure implemented - Controllers & Services partially complete

---

## Current Implementation Status

✅ **Completed:**
- Route structure (all customer-facing routes)
- Route mounting and prefix configuration
- Basic controller scaffolds for new features
- Service layer implementations for:
  - Cart management
  - Wishlist management
  - Wallet operations
  - Address management
  - Payment methods
  - Search functionality

⚠️ **Partially Complete:**
- Notification routes (routes created, controller needs implementation)
- User avatar upload (route created, controller needs implementation)
- Payment method listing with available providers

❌ **Not Implemented (left as-is per instructions):**
- Help/Support routes (use existing support route)
- Shipping integration details
- Payment processing (Stripe/Mpamba integration)
- Email notifications

---

## Database Schema Changes Required

### New Tables to Create:

```sql
-- Cart Management
CREATE TABLE IF NOT EXISTS carts (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE,
  INDEX idx_cart_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cart_items (
  id CHAR(36) NOT NULL PRIMARY KEY,
  cart_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cart_item_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_item_product FOREIGN KEY (product_id) REFERENCES catalog_products(id) ON DELETE CASCADE,
  INDEX idx_cart_item_cart (cart_id),
  INDEX idx_cart_item_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_product FOREIGN KEY (product_id) REFERENCES catalog_products(id) ON DELETE CASCADE,
  UNIQUE KEY ux_wishlist_user_product (user_id, product_id),
  INDEX idx_wishlist_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wallet
CREATE TABLE IF NOT EXISTS wallets (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL UNIQUE,
  balance DECIMAL(15,2) DEFAULT 0,
  currency CHAR(3) DEFAULT 'MWK',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  type ENUM('credit', 'debit', 'pending_topup') NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description VARCHAR(255),
  reference VARCHAR(255),
  balance_after DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_wallet_txn_user FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE,
  INDEX idx_wallet_txn_user (user_id),
  INDEX idx_wallet_txn_type (type),
  INDEX idx_wallet_txn_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment Methods
CREATE TABLE IF NOT EXISTS user_payment_methods (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  type VARCHAR(50) NOT NULL,
  provider VARCHAR(100),
  phone_number VARCHAR(30),
  is_default TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_method_user FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE,
  INDEX idx_payment_method_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Validation Rules to Add

Update [src/middleware/validation.js](src/middleware/validation.js) with:

```javascript
// Cart validation rules
export const cartValidationRules = {
  addItem: [
    body('product_id').notEmpty().isUUID(),
    body('quantity').isInt({ min: 1, max: 1000 })
  ],
  updateItem: [
    body('quantity').isInt({ min: 1, max: 1000 })
  ]
};

// Wishlist validation
export const wishlistValidationRules = {
  addItem: [
    body('product_id').notEmpty().isUUID()
  ]
};

// Wallet validation
export const walletValidationRules = {
  topup: [
    body('amount').isInt({ min: 1000 }),
    body('payment_method').notEmpty().isIn(['mobile_money', 'bank_transfer']),
    body('phone_number').optional().isMobilePhone()
  ]
};

// Address validation
export const addressValidationRules = {
  create: [
    body('label').notEmpty().isLength({ min: 2, max: 50 }),
    body('full_name').notEmpty().isLength({ min: 2 }),
    body('phone').notEmpty().isMobilePhone(),
    body('address_line_1').notEmpty(),
    body('city').notEmpty(),
    body('country').notEmpty()
  ],
  update: [ /* same as create */ ]
};

// Payment method validation
export const paymentMethodValidationRules = {
  create: [
    body('type').notEmpty().isIn(['mobile_money', 'bank_transfer']),
    body('provider').notEmpty(),
    body('phone_number').optional().isMobilePhone()
  ]
};

// Notification validation
export const notificationValidationRules = {
  registerDevice: [
    body('device_token').notEmpty().isLength({ min: 10 }),
    body('platform').notEmpty().isIn(['android', 'ios', 'web'])
  ]
};

// Search validation
export const searchValidationRules = {
  search: [
    query('q').notEmpty().isLength({ min: 1, max: 100 })
  ],
  suggestions: [
    query('q').notEmpty().isLength({ min: 2, max: 100 })
  ]
};

// Order validation
export const orderValidationRules = {
  create: [
    body('shipping_address_id').notEmpty().isUUID(),
    body('payment_method_id').optional(),
    body('notes').optional().isLength({ max: 500 })
  ],
  cancel: [
    body('reason').notEmpty().isLength({ min: 5, max: 500 })
  ],
  updateStatus: [
    body('status').notEmpty().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
  ]
};
```

---

## Controllers to Complete

### 1. Notification Controller
**File:** [src/controllers/notification.controller.js](src/controllers/notification.controller.js)

Implement:
- `getNotifications(req, res, next)` - Get paginated notifications with unread count
- `markAsRead(req, res, next)` - Mark single notification as read
- `markAllAsRead(req, res, next)` - Mark all notifications as read
- `registerDevice(req, res, next)` - Register device for push notifications

### 2. User Avatar Upload
**File:** [src/controllers/user.controller.js](src/controllers/user.controller.js)

Update existing controller with:
- `uploadAvatar(req, res, next)` - Handle avatar file upload and storage

---

## Services to Complete

### 1. Notification Service
**File:** [src/services/notification.service.js](src/services/notification.service.js)

Implement methods for managing notifications in the `notification_notifications` table.

### 2. Update Existing Services

- **user.service.js** - Add avatar upload handling
- **order.service.js** - Update to use new order response format from API docs
- **product.service.js** - Add methods for featured/hot-sales/new arrivals filtering

---

## Testing Endpoints

### Pre-Implementation Test Checklist:

1. **Database**
   - [ ] Run migration scripts to create new tables
   - [ ] Verify table relationships and constraints
   - [ ] Check indexes are created

2. **Route Registration**
   - [ ] Verify all routes mounted correctly in main router
   - [ ] Test health check endpoint: `GET /api/health`
   - [ ] Verify no route conflicts

3. **Authentication**
   - [ ] Test register endpoint: `POST /api/auth/register`
   - [ ] Test login endpoint: `POST /api/auth/login`
   - [ ] Test OTP verification: `POST /api/auth/verify-otp`
   - [ ] Test token refresh: `POST /api/auth/refresh-token`

4. **Cart Operations**
   - [ ] Add to cart: `POST /api/cart/items`
   - [ ] Get cart: `GET /api/cart`
   - [ ] Update quantity: `PUT /api/cart/items/{id}`
   - [ ] Remove item: `DELETE /api/cart/items/{id}`
   - [ ] Clear cart: `DELETE /api/cart`

5. **Wishlist Operations**
   - [ ] Add to wishlist: `POST /api/wishlist`
   - [ ] Get wishlist: `GET /api/wishlist`
   - [ ] Remove from wishlist: `DELETE /api/wishlist/{productId}`

6. **Wallet Operations**
   - [ ] Get balance: `GET /api/wallet`
   - [ ] Get transactions: `GET /api/wallet/transactions`
   - [ ] Topup wallet: `POST /api/wallet/topup`

7. **Address Management**
   - [ ] Create address: `POST /api/addresses`
   - [ ] Get addresses: `GET /api/addresses`
   - [ ] Update address: `PUT /api/addresses/{id}`
   - [ ] Set default: `POST /api/addresses/{id}/default`
   - [ ] Delete address: `DELETE /api/addresses/{id}`

8. **Payment Methods**
   - [ ] Get methods: `GET /api/payment-methods`
   - [ ] Add method: `POST /api/payment-methods`
   - [ ] Delete method: `DELETE /api/payment-methods/{id}`

9. **Search**
   - [ ] Search products: `GET /api/search?q=iphone`
   - [ ] Get suggestions: `GET /api/search/suggestions?q=ip`

10. **Orders**
    - [ ] Create order: `POST /api/orders`
    - [ ] Get orders: `GET /api/orders`
    - [ ] Get order details: `GET /api/orders/{id}`
    - [ ] Cancel order: `POST /api/orders/{id}/cancel`

---

## API Documentation

### Reference Documents Created:
1. [IMPLEMENTATION_SUMMARY_API_ROUTES.md](IMPLEMENTATION_SUMMARY_API_ROUTES.md) - Detailed implementation summary
2. [API_ENDPOINTS_REFERENCE.md](API_ENDPOINTS_REFERENCE.md) - Quick reference for all endpoints

### Mobile App Integration:
- Base URL: `https://api.techaven.mw` (production) or `http://localhost:3000/api` (development)
- All requests require `Content-Type: application/json`
- Include `Authorization: Bearer <token>` header for protected endpoints

---

## Deployment Considerations

1. **Environment Variables:**
   - Verify JWT_SECRET is set
   - Configure database credentials
   - Set NODE_ENV=production
   - Configure email service (Mailtrap/SendGrid)
   - Setup payment gateway credentials (Stripe/Mpamba)

2. **SSL/TLS:**
   - Ensure HTTPS is enforced
   - Use valid SSL certificates
   - Configure CORS properly

3. **Database:**
   - Run all migration scripts
   - Create backups
   - Setup replication/failover

4. **Monitoring:**
   - Setup error logging (Sentry/LogRocket)
   - Monitor API performance
   - Track user analytics

---

## Performance Optimization

1. **Caching:**
   - ✅ Product listings cached for 5 minutes
   - ✅ Categories cached
   - ✅ Search results cached
   - TODO: Implement Redis for session caching

2. **Database:**
   - ✅ Proper indexing on foreign keys
   - TODO: Query optimization for complex joins
   - TODO: Implement database connection pooling tuning

3. **API:**
   - TODO: Implement rate limiting per user
   - TODO: Add request/response compression
   - TODO: Implement pagination validation

---

## Security Checklist

- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] CSRF protection
- [ ] Rate limiting enabled
- [ ] Password hashing (bcrypt)
- [ ] JWT token expiration
- [ ] HTTPS enforcement
- [ ] CORS configuration
- [ ] Request size limits
- [ ] File upload validation

---

## Known Issues & Workarounds

1. **Cart Persistence:**
   - Current implementation stores cart in database
   - Consider implementing cart recovery after session timeout

2. **Inventory Management:**
   - Stock checking needs to verify with reserved quantity
   - Update inventory_inventories table atomically

3. **Order Processing:**
   - Payment processing integration needed
   - Implement payment webhook handling

4. **Notifications:**
   - Push notification service integration pending
   - Consider Firebase Cloud Messaging (FCM) for mobile

---

## Timeline Estimate

- **Database Setup:** 1-2 hours
- **Validation Rules:** 2-3 hours
- **Complete Controllers:** 4-6 hours
- **Complete Services:** 4-6 hours
- **Testing:** 6-8 hours
- **Documentation:** 2-3 hours
- **Deployment:** 2-3 hours

**Total:** ~21-31 hours of development time

---

**Next Priority:** Create and run database migrations for new tables
