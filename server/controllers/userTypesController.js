const UserTypeModel = require("../models/UserType");

const getUserTypes = async (req, res, next) => {
  try {
    const userTypes = await UserTypeModel.find({
      name: {
        $ne: "superAdmin",
      },
    });
    return res.status(200).json(userTypes);
  } catch (error) {
    res.status(400);
    next(new Error("Failed to retrieve user types."));
  }
};

module.exports = {
  getUserTypes,
};
