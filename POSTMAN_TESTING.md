# 🧪 POSTMAN/THUNDER CLIENT - Testing Guide

## Complete 3-Step Admin Login Flow

---

## 🔴 STEP 1: Request OTP

### Request Details
```
Method: POST
URL: http://localhost:3000/api/auth/admin/request-otp
```

### Headers
```
Content-Type: application/json
```

### Payload
```json
{
  "email": "manish@gmail.com"
}
```

### Expected Response (200)
```json
{
  "message": "OTP sent to your email",
  "email": "manish@gmail.com"
}
```

### What Happens:
✅ Server validates email exists  
✅ Server checks role = "admin"  
✅ Server generates 6-digit OTP  
✅ Saves OTP in DB (10 min expiry)  
✅ Sends email with OTP  
✅ Resets attempt counter to 0  

### Common Errors:
- `404` → Email not found (not admin)
- `403` → User exists but role ≠ "admin"
- `500` → Email sending failed

---

## 🟠 STEP 2: Verify OTP ⭐ (What You Asked For)

### Request Details
```
Method: POST
URL: http://localhost:3000/api/auth/admin/verify-otp
```

### Headers
```
Content-Type: application/json
```

### Payload
```json
{
  "email": "manish@gmail.com",
  "otp": "123456"
}
```

### ⚠️ IMPORTANT:
- `email`: Must match the email used in Step 1
- `otp`: Check your email for the actual 6-digit OTP sent by server

### Expected Response (200) - SUCCESS
```json
{
  "message": "OTP verified. Enter your password.",
  "sessionToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NTA2ZjhhMjM0ZjU4MDAxZTJhOTQzMSIsImVtYWlsIjoibWFuaXNoQGdtYWlsLmNvbSIsInN0YWdlIjoicGFzc3dvcmQtaW5wdXQiLCJpYXQiOjE3MzM5NjM0NTcsImV4cCI6MTczMzk2NDM1N30.xYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMn"
}
```

### 🔑 SAVE THIS: `sessionToken`
You'll need this token for Step 3!

### Response Breakdown:
```javascript
{
  // Confirmation message
  "message": "OTP verified. Enter your password.",
  
  // JWT token valid for 15 minutes
  // Use this in Step 3 as Bearer token
  "sessionToken": "eyJhbGci..."
}
```

### Possible Error Responses:

#### ❌ Wrong OTP (1st or 2nd attempt)
```json
{
  "message": "Invalid OTP. Attempts left: 2"
}
Status: 400
```
You get 3 attempts total!

#### ❌ Wrong OTP (3rd attempt - too many)
```json
{
  "message": "Too many failed attempts. Request a new OTP."
}
Status: 403
```
Must go back to Step 1 and request new OTP

#### ❌ OTP Expired (after 10 minutes)
```json
{
  "message": "OTP expired. Request a new one."
}
Status: 400
```
Must go back to Step 1

#### ❌ No OTP Found
```json
{
  "message": "No OTP found. Request a new one."
}
Status: 400
```
Means you didn't do Step 1 first

#### ❌ User Not Found
```json
{
  "message": "User not found"
}
Status: 404
```
Email doesn't exist in database

### What Happens in Controller:

```javascript
export const verifyOTP = async (req, res) => {
  // 1. Get email and otp from request body
  const { email, otp } = req.body;

  // 2. Validate both are provided
  if (!email || !otp) {
    return res.status(400).json({
      message: "Email and OTP are required"
    });
  }

  // 3. Find user in database with OTP fields
  const user = await User.findOne({ email }).select(
    "+verificationCode +verificationCodeValidation +otpAttempts +role"
  );

  // 4. Check user exists
  if (!user) {
    return res.status(404).json({
      message: "User not found"
    });
  }

  // 5. Check if OTP was even generated
  if (!user.verificationCode) {
    return res.status(400).json({
      message: "No OTP found. Request a new one."
    });
  }

  // 6. Check if OTP expired (10 min check)
  if (Date.now() > user.verificationCodeValidation) {
    // Clear the expired OTP
    user.verificationCode = undefined;
    user.verificationCodeValidation = undefined;
    user.otpAttempts = 0;
    await user.save();
    
    return res.status(400).json({
      message: "OTP expired. Request a new one."
    });
  }

  // 7. Check if already failed 3 times
  if (user.otpAttempts >= 3) {
    // Clear the OTP
    user.verificationCode = undefined;
    user.verificationCodeValidation = undefined;
    user.otpAttempts = 0;
    await user.save();
    
    return res.status(403).json({
      message: "Too many failed attempts. Request a new OTP."
    });
  }

  // 8. Check if OTP matches
  if (user.verificationCode !== otp) {
    // Wrong OTP - increment attempts
    user.otpAttempts += 1;
    await user.save();
    
    const attemptsLeft = 3 - user.otpAttempts;
    return res.status(400).json({
      message: `Invalid OTP. Attempts left: ${attemptsLeft}`
    });
  }

  // 9. OTP is correct!
  // Generate session token (15 min validity)
  const sessionToken = jwt.sign(
    {
      id: user._id,
      email: user.email,
      stage: "password-input"
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  // 10. Clear OTP from database
  user.verificationCode = undefined;
  user.verificationCodeValidation = undefined;
  user.otpAttempts = 0;
  await user.save();

  // 11. Return success with session token
  return res.status(200).json({
    message: "OTP verified. Enter your password.",
    sessionToken
  });
}
```

---

## 🟢 STEP 3: Final Login

### Request Details
```
Method: POST
URL: http://localhost:3000/api/auth/admin/login
```

### Headers
```
Content-Type: application/json
Authorization: Bearer <sessionToken from Step 2>
```

### Payload
```json
{
  "email": "manish@gmail.com",
  "password": "123456"
}
```

### Expected Response (200) - SUCCESS
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NTA2ZjhhMjM0ZjU4MDAxZTJhOTQzMSIsImVtYWlsIjoibWFuaXNoQGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczMzk2MzQ1NywiZXhwIjoxNzM0NTY4MjU3fQ.xYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMn",
  "user": {
    "id": "6750f8a234f58001e2a9431",
    "email": "manish@gmail.com",
    "role": "admin"
  }
}
```

### 🔑 SAVE THIS: `token`
This is your final JWT token for accessing protected routes!

---

## 📋 Testing Sequence

### Complete Flow:
```
1. POST /api/auth/admin/request-otp
   Body: { "email": "manish@gmail.com" }
   ✓ Check email for OTP

2. POST /api/auth/admin/verify-otp
   Body: { "email": "manish@gmail.com", "otp": "123456" }
   ✓ Save sessionToken

3. POST /api/auth/admin/login
   Headers: Authorization: Bearer <sessionToken>
   Body: { "email": "manish@gmail.com", "password": "123456" }
   ✓ Save token for later use
```

---

## 🎯 Copy-Paste Ready Postman Requests

### Request 1 - Step 1
```
POST http://localhost:3000/api/auth/admin/request-otp
Content-Type: application/json

{
  "email": "manish@gmail.com"
}
```

### Request 2 - Step 2 (with actual OTP from email)
```
POST http://localhost:3000/api/auth/admin/verify-otp
Content-Type: application/json

{
  "email": "manish@gmail.com",
  "otp": "PASTE_OTP_FROM_EMAIL_HERE"
}
```

### Request 3 - Step 3 (with sessionToken from Step 2)
```
POST http://localhost:3000/api/auth/admin/login
Content-Type: application/json
Authorization: Bearer PASTE_SESSION_TOKEN_HERE

{
  "email": "manish@gmail.com",
  "password": "123456"
}
```

---

## ⚡ Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Email not received | Check spam folder, check EMAIL_PASS in .env |
| OTP wrong | Copy exactly from email (case sensitive) |
| "Attempts left: 0" | Request new OTP from Step 1 |
| "OTP expired" | Took more than 10 min, request new OTP |
| "No token provided" in Step 3 | Add Authorization header with sessionToken |
| "Invalid token" | sessionToken expired (15 min limit) |

---

## 📊 Data Flow Diagram

```
Postman Step 2:
┌─────────────────────────────────────────┐
│ POST /verify-otp                        │
│ {                                       │
│   "email": "manish@gmail.com",         │
│   "otp": "123456"                      │
│ }                                       │
└────────────┬────────────────────────────┘
             │
             ▼
    ┌─────────────────────┐
    │ Backend Controller  │
    │ verifyOTP()        │
    └────────┬────────────┘
             │
      ┌──────┴──────┐
      │   Checks    │
      └──────┬──────┘
             │
    ┌────────▼─────────────────────┐
    │ 1. Email & OTP provided?    │
    │ 2. User exists?             │
    │ 3. OTP exists?              │
    │ 4. OTP not expired?         │
    │ 5. Attempts < 3?            │
    │ 6. OTP matches?             │
    └────────┬─────────────────────┘
             │
    ✅ All Passed!
             │
      ┌──────▼──────────┐
      │ Generate JWT    │
      │ (sessionToken)  │
      │ Valid: 15 min   │
      └──────┬──────────┘
             │
      ┌──────▼──────────────────┐
      │ Clear OTP from DB       │
      │ Reset attempts to 0     │
      └──────┬──────────────────┘
             │
      ┌──────▼──────────────────┐
      │ Return Response         │
      │ {                       │
      │   "sessionToken": "..." │
      │ }                       │
      └──────┬──────────────────┘
             │
             ▼
    Postman receives
    sessionToken
```

---

**Everything ready! Go test it!** 🚀
