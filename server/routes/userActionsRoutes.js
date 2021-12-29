const express = require("express");
const router = express.Router();
const {
  getUserActions,
  createUserAction,
  updateUserAction,
  deleteUserAction,
  deleteManyUserActions,
} = require("../controllers/userActionsController");
const {
  setupRequireLoginMiddleware,
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
  .route("/deleteMany")
  .delete(requireLoginMiddleware, mustBeSuperAdmin, deleteManyUserActions);
router
  .route("/:id")
  .put(requireLoginMiddleware, mustBeSuperAdmin, updateUserAction);
router
  .route("/:id")
  .delete(requireLoginMiddleware, mustBeSuperAdmin, deleteUserAction);

module.exports = router;
