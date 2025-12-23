-- Migration: Add OTP fields to auth_users table
-- This migration adds OTP (One-Time Password) support for email verification

ALTER TABLE auth_users ADD COLUMN otp VARCHAR(6) NULL AFTER username;
ALTER TABLE auth_users ADD COLUMN otp_expires_at TIMESTAMP NULL AFTER otp;

-- Update default is_active to 0 (user must verify email via OTP)
ALTER TABLE auth_users MODIFY COLUMN is_active TINYINT(1) NOT NULL DEFAULT 0;

-- Add index for OTP lookups
CREATE INDEX idx_auth_users_otp ON auth_users(otp, otp_expires_at);

-- Note: If you want to preserve existing active users, run this:
-- UPDATE auth_users SET is_active = 1 WHERE created_at < NOW() - INTERVAL 10 MINUTE;
