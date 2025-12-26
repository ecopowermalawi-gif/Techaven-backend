# Techaven API Documentation

**Base URL:** `https://api.techaven.mw`

**Content-Type:** `application/json`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [User Management](#2-user-management)
3. [Products](#3-products)
4. [Categories](#4-categories)
5. [Cart](#5-cart)
6. [Orders](#6-orders)
7. [Wishlist / Liked Items](#7-wishlist--liked-items)
8. [Wallet](#8-wallet)
9. [Shipping Addresses](#9-shipping-addresses)
10. [Payment Methods](#10-payment-methods)
11. [Notifications](#11-notifications)
12. [Shops / Vendors](#12-shops--vendors)
13. [Search](#13-search)
14. [Help & Support](#14-help--support)
15. [Response Format](#15-response-format)
16. [Error Codes](#16-error-codes)

---

## 1. Authentication

### 1.1 Register (Sign Up)

Creates a new user account and sends OTP to email for verification.

**Endpoint:** `POST /api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**
- `full_name`: Required, min 2 words
- `email`: Required, valid email format, unique
- `password`: Required, min 6 characters

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent to email",
  "data": {
    "user_id": "usr_123456",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `400` - Validation error
- `409` - Email already registered

---

### 1.2 Login (Sign In)

Authenticates user and sends OTP for 2FA verification.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent to email",
  "data": {
    "user_id": "usr_123456",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `401` - Invalid email or password
- `403` - Account suspended/deactivated

---

### 1.3 Verify OTP

Verifies OTP for signup, login, or password reset.

**Endpoint:** `POST /api/auth/verify-otp`

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "type": "signup"
}
```

**OTP Types:**
- `signup` - New user registration
- `login` - Login verification
- `password_reset` - Password reset verification

**Success Response for signup/login (200):**
```json
{
  "success": true,
  "message": "Verification successful",
  "data": {
    "user": {
      "id": "usr_123456",
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": null,
      "avatar_url": null,
      "created_at": "2024-01-15T10:30:00Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
```

**Success Response for password_reset (200):**
```json
{
  "success": true,
  "message": "OTP verified",
  "data": {
    "reset_token": "rst_abc123xyz"
  }
}
```

**Error Responses:**
- `400` - Invalid or expired OTP
- `429` - Too many attempts

---

### 1.4 Resend OTP

Resends OTP to user's email.

**Endpoint:** `POST /api/auth/resend-otp`

**Request Body:**
```json
{
  "email": "john@example.com",
  "type": "signup"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `429` - Rate limit exceeded (wait before resending)

---

### 1.5 Forgot Password

Initiates password reset flow by sending OTP.

**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset OTP sent",
  "data": {
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `404` - Email not found

---

### 1.6 Reset Password

Sets new password after OTP verification.

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "email": "john@example.com",
  "reset_token": "rst_abc123xyz",
  "new_password": "newSecurePassword456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": null
}
```

**Error Responses:**
- `400` - Invalid or expired reset token
- `422` - Password does not meet requirements

---

### 1.7 Refresh Token

Gets new access token using refresh token.

**Endpoint:** `POST /api/auth/refresh-token`

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
```

**Error Responses:**
- `401` - Invalid or expired refresh token

---

### 1.8 Logout

Invalidates current tokens.

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:** None

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

---

## 2. User Management

### 2.1 Get User Profile

**Endpoint:** `GET /api/user/profile`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved",
  "data": {
    "id": "usr_123456",
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+265991234567",
    "avatar_url": "https://api.techaven.mw/storage/avatars/usr_123456.jpg",
    "date_of_birth": "1990-05-15",
    "gender": "male",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:00:00Z"
  }
}
```

---

### 2.2 Update User Profile

**Endpoint:** `PUT /api/user/profile`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "full_name": "John Smith",
  "phone": "+265991234567",
  "date_of_birth": "1990-05-15",
  "gender": "male"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "usr_123456",
    "full_name": "John Smith",
    "email": "john@example.com",
    "phone": "+265991234567",
    "avatar_url": null,
    "date_of_birth": "1990-05-15",
    "gender": "male",
    "updated_at": "2024-01-20T14:00:00Z"
  }
}
```

---

### 2.3 Upload Avatar

**Endpoint:** `POST /api/user/avatar`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body:**
```
avatar: <image file> (max 5MB, jpg/png/webp)
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatar_url": "https://api.techaven.mw/storage/avatars/usr_123456.jpg"
  }
}
```

---

### 2.4 Change Password

**Endpoint:** `PUT /api/user/password`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "current_password": "oldPassword123",
  "new_password": "newPassword456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null
}
```

**Error Responses:**
- `400` - Current password is incorrect

---

### 2.5 Delete Account

**Endpoint:** `DELETE /api/user/account`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "password": "currentPassword123",
  "reason": "No longer using the app"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Account deleted successfully",
  "data": null
}
```

---

## 3. Products

### 3.1 Get All Products

**Endpoint:** `GET /api/products`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number (default: 1) |
| `limit` | int | Items per page (default: 20, max: 100) |
| `sort` | string | Sort field: `name`, `price`, `created_at`, `rating` |
| `order` | string | Sort order: `asc`, `desc` |
| `category_id` | int | Filter by category |
| `min_price` | number | Minimum price filter |
| `max_price` | number | Maximum price filter |
| `vendor_id` | string | Filter by vendor/shop |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Products retrieved",
  "data": {
    "products": [
      {
        "id": 1,
        "name": "iPhone 14 Pro",
        "slug": "iphone-14-pro",
        "description": "Latest iPhone with Dynamic Island...",
        "price": 1299000,
        "original_price": 1499000,
        "discount_percentage": 13,
        "currency": "MWK",
        "category_id": 1,
        "category_name": "Phones",
        "vendor_id": "vnd_123",
        "vendor_name": "TechStore MW",
        "stock_quantity": 25,
        "is_in_stock": true,
        "rating": 4.8,
        "review_count": 156,
        "images": [
          "https://api.techaven.mw/storage/products/iphone14pro_1.jpg",
          "https://api.techaven.mw/storage/products/iphone14pro_2.jpg"
        ],
        "thumbnail": "https://api.techaven.mw/storage/products/iphone14pro_thumb.jpg",
        "specifications": {
          "brand": "Apple",
          "model": "iPhone 14 Pro",
          "storage": "256GB",
          "color": "Deep Purple"
        },
        "is_featured": true,
        "is_hot_sale": false,
        "is_new_arrival": true,
        "created_at": "2024-01-10T08:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_items": 200,
      "items_per_page": 20,
      "has_next": true,
      "has_previous": false
    }
  }
}
```

---

### 3.2 Get Single Product

**Endpoint:** `GET /api/products/{product_id}`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product retrieved",
  "data": {
    "id": 1,
    "name": "iPhone 14 Pro",
    "slug": "iphone-14-pro",
    "description": "Latest iPhone with Dynamic Island, A16 Bionic chip, and 48MP camera system.",
    "price": 1299000,
    "original_price": 1499000,
    "discount_percentage": 13,
    "currency": "MWK",
    "category_id": 1,
    "category_name": "Phones",
    "vendor": {
      "id": "vnd_123",
      "name": "TechStore MW",
      "logo_url": "https://api.techaven.mw/storage/vendors/techstore_logo.jpg",
      "rating": 4.7,
      "location": "Lilongwe"
    },
    "stock_quantity": 25,
    "is_in_stock": true,
    "rating": 4.8,
    "review_count": 156,
    "images": [
      "https://api.techaven.mw/storage/products/iphone14pro_1.jpg",
      "https://api.techaven.mw/storage/products/iphone14pro_2.jpg",
      "https://api.techaven.mw/storage/products/iphone14pro_3.jpg",
      "https://api.techaven.mw/storage/products/iphone14pro_4.jpg"
    ],
    "thumbnail": "https://api.techaven.mw/storage/products/iphone14pro_thumb.jpg",
    "specifications": {
      "brand": "Apple",
      "model": "iPhone 14 Pro",
      "storage": "256GB",
      "color": "Deep Purple",
      "display": "6.1-inch Super Retina XDR",
      "processor": "A16 Bionic",
      "camera": "48MP + 12MP + 12MP",
      "battery": "3200mAh",
      "warranty": "1 Year"
    },
    "related_products": [1, 2, 5, 8],
    "created_at": "2024-01-10T08:00:00Z",
    "updated_at": "2024-01-15T12:00:00Z"
  }
}
```

**Error Responses:**
- `404` - Product not found

---

### 3.3 Get Featured Products

**Endpoint:** `GET /api/products/featured`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | int | Number of products (default: 10) |

**Success Response (200):** Same format as Get All Products

---

### 3.4 Get Hot Sales

**Endpoint:** `GET /api/products/hot-sales`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | int | Number of products (default: 10) |

**Success Response (200):** Same format as Get All Products

---

### 3.5 Get Special Offers

**Endpoint:** `GET /api/products/special-offers`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | int | Number of products (default: 10) |

**Success Response (200):** Same format as Get All Products

---

### 3.6 Get New Arrivals

**Endpoint:** `GET /api/products/new-arrivals`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | int | Number of products (default: 10) |

**Success Response (200):** Same format as Get All Products

---

### 3.7 Get Product Reviews

**Endpoint:** `GET /api/products/{product_id}/reviews`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number (default: 1) |
| `limit` | int | Items per page (default: 10) |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Reviews retrieved",
  "data": {
    "reviews": [
      {
        "id": "rev_123",
        "user": {
          "id": "usr_456",
          "full_name": "Jane Doe",
          "avatar_url": "https://api.techaven.mw/storage/avatars/usr_456.jpg"
        },
        "rating": 5,
        "title": "Amazing phone!",
        "comment": "Best phone I've ever owned. The camera is incredible.",
        "images": [
          "https://api.techaven.mw/storage/reviews/rev_123_1.jpg"
        ],
        "is_verified_purchase": true,
        "helpful_count": 12,
        "created_at": "2024-01-18T16:30:00Z"
      }
    ],
    "summary": {
      "average_rating": 4.8,
      "total_reviews": 156,
      "rating_breakdown": {
        "5": 120,
        "4": 25,
        "3": 8,
        "2": 2,
        "1": 1
      }
    },
    "pagination": {
      "current_page": 1,
      "total_pages": 16,
      "total_items": 156,
      "items_per_page": 10
    }
  }
}
```

---

### 3.8 Add Product Review

**Endpoint:** `POST /api/products/{product_id}/reviews`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "rating": 5,
  "title": "Amazing phone!",
  "comment": "Best phone I've ever owned.",
  "images": ["base64_encoded_image_1", "base64_encoded_image_2"]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "id": "rev_789",
    "rating": 5,
    "title": "Amazing phone!",
    "comment": "Best phone I've ever owned.",
    "created_at": "2024-01-20T10:00:00Z"
  }
}
```

---

## 4. Categories

### 4.1 Get All Categories

**Endpoint:** `GET /api/categories`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Categories retrieved",
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Phones",
        "slug": "phones",
        "description": "Smartphones and mobile devices",
        "icon": "smartphone",
        "image_url": "https://api.techaven.mw/storage/categories/phones.jpg",
        "product_count": 45,
        "is_featured": true,
        "parent_id": null,
        "subcategories": [
          {
            "id": 10,
            "name": "Android Phones",
            "slug": "android-phones",
            "product_count": 30
          },
          {
            "id": 11,
            "name": "iPhones",
            "slug": "iphones",
            "product_count": 15
          }
        ]
      },
      {
        "id": 2,
        "name": "Laptops",
        "slug": "laptops",
        "description": "Notebooks and laptops",
        "icon": "laptop",
        "image_url": "https://api.techaven.mw/storage/categories/laptops.jpg",
        "product_count": 38,
        "is_featured": true,
        "parent_id": null,
        "subcategories": []
      }
    ]
  }
}
```

---

### 4.2 Get Category Products

**Endpoint:** `GET /api/categories/{category_id}/products`

**Query Parameters:** Same as Get All Products

**Success Response (200):** Same format as Get All Products

---

## 5. Cart

### 5.1 Get Cart

**Endpoint:** `GET /api/cart`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cart retrieved",
  "data": {
    "id": "cart_123",
    "items": [
      {
        "id": "item_456",
        "product_id": 1,
        "product_name": "iPhone 14 Pro",
        "product_image": "https://api.techaven.mw/storage/products/iphone14pro_thumb.jpg",
        "unit_price": 1299000,
        "quantity": 1,
        "subtotal": 1299000,
        "is_available": true
      },
      {
        "id": "item_789",
        "product_id": 5,
        "product_name": "AirPods Pro",
        "product_image": "https://api.techaven.mw/storage/products/airpodspro_thumb.jpg",
        "unit_price": 299000,
        "quantity": 2,
        "subtotal": 598000,
        "is_available": true
      }
    ],
    "summary": {
      "subtotal": 1897000,
      "discount": 0,
      "shipping": 5000,
      "tax": 0,
      "total": 1902000,
      "currency": "MWK",
      "item_count": 3
    }
  }
}
```

---

### 5.2 Add to Cart

**Endpoint:** `POST /api/cart/items`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 1
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "item_id": "item_456",
    "cart_item_count": 3
  }
}
```

**Error Responses:**
- `400` - Product out of stock
- `409` - Item already in cart (use update instead)

---

### 5.3 Update Cart Item

**Endpoint:** `PUT /api/cart/items/{item_id}`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "quantity": 2
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cart item updated",
  "data": {
    "item_id": "item_456",
    "quantity": 2,
    "subtotal": 2598000
  }
}
```

---

### 5.4 Remove from Cart

**Endpoint:** `DELETE /api/cart/items/{item_id}`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Item removed from cart",
  "data": {
    "cart_item_count": 2
  }
}
```

---

### 5.5 Clear Cart

**Endpoint:** `DELETE /api/cart`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cart cleared",
  "data": null
}
```

---

## 6. Orders

### 6.1 Create Order

**Endpoint:** `POST /api/orders`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "shipping_address_id": "addr_123",
  "payment_method_id": "pm_456",
  "notes": "Please call before delivery",
  "coupon_code": "SAVE10"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "order_id": "ord_789",
    "order_number": "TH-2024-0001",
    "status": "pending",
    "total": 1902000,
    "currency": "MWK",
    "payment_url": "https://payment.techaven.mw/pay/ord_789",
    "created_at": "2024-01-20T10:30:00Z"
  }
}
```

---

### 6.2 Get Orders

**Endpoint:** `GET /api/orders`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number |
| `limit` | int | Items per page |
| `status` | string | Filter: `pending`, `processing`, `shipped`, `delivered`, `cancelled` |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Orders retrieved",
  "data": {
    "orders": [
      {
        "id": "ord_789",
        "order_number": "TH-2024-0001",
        "status": "delivered",
        "status_label": "Delivered",
        "items": [
          {
            "product_id": 1,
            "product_name": "iPhone 14 Pro",
            "product_image": "https://api.techaven.mw/storage/products/iphone14pro_thumb.jpg",
            "quantity": 1,
            "unit_price": 1299000
          }
        ],
        "item_count": 1,
        "subtotal": 1299000,
        "shipping": 5000,
        "discount": 0,
        "total": 1304000,
        "currency": "MWK",
        "shipping_address": {
          "full_name": "John Doe",
          "address_line": "123 Main Street",
          "city": "Lilongwe",
          "phone": "+265991234567"
        },
        "payment_method": "Mobile Money",
        "is_paid": true,
        "paid_at": "2024-01-20T10:35:00Z",
        "delivered_at": "2024-01-22T14:00:00Z",
        "created_at": "2024-01-20T10:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 45
    }
  }
}
```

---

### 6.3 Get Single Order

**Endpoint:** `GET /api/orders/{order_id}`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Order retrieved",
  "data": {
    "id": "ord_789",
    "order_number": "TH-2024-0001",
    "status": "shipped",
    "status_label": "Shipped",
    "status_history": [
      {
        "status": "pending",
        "label": "Order Placed",
        "timestamp": "2024-01-20T10:30:00Z"
      },
      {
        "status": "processing",
        "label": "Processing",
        "timestamp": "2024-01-20T11:00:00Z"
      },
      {
        "status": "shipped",
        "label": "Shipped",
        "timestamp": "2024-01-21T09:00:00Z",
        "note": "Shipped via DHL"
      }
    ],
    "items": [
      {
        "product_id": 1,
        "product_name": "iPhone 14 Pro",
        "product_image": "https://api.techaven.mw/storage/products/iphone14pro_thumb.jpg",
        "quantity": 1,
        "unit_price": 1299000,
        "subtotal": 1299000
      }
    ],
    "subtotal": 1299000,
    "shipping": 5000,
    "discount": 0,
    "tax": 0,
    "total": 1304000,
    "currency": "MWK",
    "shipping_address": {
      "full_name": "John Doe",
      "address_line": "123 Main Street",
      "city": "Lilongwe",
      "state": "Central Region",
      "postal_code": "",
      "country": "Malawi",
      "phone": "+265991234567"
    },
    "payment_method": "Mobile Money",
    "is_paid": true,
    "paid_at": "2024-01-20T10:35:00Z",
    "tracking_number": "DHL123456789",
    "tracking_url": "https://track.dhl.com/DHL123456789",
    "notes": "Please call before delivery",
    "created_at": "2024-01-20T10:30:00Z",
    "updated_at": "2024-01-21T09:00:00Z"
  }
}
```

---

### 6.4 Cancel Order

**Endpoint:** `POST /api/orders/{order_id}/cancel`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "reason": "Changed my mind"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "order_id": "ord_789",
    "status": "cancelled",
    "refund_status": "processing"
  }
}
```

**Error Responses:**
- `400` - Order cannot be cancelled (already shipped/delivered)

---

## 7. Wishlist / Liked Items

### 7.1 Get Wishlist

**Endpoint:** `GET /api/wishlist`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Wishlist retrieved",
  "data": {
    "items": [
      {
        "id": "wish_123",
        "product": {
          "id": 1,
          "name": "iPhone 14 Pro",
          "price": 1299000,
          "original_price": 1499000,
          "thumbnail": "https://api.techaven.mw/storage/products/iphone14pro_thumb.jpg",
          "is_in_stock": true,
          "rating": 4.8
        },
        "added_at": "2024-01-15T10:00:00Z"
      }
    ],
    "total_items": 5
  }
}
```

---

### 7.2 Add to Wishlist

**Endpoint:** `POST /api/wishlist`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "product_id": 1
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Added to wishlist",
  "data": {
    "wishlist_item_id": "wish_123",
    "total_items": 6
  }
}
```

---

### 7.3 Remove from Wishlist

**Endpoint:** `DELETE /api/wishlist/{product_id}`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Removed from wishlist",
  "data": {
    "total_items": 5
  }
}
```

---

## 8. Wallet

### 8.1 Get Wallet Balance

**Endpoint:** `GET /api/wallet`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Wallet retrieved",
  "data": {
    "balance": 50000,
    "currency": "MWK",
    "formatted_balance": "MK 50,000"
  }
}
```

---

### 8.2 Get Wallet Transactions

**Endpoint:** `GET /api/wallet/transactions`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number |
| `limit` | int | Items per page |
| `type` | string | Filter: `credit`, `debit` |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Transactions retrieved",
  "data": {
    "transactions": [
      {
        "id": "txn_123",
        "type": "credit",
        "amount": 10000,
        "currency": "MWK",
        "description": "Refund for order TH-2024-0001",
        "reference": "ord_789",
        "balance_after": 50000,
        "created_at": "2024-01-20T15:00:00Z"
      },
      {
        "id": "txn_122",
        "type": "debit",
        "amount": 5000,
        "currency": "MWK",
        "description": "Payment for order TH-2024-0002",
        "reference": "ord_790",
        "balance_after": 40000,
        "created_at": "2024-01-19T10:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 25
    }
  }
}
```

---

### 8.3 Top Up Wallet

**Endpoint:** `POST /api/wallet/topup`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "amount": 10000,
  "payment_method": "mobile_money",
  "phone_number": "+265991234567"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Top up initiated",
  "data": {
    "transaction_id": "txn_124",
    "amount": 10000,
    "status": "pending",
    "payment_url": "https://payment.techaven.mw/topup/txn_124"
  }
}
```

---

## 9. Shipping Addresses

### 9.1 Get Addresses

**Endpoint:** `GET /api/addresses`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Addresses retrieved",
  "data": {
    "addresses": [
      {
        "id": "addr_123",
        "label": "Home",
        "full_name": "John Doe",
        "phone": "+265991234567",
        "address_line_1": "123 Main Street",
        "address_line_2": "Area 47",
        "city": "Lilongwe",
        "state": "Central Region",
        "postal_code": "",
        "country": "Malawi",
        "is_default": true,
        "created_at": "2024-01-10T08:00:00Z"
      }
    ]
  }
}
```

---

### 9.2 Add Address

**Endpoint:** `POST /api/addresses`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "label": "Office",
  "full_name": "John Doe",
  "phone": "+265991234567",
  "address_line_1": "456 Business Park",
  "address_line_2": "City Center",
  "city": "Blantyre",
  "state": "Southern Region",
  "postal_code": "",
  "country": "Malawi",
  "is_default": false
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Address added successfully",
  "data": {
    "id": "addr_124",
    "label": "Office",
    "full_name": "John Doe",
    "is_default": false
  }
}
```

---

### 9.3 Update Address

**Endpoint:** `PUT /api/addresses/{address_id}`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:** Same as Add Address

**Success Response (200):**
```json
{
  "success": true,
  "message": "Address updated successfully",
  "data": {
    "id": "addr_123"
  }
}
```

---

### 9.4 Delete Address

**Endpoint:** `DELETE /api/addresses/{address_id}`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Address deleted successfully",
  "data": null
}
```

---

### 9.5 Set Default Address

**Endpoint:** `POST /api/addresses/{address_id}/default`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Default address updated",
  "data": {
    "id": "addr_123"
  }
}
```

---

## 10. Payment Methods

### 10.1 Get Payment Methods

**Endpoint:** `GET /api/payment-methods`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment methods retrieved",
  "data": {
    "payment_methods": [
      {
        "id": "pm_123",
        "type": "mobile_money",
        "provider": "Airtel Money",
        "phone_number": "+265991234567",
        "is_default": true,
        "created_at": "2024-01-10T08:00:00Z"
      },
      {
        "id": "pm_124",
        "type": "mobile_money",
        "provider": "TNM Mpamba",
        "phone_number": "+265881234567",
        "is_default": false,
        "created_at": "2024-01-12T10:00:00Z"
      }
    ],
    "available_providers": [
      {
        "type": "mobile_money",
        "provider": "Airtel Money",
        "icon": "airtel_money"
      },
      {
        "type": "mobile_money",
        "provider": "TNM Mpamba",
        "icon": "tnm_mpamba"
      },
      {
        "type": "bank_transfer",
        "provider": "National Bank",
        "icon": "national_bank"
      }
    ]
  }
}
```

---

### 10.2 Add Payment Method

**Endpoint:** `POST /api/payment-methods`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "type": "mobile_money",
  "provider": "Airtel Money",
  "phone_number": "+265991234567",
  "is_default": true
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Payment method added",
  "data": {
    "id": "pm_125"
  }
}
```

---

### 10.3 Delete Payment Method

**Endpoint:** `DELETE /api/payment-methods/{payment_method_id}`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment method deleted",
  "data": null
}
```

---

## 11. Notifications

### 11.1 Get Notifications

**Endpoint:** `GET /api/notifications`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number |
| `limit` | int | Items per page |
| `unread_only` | bool | Filter unread only |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Notifications retrieved",
  "data": {
    "notifications": [
      {
        "id": "notif_123",
        "type": "order_update",
        "title": "Order Shipped",
        "body": "Your order TH-2024-0001 has been shipped!",
        "data": {
          "order_id": "ord_789"
        },
        "is_read": false,
        "created_at": "2024-01-21T09:00:00Z"
      },
      {
        "id": "notif_122",
        "type": "promo",
        "title": "Flash Sale!",
        "body": "50% off on all accessories. Limited time only!",
        "data": {
          "promo_id": "promo_456"
        },
        "is_read": true,
        "created_at": "2024-01-20T08:00:00Z"
      }
    ],
    "unread_count": 3,
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 50
    }
  }
}
```

---

### 11.2 Mark Notification as Read

**Endpoint:** `POST /api/notifications/{notification_id}/read`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "unread_count": 2
  }
}
```

---

### 11.3 Mark All as Read

**Endpoint:** `POST /api/notifications/read-all`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "unread_count": 0
  }
}
```

---

### 11.4 Register Device for Push Notifications

**Endpoint:** `POST /api/notifications/register-device`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "device_token": "fcm_token_abc123",
  "platform": "android"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Device registered for notifications",
  "data": null
}
```

---

## 12. Shops / Vendors

### 12.1 Get All Shops

**Endpoint:** `GET /api/shops`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number |
| `limit` | int | Items per page |
| `location` | string | Filter by location/city |
| `category_id` | int | Filter by category they sell |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Shops retrieved",
  "data": {
    "shops": [
      {
        "id": "vnd_123",
        "name": "TechStore MW",
        "slug": "techstore-mw",
        "description": "Your one-stop shop for electronics",
        "logo_url": "https://api.techaven.mw/storage/vendors/techstore_logo.jpg",
        "cover_image_url": "https://api.techaven.mw/storage/vendors/techstore_cover.jpg",
        "rating": 4.7,
        "review_count": 234,
        "product_count": 150,
        "location": "Lilongwe",
        "is_verified": true,
        "is_open": true,
        "categories": ["Phones", "Laptops", "Accessories"]
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 45
    }
  }
}
```

---

### 12.2 Get Shop Details

**Endpoint:** `GET /api/shops/{shop_id}`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Shop retrieved",
  "data": {
    "id": "vnd_123",
    "name": "TechStore MW",
    "slug": "techstore-mw",
    "description": "Your one-stop shop for electronics in Malawi. We offer genuine products with warranty.",
    "logo_url": "https://api.techaven.mw/storage/vendors/techstore_logo.jpg",
    "cover_image_url": "https://api.techaven.mw/storage/vendors/techstore_cover.jpg",
    "rating": 4.7,
    "review_count": 234,
    "product_count": 150,
    "location": "Lilongwe",
    "address": "City Mall, Shop 45, Lilongwe",
    "phone": "+265991234567",
    "email": "info@techstore.mw",
    "website": "https://techstore.mw",
    "business_hours": {
      "monday": "08:00 - 17:00",
      "tuesday": "08:00 - 17:00",
      "wednesday": "08:00 - 17:00",
      "thursday": "08:00 - 17:00",
      "friday": "08:00 - 17:00",
      "saturday": "09:00 - 15:00",
      "sunday": "Closed"
    },
    "is_verified": true,
    "is_open": true,
    "categories": [
      {"id": 1, "name": "Phones"},
      {"id": 2, "name": "Laptops"},
      {"id": 6, "name": "Accessories"}
    ],
    "joined_at": "2023-06-15T00:00:00Z"
  }
}
```

---

### 12.3 Get Shop Products

**Endpoint:** `GET /api/shops/{shop_id}/products`

**Query Parameters:** Same as Get All Products

**Success Response (200):** Same format as Get All Products

---

## 13. Search

### 13.1 Search Products

**Endpoint:** `GET /api/search`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search query (required) |
| `page` | int | Page number |
| `limit` | int | Items per page |
| `category_id` | int | Filter by category |
| `min_price` | number | Minimum price |
| `max_price` | number | Maximum price |
| `sort` | string | `relevance`, `price_asc`, `price_desc`, `rating`, `newest` |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Search results",
  "data": {
    "query": "iphone",
    "products": [...],
    "suggestions": ["iphone 14", "iphone 14 pro", "iphone case"],
    "filters": {
      "categories": [
        {"id": 1, "name": "Phones", "count": 15},
        {"id": 6, "name": "Accessories", "count": 8}
      ],
      "price_range": {
        "min": 50000,
        "max": 1500000
      }
    },
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 23
    }
  }
}
```

---

### 13.2 Search Suggestions (Autocomplete)

**Endpoint:** `GET /api/search/suggestions`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search query (min 2 chars) |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Suggestions retrieved",
  "data": {
    "suggestions": [
      {"text": "iPhone 14 Pro", "type": "product"},
      {"text": "iPhone Cases", "type": "category"},
      {"text": "iPhones", "type": "category"}
    ]
  }
}
```

---

## 14. Help & Support

### 14.1 Get Help Topics

**Endpoint:** `GET /api/help/topics`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Help topics retrieved",
  "data": {
    "topics": [
      {
        "id": "topic_1",
        "title": "Orders & Shipping",
        "icon": "local_shipping",
        "articles": [
          {
            "id": "art_1",
            "title": "How to track my order?",
            "slug": "how-to-track-order"
          },
          {
            "id": "art_2",
            "title": "Shipping costs and delivery times",
            "slug": "shipping-costs-delivery"
          }
        ]
      }
    ]
  }
}
```

---

### 14.2 Get FAQs

**Endpoint:** `GET /api/help/faqs`

**Success Response (200):**
```json
{
  "success": true,
  "message": "FAQs retrieved",
  "data": {
    "faqs": [
      {
        "id": "faq_1",
        "question": "How do I return a product?",
        "answer": "To return a product, go to your order history...",
        "category": "Returns"
      }
    ]
  }
}
```

---

### 14.3 Submit Support Ticket

**Endpoint:** `POST /api/help/tickets`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "subject": "Issue with my order",
  "category": "orders",
  "message": "I received a damaged product...",
  "order_id": "ord_789",
  "attachments": ["base64_image_1"]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Support ticket created",
  "data": {
    "ticket_id": "tkt_123",
    "ticket_number": "SUP-2024-0001",
    "status": "open"
  }
}
```

---

### 14.4 Get App Info

**Endpoint:** `GET /api/app/info`

**Success Response (200):**
```json
{
  "success": true,
  "message": "App info retrieved",
  "data": {
    "app_name": "Techaven",
    "version": "1.0.0",
    "min_version": "1.0.0",
    "force_update": false,
    "update_url": "https://play.google.com/store/apps/details?id=mw.techaven.app",
    "terms_url": "https://techaven.mw/terms",
    "privacy_url": "https://techaven.mw/privacy",
    "support_email": "support@techaven.mw",
    "support_phone": "+265991234567",
    "social_links": {
      "facebook": "https://facebook.com/techavenmw",
      "instagram": "https://instagram.com/techavenmw",
      "twitter": "https://twitter.com/techavenmw"
    }
  }
}
```

---

## 15. Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "errors": {
    "field_name": ["Validation error 1", "Validation error 2"]
  }
}
```

---

## 16. Error Codes

| HTTP Code | Description |
|-----------|-------------|
| `200` | OK - Request successful |
| `201` | Created - Resource created successfully |
| `400` | Bad Request - Invalid request data |
| `401` | Unauthorized - Invalid or missing token |
| `403` | Forbidden - Access denied |
| `404` | Not Found - Resource not found |
| `409` | Conflict - Resource already exists |
| `422` | Unprocessable Entity - Validation failed |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error - Server error |

---

## Authentication Notes

1. **Access Token** - Short-lived (1 hour), used for API requests
2. **Refresh Token** - Long-lived (30 days), used to get new access tokens
3. All authenticated endpoints require: `Authorization: Bearer <access_token>`
4. When access token expires, use refresh token to get a new one
5. If refresh token is invalid, user must login again

---

## Rate Limiting

- **General endpoints:** 100 requests per minute
- **Auth endpoints:** 10 requests per minute
- **Search:** 30 requests per minute

Rate limit headers included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705750800
```

---

## Pagination

All list endpoints support pagination:

```json
{
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_items": 200,
    "items_per_page": 20,
    "has_next": true,
    "has_previous": false
  }
}
```

Query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

---

## Currency

All monetary values are in **Malawian Kwacha (MWK)** and represented as integers (no decimals).

Example: `1299000` = MK 1,299,000

---