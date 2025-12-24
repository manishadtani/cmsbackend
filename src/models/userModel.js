import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: [true, "Email is already exist"], trim: true, minLength: 5, lowercase: true },
    password: { type: String, required: true, minLength: 6, maxLength: 1024, trim: true, select: false },

    // 🔥 NEW FIELD → Role Based Access
    role: {
        type: String,
        enum: ["admin", "super-admin"],
        default: "admin"
    },

    verified: { type: Boolean, default: false },
    verificationCode: { type: String, select: false }, 
    verificationCodeValidation: { type: Number, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
    forgotPasswordCode: { type: String, select: false },
    forgotPasswordCodeValidation: { type: Number, select: false },
    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
