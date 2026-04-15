import User from "../models/User.js";
import jwt from "jsonwebtoken";

// signup controller
export async function signup(req, res) {
  try {
    const { email, password, userName } = req.body;

    // validate input
    if (!email || !password || !userName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // check if user exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const userNameExists = await User.findOne({ userName });
    if (userNameExists) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Create user
    const newUser = await User.create({ email, userName, password });

    // Create JWT token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" },
    );

    // set cookie
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    console.log("Error in signup controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// login controller
export async function login(req, res) {
  try {
    const { userName, password } = req.body;

    // validate input
    if (!userName || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find user by username
    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(401).json({ message: "Invalid user name or password" });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid user name or password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      },
    );

    // Set cookie
    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        userName: user.userName,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        city: user.city,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.log("Error in login controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// logout controller
export function logout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logout successful" });
}
