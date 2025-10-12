const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// AUTH UTILITY — generateTokens
// Note: Logic preserved exactly from index_login.js
const generateTokens = (userData) => {
  const { _id: sub, email } = userData;
  const role = userData.role || 'user';

  const accessToken = jwt.sign(
    { sub, role, email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_TTL || "15m" }
  );

  const refreshJti = new mongoose.Types.ObjectId().toString();
  const refreshToken = jwt.sign(
    { sub, role, email, jti: refreshJti },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_TTL || "7d" }
  );

  return { accessToken, refreshToken, role };
};

module.exports = generateTokens;


