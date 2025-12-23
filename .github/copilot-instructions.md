# TechHaven Codebase Guidelines for AI Agents

## Architecture Overview

**TechHaven** is a multi-service e-commerce platform with three main components:
- **Backend** (Node.js/Express): REST API handling users, products, orders, payments, shipping
- **Mobile** (React Native/Expo): React Native mobile client  
- **Dashboards** (HTML/CSS): Web interface for sellers and admins

This document focuses on the **backend** Node.js codebase.

### Backend Layered Architecture

**Request Flow**: Routes → Controllers → Services → Models → Database

```
src/
├── routes/          # Express route handlers (entry points)
├── controllers/     # Request processing, input/output mapping
├── services/        # Business logic, transactions, external integrations
├── models/          # Database queries, transactions, SQL execution
├── middleware/      # Auth, validation, error handling, rate limiting
├── config/          # Database pool, environment config
└── validators/      # Reusable validation rules
```

Each domain (users, products, orders, etc.) follows this pattern consistently.

## Critical Architectural Patterns

### 1. Database: MySQL with Connection Pool
- **Pool Configuration** [src/config/database.js](src/config/database.js): `mysql2/promise` with 10 connections
- **Transaction Usage**: Models use `connection.beginTransaction()` for multi-step operations (e.g., user creation involves users table + profile + roles)
- **UUID Primary Keys**: All resource IDs are CHAR(36) UUIDs, generated via `uuid` v4
- **User Creation Pattern** [src/models/user.model.js#L13-L50](src/models/user.model.js): Always create user → profile → assign role in single transaction
- **Connection Cleanup**: Always use try/finally to release connections back to pool

### 2. Service Layer: Business Logic & Transactions
Services handle complex workflows that span multiple models. **Never put transactions in controllers.**

Example flow:
- `userService.registerUser()` → validates, creates user via UserModel, sends welcome email via emailService
- `orderService.createOrder()` → creates order + inventory adjustments in transaction
- Services catch model errors and add context before re-throwing

### 3. Authentication & Authorization
- **JWT Strategy**: Bearer token in `Authorization: Bearer <token>` header
- **Auth Middleware** [src/middleware/auth.js](src/middleware/auth.js):
  - Validates token with `jwt.verify(token, process.env.JWT_SECRET)`
  - Checks user still exists & is active
  - Attaches `req.user = { id, email, username, roles }` to request
  - Supports session validation via `x-session-id` header
- **Role-Based Access**: `checkRole(['seller', 'admin'])` middleware guards protected endpoints
- **Session Tracking**: Sessions stored in `auth_sessions` table with refresh tokens (HTTP-only cookies)

### 4. Validation & Error Handling
- **Express-validator** [src/middleware/validation.js](src/middleware/validation.js): All route validation is declarative
- **Validation Pattern**: Import rule set (e.g., `userValidationRules.register`) → pass to `validate()` middleware → attach to route
- **Error Class** [src/middleware/error.js](src/middleware/error.js): `AppError(message, statusCode)` for operational errors
- **Response Format**: All endpoints return `{ success: bool, message: string, data: object, errors: array }`
- **Rate Limiting** [src/middleware/rateLimit.js](src/middleware/rateLimit.js): Strict limits on login (5/15min), password reset (3/hour), register (10/hour)

### 5. File Uploads
- **Multer Configuration** [src/middleware/upload.js](src/middleware/upload.js): Disk storage to `backend/uploads/`
- **Size & Type Restrictions**: Max size in config; allowed types checked against MIME types
- **Middleware Pattern**: `uploadSingleFile('fieldName')` handles single files with error handling

### 6. Email Service (Mailtrap Integration)
- **Service** [src/services/email.service.js](src/services/email.service.js): Currently mixed between Ethereal (test) & Mailtrap (production)
- **Key Methods**: `sendWelcomeEmail()` (on register), other methods to implement
- **Environment**: Uses `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` env vars (Mailtrap token needed)

## Common Development Tasks

### Adding a New Endpoint

1. **Create validation rules** in [src/middleware/validation.js](src/middleware/validation.js) (e.g., `newFeatureRules.create`)
2. **Add controller method** in appropriate controller (e.g., [src/controllers/product.controller.js](src/controllers/product.controller.js))
3. **Add service method** in matching service (e.g., [src/services/product.service.js](src/services/product.service.js)) for business logic
4. **Add model method** in model if new database query needed
5. **Register route** in [src/routes/product.routes.js](src/routes/product.routes.js) with validation middleware

Example route:
```javascript
router.post(
    '/create',
    auth,
    validate(productValidationRules.create),
    productController.createProduct
);
```

### Database Queries with Transactions

Always follow this pattern for multi-step operations:

```javascript
async createOrderWithItems(orderId, items) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        // Step 1: Insert order
        await connection.query('INSERT INTO orders ...', [orderId, ...]);
        
        // Step 2: Insert items & update inventory
        for (const item of items) {
            await connection.query('INSERT INTO order_items ...', [...]);
            await connection.query('UPDATE inventory SET quantity = ...', [...]);
        }
        
        await connection.commit();
        return orderId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release(); // Critical!
    }
}
```

### Adding Authentication to Endpoints

1. Import `auth` middleware from [src/middleware/auth.js](src/middleware/auth.js)
2. Add `auth` to route middleware stack
3. Access authenticated user via `req.user.id`, `req.user.email`, etc.
4. Use `checkRole(['seller'])` for role-specific endpoints

```javascript
router.put(
    '/profile',
    auth,
    validate(userValidationRules.updateProfile),
    userController.updateProfile
);
// In controller: const userId = req.user.id;
```

## Environment Configuration

Key `.env` variables (see [backend/ReadMe.md](../backend/ReadMe.md)):
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (MySQL)
- `JWT_SECRET` (token signing)
- `NODE_ENV` (production/development)
- `PORT` (default 3000)
- `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` (Mailtrap email)
- `STRIPE_SECRET_KEY` (payment processing)

## Running & Building

- **Dev**: `npm run dev` (nodemon watches src/)
- **Production**: `npm start` (runs src/index.js) or Docker: `docker-compose up`
- **Database**: Import schema from [backend/techaven_schema.sql](../backend/techaven_schema.sql)

Database uses UUID generation and transactions—ensure schema matches models.

## Project-Specific Conventions

1. **No arrow functions in class methods** (use `async methodName() {}`)
2. **Error messages are user-facing** - be clear, not technical
3. **Session IDs are optional but encouraged** for security
4. **All responses include success flag** - never return raw data
5. **Validation happens in middleware, not controllers**
6. **Business logic belongs in services**, not controllers
7. **Rate limits are enforced per IP** (or API key for authenticated users)

## Key Files for Reference

- **Entry Point**: [src/index.js](src/index.js)
- **User Workflow**: [src/models/user.model.js](src/models/user.model.js), [src/services/user.service.js](src/services/user.service.js), [src/controllers/user.controller.js](src/controllers/user.controller.js)
- **Database Schema**: [techaven_schema.sql](../backend/techaven_schema.sql)
- **Middleware Stack**: [src/middleware/](src/middleware/)
- **Config**: [src/config/](src/config/)

---

**Last Updated**: December 2025 | Backend: Node.js v20, Express 4.x, MySQL 8.0
