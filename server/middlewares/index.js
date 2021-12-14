// middlewares
const mustBeAdmin = (req, res, next) => {
  if (req.user && req.user.userType && req.user.userType === "admin") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as an admin.");
  }
};

const mustBeSuperAdmin = (req, res, next) => {
  if (req.user && req.user.userType && req.user.userType === "superAdmin") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as super admin.");
  }
};

const hasSuperAdminPrivileges = (req) => {
  if (req.user && req.user.userType && req.user.userType.allowedActions) {
    return req.user.userType.allowedActions[0].name === "superAdminPrivilege";
  }
};

const isAllowedToPerformAction = (actionString) => {
  if (hasSuperAdminPrivileges()) {
    next();
  }

  if (req.user && req.user.userType && req.user.userType.allowedActions) {
    const actionIndex = req.user.userType.allowedActions
      .map((actionObject) => actionObject.name)
      .indexOf(actionString);

    if (actionIndex >= 0) {
      next();
    } else {
      res.status(401);
      throw new Error("Not allowed to perform the specified action.");
    }
  } else {
    res.status(401);
    throw new Error("Invalid userType.");
  }
};

module.exports = {
  mustBeAdmin,
  mustBeSuperAdmin,
  isAllowedToPerformAction,
};
