-- Use a safe mode
SET FOREIGN_KEY_CHECKS = 0;

-- Create single database
CREATE DATABASE IF NOT EXISTS techaven;
USE techaven;

-- Use utf8mb4 and InnoDB by default

-- ========== AUTH SERVICE TABLES ==========
CREATE TABLE IF NOT EXISTS auth_users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY ux_users_email (email),
  UNIQUE KEY ux_users_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auth_roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auth_users_roles (
  user_id CHAR(36) NOT NULL,
  role_id INT UNSIGNED NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES auth_roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auth_user_profile (
  user_id CHAR(36) NOT NULL PRIMARY KEY,
  full_name VARCHAR(255),
  phone VARCHAR(30),
  dob DATE,
  locale VARCHAR(10),
  metadata VARCHAR(255),
  CONSTRAINT fk_up_user FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auth_user_contacts (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  contact_type ENUM('email','phone','whatsapp','telegram','other') NOT NULL,
  contact_value VARCHAR(255) NOT NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  verified_at TIMESTAMP NULL,
  CONSTRAINT fk_uc_user FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auth_sessions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  refresh_token_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL 7 DAY),
  user_agent VARCHAR(512),
  ip_address VARCHAR(45),
  CONSTRAINT fk_as_user FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== CATALOG SERVICE TABLES ==========
CREATE TABLE IF NOT EXISTS catalog_sellers (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  business_name VARCHAR(255),
  registration_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_seller_user FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS catalog_categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  parent_id INT UNSIGNED NULL,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL,
  description TEXT,
  UNIQUE KEY ux_cat_slug (slug),
  CONSTRAINT fk_cat_parent FOREIGN KEY (parent_id) REFERENCES catalog_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS catalog_products (
  id CHAR(36) NOT NULL PRIMARY KEY,
  seller_id CHAR(36) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  short_description VARCHAR(512),
  long_description TEXT,
  price DECIMAL(15,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'MWK',
  weight_grams INT UNSIGNED NULL,
  height_mm INT UNSIGNED NULL,
  width_mm INT UNSIGNED NULL,
  depth_mm INT UNSIGNED NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_prod_seller FOREIGN KEY (seller_id) REFERENCES catalog_sellers(id) ON DELETE CASCADE,
  UNIQUE KEY ux_product_sku (sku),
  INDEX idx_products_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS catalog_product_categories (
  product_id CHAR(36) NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (product_id, category_id),
  CONSTRAINT fk_pc_product FOREIGN KEY (product_id) REFERENCES catalog_products(id) ON DELETE CASCADE,
  CONSTRAINT fk_pc_category FOREIGN KEY (category_id) REFERENCES catalog_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS catalog_product_images (
  id CHAR(36) NOT NULL PRIMARY KEY,
  product_id CHAR(36) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  alt_text VARCHAR(255),
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pi_product FOREIGN KEY (product_id) REFERENCES catalog_products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS catalog_tags (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS catalog_product_tags (
  product_id CHAR(36) NOT NULL,
  tag_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (product_id, tag_id),
  CONSTRAINT fk_pt_product FOREIGN KEY (product_id) REFERENCES catalog_products(id) ON DELETE CASCADE,
  CONSTRAINT fk_pt_tag FOREIGN KEY (tag_id) REFERENCES catalog_tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Price history (separate table avoids multi-valued price in products)
CREATE TABLE IF NOT EXISTS catalog_product_prices (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id CHAR(36) NOT NULL,
  price DECIMAL(15,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'MWK',
  valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valid_to TIMESTAMP NULL,
  CONSTRAINT fk_pp_product FOREIGN KEY (product_id) REFERENCES catalog_products(id) ON DELETE CASCADE,
  INDEX idx_pp_product_valid (product_id, valid_from)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== INVENTORY SERVICE TABLES ==========
CREATE TABLE IF NOT EXISTS inventory_inventories (
  id CHAR(36) NOT NULL PRIMARY KEY,
  product_id CHAR(36) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  reserved INT NOT NULL DEFAULT 0,
  location_code VARCHAR(100),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_inv_product FOREIGN KEY (product_id) REFERENCES catalog_products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_transactions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  inventory_id CHAR(36) NOT NULL,
  delta INT NOT NULL,
  reason VARCHAR(255),
  related_entity_type VARCHAR(50), -- e.g. 'order', 'restock'
  related_entity_id CHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_it_inventory FOREIGN KEY (inventory_id) REFERENCES inventory_inventories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== ORDER SERVICE TABLES ==========
CREATE TABLE IF NOT EXISTS order_addresses (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NULL,
  full_name VARCHAR(255) NOT NULL,
  line1 VARCHAR(255) NOT NULL,
  line2 VARCHAR(255),
  city VARCHAR(100),
  region VARCHAR(100),
  postal_code VARCHAR(50),
  country VARCHAR(100),
  phone VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_addr_user FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_orders (
  id CHAR(36) NOT NULL PRIMARY KEY,
  buyer_id CHAR(36) NOT NULL,
  seller_id CHAR(36) NOT NULL,
  shipping_address_id CHAR(36) NOT NULL,
  billing_address_id CHAR(36),
  total_amount DECIMAL(15,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'MWK',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_buyer FOREIGN KEY (buyer_id) REFERENCES auth_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_seller FOREIGN KEY (seller_id) REFERENCES catalog_sellers(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_shipaddr FOREIGN KEY (shipping_address_id) REFERENCES order_addresses(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_billaddr FOREIGN KEY (billing_address_id) REFERENCES order_addresses(id) ON DELETE CASCADE,
  INDEX idx_orders_buyer (buyer_id),
  INDEX idx_orders_seller (seller_id),
  INDEX idx_orders_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id CHAR(36) NOT NULL PRIMARY KEY,
  order_id CHAR(36) NOT NULL,
  product_id CHAR(36) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  quantity INT NOT NULL,
  line_total DECIMAL(15,2) NOT NULL,
  tax_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_oi_order FOREIGN KEY (order_id) REFERENCES order_orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_oi_product FOREIGN KEY (product_id) REFERENCES catalog_products(id) ON DELETE CASCADE,
  INDEX idx_order_items_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_status_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id CHAR(36) NOT NULL,
  status VARCHAR(50) NOT NULL,
  changed_by CHAR(36) NULL,
  note TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_osh_order FOREIGN KEY (order_id) REFERENCES order_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== PAYMENT SERVICE TABLES ==========
CREATE TABLE IF NOT EXISTS payment_methods (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  provider VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO payment_methods (code, display_name, provider) VALUES
('mpamba','Mpamba','Airtel/Provider'),
('airtel_money','Airtel Money','Airtel'),
('card','Card','Stripe/Adyen'),
('mobile_money','Mobile Money','Generic');

CREATE TABLE IF NOT EXISTS payment_payments (
  id CHAR(36) NOT NULL PRIMARY KEY,
  order_id CHAR(36) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'MWK',
  payment_method_id INT UNSIGNED NOT NULL,
  provider_ref VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'initiated',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pay_order FOREIGN KEY (order_id) REFERENCES order_orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_pay_method FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE CASCADE,
  INDEX idx_pay_order (order_id),
  INDEX idx_pay_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== ESCROW SERVICE TABLES ==========
CREATE TABLE IF NOT EXISTS escrow_accounts (
  id CHAR(36) NOT NULL PRIMARY KEY,
  order_id CHAR(36) NOT NULL UNIQUE,
  escrow_amount DECIMAL(15,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'MWK',
  status ENUM('held','released','refunded','disputed') NOT NULL DEFAULT 'held',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_esc_order FOREIGN KEY (order_id) REFERENCES order_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS escrow_events (
  id CHAR(36) NOT NULL PRIMARY KEY,
  escrow_account_id CHAR(36) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ee_esc FOREIGN KEY (escrow_account_id) REFERENCES escrow_accounts(id) ON DELETE CASCADE,
  INDEX idx_ee_esc (escrow_account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== SHIPPING SERVICE TABLES ==========
CREATE TABLE IF NOT EXISTS shipping_providers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255),
  contact_info JSON
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS shipping_shipments (
  id CHAR(36) NOT NULL PRIMARY KEY,
  order_id CHAR(36) NOT NULL,
  provider_id INT UNSIGNED NULL,
  tracking_number VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  shipped_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_shp_order FOREIGN KEY (order_id) REFERENCES order_orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_shp_provider FOREIGN KEY (provider_id) REFERENCES shipping_providers(id) ON DELETE CASCADE,
  INDEX idx_ship_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== REVIEW SERVICE TABLES ==========
CREATE TABLE IF NOT EXISTS review_product_reviews (
  id CHAR(36) NOT NULL PRIMARY KEY,
  product_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(255),
  body TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pr_product FOREIGN KEY (product_id) REFERENCES catalog_products(id) ON DELETE CASCADE,
  CONSTRAINT fk_pr_user FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE,
  INDEX idx_pr_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== NOTIFICATION SERVICE TABLES ==========
CREATE TABLE IF NOT EXISTS notification_notifications (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  channel ENUM('email','sms','push','web') NOT NULL,
  type VARCHAR(100) NOT NULL,
  payload JSON,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES auth_users(id) ON DELETE CASCADE,
  INDEX idx_notif_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========== ADMIN SERVICE TABLES ==========
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  actor_id CHAR(36) NULL,
  actor_role VARCHAR(100),
  action VARCHAR(255) NOT NULL,
  target_table VARCHAR(100),
  target_id CHAR(36),
  diff JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_actor (actor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_system_settings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(255) NOT NULL UNIQUE,
  value JSON,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable FK checks
SET FOREIGN_KEY_CHECKS = 1;