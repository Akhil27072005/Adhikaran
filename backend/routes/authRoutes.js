const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const findUserByEmail = require("../auth/findUserByEmail");
const generateTokens = require("../auth/generateTokens");
const User = require("../models/user");
const Judge = require("../models/judge");

const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password, role, age, phone, postedCity, address, court } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Full name, email, and password are required" });
    }

    // Check existing user
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user based on role
    const userData = {
      fullName,
      email,
      password: hashedPassword,
      age,
      phone,
      postedCity,
      ...(role === 'judge' ? { court } : { address })
    };

    const newUser = role === 'judge' 
      ? new Judge(userData)
      : new User(userData);

    await newUser.save();
    
    res.status(201).json({ 
      message: `${role === 'judge' ? 'Judge' : 'User'} registered successfully!` 
    });
    
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Database connection check
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: "Database not connected" });
    }

    // Find user
    const userData = await findUserByEmail(email);
    if (!userData) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, userData.user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Prepare response
    const { password: _, ...safeUser } = userData.user.toObject();
    safeUser.role = userData.type;

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(safeUser);

    // Set refresh token cookie
    res.cookie("rt", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ user: safeUser, accessToken });
    
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Refresh Token Route
router.post("/refresh", (req, res) => {
  const refreshToken = req.cookies?.rt || req.body?.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ message: "Missing refresh token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const { sub, role, email } = decoded;

    // Generate new tokens
    const accessToken = jwt.sign(
      { sub, role, email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_TTL || "15m" }
    );

    const newJti = new mongoose.Types.ObjectId().toString();
    const newRefresh = jwt.sign(
      { sub, role, email, jti: newJti },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_TTL || "7d" }
    );

    res.cookie("rt", newRefresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken });
    
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

// Logout Route
router.post("/logout", (req, res) => {
  res.clearCookie("rt", { path: "/api/auth/refresh" });
  return res.json({ message: "Logged out" });
});

module.exports = router;


