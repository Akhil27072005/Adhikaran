// AUTH UTILITY — findUserByEmail
const User = require("../models/user");
const Judge = require("../models/judge");

const findUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  if (user) return { user, type: 'user' };

  const judge = await Judge.findOne({ email });
  if (judge) return { user: judge, type: 'judge' };

  return null;
};

module.exports = findUserByEmail;


