const jwt = require("jsonwebtoken");
// middlewares
const mustBeAdmin = (req, res, next) => {
  if (req.user && req.user.userType) {
    if (
      req.user.userType.name === "admin" ||
      req.user.userType.name === "superAdmin"
    ) {
      return next();
    } else {
      res.status(401);
      return next(new Error("Not authorized as an admin."));
    }
  } else {
    res.status(401);
    return next(new Error("Not authorized as an admin."));
  }
};

const mustBeSuperAdmin = (req, res, next) => {
  if (
    req.user &&
    req.user.userType &&
    req.user.userType.name === "superAdmin"
  ) {
    return next();
  } else {
    res.status(401);
    return next(new Error("Not authorized as super admin."));
  }
};

const hasSuperAdminPrivileges = (req) => {
  if (req.user && req.user.userType && req.user.userType.allowedActions) {
    return req.user.userType.allowedActions[0] === "superAdminPrivilege";
  }
  return false;
};

const isAllowedToPerformAction = (actionString) => (req, res, next) => {
  if (hasSuperAdminPrivileges(req)) {
    return next();
  }
  if (req.user && req.user.userType && req.user.userType.allowedActions) {
    const actionIndex = req.user.userType.allowedActions.indexOf(actionString);
    console.log(`Index: ${actionIndex}`);
    if (actionIndex >= 0) {
      return next();
    } else {
      res.status(401);
      return next(
        new Error(
          "Authorization Error: Not allowed to perform the specified action."
        )
      );
    }
  } else {
    res.status(401);
    return next(
      new Error(
        "Authorization Error: Not allowed to perform the specified action."
      )
    );
  }
};

// this is function that returns a callback
// requsts need to have a header with key-value of "authorization" : "Brearer <JWT token>"
const setupRequireLoginMiddleware =
  (
    MongooseUserModel,
    jwtSecret,
    jwtIDKey = "id",
    userPasswordProp = "password"
  ) =>
  async (req, res, next) => {
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
        return next(Error("Not authorized, token failed. " + error));
      }
    }
    if (!token) {
      res.status(401);
      return next(Error("Not authorized."));
    }
  };

module.exports = {
  mustBeAdmin,
  mustBeSuperAdmin,
  isAllowedToPerformAction,
  setupRequireLoginMiddleware,
};
