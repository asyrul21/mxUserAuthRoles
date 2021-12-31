// setup
const {
  initialiseSwissRolls,
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
  initialiseSwissRolls,
  connectRoutesAndUserModel,
  mustBeAdmin,
  mustBeSuperAdmin,
  setupRequireLoginMiddleware,
  isAllowedToPerformAction,
};
