const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

// Health Check
router.get('/health/db', (_req, res) => {
  const state = mongoose.connection.readyState;
  const states = { 
    0: 'disconnected', 
    1: 'connected', 
    2: 'connecting', 
    3: 'disconnecting' 
  };
  res.json({ state, label: states[state] });
});

module.exports = router;


