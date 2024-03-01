const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies["jwt-token"];
    if (!token) {
      return res
        .status(401)
        .json({ message: "no token, authorization denied" });
    }
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      req.user = decoded.userId; // current user id
      next();
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log("error in verifyToken middleware", error);
  }
};

module.exports = verifyToken;
