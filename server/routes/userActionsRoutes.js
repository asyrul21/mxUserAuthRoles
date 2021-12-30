const express = require("express");
const router = express.Router();
const {
  getUserActions,
  createUserAction,
  updateUserAction,
  deleteUserAction,
  deleteManyUserActions,
} = require("../controllers/userActionsController");
const { mustBeSuperAdmin } = require("../middlewares");

const UserActionsRoutes = (requireLoginMiddleware) => {
  router.route("/").get(requireLoginMiddleware, getUserActions);
  router
    .route("/")
    .post(requireLoginMiddleware, mustBeSuperAdmin, createUserAction);
  router
    .route("/deleteMany")
    .delete(requireLoginMiddleware, mustBeSuperAdmin, deleteManyUserActions);
  router
    .route("/:id")
    .put(requireLoginMiddleware, mustBeSuperAdmin, updateUserAction)
    .delete(requireLoginMiddleware, mustBeSuperAdmin, deleteUserAction);
  return router;
};

module.exports = UserActionsRoutes;
