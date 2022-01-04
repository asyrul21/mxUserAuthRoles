const express = require("express");
const {
  verifyUserAllowedActions,
} = require("../controllers/userVerifyController");
const router = express.Router();

const UserVerifyRoutes = (requireLoginMiddleware) => {
  router.route("/").get(requireLoginMiddleware, verifyUserAllowedActions);
  return router;
};

module.exports = UserVerifyRoutes;
