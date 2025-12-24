import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendOTPEmail } from "../utils/emailService.js";



// Step 1: Request OTP - Verify admin email
export const requestOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Check if user exists and is admin
    const user = await User.findOne({ email }).select("+otpAttempts");

    if (!user) {
      return res.status(404).json({
        message: "Admin email not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Only admins can login",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP with 10 minutes expiry
    user.verificationCode = otp;
    user.verificationCodeValidation = Date.now() + 10 * 60 * 1000; // 10 min
    user.otpAttempts = 0; // Reset attempts on new OTP request
    await user.save();

    // Send OTP via email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      return res.status(500).json({
        message: "Failed to send OTP email",
      });
    }

    // Set cookie with email (10 min expiry, HttpOnly)
    res.cookie('otpEmail', email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    return res.status(200).json({
      message: "OTP sent to your email",
      email: email, // So frontend knows which email to use next
    });
  } catch (error) {
    console.error("Request OTP Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Step 1.5: Resend OTP - for login (without email in body)
export const resendOTP = async (req, res) => {
  try {
    // Get email from cookie
    const email = req.cookies.otpEmail;

    if (!email) {
      return res.status(400).json({
        message: "Request OTP first",
      });
    }

    // Check if user exists and is admin
    const user = await User.findOne({ email }).select("+otpAttempts");

    if (!user) {
      return res.status(404).json({
        message: "Admin email not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Only admins can login",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP with 10 minutes expiry
    user.verificationCode = otp;
    user.verificationCodeValidation = Date.now() + 10 * 60 * 1000; // 10 min
    user.otpAttempts = 0; // Reset attempts on resend
    await user.save();

    // Send OTP via email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      return res.status(500).json({
        message: "Failed to send OTP email",
      });
    }

    // Update cookie expiry (10 min from now)
    res.cookie('otpEmail', email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    return res.status(200).json({
      message: "OTP resent to your email",
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};


// Step 2: Verify OTP - Check OTP and return session token
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    // Find user
    const user = await User.findOne({ email }).select(
      "+verificationCode +verificationCodeValidation +otpAttempts +role"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check if OTP exists
    if (!user.verificationCode) {
      return res.status(400).json({
        message: "No OTP found. Request a new one.",
      });
    }

    // Check if OTP expired
    if (Date.now() > user.verificationCodeValidation) {
      user.verificationCode = undefined;
      user.verificationCodeValidation = undefined;
      user.otpAttempts = 0;
      await user.save();
      return res.status(400).json({
        message: "OTP expired. Request a new one.",
      });
    }

    // Check attempts
    if (user.otpAttempts >= 3) {
      user.verificationCode = undefined;
      user.verificationCodeValidation = undefined;
      user.otpAttempts = 0;
      await user.save();
      return res.status(403).json({
        message: "Too many failed attempts. Request a new OTP.",
      });
    }

    // Check if OTP matches
    if (user.verificationCode !== otp) {
      user.otpAttempts += 1;
      await user.save();
      const attemptsLeft = 3 - user.otpAttempts;
      return res.status(400).json({
        message: `Invalid OTP. Attempts left: ${attemptsLeft}`,
      });
    }

    // OTP Correct - Create temporary session token (just for password input)
    const sessionToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        stage: "password-input", // Only for password input stage
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // Short lived
    );

    // Clear OTP from DB
    user.verificationCode = undefined;
    user.verificationCodeValidation = undefined;
    user.otpAttempts = 0;
    await user.save();

    return res.status(200).json({
      message: "OTP verified. Enter your password.",
      sessionToken, // For frontend to use in password step
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};



// Step 3: Login with password - Get final JWT token
export const login = async (req, res) => {  
  try {
    const { email, password } = req.body;
    const sessionToken = req.headers.authorization?.split(" ")[1]; // Get sessionToken from header

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (!sessionToken) {
      return res.status(401).json({
        message: "Session expired. Start from email verification.",
      });
    }

    // Verify session token
    let decoded;
    try {
      decoded = jwt.verify(sessionToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        message: "Invalid or expired session. Start from email verification.",
      });
    }

    // Check if email matches
    if (decoded.email !== email) {
      return res.status(400).json({
        message: "Email mismatch. Start from email verification.",
      });
    }

    // Find user
    const user = await User.findById(decoded.id).select("+password +role");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check if admin
    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Only admins can login",
      });
    }

    // Check if verified (OTP was done)
    if (!user.verified) {
      return res.status(403).json({
        message: "Account not verified",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    // Create final JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send token + user data
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ========== PASSWORD CHANGE FLOW ==========

// Step 1: Request OTP for password change (requires logged-in user)
export const requestPasswordChangeOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const authHeader = req.headers.authorization?.split(" ")[1];

    // Validate JWT token exists
    if (!authHeader) {
      return res.status(401).json({
        message: "Unauthorized. Login required.",
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(authHeader, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    // Use email from token or body
    const userEmail = email || decoded.email;

    if (!userEmail) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Find user
    const user = await User.findOne({ email: userEmail }).select("+otpAttempts");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check if verified
    if (!user.verified) {
      return res.status(403).json({
        message: "Only verified accounts can change password",
      });
    }

    // Check if admin
    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Only admins can change password",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP with 10 minutes expiry
    user.verificationCode = otp;
    user.verificationCodeValidation = Date.now() + 10 * 60 * 1000;
    user.otpAttempts = 0;
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(userEmail, otp);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      return res.status(500).json({
        message: "Failed to send OTP email",
      });
    }

    // Generate OTP session token (valid for 10 minutes, purpose: change-password)
    const otpSessionToken = jwt.sign(
      {
        email: userEmail,
        purpose: "change-password",
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    // Set cookie with email and purpose (10 min expiry, HttpOnly)
    res.cookie('otpEmail', userEmail, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    res.cookie('otpPurpose', 'change-password', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    return res.status(200).json({
      message: "OTP sent to your email for password change",
      otpSessionToken,
    });
  } catch (error) {
    console.error("Request Password Change OTP Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Step 2: Verify OTP for password change
export const verifyPasswordChangeOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const otpSessionToken = req.headers.authorization?.split(" ")[1];

    // Validate input
    if (!otp) {
      return res.status(400).json({
        message: "OTP is required",
      });
    }

    if (!otpSessionToken) {
      return res.status(401).json({
        message: "OTP session expired. Request new OTP.",
      });
    }

    // Verify OTP session token
    let decoded;
    try {
      decoded = jwt.verify(otpSessionToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        message: "Invalid or expired OTP session. Request new OTP.",
      });
    }

    // Check purpose
    if (decoded.purpose !== "change-password") {
      return res.status(403).json({
        message: "Invalid token purpose",
      });
    }

    // Find user
    const user = await User.findOne({ email: decoded.email }).select(
      "+verificationCode +verificationCodeValidation +otpAttempts"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check if OTP exists
    if (!user.verificationCode) {
      return res.status(400).json({
        message: "No OTP found. Request a new one.",
      });
    }

    // Check if OTP expired
    if (Date.now() > user.verificationCodeValidation) {
      user.verificationCode = undefined;
      user.verificationCodeValidation = undefined;
      user.otpAttempts = 0;
      await user.save();
      return res.status(400).json({
        message: "OTP expired. Request new one.",
      });
    }

    // Check attempts
    if (user.otpAttempts >= 3) {
      user.verificationCode = undefined;
      user.verificationCodeValidation = undefined;
      user.otpAttempts = 0;
      await user.save();
      return res.status(403).json({
        message: "Too many failed attempts. Request new OTP.",
      });
    }

    // Verify OTP
    if (user.verificationCode !== otp) {
      user.otpAttempts += 1;
      await user.save();
      const attemptsLeft = 3 - user.otpAttempts;
      return res.status(400).json({
        message: `Invalid OTP. Attempts left: ${attemptsLeft}`,
      });
    }

    // OTP verified - Create change password token (valid for 15 minutes)
    const changePasswordToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        purpose: "change-password",
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Clear OTP from DB
    user.verificationCode = undefined;
    user.verificationCodeValidation = undefined;
    user.otpAttempts = 0;
    await user.save();

    return res.status(200).json({
      message: "OTP verified. Proceed to change password.",
      changePasswordToken,
    });
  } catch (error) {
    console.error("Verify Password Change OTP Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Step 2.5: Resend OTP for password change (without email in body)
export const resendPasswordChangeOTP = async (req, res) => {
  try {
    // Get email from cookie
    const email = req.cookies.otpEmail;
    const otpPurpose = req.cookies.otpPurpose;
    const otpSessionToken = req.headers.authorization?.split(" ")[1];

    // Validate cookies
    if (!email || otpPurpose !== 'change-password') {
      return res.status(400).json({
        message: "Request OTP first for password change",
      });
    }

    // Validate token
    if (!otpSessionToken) {
      return res.status(401).json({
        message: "OTP session expired. Request new OTP.",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(otpSessionToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        message: "Invalid or expired OTP session. Request new OTP.",
      });
    }

    // Check purpose
    if (decoded.purpose !== "change-password") {
      return res.status(403).json({
        message: "Invalid token purpose",
      });
    }

    // Find user
    const user = await User.findOne({ email }).select("+otpAttempts");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check if verified
    if (!user.verified) {
      return res.status(403).json({
        message: "Only verified accounts can change password",
      });
    }

    // Check if admin
    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Only admins can change password",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP with 10 minutes expiry
    user.verificationCode = otp;
    user.verificationCodeValidation = Date.now() + 10 * 60 * 1000;
    user.otpAttempts = 0; // Reset attempts on resend
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      return res.status(500).json({
        message: "Failed to send OTP email",
      });
    }

    // Update cookies expiry (10 min from now)
    res.cookie('otpEmail', email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    res.cookie('otpPurpose', 'change-password', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    // Generate new OTP session token (valid for 10 minutes)
    const newOtpSessionToken = jwt.sign(
      {
        email: email,
        purpose: "change-password",
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    return res.status(200).json({
      message: "OTP resent to your email",
      otpSessionToken: newOtpSessionToken,
    });
  } catch (error) {
    console.error("Resend Password Change OTP Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Step 3: Change password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const changePasswordToken = req.headers.authorization?.split(" ")[1];

    // Validate input
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Old password, new password, and confirm password are required",
      });
    }

    if (!changePasswordToken) {
      return res.status(401).json({
        message: "Unauthorized. Complete OTP verification first.",
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(changePasswordToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        message: "Invalid or expired token. Request new OTP.",
      });
    }

    // Check purpose
    if (decoded.purpose !== "change-password") {
      return res.status(403).json({
        message: "Invalid token purpose",
      });
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match",
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    // Find user
    const user = await User.findById(decoded.id).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Verify old password
    const isOldPasswordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordMatch) {
      return res.status(400).json({
        message: "Old password is incorrect",
      });
    }

    // Check if new password is same as old (optional but good practice)
    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        message: "New password must be different from old password",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in DB
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      message: "Password changed successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};
