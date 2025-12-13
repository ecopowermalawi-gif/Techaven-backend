# TechHaven E-commerce API End Points

## Overview
TechHaven Backend is an e-commerce platform built with Node.js, Express, and MySQL. This repository contains the backend API that powers the platform.

## Technical Stack
- **Runtime**: Node.js v20.x
- **Framework**: Express.js
- **Database**: MySQL 8.0 (InnoDB, utf8mb4)
- **Authentication**: JWT
- **File Storage**: Local/S3
- **Payment**: Stripe/Local Payment Integration

## Getting Started

### Prerequisites
- Node.js v20.x or higher
- MySQL 8.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ecopowermalawi-gif/Techaven-backend.git
cd Techaven-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials and other settings
```

4. Run migrations:
```bash
npm run migrate / import the schema into db
```

5. Start the development server:
```bash
npm run dev
```

## API Documentation

### Base URL
```
http://localhost:666/api
```

### Authentication
Most routes require authentication via JWT token. Include the token in the Authorization header:
```
Authorization: Bearer your-jwt-token
```

### Available Routes

#### 1. Authentication & User Management
```http
# Public Routes
POST /user/register
{
  "email": "buyer@gmail.com",
  "password": "secure123",
  "username": "buyer1",
  "role" : "buyer"
}

POST /user/login
{
  "email": "buyer1@gmail.com",
  "password": "buyer1"
}

output
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJkNWRlNWMwLTVhODItNGYxYS1iNzlkLWUxZWM3MDQ1NzQ2YiIsImVtYWlsIjoiYnV5ZXIxQGdtYWlsLmNvbSIsInJvbGVzIjpbImJ1eWVyIl0sImlhdCI6MTc2MzE5NDE4OSwiZXhwIjoxNzYzMjgwNTg5fQ.KbkzgFE5jLrP8WCzUoXvog8BOmSWUU7Tvwrc_b_mYtc",
    "user": {
      "id": "2d5de5c0-5a82-4f1a-b79d-e1ec7045746b",
      "email": "buyer1@gmail.com",
      "username": "buyer1",
      "created_at": "2025-11-15T08:06:36.000Z",
      "updated_at": null,
      "is_active": 1,
      "roles": "buyer"
    }
  }
}

# Protected Routes
GET /users/me                 # Get current user profile
GET /users/:user_id           # Get user by id

GET /users/users                    # List users (Admin only)
PUT /users/profile           # Update profile
POST /users/logout           # Log out
PUT /users/password         # Change password
```

Example Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "4620dcf0-6607-4e06-b43e-ba4126112132",
      "email": "kk@g.com",
      "username": "hkg",
      "created_at": "2025-10-24T10:49:18.000Z",
      "updated_at": null,
      "is_active": 1,
      "roles": "admin",
      "full_name": null,
      "phone": null
    },
    {
      "id": "df14e8ce-2fb5-423d-a0b4-467f45e1bf09",
      "email": "john@gmail.com",
      "username": "john1347",
      "created_at": "2025-10-24T13:42:10.000Z",
      "is_active": 1
    }
  ]
}
```

#### 2. Product Management
```http
# Public Routes
GET /products/products/     # List all products
GET /products/search        # Search products
GET /products/:id           # Get single product

# Protected Routes (Seller)
POST /products             # Create product
{
  "title": "iPhone 15 Pro",
  "description": "Latest iPhone model",
  "price": 999.99,
  "stock": 100,
  "category_id": 1
}

PUT /products/:id          # Update product
DELETE /products/:id       # Delete product
```

#### 3. Shop Management
```http
# Public Routes
GET /shops                 # List all shops
GET /shops/:id            # Get single shop

# Protected Routes
POST /shops               # Create a shop
{
  "name": "Tech Store",
  "description": "Best tech deals",
  "category": "Electronics",
  "address": "123 Tech St"
}

PUT /shops/:id           # Update shop
DELETE /shops/:id        # Delete shop
```

#### 4. Order Management
```http
# Protected Routes
GET /orders              # List user's orders
POST /orders             # Create order
{
  "items": [
    {
      "product_id": "product-uuid",
      "quantity": 2
    }
  ],
  "shipping_address_id": "address-uuid"
}

GET /orders/:id         # Get order details
PUT /orders/:id/status  # Update order status
```

#### 5. Payment Integration
```http
# Protected Routes
POST /payments/intent   # Create payment intent
{
  "amount": 999.99,
  "currency": "usd",
  "orderId": "order-uuid"
}

POST /payments/confirm  # Confirm payment
GET /payments/methods   # List payment methods
```

### Testing the API

1. Create a test user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser"
  }'
```

2. Login to get JWT token:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

3. Use the token for protected routes:
```bash
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer your-jwt-token"
```

### Rate Limiting
The API implements rate limiting:
- Standard API calls: 100 requests per minute
- Login attempts: 5 per 15 minutes
- File uploads: 10 per hour

### Error Responses
All errors follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional validation errors
}
```

## Database Documentation

## Technical Specifications
- **Engine**: InnoDB
- **Character Set**: utf8mb4
- **Collation**: utf8mb4_unicode_ci
- **Primary Keys**: UUID (CHAR(36)) for entities, AUTO_INCREMENT for lookups
- **Foreign Keys**: ON DELETE CASCADE/RESTRICT as appropriate
- **Default Currency**: MWK (Malawian Kwacha)

## Service Domains

### 1. Authentication Service (`auth_*`)

#### `auth_users`
Core user management table:
- UUID primary key for user identification
- Email and username with unique constraints
- Secure password hash storage
- Account status tracking
- Automatic timestamp management
```sql
Primary: id CHAR(36)
Unique: email, username
Important: is_active, created_at, updated_at
```

#### `auth_roles` & `auth_users_roles`
Role-based access control:
- Hierarchical role management
- Many-to-many user-role relationships
- Role assignment tracking
```sql
Roles: id, name, description
Assignments: user_id, role_id, assigned_at
```

#### `auth_user_profile` & `auth_user_contacts`
Extended user information:
- Personal details and preferences
- Multiple contact methods (email/phone/social)
- Contact verification tracking
```sql
Profile: user_id, full_name, phone, locale
Contacts: contact_type, contact_value, is_primary
```

### 2. Catalog Service (`catalog_*`)

#### `catalog_products` & Related Tables
Product management system:
- Complete product information
- Price history tracking
- Category management
- Image handling
- Tagging system
```sql
Core: id, seller_id, sku, title, price
Categories: hierarchical structure
Images: multiple per product
Tags: flexible categorization
```

### 3. Inventory Service (`inventory_*`)
Stock management:
- Real-time inventory tracking
- Reserved stock handling
- Transaction logging
- Location-based inventory
```sql
Inventory: quantity, reserved
Transactions: delta, reason, tracking
```

### 4. Order Service (`order_*`)
Order processing system:
- Complete order management
- Line item tracking
- Address management
- Status history
```sql
Orders: buyer_id, seller_id, total_amount
Items: product_id, quantity, pricing
Status: state transitions, audit trail
```

### 5. Payment & Escrow Services

#### Payment Service
- Multiple payment methods
- Transaction tracking
- Local payment integration
```sql
Methods: Mpamba, Airtel Money, Cards
Transactions: amount, status, provider_ref
```

#### Escrow Service
- Secure fund holding
- Event-based tracking
- Dispute handling
```sql
Accounts: amount, status
Events: event_type, event_data
```

### 6. Supporting Services

#### Shipping Service
- Provider management
- Shipment tracking
- Delivery status updates
```sql
Providers: code, name, contact_info
Shipments: tracking_number, status
```

#### Review Service
- Product reviews and ratings
- User feedback management
```sql
Reviews: rating (1-5), title, body
```

#### Notification Service
- Multi-channel notifications
- Read status tracking
```sql
Channels: email, sms, push, web
Tracking: type, payload, is_read
```

#### Admin Service
- System-wide audit logging
- Configuration management
```sql
Audit: actor, action, target, diff
Settings: key-value store
```

## Common Patterns & Best Practices

### 1. Data Integrity
- Foreign key constraints
- Appropriate ON DELETE behaviors
- NOT NULL constraints where needed
- UNIQUE constraints for business rules

### 2. Timestamps
- `created_at`: Creation tracking
- `updated_at`: Change tracking
- Event-specific timestamps (e.g., `verified_at`)

### 3. Indexing Strategy
- Indexed foreign keys
- Business query optimization
- Status and search fields indexed

### 4. Audit & History
- Status change tracking
- Price history
- Transaction logging
- System-wide audit trail

### 5. Security Features
- Password hash storage
- Session management
- IP tracking
- Role-based access

## Development Guidelines

1. **Table Naming**
   - Service prefix for domain separation
   - Clear, descriptive names
   - Consistent pluralization

2. **Foreign Keys**
   - Clear naming convention
   - Appropriate cascading rules
   - Index all foreign keys

3. **Transactions**
   - Required for multi-table updates
   - Especially for financial operations
   - Maintain ACID properties

4. **Performance**
   - Appropriate index usage
   - Query optimization
   - Regular maintenance

---

For implementation details, see `techaven_schema.sql`

*Last updated: October 2025*
