-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 26, 2025 at 05:12 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

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
-- Creation: Dec 17, 2025 at 11:01 PM
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

--
-- RELATIONSHIPS FOR TABLE `admin_audit_logs`:
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_system_settings`
--
-- Creation: Dec 17, 2025 at 11:01 PM
-- Last update: Dec 26, 2025 at 02:14 AM
--

CREATE TABLE `admin_system_settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `key_name` varchar(255) NOT NULL,
  `value` longtext DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELATIONSHIPS FOR TABLE `admin_system_settings`:
--

--
-- Dumping data for table `admin_system_settings`
--

INSERT INTO `admin_system_settings` (`id`, `key_name`, `value`, `updated_at`) VALUES
(1, 'APP_Name', 'Techaven', '2025-12-25 18:00:44'),
(2, 'version', '1.0.0', '2025-12-26 02:08:55'),
(3, 'min_version', '1.0.0', '2025-12-26 02:08:55'),
(4, 'update_url', ' https://play.google.com/store/apps/details?id=mw.techaven.app', '2025-12-26 02:13:24'),
(5, 'terms_url', 'https://techaven.mw/terms', '2025-12-26 02:13:24'),
(6, 'privacy_url', 'https://techaven.mw/privacy', '2025-12-26 02:13:24'),
(7, 'support_email', 'support@techaven.mw', '2025-12-26 02:14:41'),
(8, 'support_phone', '+265991234567', '2025-12-26 02:14:41');

-- --------------------------------------------------------

--
-- Table structure for table `auth_roles`
--
-- Creation: Dec 17, 2025 at 11:01 PM
--

CREATE TABLE `auth_roles` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELATIONSHIPS FOR TABLE `auth_roles`:
--

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
-- Creation: Dec 17, 2025 at 11:01 PM
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

--
-- RELATIONSHIPS FOR TABLE `auth_sessions`:
--   `user_id`
--       `auth_users` -> `id`
--

--
-- Dumping data for table `auth_sessions`
--

INSERT INTO `auth_sessions` (`id`, `user_id`, `refresh_token_hash`, `created_at`, `expires_at`, `user_agent`, `ip_address`) VALUES
('04d040f6-346e-4bef-afb2-d79974335322', '172431d9-600c-4cb6-ab67-0506cb96cd63', '193a01b1ddc7db068dcc9e6ffe5ae695a61cc7c561ff1432233c377795dc2ab0', '2025-12-23 17:16:37', '2025-12-30 17:16:37', 'PostmanRuntime/7.51.0', '127.0.0.1'),
('2fd7fb40-581b-4003-87dd-d58f118e3c34', '54130a68-9ca4-44f2-8a85-e44bd2eff294', '0d602890935e537829b4d64d3e4d45dfe30192267e3665c4a841b24a9c06e2ff', '2025-12-19 12:30:20', '2025-12-26 12:30:20', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('32799bc6-b3cf-4981-b2f7-08e19ba065cf', '54130a68-9ca4-44f2-8a85-e44bd2eff294', '92884f8a5d236d5d147d00ade38d890bedf9e6e3e5430ec7d7413abfec433706', '2025-12-20 19:22:25', '2025-12-27 19:22:25', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('3d7c7991-fdb9-4c53-b255-7f2565fffef9', '54130a68-9ca4-44f2-8a85-e44bd2eff294', '2e838b871672f24b20e6266ea9e545714a6ef57bdfd818b79954c77bf3b6442c', '2025-12-19 12:30:14', '2025-12-26 12:30:14', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('4a761289-6095-466c-945a-bc38d7914b7d', '54130a68-9ca4-44f2-8a85-e44bd2eff294', 'f6aedeadcd030f7ac05b30bbcb1ac9c13a1ceb4d72ce52565fc232560cb884f9', '2025-12-20 05:50:59', '2025-12-27 05:50:59', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('5a124244-94b6-4b76-a51e-585a7fbe51ac', '54130a68-9ca4-44f2-8a85-e44bd2eff294', '04a3382b17f11593773bf4a51490adcc470a962b1797730a6ba97368fe73882d', '2025-12-19 12:17:23', '2025-12-26 12:17:23', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('73685495-58c9-491a-9dd1-2f1cad7d0e0c', '7de52251-9066-4cfa-824d-c3cd53db9661', 'fe6a451b1f8268b6cd9fe67ea49a7ec4a4487645b5c76baa6d2554315d63a01e', '2025-12-22 15:16:55', '2025-12-29 15:16:54', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('b5d62a0e-0cb9-433e-8177-16706d7223ba', '54130a68-9ca4-44f2-8a85-e44bd2eff294', '9e347cbac67a6a5f7df77c2832e50a71ab2f9b74e4ddca3b7b9e8f004f00beff', '2025-12-19 12:14:36', '2025-12-26 12:14:36', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('c0cb21dc-d722-4796-8a7a-653e3490057f', '54130a68-9ca4-44f2-8a85-e44bd2eff294', '1d0190d83179da45adc3b644c2d1d957e194728ea7e6766c62e76636c2ccfffa', '2025-12-19 11:24:58', '2025-12-26 11:24:58', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('c8cc9b5b-7011-445e-83d2-b0c35dd59b2b', '54130a68-9ca4-44f2-8a85-e44bd2eff294', '0ac6bd2dceaaaf392cc298b30f7d6b345e30d7a5f74782eaaf6f0f3033f90020', '2025-12-21 05:14:02', '2025-12-28 05:14:02', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('d6a8c15f-d91b-4502-bfa8-0b8ec529b7a2', '54130a68-9ca4-44f2-8a85-e44bd2eff294', 'ff5602c5039ddd78f9d28f26b298d58e50b43e21b584c75d34ac77060c9b20f7', '2025-12-20 19:49:47', '2025-12-27 19:49:47', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('e0d9bd51-810d-46f8-a5b2-74c2ceeea5d9', '54130a68-9ca4-44f2-8a85-e44bd2eff294', '2066aae589234746623fc303da69026114b9a62e5a20a3d0e402defca6bfc22e', '2025-12-20 19:46:43', '2025-12-27 19:46:43', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1');

-- --------------------------------------------------------

--
-- Table structure for table `auth_users`
--
-- Creation: Dec 22, 2025 at 06:04 AM
--

CREATE TABLE `auth_users` (
  `id` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `otp` varchar(6) DEFAULT NULL,
  `otp_expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `is_active` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELATIONSHIPS FOR TABLE `auth_users`:
--

--
-- Dumping data for table `auth_users`
--

INSERT INTO `auth_users` (`id`, `email`, `password_hash`, `username`, `otp`, `otp_expires_at`, `created_at`, `updated_at`, `is_active`) VALUES
('172431d9-600c-4cb6-ab67-0506cb96cd63', 'superadmin001@gmail.com', '$2a$10$Yk5aZYAik4.1AVMbdlG29uE/wYcyacv1MFF9fN2OgbJnIEvdJEAOm', 'superadmin', NULL, NULL, '2025-12-19 11:05:10', NULL, 1),
('2e77d931-ee61-4dd7-941b-32cf21981fd2', 'christian@techaven.com', '$2a$10$/bfCuu56A.FIsEs8DgXzJO5aQO1usqk7um2q00bAdkA19Eexak5h.', 'Balui', NULL, NULL, '2025-12-21 08:43:42', NULL, 0),
('4620dcf0-6607-4e06-b43e-ba4126112132', 'kk@g.com', '$2a$10$hmwupxnOMPnJXia3fNSjrOJpcCXA8kUh6Z26l9EETWPc5c54UgO8a', 'hkg', NULL, NULL, '2025-10-24 10:49:18', NULL, 1),
('54130a68-9ca4-44f2-8a85-e44bd2eff294', 'superadmin002@gmail.com', '$2a$10$wLdl0eYE5JeAm4uDJBSXAuewdTbTakst8ppUgv1AlV.6q1zYUTX.u', 'superadmi2', NULL, NULL, '2025-12-19 11:14:53', '2025-12-21 05:29:13', 0),
('74e50b38-b3e0-495a-ae5e-83634d56f83f', 'buyer100@gmail.com', '$2a$10$O1o9sFsH6bCTlM3W2uHrGuV19QthbZwMUemsOtrtvB7wXMXD1LLmG', 'buyer100', NULL, NULL, '2025-12-19 10:54:29', NULL, 1),
('7de52251-9066-4cfa-824d-c3cd53db9661', 'born2code265@gmail.com', '$2a$10$sJaBsAEimzDBENpjitlqUudH8joDbrwbNWcODU0F3LSiAMBqJRTP6', 'BornToCodeFoundaton', NULL, NULL, '2025-12-22 07:20:05', '2025-12-22 15:15:58', 1),
('dd8ac68d-368c-401b-8ad1-d71e1875e4f2', 'pincesmnsusa@gmail.com', '$2a$10$LP8jSsXxmgrVu8dSRcTu6eg81qswQvZEw6SKU/88Zo1MVJn72GTAC', 'Preffols', '362836', '2025-12-23 17:19:47', '2025-12-23 17:09:47', '2025-12-23 17:09:47', 0),
('df14e8ce-2fb5-423d-a0b4-467f45e1bf09', 'john@gmail.com', '$2a$10$zfqlyXdK1ZbwL6A1p7zscuEH0XVlLZFsDrEtbIOrqQqORlrau9Kym', 'john1347', NULL, NULL, '2025-10-24 13:42:10', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `auth_users_roles`
--
-- Creation: Dec 17, 2025 at 11:01 PM
--

CREATE TABLE `auth_users_roles` (
  `user_id` char(36) NOT NULL,
  `role_id` int(10) UNSIGNED NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELATIONSHIPS FOR TABLE `auth_users_roles`:
--   `role_id`
--       `auth_roles` -> `id`
--   `user_id`
--       `auth_users` -> `id`
--

--
-- Dumping data for table `auth_users_roles`
--

INSERT INTO `auth_users_roles` (`user_id`, `role_id`, `assigned_at`) VALUES
('4620dcf0-6607-4e06-b43e-ba4126112132', 1, '2025-10-24 12:45:21'),
('74e50b38-b3e0-495a-ae5e-83634d56f83f', 2, '2025-12-19 10:54:29'),
('172431d9-600c-4cb6-ab67-0506cb96cd63', 1, '2025-12-19 11:05:10'),
('54130a68-9ca4-44f2-8a85-e44bd2eff294', 1, '2025-12-19 11:14:53'),
('7de52251-9066-4cfa-824d-c3cd53db9661', 3, '2025-12-22 07:20:05'),
('dd8ac68d-368c-401b-8ad1-d71e1875e4f2', 2, '2025-12-23 17:09:47');

-- --------------------------------------------------------

--
-- Table structure for table `auth_user_contacts`
--
-- Creation: Dec 17, 2025 at 11:01 PM
--

CREATE TABLE `auth_user_contacts` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `contact_type` enum('email','phone','whatsapp','telegram','other') NOT NULL,
  `contact_value` varchar(255) NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `verified_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELATIONSHIPS FOR TABLE `auth_user_contacts`:
--   `user_id`
--       `auth_users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `auth_user_profile`
--
-- Creation: Dec 17, 2025 at 11:01 PM
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
-- RELATIONSHIPS FOR TABLE `auth_user_profile`:
--   `user_id`
--       `auth_users` -> `id`
--

--
-- Dumping data for table `auth_user_profile`
--

INSERT INTO `auth_user_profile` (`user_id`, `full_name`, `phone`, `dob`, `locale`, `metadata`) VALUES
('172431d9-600c-4cb6-ab67-0506cb96cd63', NULL, NULL, NULL, NULL, NULL),
('2e77d931-ee61-4dd7-941b-32cf21981fd2', NULL, NULL, NULL, NULL, NULL),
('4620dcf0-6607-4e06-b43e-ba4126112132', NULL, NULL, NULL, NULL, NULL),
('54130a68-9ca4-44f2-8a85-e44bd2eff294', NULL, NULL, NULL, NULL, NULL),
('74e50b38-b3e0-495a-ae5e-83634d56f83f', NULL, NULL, NULL, NULL, NULL),
('7de52251-9066-4cfa-824d-c3cd53db9661', NULL, NULL, NULL, NULL, NULL),
('dd8ac68d-368c-401b-8ad1-d71e1875e4f2', NULL, NULL, NULL, NULL, NULL),
('df14e8ce-2fb5-423d-a0b4-467f45e1bf09', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `catalog_categories`
--
-- Creation: Dec 17, 2025 at 11:01 PM
--

CREATE TABLE `catalog_categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `parent_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELATIONSHIPS FOR TABLE `catalog_categories`:
--   `parent_id`
--       `catalog_categories` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `catalog_products`
--
-- Creation: Dec 17, 2025 at 11:01 PM
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

--
-- RELATIONSHIPS FOR TABLE `catalog_products`:
--   `seller_id`
--       `catalog_sellers` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `catalog_product_categories`
--
-- Creation: Dec 17, 2025 at 11:01 PM
--

CREATE TABLE `catalog_product_categories` (
  `product_id` char(36) NOT NULL,
  `category_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELATIONSHIPS FOR TABLE `catalog_product_categories`:
--   `category_id`
--       `catalog_categories` -> `id`
--   `product_id`
--       `catalog_products` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `catalog_product_images`
--
-- Creation: Dec 17, 2025 at 11:01 PM
--

CREATE TABLE `catalog_product_images` (
  `id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `url` varchar(2048) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELATIONSHIPS FOR TABLE `catalog_product_images`:
--   `product_id`
--       `catalog_products` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `catalog_product_prices`
--
-- Creation: Dec 17, 2025 at 11:01 PM
--

CREATE TABLE `catalog_product_prices` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` char(36) NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `currency` char(3) NOT NULL DEFAULT 'MWK',
  `valid_from` timestamp NOT NULL DEFAULT current_timestamp(),
  `valid_to` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELATIONSHIPS FOR TABLE `catalog_product_prices`:
--   `product_id`
--       `catalog_products` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `catalog_product_tags`
--
-- Creation: Dec 17, 2025 at 11:01 PM
--

CREATE TABLE `catalog_product_tags` (
  `product_id` char(36) NOT NULL,
  `tag_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELATIONSHIPS FOR TABLE `catalog_product_tags`:
--   `product_id`
--       `catalog_products` -> `id`
--   `tag_id`
--       `catalog_tags` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `catalog_sellers`
--
-- Creation: Dec 25, 2025 at 02:39 AM
-- Last update: Dec 25, 2025 at 02:39 AM
--

CREATE TABLE `catalog_sellers` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `business_name` varchar(255) DEFAULT NULL,
  `registration_number` varchar(100) DEFAULT NULL,
  `status` int(10) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELATIONSHIPS FOR TABLE `catalog_sellers`:
--   `user_id`
--       `auth_users` -> `id`
--

--
-- Dumping data for table `catalog_sellers`
--

INSERT INTO `catalog_sellers` (`id`, `user_id`, `business_name`, `registration_number`, `status`, `created_at`, `updated_at`) VALUES
('31c6eb29-7340-44a6-91ab-a43c8de87aa3', '7de52251-9066-4cfa-824d-c3cd53db9661', 'born To Code Foundation', 'CY-5WJ', 0, '2025-12-22 16:03:03', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `catalog_tags`
--
-- Creation: Dec 17, 2025 at 11:01 PM
--

CREATE TABLE `catalog_tags` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELATIONSHIPS FOR TABLE `catalog_tags`:
--

-- --------------------------------------------------------

--
-- Table structure for table `escrow_accounts`
--
-- Creation: Dec 17, 2025 at 11:01 PM
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

--
-- RELATIONSHIPS FOR TABLE `escrow_accounts`:
--   `order_id`
--       `order_orders` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `escrow_events`
--
-- Creation: Dec 17, 2025 at 11:01 PM
--

CREATE TABLE `escrow_events` (
  `id` char(36) NOT NULL,
  `escrow_account_id` char(36) NOT NULL,
  `event_type` varchar(100) NOT NULL,
  `event_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`event_data`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELATIONSHIPS FOR TABLE `escrow_events`:
--   `escrow_account_id`
--       `escrow_accounts` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `inventory_inventories`
--
-- Creation: Dec 17, 2025 at 11:01 PM
--

CREATE TABLE `inventory_inventories` (
  `id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `reserved` int(11) NOT NULL DEFAULT 0,
  `location_code` varchar(100) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELATIONSHIPS FOR TABLE `inventory_inventories`:
--   `product_id`
--       `catalog_products` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `inventory_transactions`
--
-- Creation: Dec 17, 2025 at 11:01 PM
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

--
-- RELATIONSHIPS FOR TABLE `inventory_transactions`:
--   `inventory_id`
--       `inventory_inventories` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `notification_notifications`
--
-- Creation: Dec 17, 2025 at 11:01 PM
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

--
-- RELATIONSHIPS FOR TABLE `notification_notifications`:
--   `user_id`
--       `auth_users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `order_addresses`
--
-- Creation: Dec 17, 2025 at 11:01 PM
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

--
-- RELATIONSHIPS FOR TABLE `order_addresses`:
--   `user_id`
--       `auth_users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--
-- Creation: Dec 17, 2025 at 11:01 PM
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

--
-- RELATIONSHIPS FOR TABLE `order_items`:
--   `order_id`
--       `order_orders` -> `id`
--   `product_id`
--       `catalog_products` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `order_orders`
--
-- Creation: Dec 17, 2025 at 11:01 PM
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

--
-- RELATIONSHIPS FOR TABLE `order_orders`:
--   `billing_address_id`
--       `order_addresses` -> `id`
--   `buyer_id`
--       `auth_users` -> `id`
--   `seller_id`
--       `catalog_sellers` -> `id`
--   `shipping_address_id`
--       `order_addresses` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `order_status_history`
--
-- Creation: Dec 17, 2025 at 11:01 PM
--

CREATE TABLE `order_status_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` char(36) NOT NULL,
  `status` varchar(50) NOT NULL,
  `changed_by` char(36) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELATIONSHIPS FOR TABLE `order_status_history`:
--   `order_id`
--       `order_orders` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `payment_methods`
--
-- Creation: Dec 17, 2025 at 11:01 PM
--

CREATE TABLE `payment_methods` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `provider` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELATIONSHIPS FOR TABLE `payment_methods`:
--

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
-- Creation: Dec 17, 2025 at 11:01 PM
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

--
-- RELATIONSHIPS FOR TABLE `payment_payments`:
--   `payment_method_id`
--       `payment_methods` -> `id`
--   `order_id`
--       `order_orders` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `review_product_reviews`
--
-- Creation: Dec 17, 2025 at 11:01 PM
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

--
-- RELATIONSHIPS FOR TABLE `review_product_reviews`:
--   `product_id`
--       `catalog_products` -> `id`
--   `user_id`
--       `auth_users` -> `id`
--

-- --------------------------------------------------------

--
-- Table structure for table `shipping_providers`
--
-- Creation: Dec 17, 2025 at 11:01 PM
--

CREATE TABLE `shipping_providers` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `contact_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`contact_info`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELATIONSHIPS FOR TABLE `shipping_providers`:
--

-- --------------------------------------------------------

--
-- Table structure for table `shipping_shipments`
--
-- Creation: Dec 17, 2025 at 11:01 PM
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
-- RELATIONSHIPS FOR TABLE `shipping_shipments`:
--   `order_id`
--       `order_orders` -> `id`
--   `provider_id`
--       `shipping_providers` -> `id`
--

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
  ADD KEY `idx_users_is_active` (`is_active`),
  ADD KEY `idx_auth_users_otp` (`otp`,`otp_expires_at`);

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
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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