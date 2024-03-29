const jwt = require("jsonwebtoken");

const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_KEY);
  res.cookie("jwt-token", token, {
    httpOnly: true,
    sameSite: "none", //
    secure: true, 
  });
  return token;
};

module.exports = generateToken;
