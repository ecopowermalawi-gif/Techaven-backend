# Techaven API Quick Reference

**Base URL:** `/api`

---

## Authentication Routes (`/auth`)

| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| POST | `/auth/register` | No | Register new user account |
| POST | `/auth/login` | No | Login and get OTP |
| POST | `/auth/verify-otp` | No | Verify OTP for signup/login/password-reset |
| POST | `/auth/resend-otp` | No | Resend OTP to email |
| POST | `/auth/forgot-password` | No | Request password reset OTP |
| POST | `/auth/reset-password` | No | Reset password with OTP |
| POST | `/auth/refresh-token` | No | Get new access token |
| POST | `/auth/logout` | Yes | Logout and invalidate tokens |

---

## User Management Routes (`/user`)

| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| GET | `/user/profile` | Yes | Get current user profile |
| PUT | `/user/profile` | Yes | Update user profile |
| POST | `/user/avatar` | Yes | Upload user avatar |
| PUT | `/user/password` | Yes | Change password |
| DELETE | `/user/account` | Yes | Delete user account |

---

## Products Routes (`/products`)

| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| GET | `/products/` | No | Get all products (paginated) |
| GET | `/products/featured` | No | Get featured products |
| GET | `/products/hot-sales` | No | Get hot sale products |
| GET | `/products/special-offers` | No | Get special offer products |
| GET | `/products/new-arrivals` | No | Get new arrival products |
| GET | `/products/search` | No | Search products |
| GET | `/products/{id}` | No | Get single product |
| GET | `/products/{id}/reviews` | No | Get product reviews |
| POST | `/products/{id}/reviews` | Yes | Add product review |
| POST | `/products/` | Yes (Seller/Admin) | Create product |
| PUT | `/products/{id}` | Yes (Seller/Admin) | Update product |
| DELETE | `/products/{id}` | Yes (Seller/Admin) | Delete product |
| PUT | `/products/{id}/stock` | Yes (Seller) | Update stock |

---

## Categories Routes (`/categories`)

| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| GET | `/categories/` | No | Get all categories |
| GET | `/categories/{id}/products` | No | Get category products |
| POST | `/categories/` | Yes (Admin) | Create category |
| PUT | `/categories/{id}` | Yes (Admin) | Update category |
| DELETE | `/categories/{id}` | Yes (Admin) | Delete category |

---

## Cart Routes (`/cart`)

| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| GET | `/cart/` | Yes | Get user cart |
| POST | `/cart/items` | Yes | Add item to cart |
| PUT | `/cart/items/{itemId}` | Yes | Update cart item |
| DELETE | `/cart/items/{itemId}` | Yes | Remove cart item |
| DELETE | `/cart/` | Yes | Clear cart |

---

## Wishlist Routes (`/wishlist`)

| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| GET | `/wishlist/` | Yes | Get wishlist |
| POST | `/wishlist/` | Yes | Add to wishlist |
| DELETE | `/wishlist/{productId}` | Yes | Remove from wishlist |

---

## Orders Routes (`/orders`)

| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| POST | `/orders/` | Yes | Create order |
| GET | `/orders/` | Yes | Get user orders |
| GET | `/orders/{id}` | Yes | Get order details |
| POST | `/orders/{id}/cancel` | Yes | Cancel order |
| GET | `/orders/admin/all` | Yes (Admin) | Get all orders |
| PUT | `/orders/admin/{id}/status` | Yes (Admin) | Update order status |

---

## Wallet Routes (`/wallet`)

| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| GET | `/wallet/` | Yes | Get wallet balance |
| GET | `/wallet/transactions` | Yes | Get transactions |
| POST | `/wallet/topup` | Yes | Top up wallet |

---

## Address Routes (`/addresses`)

| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| GET | `/addresses/` | Yes | Get user addresses |
| POST | `/addresses/` | Yes | Add address |
| PUT | `/addresses/{id}` | Yes | Update address |
| DELETE | `/addresses/{id}` | Yes | Delete address |
| POST | `/addresses/{id}/default` | Yes | Set default address |

---

## Payment Methods Routes (`/payment-methods`)

| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| GET | `/payment-methods/` | Yes | Get payment methods |
| POST | `/payment-methods/` | Yes | Add payment method |
| DELETE | `/payment-methods/{id}` | Yes | Delete payment method |

---

## Notifications Routes (`/notifications`)

| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| GET | `/notifications/` | Yes | Get notifications |
| POST | `/notifications/{id}/read` | Yes | Mark as read |
| POST | `/notifications/read-all` | Yes | Mark all as read |
| POST | `/notifications/register-device` | Yes | Register push device |

---

## Shops Routes (`/shops`)

| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| GET | `/shops/` | No | Get all shops |
| GET | `/shops/{id}` | No | Get shop details |
| GET | `/shops/{id}/products` | No | Get shop products |
| POST | `/shops/` | Yes (Seller/Admin) | Create shop |
| PUT | `/shops/{id}` | Yes (Seller/Admin) | Update shop |
| DELETE | `/shops/{id}` | Yes (Seller/Admin) | Delete shop |

---

## Search Routes (`/search`)

| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| GET | `/search/?q=query` | No | Search products |
| GET | `/search/suggestions?q=query` | No | Get search suggestions |

---

## Common Query Parameters

### Pagination:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

### Filtering & Sorting (Products):
- `sort` - Sort field (name, price, created_at, rating)
- `order` - Sort order (asc, desc)
- `category_id` - Filter by category
- `min_price` - Minimum price
- `max_price` - Maximum price
- `vendor_id` - Filter by vendor

---

## Authentication Headers

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

---

## Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... }
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## Rate Limiting

- General endpoints: 100 requests/minute
- Auth endpoints: 10 requests/minute
- Search: 30 requests/minute

---

**Last Updated:** December 26, 2025
