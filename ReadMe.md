# TechHaven E-commerce Platform - Database Documentation

## Overview
TechHaven's database is structured using a domain-driven design approach, with tables organized into distinct service boundaries. The schema uses MySQL/MariaDB with InnoDB engine and utf8mb4 character set.

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
