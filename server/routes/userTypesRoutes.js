const express = require("express");
const router = express.Router();
const { getUserTypes } = require("../controllers/userTypesController");
const { setupRequireLoginMiddleware, mustBeAdmin } = require("../middlewares");

require("dotenv").config();
const requireLoginMiddleware = setupRequireLoginMiddleware(
  require("../models/User"),
  process.env.JWT_SECRET
);

router.route("/").get(requireLoginMiddleware, mustBeAdmin, getUserTypes);

module.exports = router;
