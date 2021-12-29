const express = require("express");
const router = express.Router();
const {
  getUserTypes,
  createUserType,
  getSingleUserType,
  updateUserType,
  deleteUserType,
  deleteManyUserTypes,
} = require("../controllers/userTypesController");
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

router
  .route("/")
  .get(requireLoginMiddleware, mustBeAdmin, getUserTypes)
  .post(requireLoginMiddleware, mustBeAdmin, createUserType);
router
  .route("/deleteMany")
  .delete(requireLoginMiddleware, mustBeAdmin, deleteManyUserTypes);
router
  .route("/:id")
  .get(requireLoginMiddleware, mustBeAdmin, getSingleUserType)
  .put(requireLoginMiddleware, mustBeAdmin, updateUserType)
  .delete(requireLoginMiddleware, mustBeAdmin, deleteUserType);

module.exports = router;
