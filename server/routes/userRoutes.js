const express = require("express");
const router = express.Router();
const {
  signIn,
  getUsers,
  updateUserProfile,
  deleteUser,
} = require("../controllers/userController");

const UserModel = require("../models/User");
const {
  mustBeAdmin,
  mustBeSuperAdmin,
  isAllowedToPerformAction,
  setupRequireLoginMiddleware,
  isProfileOwner,
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
    isAllowedToPerformAction("updateUserProfile"),
    isProfileOwner,
    updateUserProfile
  )
  .delete(requireLogin, isAllowedToPerformAction("deleteUser"), deleteUser);
router.post("/login", signIn);

module.exports = router;
