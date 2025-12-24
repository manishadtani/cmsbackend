# Admin Login Flow - API Documentation

## Complete 3-Step Authentication Flow

### Step 1: Request OTP (Email Verification)
**Endpoint:** `POST /api/auth/admin/request-otp`

**Request Body:**
```json
{
  "email": "admin@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "OTP sent to your email",
  "email": "admin@example.com"
}
```

**Error Responses:**
- `400`: Email not provided
- `404`: Admin email not found in system
- `403`: User exists but is not admin
- `500`: Failed to send email

---

### Step 2: Verify OTP
**Endpoint:** `POST /api/auth/admin/verify-otp`

**Request Body:**
```json
{
  "email": "admin@example.com",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "message": "OTP verified. Enter your password.",
  "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400`: Invalid OTP / OTP expired / Email or OTP missing
  - Includes attempts left message
- `403`: Too many failed attempts (3 max)
- `404`: User not found

**Important:** Save the `sessionToken` - it will be needed for the final login step!

---

### Step 3: Login with Password
**Endpoint:** `POST /api/admin/login`

**Headers:**
```
Authorization: Bearer <sessionToken from step 2>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Error Responses:**
- `400`: Email/password missing or email mismatch
- `401`: Invalid password / Session expired / No sessionToken
- `403`: Account not verified / Not an admin
- `404`: User not found

---

## Using the Final Token

After successful login, use the returned token for all protected routes:

**Headers for Protected Routes:**
```
Authorization: Bearer <token from login response>
```

---

## Field Explanations

### OTP Details
- **Valid for:** 10 minutes
- **Length:** 6 digits
- **Max Attempts:** 3 attempts to enter correct OTP
- **After 3 fails:** Must request new OTP

### Session Token (from verify-otp)
- **Valid for:** 15 minutes
- **Purpose:** Only for password input step
- **Expires:** After 15 minutes, must start from step 1 again

### Final JWT Token (from login)
- **Valid for:** 7 days
- **Purpose:** Access all protected admin routes
- **Payload includes:** id, email, role

---

## Error Handling Guide

| Scenario | Action |
|----------|--------|
| OTP expired | Request new OTP from step 1 |
| 3 OTP attempts failed | Request new OTP from step 1 |
| Session token expired | Go back to step 1 |
| Password incorrect | Try again (step 3) |
| Not verified user | Account needs verification first |
| Non-admin user | Only admins can access |

---

## Frontend Integration Example

```javascript
// Step 1: Request OTP
const step1 = async (email) => {
  const res = await fetch('/api/auth/admin/request-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return res.json();
};

// Step 2: Verify OTP
const step2 = async (email, otp) => {
  const res = await fetch('/api/auth/admin/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  const data = await res.json();
  // Save sessionToken from data.sessionToken
  return data;
};

// Step 3: Login
const step3 = async (email, password, sessionToken) => {
  const res = await fetch('/api/auth/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionToken}`
    },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  // Save final token from data.token
  return data;
};
```
