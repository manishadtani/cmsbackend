import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// Generic token verification middleware
export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer token
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("+role +email");
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Enhanced token verification - specifically for CMS (requires admin role)
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    // Check token exists
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized. No token provided.",
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }

    // Find user and check role
    const user = await User.findById(decoded.id).select("+role +email");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check if admin
    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Only admins can modify content.",
      });
    }

    // Check if verified
    if (!user.verified) {
      return res.status(403).json({
        message: "Account not verified",
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Token Verification Error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};
