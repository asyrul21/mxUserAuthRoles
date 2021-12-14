const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const asyncHandler = require("express-async-handler");

const requireLogin = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id)
        .select("-password")
        .populate("userType");
      req.user = currentUser;
      return next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed. " + error);
    }
  }
  if (!token) {
    res.status(401);
    throw new Error("Not authorized.");
  }
});

module.exports = { requireLogin };
