require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/user');
const Judge = require('./models/judge');

const resetPassword = async () => {
  try {
    await connectDB();

    // Get email and new password from command line arguments
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
      console.error('❌ Usage: node resetPassword.js <email> <newPassword>');
      console.error('Example: node resetPassword.js user@example.com newpassword123');
      process.exit(1);
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Try to find user in User collection
    let user = await User.findOne({ email: email.toLowerCase() });
    let userType = 'user';

    // If not found, try Judge collection
    if (!user) {
      user = await Judge.findOne({ email: email.toLowerCase() });
      userType = 'judge';
    }

    if (!user) {
      console.error(`❌ User with email "${email}" not found`);
      process.exit(1);
    }

    // Update password
    user.password = hashedPassword;
    await user.save();

    console.log(`✅ Password reset successfully for ${userType}: ${email}`);
    console.log(`   New password: ${newPassword}`);
    console.log(`   Full Name: ${user.fullName}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Password reset failed:', err.message);
    process.exit(1);
  }
};

resetPassword();

