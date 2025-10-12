const express = require("express");
const authenticateToken = require("../auth/authenticateToken");
const User = require("../models/user");
const Judge = require("../models/judge");
const Lawyer = require('../models/Lawyer');

const router = express.Router();


// IMPORTANT: Place specific routes BEFORE dynamic ":id" route to avoid shadowing

// GET /api/users/search?q=...
// Case-insensitive search on fullName, returns limited fields
router.get('/users/search', authenticateToken, async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ users: [] });
    const regex = new RegExp(q, 'i');
  const users = await User.find({ fullName: regex })
      .select('_id fullName email city phone')
      .limit(20);
    // normalize property names to requested shape
    const formatted = users.map(u => ({
      _id: u._id,
      fullName: u.fullName,
      email: u.email,
      city: u.city || '',
      phone: u.phone || ''
    }));
    return res.json({ users: formatted });
  } catch (err) {
    console.error('GET /api/users/search error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET user profile (by id)
router.get("/users/:id", authenticateToken, async (req, res) => {
  try {
    let user = await User.findById(req.params.id).select("-password");
    if (!user) user = await Judge.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update User Profile
router.put("/users/:id", authenticateToken, async (req, res) => {
  try {
    let updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      updatedUser = await Judge.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      ).select("-password");
    }

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
});


// (lawyer suggestions temporarily hosted under this router by user change)

router.get('/suggestions', authenticateToken, async (req, res) => {
  try {
    const { city, jurisdiction } = req.query;
    const query = {};
    if (city) query.city = city;
    if (jurisdiction) query.jurisdiction = jurisdiction;

    const lawyers = await Lawyer.find(query).select('_id name city jurisdiction phone').limit(50);
    return res.json({ lawyers });
  } catch (err) {
    console.error('GET /api/lawyers/suggestions error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
