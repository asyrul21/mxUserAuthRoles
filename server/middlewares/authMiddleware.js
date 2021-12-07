const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const asyncHandler = require("express-async-handler");
const SuperAdmin = require("../models/SuperAdmin");

const isSuperAdmin = (decoded, foundSuperAdmin) => {
  return (
    decoded &&
    foundSuperAdmin &&
    foundSuperAdmin.email === process.env.SUPER_ADMIN_ID
  );
};

const isAdmin = (decoded, requestBody) => {
  const {
    _id,
    name: requestName,
    email: requestEmail,
    userType: requestUserType,
  } = requestBody;
  const {
    id,
    name: decodedName,
    email: decodedEmail,
    userType: decodedUserType,
  } = decoded;
  return (
    _id === id &&
    requestName === decodedName &&
    requestEmail === decodedEmail &&
    requestUserType === "admin" &&
    decodedUserType === "admin"
  );
};

// for internal authorization
const requireLoginAsSuperAdmin = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const currentSuperAdmin = await SuperAdmin.findById(decoded.id).select(
        "-password"
      );
      if (isSuperAdmin(decoded, currentSuperAdmin)) {
        req.user = currentSuperAdmin;
        return next();
      }
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

// for API authorization
const mustBeSuperAdminOrAdmin = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const currentSuperAdmin = await SuperAdmin.findById(decoded.id).select(
        "-password"
      );
      if (isSuperAdmin(decoded, currentSuperAdmin)) {
        req.user = currentSuperAdmin;
        return next();
      }
      if (isAdmin(token, decoded, req.body)) {
        return next();
      }
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

module.exports = { requireLoginAsSuperAdmin, mustBeSuperAdminOrAdmin };
