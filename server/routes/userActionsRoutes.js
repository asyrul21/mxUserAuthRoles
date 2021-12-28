const express = require("express");
const router = express.Router();
const {
  getUserActions,
  createUserAction,
  updateUserAction,
} = require("../controllers/userActionsController");
const {
  setupRequireLoginMiddleware,
  mustBeAdmin,
  mustBeSuperAdmin,
} = require("../middlewares");

require("dotenv").config();
const requireLoginMiddleware = setupRequireLoginMiddleware(
  require("../models/User"),
  process.env.JWT_SECRET
);

router.route("/").get(requireLoginMiddleware, getUserActions);
router
  .route("/")
  .post(requireLoginMiddleware, mustBeSuperAdmin, createUserAction);
router
  .route("/:id")
  .put(requireLoginMiddleware, mustBeSuperAdmin, updateUserAction);

module.exports = router;
