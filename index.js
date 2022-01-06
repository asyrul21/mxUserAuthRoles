// setup
const {
  initialiseUserAuthRoles,
  connectRoutesAndUserModel,
} = require("./server/config");

// middlewares
const {
  mustBeAdmin,
  mustBeSuperAdmin,
  setupRequireLoginMiddleware,
  isAllowedToPerformAction,
  isProfileOwner,
} = require("./server/middlewares");

module.exports = {
  initialiseUserAuthRoles,
  connectRoutesAndUserModel,
  mustBeAdmin,
  mustBeSuperAdmin,
  setupRequireLoginMiddleware,
  isAllowedToPerformAction,
  isProfileOwner,
};
