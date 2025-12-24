import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./src/models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

const insertUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const hashedPassword = await bcrypt.hash("123456", 10);

    const user = await User.create({
      email: "manish@digicots.com",
      password: hashedPassword,
      role: "admin",
      verified: true,
    });

    console.log("User added:", user);
    process.exit();
  } catch (error) {
    console.log("Error inserting user:", error);
    process.exit();
  }
};

insertUser();
