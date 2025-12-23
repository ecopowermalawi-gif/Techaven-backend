# OTP (One-Time Password) Email Verification Implementation

## Overview

This implementation adds a complete OTP-based email verification system to the TechHaven backend. Users must verify their email with a 6-digit OTP before their account becomes active.

## Features

- **OTP Generation**: 6-digit random codes generated on demand
- **Email Delivery**: OTP codes sent via Mailtrap (production) or Ethereal (development)
- **Expiration**: OTPs expire after 10 minutes
- **Account Activation**: Email verification activates user accounts
- **Rate Limiting**: Protection against brute force (built-in validation)
- **Resend Support**: Users can request new OTP if expired

## API Endpoints

### 1. Register User
**POST** `/api/users/register`

Creates a new user account and sends OTP to email.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "username": "john_doe",
  "role": "buyer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered. Check your email for OTP to verify your account.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "john_doe"
  }
}
```

### 2. Send OTP
**POST** `/api/users/send-otp`

Resends OTP to user's email address.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

### 3. Verify OTP
**POST** `/api/users/verify-otp`

Verifies the OTP and activates the user account.

**Request:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully. Account activated.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "john_doe"
  }
}
```

## Database Schema Changes

### Updated `auth_users` Table

```sql
ALTER TABLE auth_users ADD COLUMN otp VARCHAR(6) NULL;
ALTER TABLE auth_users ADD COLUMN otp_expires_at TIMESTAMP NULL;
ALTER TABLE auth_users MODIFY COLUMN is_active TINYINT(1) NOT NULL DEFAULT 0;
```

**New Fields:**
- `otp`: Stores the 6-digit OTP code
- `otp_expires_at`: Timestamp when OTP expires (10 minutes after generation)
- `is_active`: Changed default from 1 to 0 (users inactive until email verified)

## Environment Configuration

Update your `.env` file:

```env
# SMTP Configuration (for Ethereal - development)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_ethereal_email@example.com
SMTP_PASS=your_ethereal_password

# Mailtrap Configuration (for production)
MAILTRAP_TOKEN=your_mailtrap_token

# Email settings
EMAIL_FROM=noreply@techaven.com
NODE_ENV=development  # or 'production'
```

## Implementation Details

### Services Layer (`user.service.js`)

**New Methods:**
- `generateOTP()`: Creates a random 6-digit code
- `sendOTP(email)`: Generates and sends OTP to user's email
- `verifyOTP(userId, otp)`: Validates OTP and activates account
- `registerUser()`: Updated to generate OTP and send email

### Email Service (`email.service.js`)

**New Methods:**
- `sendOTPEmail(to, otp, expiresIn)`: Sends formatted OTP email
- `sendPasswordResetEmail()`: Password reset with reset link
- `sendPasswordChangeNotification()`: Notifies about password changes
- `sendPasswordResetConfirmation()`: Confirms password reset

### Model Layer (`user.model.js`)

**New Methods:**
- `storeOTP(userId, otp)`: Saves OTP to database (10-minute expiry)
- `validateOTP(userId, otp)`: Checks if OTP is valid and not expired
- `clearOTP(userId)`: Removes OTP after successful verification

### Validation Rules

Added to `validation.js`:
```javascript
sendOTP: [
  body('email').isEmail().normalizeEmail()
],

verifyOTP: [
  body('userId').isLength({ min: 36, max: 36 }),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric()
]
```

## Client-Side Flow

### Registration Flow
```
1. User fills registration form
2. Client sends POST /api/users/register
3. Server creates inactive user, generates OTP, sends email
4. User receives OTP in email
5. User enters OTP on client
6. Client sends POST /api/users/verify-otp
7. Server activates account
8. User can now log in
```

### OTP Expiry Flow
```
1. If user doesn't verify within 10 minutes
2. OTP expires automatically
3. User clicks "Resend OTP"
4. Client sends POST /api/users/send-otp
5. Server generates new OTP, sends email
6. Process repeats
```

## Email Templates

All emails use HTML templates with:
- Professional branding
- Clear call-to-action buttons
- Expiry information
- Security warnings

### OTP Email Template
- Shows 6-digit code prominently
- Expires in 10 minutes
- Warning not to share code
- Link to ignore if unsolicited

### Password Reset Email Template
- Reset link with token
- Expiry information
- Security notice

## Migration Steps

### For Existing Databases:

1. **Run migration:**
```bash
mysql -u root -p techaven < migrations/001_add_otp_fields.sql
```

2. **Preserve existing users as active:**
```sql
UPDATE auth_users SET is_active = 1 WHERE created_at < NOW() - INTERVAL 10 MINUTE;
```

### For New Installations:

Simply run the full schema from `techaven_schema.sql` - it already includes OTP fields.

## Testing

### Test with Ethereal (Development)

1. Set `NODE_ENV=development` in `.env`
2. Get Ethereal credentials from https://ethereal.email
3. Run registration: OTP will be logged to console
4. Verify OTP with the code from logs

### Test with Mailtrap (Production)

1. Set `NODE_ENV=production` in `.env`
2. Add `MAILTRAP_TOKEN` to `.env`
3. Run registration: Email sent to Mailtrap inbox
4. View email in Mailtrap dashboard
5. Extract OTP and verify

## Security Considerations

✅ **Implemented:**
- OTP expires after 10 minutes (configurable)
- OTP is random 6-digit (999,999 possibilities)
- Passwords hashed with bcrypt
- Rate limiting on register/login endpoints
- OTP validation happens server-side

⚠️ **Additional Recommendations:**
- Add rate limiting to OTP endpoint (max 5 attempts per 15 minutes)
- Log failed OTP attempts for security audit
- Consider implementing exponential backoff after failed attempts
- Add CAPTCHA after multiple failed attempts

## Error Handling

**Invalid OTP:**
```json
{
  "success": false,
  "message": "Invalid or expired OTP"
}
```

**User Not Found:**
```json
{
  "success": false,
  "message": "User not found"
}
```

**Validation Errors:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "otp",
      "message": "OTP must be 6 digits"
    }
  ]
}
```

## Future Enhancements

- SMS-based OTP (Twilio integration)
- Two-factor authentication (2FA) using TOTP
- OTP resend rate limiting
- Backup codes for account recovery
- Email verification reminders
- Account lockout after multiple failed attempts

---

**Last Updated:** December 2025
**Status:** Production Ready
