import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./src/models/User.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("12345678", 10); // hash the password before saving

    await User.create({
      userName: "admincvdcare",
      email: "admincvdcare@gmail.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin seeded successfully!");
  } catch (err) {
    console.error("Seed admin failed:", err);
  } finally {
    await mongoose.connection.close();
  }
}

seedAdmin();
