import express from 'express';
import { requestOTP, verifyOTP, login, resendOTP, requestPasswordChangeOTP, verifyPasswordChangeOTP, changePassword, resendPasswordChangeOTP } from '../controllers/auth.controller.js';
const router = express.Router();

// ========== LOGIN FLOW ==========
// Step 1: Request OTP with email
router.post('/admin/request-otp', requestOTP);

// Step 1.5: Resend OTP (without email in body)
router.post('/admin/resend-otp', resendOTP);

// Step 2: Verify OTP
router.post('/admin/verify-otp', verifyOTP);

// Step 3: Login with password (requires sessionToken from step 2)
router.post('/admin/login', login);

// ========== PASSWORD CHANGE FLOW ==========
// Step 1: Request OTP for password change (requires logged-in JWT)
router.post('/admin/request-password-change-otp', requestPasswordChangeOTP);

// Step 1.5: Resend OTP for password change (without email in body)
router.post('/admin/resend-password-change-otp', resendPasswordChangeOTP);

// Step 2: Verify OTP for password change (requires otpSessionToken)
router.post('/admin/verify-password-change-otp', verifyPasswordChangeOTP);

// Step 3: Change password (requires changePasswordToken)
router.post('/admin/change-password', changePassword);

export default router;