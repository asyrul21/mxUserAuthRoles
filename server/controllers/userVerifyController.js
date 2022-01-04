const UserTypeModel = require("../models/UserType");

const verifyUserAllowedActions = async (req, res, next) => {
  const { actions } = req.body;
  try {
    const allowedActions = req.user.userType.allowedActions;
    const userType = req.user.userType.name;
    if (actions && actions.length > 0) {
      const result = actions.reduce((acc, current) => {
        const actionIndex = allowedActions.indexOf(current);
        if (actionIndex >= 0 || userType === "superAdmin") {
          acc[current] = true;
        } else {
          acc[current] = false;
        }
        return acc;
      }, {});
      return res.status(200).json({ ...result });
    } else {
      throw "Nothing to verify";
    }
  } catch (error) {
    console.error(error);
    res.status(400);
    next(new Error("Failed to retrieve user types."));
  }
};

module.exports = {
  verifyUserAllowedActions,
};
