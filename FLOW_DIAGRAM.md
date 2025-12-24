# 🔐 Admin Login Flow - Visual Guide

## Complete 3-Step Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PROFESSIONAL ADMIN LOGIN FLOW                        │
└─────────────────────────────────────────────────────────────────────────┘

STEP 1: EMAIL VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Frontend                          Backend                    Database
  ────────────────────────────────────────────────────────────────────
  
  User enters email
           │
           ├─→ POST /admin/request-otp ──→ Check email exists? ─→ Query User
           │                                     ├─ Yes, Role=admin? ─→ ✅
           │                                     └─ No/Not admin? ─→ ❌ 403
           │
           ├────────────────────────────────── Generate OTP ────────────┐
           │                                    (6 digits)               │
           │                                    Expiry: 10 min           │
           │                                    Save to DB ──────────────┤
           │                                                              │
           │◀─ Response + Save "email" ◀── Send Email (NodeMailer) ────┤
           │   "OTP sent to your email"      ✉️ admin@gmail.com         │
           │                                 "Your OTP: 123456"         │
           │                                                             │
           ▼                                                             │
    [OTP Received]                                                       │
    (Check Email)                                                        │
           │                                                             │
           ▼                                                             │
    Show OTP Input Form                                                 │
           │                                                             │
           └─────────────────────────────────────────────────────────────┘


STEP 2: OTP VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  User enters OTP
           │
           ├─→ POST /admin/verify-otp ──→ Find User
           │                                 ├─ OTP exists? ──────────┐
           │                                 ├─ Not expired? ──────────┤
           │                                 └─ Attempts < 3? ────────┐│
           │                                                           ││
           │                    LOGIC FLOW                             ││
           │                    ───────────                            ││
           │         Match OTP?            Wrong OTP?                ││
           │         /              \      /                \         ││
           │     ✅ Yes        ❌ No (max 3 tries)                   ││
           │        │               │                                ││
           │        │          Increment       Block User            ││
           │        │          Attempts +1     Force Email Step      ││
           │        │               │                                ││
           │        └─ Generate ────┴──→ Save to DB ─────────────────┘│
           │          Session Token        (Clear OTP)                │
           │          (JWT signed)                                    │
           │          Expiry: 15 min                                  │
           │                                                           │
           ◀───────── Response: ◀───────────────────────────────────────┘
           │         sessionToken (only for password step!)
           │         "OTP verified. Enter password"
           │
           ▼
    [SAVE sessionToken]
    (In localStorage/cookie)
           │
           ▼
    Show Password Input Form
           │
           └─────────────────────────────┐
                                         │
                                         ▼


STEP 3: PASSWORD VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  User enters password
           │
           ├─→ POST /admin/login ──────→ Get sessionToken from header
           │   (with sessionToken)         ├─ Token valid? ─┐
           │   Headers: {                 └─ Not expired?  │
           │     Authorization:                              │
           │     "Bearer <sessionToken>"                     │
           │   }                                             │
           │                                                 │
           │                        Verify JWT + Email Match ─┘
           │                                 │
           │              Find User by ID ───┘
           │                  ├─ User exists? ──────────┐
           │                  ├─ Role = admin? ─────────┤
           │                  ├─ Verified = true? ──────┤
           │                  ├─ Password match? ───────┤
           │                  └─ (bcrypt compare)       │
           │                                            │
           │          All checks passed!               │
           │          ✅ ✅ ✅ ✅ ✅ ✅                   │
           │                                            │
           │◀─ Generate Final JWT Token ◀──────────────┘
           │   (7 days expiry)
           │   Payload: { id, email, role }
           │
           ├─ Response:
           │  {
           │    "message": "Login successful",
           │    "token": "eyJhbGc...",
           │    "user": {
           │      "id": "507f1f77bcf86cd799439011",
           │      "email": "admin@example.com",
           │      "role": "admin"
           │    }
           │  }
           │
           ▼
    [SAVE Final Token]
    (In localStorage/cookie)
           │
           ▼
    ✅ LOGGED IN!
    Use token for all protected routes:
    Headers: Authorization: Bearer <token>
           │
           ▼
    Access Protected Admin Routes
    - /api/admin/dashboard
    - /api/admin/users
    - /api/admin/settings
    (authMiddleware + isAdmin check)

```

---

## Error Flows

### ❌ WRONG OTP (Max 3 Attempts)
```
Step 2: Verify OTP
       │
       ├─ Wrong OTP (1st time) → "Attempts left: 2"
       ├─ Wrong OTP (2nd time) → "Attempts left: 1"
       ├─ Wrong OTP (3rd time) → ❌ 403 "Too many failed attempts"
       │
       └─ User must request new OTP from Step 1
```

### ❌ OTP EXPIRED (After 10 min)
```
Step 2: Verify OTP (after 10 min)
       │
       ├─ OTP expired? → ❌ 400 "OTP expired"
       │
       └─ User must request new OTP from Step 1
```

### ❌ SESSION TOKEN EXPIRED (After 15 min)
```
Step 3: Login (after 15 min from step 2)
       │
       ├─ Session token expired? → ❌ 401 "Session expired"
       │
       └─ User must start from Step 1 again
```

---

## Database Changes

### User Model Updated Fields
```javascript
{
  email: String,                          // Admin email
  password: String,                       // Hashed password
  role: String,                           // "admin" role
  verified: Boolean,                      // Must be true to login
  
  verificationCode: String,               // Current OTP (max 10 min)
  verificationCodeValidation: Number,    // OTP expiry timestamp
  otpAttempts: Number,                   // Track wrong attempts (max 3)
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## Token Lifespans

```
Step 1: Request OTP
├─ OTP Valid: 10 minutes
├─ Stored in DB
└─ Sent to email

       ↓

Step 2: Verify OTP → Get sessionToken
├─ Session Token Valid: 15 minutes
├─ JWT Signed with "password-input" stage
└─ Used only for next request

       ↓

Step 3: Login → Get Final Token
├─ Final Token Valid: 7 days
├─ JWT Signed with user role
└─ Used for all protected routes
```

---

## Security Layers

```
Layer 1: Email Verification
├─ Only registered admin emails can request OTP
└─ Non-admin users get rejected

Layer 2: OTP Verification
├─ 6-digit random OTP
├─ 10-minute expiry
├─ Max 3 failed attempts
└─ Session token has 15-min expiry

Layer 3: Password Verification
├─ bcryptjs hashed password
├─ Session token must be valid
├─ Email must match
├─ Account must be verified
└─ Role must be "admin"

Layer 4: Route Protection
├─ authMiddleware checks JWT
├─ isAdmin middleware checks role
└─ Only admins access admin routes
```

---

## API Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200  | Success | Continue to next step |
| 400  | Bad request | Fix input and retry |
| 401  | Unauthorized | Session expired, start from Step 1 |
| 403  | Forbidden | Too many attempts, start from Step 1 |
| 404  | Not found | Email/User not found |
| 500  | Server error | Retry or contact support |


