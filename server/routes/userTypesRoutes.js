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
const { mustBeAdmin, mustBeSuperAdmin } = require("../middlewares");

const userTypesRoutes = (requireLoginMiddleware) => {
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
  return router;
};

module.exports = userTypesRoutes;
