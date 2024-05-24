const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized User",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return req.status(401).json({
        message: "Unauthorized User",
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      messsage: "Internal Server Errror",
      token,
    });
  }
};

module.exports = authMiddleware;
