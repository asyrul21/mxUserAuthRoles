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
      throw new Error("Not allowed to perform the specified action.");
    }
  } else {
    res.status(401);
    throw new Error("Invalid userType.");
  }
};

// this is function that returns a callback
// requsts need to have a header with key-value of "authorization" : "Brearer <JWT token>"
const setupRequireLoginMiddleware = (
  MongooseUserModel,
  jwtSecret,
  jwtIDKey = "id",
  userPasswordProp = "password"
) =>
  asyncHandler(async (req, res, next) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, jwtSecret);
        const currentUser = await MongooseUserModel.findById(decoded[jwtIDKey])
          .select(`-${userPasswordProp}`)
          .populate("userType");
        req.user = currentUser;
        return next();
      } catch (error) {
        res.status(401);
        throw new Error("Not authorized, token failed. " + error);
      }
    }
    if (!token) {
      res.status(401);
      throw new Error("Not authorized.");
    }
  });

module.exports = {
  mustBeAdmin,
  mustBeSuperAdmin,
  isAllowedToPerformAction,
  setupRequireLoginMiddleware,
};
