# ✅ Professional Admin Login Flow - Implementation Complete

## 📦 Packages Already Installed

Your `package.json` already has all required dependencies:

- ✅ `nodemailer` ^7.0.11 - For sending OTP emails
- ✅ `jsonwebtoken` ^9.0.3 - For JWT tokens
- ✅ `bcryptjs` ^3.0.3 - For password hashing
- ✅ `express` ^5.2.1 - Web framework
- ✅ `mongoose` ^9.0.1 - MongoDB ORM
- ✅ All other dependencies

**No additional packages need to be installed!**

---

## 🔧 Setup Instructions

### 1. Create `.env` file in root directory

Copy from `.env.example` and fill in your values:

```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_strong_secret_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
```

### 2. Gmail Setup for Email Sending

1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or your device)
3. Generate app password
4. Use that password in `EMAIL_PASS` (not your Gmail password!)

### 3. Database Setup

Make sure you have created an admin user:

```bash
npm start
# Then run this separately
node insertUser.js
```

This creates:
- Email: `manish@gmail.com`
- Password: `123456`
- Role: `admin`
- Verified: `true`

---

## 🔄 Login Flow Summary

### Step 1: Request OTP
```
POST /api/auth/admin/request-otp
Body: { "email": "admin@example.com" }
Response: { "message": "OTP sent...", "email": "..." }
```

### Step 2: Verify OTP
```
POST /api/auth/admin/verify-otp
Body: { "email": "admin@example.com", "otp": "123456" }
Response: { "message": "OTP verified...", "sessionToken": "..." }
⚠️ SAVE sessionToken - needed for next step!
```

### Step 3: Login
```
POST /api/auth/admin/login
Headers: Authorization: Bearer <sessionToken>
Body: { "email": "admin@example.com", "password": "123456" }
Response: { "message": "Login successful", "token": "...", "user": {...} }
✅ USE THIS TOKEN for protected routes!
```

---

## 📋 What Changed

### Files Modified:
1. ✅ `src/models/userModel.js` - Added `otpAttempts` field
2. ✅ `src/controllers/auth.controller.js` - Replaced old login with 3 functions: `requestOTP`, `verifyOTP`, `login`
3. ✅ `src/routers/auth.routers.js` - Added 3 new routes
4. ✅ `src/middlewares/authMiddleware.js` - Minor updates for role/email

### Files Created:
1. ✅ `src/utils/emailService.js` - Email sending utility
2. ✅ `.env.example` - Environment variables template
3. ✅ `API_DOCUMENTATION.md` - Complete API docs

### Removed:
- ❌ Old simple login logic (replaced with 3-step flow)
- ❌ Unnecessary code

---

## 🔐 Security Features

✅ **OTP expiry:** 10 minutes  
✅ **Max OTP attempts:** 3 (then must request new OTP)  
✅ **Session token:** 15 minutes (only for password step)  
✅ **Final JWT:** 7 days (for authenticated requests)  
✅ **Email verification:** Only verified admins can login  
✅ **Password hashing:** bcryptjs  
✅ **Role-based access:** Only "admin" role can access  

---

## 🧪 Testing with Postman/Thunder Client

### Test 1: Request OTP
```
POST http://localhost:3000/api/auth/admin/request-otp
{
  "email": "manish@gmail.com"
}
```
✅ Should get 200 with OTP sent message

### Test 2: Verify OTP
Check email for OTP, then:
```
POST http://localhost:3000/api/auth/admin/verify-otp
{
  "email": "manish@gmail.com",
  "otp": "123456"  // From email
}
```
✅ Should get 200 with sessionToken

### Test 3: Login
```
POST http://localhost:3000/api/auth/admin/login
Headers:
  Authorization: Bearer <sessionToken from step 2>

{
  "email": "manish@gmail.com",
  "password": "123456"
}
```
✅ Should get 200 with final JWT token

---

## 🎯 Next Steps

1. ✅ Already done: Code implementation
2. Create `.env` file with your credentials
3. Test with Postman/Thunder Client
4. Build frontend UI for 3-step flow
5. Use final JWT token for protected admin routes

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| Email not sending | Check EMAIL_USER and EMAIL_PASS in .env (use App Password for Gmail) |
| OTP not found | Make sure you completed Step 1 first |
| Session token expired | Start from Step 1 again |
| "Only admins can login" | Make sure user role is "admin" in database |
| Connection error | Check MONGODB_URI in .env |

---

## 📚 Complete File Structure

```
varallobackend/
├── src/
│   ├── controllers/
│   │   └── auth.controller.js (✅ UPDATED - 3 functions)
│   ├── middlewares/
│   │   ├── authMiddleware.js (✅ UPDATED)
│   │   └── isAdmin.js
│   ├── models/
│   │   └── userModel.js (✅ UPDATED - added otpAttempts)
│   ├── routers/
│   │   └── auth.routers.js (✅ UPDATED - 3 routes)
│   └── utils/
│       └── emailService.js (✅ NEW - email utility)
├── index.js
├── insertUser.js
├── package.json
├── .env (⚠️ CREATE THIS)
├── .env.example (✅ NEW - template)
└── API_DOCUMENTATION.md (✅ NEW - full docs)
```

---

**Status:** ✅ READY TO USE!

Go ahead, create `.env` file, and test the authentication flow! 🚀
