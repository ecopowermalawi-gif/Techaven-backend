-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 02, 2026 at 04:12 AM
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
  `value` longtext DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

--
-- Dumping data for table `auth_sessions`
--

INSERT INTO `auth_sessions` (`id`, `user_id`, `refresh_token_hash`, `created_at`, `expires_at`, `user_agent`, `ip_address`) VALUES
('04d040f6-346e-4bef-afb2-d79974335322', '172431d9-600c-4cb6-ab67-0506cb96cd63', '193a01b1ddc7db068dcc9e6ffe5ae695a61cc7c561ff1432233c377795dc2ab0', '2025-12-23 17:16:37', '2025-12-30 17:16:37', 'PostmanRuntime/7.51.0', '127.0.0.1'),
('0d639abc-bd9c-4de6-8389-6bcc839f6cde', '7de52251-9066-4cfa-824d-c3cd53db9661', '83d1cb39998c39455c23b4ca8dc81619c23722fbaaf33cc854a52e0c01520eda', '2025-12-26 14:56:19', '2026-01-02 14:56:19', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('146d2135-b550-4f88-a9bb-8c795374e206', '74e50b38-b3e0-495a-ae5e-83634d56f83f', '62c0c0ffcea3f317d5ee4dbb89868551c4cd435af6677746557a831f0901d524', '2025-12-29 17:16:22', '2026-01-05 17:16:22', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('471d52a4-8624-4b7c-9c42-4a039f5964f1', '74e50b38-b3e0-495a-ae5e-83634d56f83f', '888f86174f55d163add5237e19c3126205b4c16e35f7887ab328d9ba4d369758', '2025-12-29 09:11:23', '2026-01-05 09:11:23', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('4da1a7e5-c651-49c5-9905-d79d5d8398d7', '74e50b38-b3e0-495a-ae5e-83634d56f83f', '5fda8d5e3fcad0b0c31779ba6c484de0ea1a91ed552a6af2e6abe5e8fcd5c454', '2025-12-29 08:57:19', '2026-01-05 08:57:19', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('64279a4b-84e1-4d68-844e-c981b0b30086', '74e50b38-b3e0-495a-ae5e-83634d56f83f', '88e7e918f36099abe457cc3709b6a17fe7efc15ba022ef48414e19877e19109c', '2025-12-29 09:33:10', '2026-01-05 09:33:10', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('7077c251-9634-4bf9-b1ce-b99068d5b5dd', '74e50b38-b3e0-495a-ae5e-83634d56f83f', '1e23870d6a1a64592721f3f814b5f39e354577336fbe8d54f641d5bf689752be', '2025-12-29 12:56:01', '2026-01-05 12:56:01', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('73685495-58c9-491a-9dd1-2f1cad7d0e0c', '7de52251-9066-4cfa-824d-c3cd53db9661', 'fe6a451b1f8268b6cd9fe67ea49a7ec4a4487645b5c76baa6d2554315d63a01e', '2025-12-22 15:16:55', '2025-12-29 15:16:54', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('79093506-6e90-48f6-a13c-de6977049429', '74e50b38-b3e0-495a-ae5e-83634d56f83f', '3b6c2ec4ac1b660f60a2be2e9187f44b306490818400d6737223eb783684ada1', '2025-12-29 17:26:44', '2026-01-05 17:26:44', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('8f6da048-1a82-4db1-882c-96d337290a95', '74e50b38-b3e0-495a-ae5e-83634d56f83f', 'eeeae73ce69bccb063dddc02d21d721181f072040e53de58c0b046eb3e3c6cdb', '2025-12-29 13:05:43', '2026-01-05 13:05:43', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('a07d0d79-a7e5-4f68-aec9-31d9d252c76c', '74e50b38-b3e0-495a-ae5e-83634d56f83f', '2ebc673512c8540380e9106b9c5b0f1d6a7f54fd0dfd24b889fa3f8fea76239c', '2025-12-29 09:33:48', '2026-01-05 09:33:48', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('af468c45-a523-4acf-bd09-941d41158666', '74e50b38-b3e0-495a-ae5e-83634d56f83f', '6826a01ebae9544ddc2c562578ea9711e52af348915044b3d03c4fe7b02d62dc', '2025-12-29 09:10:06', '2026-01-05 09:10:06', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('b941c4a3-7374-4b67-b079-3a8a04513334', '74e50b38-b3e0-495a-ae5e-83634d56f83f', 'e306251a390dad5551a9bc995a0119a26001d9aee712259f534e83159a5b99ec', '2025-12-29 09:09:04', '2026-01-05 09:09:04', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('c775157f-d6b0-42d1-853c-f1e5c27f9011', 'fb6eb0e4-e85e-466f-93fc-cd72c5855c40', '359fb92145ee4782d14406e9142ca16aa2d4cc50624473ea748aeaf13f2e3d4c', '2025-12-30 04:40:46', '2026-01-06 04:40:46', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('db3d6aa6-1045-4be1-9711-6a15817522ac', 'fb6fa1ca-4f2c-42ab-9e54-ab4d5850e9f6', '8a1998cb4143fb6f988e6d05767f012a3076afb6eb4c8c5872a048be74d72706', '2025-12-27 02:21:42', '2026-01-03 02:21:42', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('e1d6a443-5348-4135-8bae-5c1b847e2b73', '74e50b38-b3e0-495a-ae5e-83634d56f83f', 'c2e5e0d699fb62df09af47042fc70014e81b7e4d14beed6123adfabb27b4cdb7', '2025-12-29 17:17:28', '2026-01-05 17:17:28', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('e31211aa-8b29-4eab-ab74-7802d440323e', '74e50b38-b3e0-495a-ae5e-83634d56f83f', '745d93a9a26b04430fb83c75f8fc4ce364929e7584d463f9f3e314d9905b6570', '2025-12-30 04:31:41', '2026-01-06 04:31:41', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1'),
('edb8e424-ff9b-4fc3-bb5b-d4cf9c712234', '74e50b38-b3e0-495a-ae5e-83634d56f83f', '77fe02ac361a5f984bb0a22b435a8fbe3e3c583d8500cfb18471781698f5c4d9', '2025-12-29 17:27:51', '2026-01-05 17:27:51', 'Thunder Client (https://www.thunderclient.com)', '127.0.0.1');

-- --------------------------------------------------------

--
-- Table structure for table `auth_users`
--

CREATE TABLE `auth_users` (
  `id` char(36) NOT NULL,
  `phone_number` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `otp` varchar(6) DEFAULT NULL,
  `otp_expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `is_active` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auth_users`
--

INSERT INTO `auth_users` (`id`, `phone_number`, `password_hash`, `username`, `otp`, `otp_expires_at`, `created_at`, `updated_at`, `is_active`) VALUES
('026900a1-f496-4662-ab74-9eafa8230ff8', 'ecopowermalawi@gmail.com', '$2a$10$P.tDd5rUoxPNV6r/WMG0t.96E.9aKfXI7qdOVHh.83bS8axfSi0fS', 'ecopower', '357827', '2025-12-27 15:36:50', '2025-12-27 15:26:50', '2025-12-27 15:26:50', 0),
('172431d9-600c-4cb6-ab67-0506cb96cd63', 'superadmin001@gmail.com', '$2a$10$Yk5aZYAik4.1AVMbdlG29uE/wYcyacv1MFF9fN2OgbJnIEvdJEAOm', 'superadmin', NULL, NULL, '2025-12-19 11:05:10', NULL, 1),
('2e77d931-ee61-4dd7-941b-32cf21981fd2', 'christian@techaven.com', '$2a$10$/bfCuu56A.FIsEs8DgXzJO5aQO1usqk7um2q00bAdkA19Eexak5h.', 'Balui', NULL, NULL, '2025-12-21 08:43:42', NULL, 0),
('58efe176-8cf4-4ad6-a2e1-2cb1f6340027', 'chifundo@gmail.com', '$2a$10$BfV9VmIoOIk58WQvm7IsPOtI2AcVBUoXdZUljCTGYp/wLfKhBJ.bS', 'admin963', '192462', '2025-12-31 17:33:35', '2025-12-30 06:18:26', '2025-12-31 17:23:35', 0),
('74e50b38-b3e0-495a-ae5e-83634d56f83f', 'buyer100@gmail.com', '$2a$10$jaYqkdtZUHctkJ3pwlWfyeBPDFsbshqic.RPyoq8zYGfvpC9Bq/C2', 'buyer100', NULL, NULL, '2025-12-19 10:54:29', '2025-12-30 04:31:12', 1),
('7de52251-9066-4cfa-824d-c3cd53db9661', 'born2code265@gmail.com', '$2a$10$sJaBsAEimzDBENpjitlqUudH8joDbrwbNWcODU0F3LSiAMBqJRTP6', 'BornToCodeFoundaton', '967825', '2025-12-27 15:35:31', '2025-12-22 07:20:05', '2025-12-27 15:25:31', 1),
('f93b9ef2-8f3c-4e5f-9cb3-02b0ce5eaab5', 'admin1234@gmail.com', '$2a$10$/9bEYalh2V8TIWosoOMsg./9U496wxQKmCYUY3ntZldX5.CzOu.wa', 'Admin', NULL, '2025-12-27 02:53:41', '2025-12-27 01:43:41', '2025-12-27 01:59:56', 1),
('fb6eb0e4-e85e-466f-93fc-cd72c5855c40', 'kdg100@gmail.com', '$2a$10$6OV3YVHJRx8a6BUti3BCyuKypKWtjWFUARejk6n31enhPQ3Dqnm3O', 'kdg', NULL, NULL, '2025-12-30 04:39:22', '2025-12-30 04:40:35', 1),
('fb6fa1ca-4f2c-42ab-9e54-ab4d5850e9f6', 'admin99@gmail.com', '$2a$10$L/ra6gAGMSatEQy/p1Gn5eiLAm6ZRiRCYDluAxOk0xYiaJ0JQBy1.', 'Admin99', NULL, NULL, '2025-12-27 02:19:15', '2025-12-27 02:21:17', 1);

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
('74e50b38-b3e0-495a-ae5e-83634d56f83f', 2, '2025-12-19 10:54:29'),
('172431d9-600c-4cb6-ab67-0506cb96cd63', 1, '2025-12-19 11:05:10'),
('7de52251-9066-4cfa-824d-c3cd53db9661', 3, '2025-12-22 07:20:05'),
('f93b9ef2-8f3c-4e5f-9cb3-02b0ce5eaab5', 1, '2025-12-27 01:43:41'),
('fb6fa1ca-4f2c-42ab-9e54-ab4d5850e9f6', 1, '2025-12-27 02:19:15'),
('026900a1-f496-4662-ab74-9eafa8230ff8', 2, '2025-12-27 15:26:50'),
('fb6eb0e4-e85e-466f-93fc-cd72c5855c40', 3, '2025-12-30 04:39:22'),
('58efe176-8cf4-4ad6-a2e1-2cb1f6340027', 1, '2025-12-30 06:18:26');

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
  `email` varchar(255) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `locale` varchar(10) DEFAULT NULL,
  `metadata` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auth_user_profile`
--

INSERT INTO `auth_user_profile` (`user_id`, `full_name`, `email`, `dob`, `locale`, `metadata`) VALUES
('026900a1-f496-4662-ab74-9eafa8230ff8', NULL, NULL, NULL, NULL, NULL),
('172431d9-600c-4cb6-ab67-0506cb96cd63', NULL, NULL, NULL, NULL, NULL),
('2e77d931-ee61-4dd7-941b-32cf21981fd2', NULL, NULL, NULL, NULL, NULL),
('58efe176-8cf4-4ad6-a2e1-2cb1f6340027', NULL, NULL, NULL, NULL, NULL),
('74e50b38-b3e0-495a-ae5e-83634d56f83f', 'Smart Virus', '0111666963', '1990-05-15', NULL, '{}'),
('7de52251-9066-4cfa-824d-c3cd53db9661', NULL, NULL, NULL, NULL, NULL),
('f93b9ef2-8f3c-4e5f-9cb3-02b0ce5eaab5', NULL, NULL, NULL, NULL, NULL),
('fb6eb0e4-e85e-466f-93fc-cd72c5855c40', NULL, NULL, NULL, NULL, NULL),
('fb6fa1ca-4f2c-42ab-9e54-ab4d5850e9f6', NULL, NULL, NULL, NULL, NULL);

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
  `status` int(10) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `catalog_sellers`
--

INSERT INTO `catalog_sellers` (`id`, `user_id`, `business_name`, `registration_number`, `status`, `created_at`, `updated_at`) VALUES
('31c6eb29-7340-44a6-91ab-a43c8de87aa3', '7de52251-9066-4cfa-824d-c3cd53db9661', 'born To Code Foundation', 'CY-5WJ', 0, '2025-12-22 16:03:03', NULL),
('6004055b-ebc3-4582-8e32-1b77e424a3b2', 'fb6eb0e4-e85e-466f-93fc-cd72c5855c40', 'KDG shop', NULL, 0, '2025-12-30 04:39:22', NULL);

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
  ADD UNIQUE KEY `ux_users_email` (`phone_number`),
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
