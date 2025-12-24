import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: `"Admin Panel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code - Admin Login",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Admin Login OTP</h2>
          <p>Your OTP for admin login is:</p>
          <h1 style="color: #2196F3; letter-spacing: 3px;">${otp}</h1>
          <p style="color: #666;">This OTP will expire in <strong>10 minutes</strong>.</p>
          <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Email Error:", error);
    throw error;
  }
};
