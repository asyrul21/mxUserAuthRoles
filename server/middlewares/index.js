const jwt = require("jsonwebtoken");

const isAdminOrSuperAdmin = (req) => {
  return (
    req.user.userType.name === "admin" ||
    req.user.userType.name === "superAdmin"
  );
};

// middlewares
const mustBeAdmin = (req, res, next) => {
  if (req.user && req.user.userType) {
    if (isAdminOrSuperAdmin(req)) {
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

const isProfileOwner = async (req, res, next) => {
  const ClientUserModel = req.app.get("clientUserModel");
  const reqUserId = req.user._id;
  const reqParamsId = req.params.id;
  if (!reqParamsId) {
    res.status(400);
    return next(
      new Error("Route not supported by the isProfileOwner middleware.")
    );
  }
  if (!req.user || !reqUserId) {
    res.status(401);
    return next(new Error("Not authorized."));
  }
  if (req.user && req.user.userType) {
    if (isAdminOrSuperAdmin(req)) {
      return next();
    }
  }
  try {
    const UserProfile = await ClientUserModel.findById(reqUserId);
    if (!UserProfile) {
      res.status(400);
      return next(new Error("Checking profile ownership failed."));
    }
    if (UserProfile._id.equals(reqParamsId)) {
      return next();
    } else {
      res.status(401);
      return next(
        new Error(
          "Authorization Error: Not allowed to perform the specified action."
        )
      );
    }
  } catch (error) {
    console.error(error);
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
        console.error(error);
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
  isProfileOwner,
  isAllowedToPerformAction,
  setupRequireLoginMiddleware,
};
