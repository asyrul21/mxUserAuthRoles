const mustBeAdmin = (req, res, next) => {
  if (req.user && req.user.userType) {
    if (
      req.user.userType.name === "admin" ||
      req.user.userType.name === "superAdmin"
    ) {
      next();
    } else {
      res.status(401);
      next(new Error("Not authorized as an admin."));
    }
  } else {
    res.status(401);
    next(new Error("Not authorized as an admin."));
  }
};

const mustBeSuperAdmin = (req, res, next) => {
  if (
    req.user &&
    req.user.userType &&
    req.user.userType.name === "superAdmin"
  ) {
    next();
  } else {
    res.status(401);
    next(new Error("Not authorized as super admin."));
  }
};

const hasSuperAdminPrivileges = (req) => {
  if (req.user && req.user.userType && req.user.userType.allowedActions) {
    return req.user.userType.allowedActions[0].name === "superAdminPrivilege";
  }
  return false;
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
      next(new Error("Not allowed to perform the specified action."));
    }
  } else {
    res.status(401);
    next(new Error("Invalid userType."));
  }
};

module.exports = {
  mustBeAdmin,
  mustBeSuperAdmin,
  isAllowedToPerformAction,
};
