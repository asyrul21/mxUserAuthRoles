const express = require("express");
const router = express.Router();
const {
  signIn,
  getUsers,
  updateUserProfile,
} = require("../controllers/userController");

const UserModel = require("../models/User");
const {
  mustBeAdmin,
  mustBeSuperAdmin,
  isAllowedToPerformAction,
  setupRequireLoginMiddleware,
} = require("../middlewares");

const requireLogin = setupRequireLoginMiddleware(
  UserModel,
  process.env.JWT_SECRET
);
router.route("/").get(requireLogin, mustBeAdmin, getUsers);
router
  .route("/:id")
  .put(
    requireLogin,
    isAllowedToPerformAction("updateProfile"),
    updateUserProfile
  );
router.post("/login", signIn);

module.exports = router;
