## OTP Implementation - Testing Examples

### cURL Examples

#### 1. Register User
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePass123",
    "username": "testuser",
    "role": "buyer"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered. Check your email for OTP to verify your account.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "testuser@example.com",
    "username": "testuser",
    "message": "User registered. Check your email for OTP to verify your account."
  }
}
```

#### 2. Send OTP (Resend)
```bash
curl -X POST http://localhost:3000/api/users/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

#### 3. Verify OTP
```bash
curl -X POST http://localhost:3000/api/users/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "otp": "123456"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully. Account activated.",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "testuser@example.com",
    "username": "testuser"
  }
}
```

#### 4. Login After Verification
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePass123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "testuser@example.com",
      "username": "testuser",
      "roles": ["buyer"]
    }
  }
}
```

---

### Postman Collection

Save this as `techaven-otp.postman_collection.json`:

```json
{
  "info": {
    "name": "TechHaven OTP Implementation",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Register User",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/users/register",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"testuser@example.com\",\n  \"password\": \"SecurePass123\",\n  \"username\": \"testuser\",\n  \"role\": \"buyer\"\n}"
        }
      }
    },
    {
      "name": "2. Send OTP (Resend)",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/users/send-otp",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"testuser@example.com\"\n}"
        }
      }
    },
    {
      "name": "3. Verify OTP",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/users/verify-otp",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"userId\": \"{{userId}}\",\n  \"otp\": \"123456\"\n}"
        }
      }
    },
    {
      "name": "4. Login",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/users/login",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"testuser@example.com\",\n  \"password\": \"SecurePass123\"\n}"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000/api"
    },
    {
      "key": "userId",
      "value": "550e8400-e29b-41d4-a716-446655440000"
    }
  ]
}
```

---

### Error Scenarios

#### Invalid OTP
```bash
curl -X POST http://localhost:3000/api/users/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "otp": "999999"
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "OTP verification failed: Invalid or expired OTP"
}
```

#### Expired OTP (after 10 minutes)
```json
{
  "success": false,
  "message": "OTP verification failed: Invalid or expired OTP"
}
```

#### Validation Error - Invalid OTP Format
```bash
curl -X POST http://localhost:3000/api/users/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "otp": "12345"
  }'
```

**Response:**
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

#### User Not Found
```bash
curl -X POST http://localhost:3000/api/users/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com"
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Failed to send OTP: User not found"
}
```

#### Account Not Activated (Login Before OTP Verification)
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePass123"
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Login failed: Account is deactivated"
}
```

---

### Testing Workflow

1. **Register a new user** → Copy `userId` from response
2. **Check email** (Ethereal logs or Mailtrap) → Get OTP code
3. **Verify OTP** → Use `userId` and OTP code
4. **Try Login** → Should now succeed
5. **Resend OTP** → Generate new code
6. **Test Invalid OTP** → Use wrong code, verify error

---

### Development Tips

**Get OTP from Ethereal Console (Development):**
```bash
# Enable debug logging in email.service.js
console.log('OTP sent to:', to, 'Code:', otp);
```

**Check OTP in Database:**
```sql
SELECT email, otp, otp_expires_at, is_active FROM auth_users 
WHERE email = 'testuser@example.com';
```

**Clear OTP Manually:**
```sql
UPDATE auth_users SET otp = NULL, otp_expires_at = NULL 
WHERE email = 'testuser@example.com';
```

**Activate User Manually:**
```sql
UPDATE auth_users SET is_active = 1 
WHERE email = 'testuser@example.com';
```

---

**Last Updated:** December 2025
