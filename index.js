// setup
const {
  initialiseUserRolls,
  connectRoutesAndUserModel,
} = require("./server/config");

// middlewares
const {
  mustBeAdmin,
  mustBeSuperAdmin,
  setupRequireLoginMiddleware,
  isAllowedToPerformAction,
} = require("./server/middlewares");

module.exports = {
  initialiseUserRolls,
  connectRoutesAndUserModel,
  mustBeAdmin,
  mustBeSuperAdmin,
  setupRequireLoginMiddleware,
  isAllowedToPerformAction,
};
