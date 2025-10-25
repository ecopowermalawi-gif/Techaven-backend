-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 25, 2025 at 06:56 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `techaven`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_audit_logs`
--

CREATE TABLE `admin_audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `actor_id` char(36) DEFAULT NULL,
  `actor_role` varchar(100) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `target_table` varchar(100) DEFAULT NULL,
  `target_id` char(36) DEFAULT NULL,
  `diff` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`diff`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admin_system_settings`
--

CREATE TABLE `admin_system_settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `key_name` varchar(255) NOT NULL,
  `value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`value`)),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_roles`
--

CREATE TABLE `auth_roles` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auth_roles`
--

INSERT INTO `auth_roles` (`id`, `name`, `description`) VALUES
(1, 'admin', 'user management, '),
(2, 'buyer', 'can buy products'),
(3, 'seller', 'sells products ');

-- --------------------------------------------------------

--
-- Table structure for table `auth_sessions`
--

CREATE TABLE `auth_sessions` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `refresh_token_hash` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NOT NULL DEFAULT (current_timestamp() + interval 7 day),
  `user_agent` varchar(512) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_users`
--

CREATE TABLE `auth_users` (
  `id` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auth_users`
--

INSERT INTO `auth_users` (`id`, `email`, `password_hash`, `username`, `created_at`, `updated_at`, `is_active`) VALUES
('4620dcf0-6607-4e06-b43e-ba4126112132', 'kk@g.com', '$2a$10$hmwupxnOMPnJXia3fNSjrOJpcCXA8kUh6Z26l9EETWPc5c54UgO8a', 'hkg', '2025-10-24 10:49:18', NULL, 1),
('df14e8ce-2fb5-423d-a0b4-467f45e1bf09', 'john@gmail.com', '$2a$10$zfqlyXdK1ZbwL6A1p7zscuEH0XVlLZFsDrEtbIOrqQqORlrau9Kym', 'john1347', '2025-10-24 13:42:10', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `auth_users_roles`
--

CREATE TABLE `auth_users_roles` (
  `user_id` char(36) NOT NULL,
  `role_id` int(10) UNSIGNED NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auth_users_roles`
--

INSERT INTO `auth_users_roles` (`user_id`, `role_id`, `assigned_at`) VALUES
('4620dcf0-6607-4e06-b43e-ba4126112132', 1, '2025-10-24 12:45:21');

-- --------------------------------------------------------

--
-- Table structure for table `auth_user_contacts`
--

CREATE TABLE `auth_user_contacts` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `contact_type` enum('email','phone','whatsapp','telegram','other') NOT NULL,
  `contact_value` varchar(255) NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `verified_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_user_profile`
--

CREATE TABLE `auth_user_profile` (
  `user_id` char(36) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `locale` varchar(10) DEFAULT NULL,
  `metadata` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auth_user_profile`
--

INSERT INTO `auth_user_profile` (`user_id`, `full_name`, `phone`, `dob`, `locale`, `metadata`) VALUES
('4620dcf0-6607-4e06-b43e-ba4126112132', NULL, NULL, NULL, NULL, NULL),
('df14e8ce-2fb5-423d-a0b4-467f45e1bf09', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `catalog_categories`
--

CREATE TABLE `catalog_categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `parent_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `catalog_products`
--

CREATE TABLE `catalog_products` (
  `id` char(36) NOT NULL,
  `seller_id` char(36) NOT NULL,
  `sku` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `short_description` varchar(512) DEFAULT NULL,
  `long_description` text DEFAULT NULL,
  `price` decimal(15,2) NOT NULL,
  `currency` char(3) NOT NULL DEFAULT 'MWK',
  `weight_grams` int(10) UNSIGNED DEFAULT NULL,
  `height_mm` int(10) UNSIGNED DEFAULT NULL,
  `width_mm` int(10) UNSIGNED DEFAULT NULL,
  `depth_mm` int(10) UNSIGNED DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `catalog_product_categories`
--

CREATE TABLE `catalog_product_categories` (
  `product_id` char(36) NOT NULL,
  `category_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `catalog_product_images`
--

CREATE TABLE `catalog_product_images` (
  `id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `url` varchar(2048) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `catalog_product_prices`
--

CREATE TABLE `catalog_product_prices` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` char(36) NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `currency` char(3) NOT NULL DEFAULT 'MWK',
  `valid_from` timestamp NOT NULL DEFAULT current_timestamp(),
  `valid_to` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `catalog_product_tags`
--

CREATE TABLE `catalog_product_tags` (
  `product_id` char(36) NOT NULL,
  `tag_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `catalog_sellers`
--

CREATE TABLE `catalog_sellers` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `business_name` varchar(255) DEFAULT NULL,
  `registration_number` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `catalog_tags`
--

CREATE TABLE `catalog_tags` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `escrow_accounts`
--

CREATE TABLE `escrow_accounts` (
  `id` char(36) NOT NULL,
  `order_id` char(36) NOT NULL,
  `escrow_amount` decimal(15,2) NOT NULL,
  `currency` char(3) NOT NULL DEFAULT 'MWK',
  `status` enum('held','released','refunded','disputed') NOT NULL DEFAULT 'held',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `escrow_events`
--

CREATE TABLE `escrow_events` (
  `id` char(36) NOT NULL,
  `escrow_account_id` char(36) NOT NULL,
  `event_type` varchar(100) NOT NULL,
  `event_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`event_data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory_inventories`
--

CREATE TABLE `inventory_inventories` (
  `id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `reserved` int(11) NOT NULL DEFAULT 0,
  `location_code` varchar(100) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory_transactions`
--

CREATE TABLE `inventory_transactions` (
  `id` char(36) NOT NULL,
  `inventory_id` char(36) NOT NULL,
  `delta` int(11) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `related_entity_type` varchar(50) DEFAULT NULL,
  `related_entity_id` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notification_notifications`
--

CREATE TABLE `notification_notifications` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `channel` enum('email','sms','push','web') NOT NULL,
  `type` varchar(100) NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload`)),
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_addresses`
--

CREATE TABLE `order_addresses` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `line1` varchar(255) NOT NULL,
  `line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `postal_code` varchar(50) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` char(36) NOT NULL,
  `order_id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `sku` varchar(100) NOT NULL,
  `unit_price` decimal(15,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `line_total` decimal(15,2) NOT NULL,
  `tax_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_orders`
--

CREATE TABLE `order_orders` (
  `id` char(36) NOT NULL,
  `buyer_id` char(36) NOT NULL,
  `seller_id` char(36) NOT NULL,
  `shipping_address_id` char(36) NOT NULL,
  `billing_address_id` char(36) DEFAULT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `currency` char(3) NOT NULL DEFAULT 'MWK',
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `placed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_status_history`
--

CREATE TABLE `order_status_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` char(36) NOT NULL,
  `status` varchar(50) NOT NULL,
  `changed_by` char(36) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_methods`
--

CREATE TABLE `payment_methods` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `provider` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_methods`
--

INSERT INTO `payment_methods` (`id`, `code`, `display_name`, `provider`) VALUES
(1, 'mpamba', 'Mpamba', 'Airtel/Provider'),
(2, 'airtel_money', 'Airtel Money', 'Airtel'),
(3, 'card', 'Card', 'Stripe/Adyen'),
(4, 'mobile_money', 'Mobile Money', 'Generic');

-- --------------------------------------------------------

--
-- Table structure for table `payment_payments`
--

CREATE TABLE `payment_payments` (
  `id` char(36) NOT NULL,
  `order_id` char(36) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` char(3) NOT NULL DEFAULT 'MWK',
  `payment_method_id` int(10) UNSIGNED NOT NULL,
  `provider_ref` varchar(255) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'initiated',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `review_product_reviews`
--

CREATE TABLE `review_product_reviews` (
  `id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `rating` tinyint(4) NOT NULL CHECK (`rating` between 1 and 5),
  `title` varchar(255) DEFAULT NULL,
  `body` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shipping_providers`
--

CREATE TABLE `shipping_providers` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `contact_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`contact_info`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shipping_shipments`
--

CREATE TABLE `shipping_shipments` (
  `id` char(36) NOT NULL,
  `order_id` char(36) NOT NULL,
  `provider_id` int(10) UNSIGNED DEFAULT NULL,
  `tracking_number` varchar(255) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'pending',
  `shipped_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_audit_logs`
--
ALTER TABLE `admin_audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_actor` (`actor_id`),
  ADD KEY `idx_audit_created_at` (`created_at`);

--
-- Indexes for table `admin_system_settings`
--
ALTER TABLE `admin_system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `key_name` (`key_name`);

--
-- Indexes for table `auth_roles`
--
ALTER TABLE `auth_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_roles_name` (`name`);

--
-- Indexes for table `auth_sessions`
--
ALTER TABLE `auth_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_as_user` (`user_id`),
  ADD KEY `idx_as_expires_at` (`expires_at`);

--
-- Indexes for table `auth_users`
--
ALTER TABLE `auth_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_users_email` (`email`),
  ADD UNIQUE KEY `ux_users_username` (`username`),
  ADD KEY `idx_users_created_at` (`created_at`),
  ADD KEY `idx_users_is_active` (`is_active`);

--
-- Indexes for table `auth_users_roles`
--
ALTER TABLE `auth_users_roles`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `idx_ur_user` (`user_id`),
  ADD KEY `idx_ur_role` (`role_id`),
  ADD KEY `idx_ur_assigned_at` (`assigned_at`);

--
-- Indexes for table `auth_user_contacts`
--
ALTER TABLE `auth_user_contacts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_uc_user` (`user_id`),
  ADD KEY `idx_uc_contact_type` (`contact_type`),
  ADD KEY `idx_uc_verified_at` (`verified_at`);

--
-- Indexes for table `auth_user_profile`
--
ALTER TABLE `auth_user_profile`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `idx_up_full_name` (`full_name`(100));

--
-- Indexes for table `catalog_categories`
--
ALTER TABLE `catalog_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_cat_slug` (`slug`),
  ADD KEY `idx_cat_parent` (`parent_id`),
  ADD KEY `idx_cat_name` (`name`);

--
-- Indexes for table `catalog_products`
--
ALTER TABLE `catalog_products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_product_sku` (`sku`),
  ADD KEY `idx_products_title` (`title`),
  ADD KEY `idx_products_seller_id` (`seller_id`),
  ADD KEY `idx_products_price` (`price`),
  ADD KEY `idx_products_is_active` (`is_active`),
  ADD KEY `idx_products_created_at` (`created_at`);

--
-- Indexes for table `catalog_product_categories`
--
ALTER TABLE `catalog_product_categories`
  ADD PRIMARY KEY (`product_id`,`category_id`),
  ADD KEY `idx_pc_product` (`product_id`),
  ADD KEY `idx_pc_category` (`category_id`);

--
-- Indexes for table `catalog_product_images`
--
ALTER TABLE `catalog_product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pi_product` (`product_id`),
  ADD KEY `idx_pi_created_at` (`created_at`);

--
-- Indexes for table `catalog_product_prices`
--
ALTER TABLE `catalog_product_prices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pp_product_valid` (`product_id`,`valid_from`),
  ADD KEY `idx_pp_price` (`price`);

--
-- Indexes for table `catalog_product_tags`
--
ALTER TABLE `catalog_product_tags`
  ADD PRIMARY KEY (`product_id`,`tag_id`),
  ADD KEY `idx_pt_product` (`product_id`),
  ADD KEY `idx_pt_tag` (`tag_id`);

--
-- Indexes for table `catalog_sellers`
--
ALTER TABLE `catalog_sellers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sellers_user_id` (`user_id`),
  ADD KEY `idx_sellers_created_at` (`created_at`);

--
-- Indexes for table `catalog_tags`
--
ALTER TABLE `catalog_tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_tags_name` (`name`);

--
-- Indexes for table `escrow_accounts`
--
ALTER TABLE `escrow_accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`),
  ADD KEY `idx_esc_order_id` (`order_id`),
  ADD KEY `idx_esc_status` (`status`);

--
-- Indexes for table `escrow_events`
--
ALTER TABLE `escrow_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ee_esc` (`escrow_account_id`),
  ADD KEY `idx_ee_event_type` (`event_type`);

--
-- Indexes for table `inventory_inventories`
--
ALTER TABLE `inventory_inventories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_inv_product` (`product_id`),
  ADD KEY `idx_inv_location` (`location_code`(50));

--
-- Indexes for table `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_it_inventory` (`inventory_id`),
  ADD KEY `idx_it_related` (`related_entity_type`,`related_entity_id`),
  ADD KEY `idx_it_created_at` (`created_at`);

--
-- Indexes for table `notification_notifications`
--
ALTER TABLE `notification_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notif_user` (`user_id`),
  ADD KEY `idx_notif_channel` (`channel`),
  ADD KEY `idx_notif_is_read` (`is_read`);

--
-- Indexes for table `order_addresses`
--
ALTER TABLE `order_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_addr_user` (`user_id`),
  ADD KEY `idx_addr_created_at` (`created_at`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_items_order` (`order_id`),
  ADD KEY `idx_order_items_product` (`product_id`),
  ADD KEY `idx_order_items_created_at` (`created_at`);

--
-- Indexes for table `order_orders`
--
ALTER TABLE `order_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_order_shipaddr` (`shipping_address_id`),
  ADD KEY `fk_order_billaddr` (`billing_address_id`),
  ADD KEY `idx_orders_buyer` (`buyer_id`),
  ADD KEY `idx_orders_seller` (`seller_id`),
  ADD KEY `idx_orders_status` (`status`),
  ADD KEY `idx_orders_placed_at` (`placed_at`);

--
-- Indexes for table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_osh_order` (`order_id`),
  ADD KEY `idx_osh_changed_at` (`changed_at`);

--
-- Indexes for table `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_pm_code` (`code`);

--
-- Indexes for table `payment_payments`
--
ALTER TABLE `payment_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pay_method` (`payment_method_id`),
  ADD KEY `idx_pay_order` (`order_id`),
  ADD KEY `idx_pay_status` (`status`),
  ADD KEY `idx_pay_created_at` (`created_at`);

--
-- Indexes for table `review_product_reviews`
--
ALTER TABLE `review_product_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pr_product` (`product_id`),
  ADD KEY `idx_pr_user` (`user_id`),
  ADD KEY `idx_pr_rating` (`rating`),
  ADD KEY `idx_pr_created_at` (`created_at`);

--
-- Indexes for table `shipping_providers`
--
ALTER TABLE `shipping_providers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_sp_code` (`code`);

--
-- Indexes for table `shipping_shipments`
--
ALTER TABLE `shipping_shipments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ship_order` (`order_id`),
  ADD KEY `idx_ship_provider` (`provider_id`),
  ADD KEY `idx_ship_status` (`status`),
  ADD KEY `idx_ship_created_at` (`created_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_audit_logs`
--
ALTER TABLE `admin_audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `admin_system_settings`
--
ALTER TABLE `admin_system_settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auth_roles`
--
ALTER TABLE `auth_roles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `catalog_categories`
--
ALTER TABLE `catalog_categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `catalog_product_prices`
--
ALTER TABLE `catalog_product_prices`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `catalog_tags`
--
ALTER TABLE `catalog_tags`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_status_history`
--
ALTER TABLE `order_status_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `shipping_providers`
--
ALTER TABLE `shipping_providers`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `auth_sessions`
--
ALTER TABLE `auth_sessions`
  ADD CONSTRAINT `fk_as_user` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `auth_users_roles`
--
ALTER TABLE `auth_users_roles`
  ADD CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `auth_roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `auth_user_contacts`
--
ALTER TABLE `auth_user_contacts`
  ADD CONSTRAINT `fk_uc_user` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `auth_user_profile`
--
ALTER TABLE `auth_user_profile`
  ADD CONSTRAINT `fk_up_user` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `catalog_categories`
--
ALTER TABLE `catalog_categories`
  ADD CONSTRAINT `fk_cat_parent` FOREIGN KEY (`parent_id`) REFERENCES `catalog_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `catalog_products`
--
ALTER TABLE `catalog_products`
  ADD CONSTRAINT `fk_prod_seller` FOREIGN KEY (`seller_id`) REFERENCES `catalog_sellers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `catalog_product_categories`
--
ALTER TABLE `catalog_product_categories`
  ADD CONSTRAINT `fk_pc_category` FOREIGN KEY (`category_id`) REFERENCES `catalog_categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pc_product` FOREIGN KEY (`product_id`) REFERENCES `catalog_products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `catalog_product_images`
--
ALTER TABLE `catalog_product_images`
  ADD CONSTRAINT `fk_pi_product` FOREIGN KEY (`product_id`) REFERENCES `catalog_products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `catalog_product_prices`
--
ALTER TABLE `catalog_product_prices`
  ADD CONSTRAINT `fk_pp_product` FOREIGN KEY (`product_id`) REFERENCES `catalog_products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `catalog_product_tags`
--
ALTER TABLE `catalog_product_tags`
  ADD CONSTRAINT `fk_pt_product` FOREIGN KEY (`product_id`) REFERENCES `catalog_products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pt_tag` FOREIGN KEY (`tag_id`) REFERENCES `catalog_tags` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `catalog_sellers`
--
ALTER TABLE `catalog_sellers`
  ADD CONSTRAINT `fk_seller_user` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `escrow_accounts`
--
ALTER TABLE `escrow_accounts`
  ADD CONSTRAINT `fk_esc_order` FOREIGN KEY (`order_id`) REFERENCES `order_orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `escrow_events`
--
ALTER TABLE `escrow_events`
  ADD CONSTRAINT `fk_ee_esc` FOREIGN KEY (`escrow_account_id`) REFERENCES `escrow_accounts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `inventory_inventories`
--
ALTER TABLE `inventory_inventories`
  ADD CONSTRAINT `fk_inv_product` FOREIGN KEY (`product_id`) REFERENCES `catalog_products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `inventory_transactions`
--
ALTER TABLE `inventory_transactions`
  ADD CONSTRAINT `fk_it_inventory` FOREIGN KEY (`inventory_id`) REFERENCES `inventory_inventories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notification_notifications`
--
ALTER TABLE `notification_notifications`
  ADD CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_addresses`
--
ALTER TABLE `order_addresses`
  ADD CONSTRAINT `fk_addr_user` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_oi_order` FOREIGN KEY (`order_id`) REFERENCES `order_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_oi_product` FOREIGN KEY (`product_id`) REFERENCES `catalog_products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_orders`
--
ALTER TABLE `order_orders`
  ADD CONSTRAINT `fk_order_billaddr` FOREIGN KEY (`billing_address_id`) REFERENCES `order_addresses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_order_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `auth_users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_order_seller` FOREIGN KEY (`seller_id`) REFERENCES `catalog_sellers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_order_shipaddr` FOREIGN KEY (`shipping_address_id`) REFERENCES `order_addresses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD CONSTRAINT `fk_osh_order` FOREIGN KEY (`order_id`) REFERENCES `order_orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payment_payments`
--
ALTER TABLE `payment_payments`
  ADD CONSTRAINT `fk_pay_method` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pay_order` FOREIGN KEY (`order_id`) REFERENCES `order_orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `review_product_reviews`
--
ALTER TABLE `review_product_reviews`
  ADD CONSTRAINT `fk_pr_product` FOREIGN KEY (`product_id`) REFERENCES `catalog_products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pr_user` FOREIGN KEY (`user_id`) REFERENCES `auth_users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `shipping_shipments`
--
ALTER TABLE `shipping_shipments`
  ADD CONSTRAINT `fk_shp_order` FOREIGN KEY (`order_id`) REFERENCES `order_orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_shp_provider` FOREIGN KEY (`provider_id`) REFERENCES `shipping_providers` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
