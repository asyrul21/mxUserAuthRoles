const UserTypeModel = require("../models/UserType");

const getUserTypes = async (req, res, next) => {
  try {
    const userTypes = await UserTypeModel.find({
      name: {
        $ne: "superAdmin",
      },
    }).populate("allowedActions");
    return res.status(200).json(userTypes);
  } catch (error) {
    res.status(400);
    next(new Error("Failed to retrieve user types."));
  }
};

// only for admin and superAdmin
const createUserType = async (req, res, next) => {
  try {
    const { name, description, allowedActions, nonDeletable } = req.body;
    let newTypeObject = {
      name,
      allowedActions,
    };
    if (description) {
      newTypeObject = {
        ...newTypeObject,
        description,
      };
    }
    if (nonDeletable !== null && nonDeletable !== undefined) {
      newTypeObject = {
        ...newTypeObject,
        nonDeletable,
      };
    }
    const newType = new UserTypeModel({ ...newTypeObject });
    await newType.save();

    const userTypes = await UserTypeModel.find().populate("allowedActions");
    return res.status(200).json(userTypes);
  } catch (error) {
    console.error(error);
    res.status(400);
    next(new Error("Failed to create user type. " + error));
  }
};

// only for admin and superAdmin
const getSingleUserType = async (req, res, next) => {
  try {
    const userTypeId = req.params.id;
    const UserType = await UserTypeModel.findById(userTypeId).populate(
      "allowedActions"
    );
    if (!UserType) {
      throw "UserType not found.";
    }
    return res.status(200).json(UserType);
  } catch (error) {
    console.error(error);
    res.status(400);
    next(new Error("Failed to retrieve user type by id. " + error));
  }
};

// only for admin and superAdmin
const updateUserType = async (req, res, next) => {
  try {
    const { name, description, nonDeletable, allowedActions } = req.body;
    const userTypeId = req.params.id;
    const UserType = await UserTypeModel.findById(userTypeId);
    if (!UserType) {
      throw "UserType not found.";
    }

    if (UserType.name === "admin") {
      // only superAdmin can update Admin User Type
      const requestUser = req.user;
      if (requestUser.userType.name !== "superAdmin") {
        throw "Not authorized to update Admin User Type.";
      }
    }
    UserType.name = name || UserType.name;
    if (description) {
      UserType.description = description;
    }
    if (nonDeletable !== null && nonDeletable !== undefined) {
      UserType.nonDeletable = nonDeletable;
    }
    UserType.allowedActions = allowedActions || UserType.allowedActions; // this is an array
    await UserType.save();

    const updatedUserType = await UserTypeModel.findById(userTypeId).populate(
      "allowedActions"
    );
    return res.status(200).json(updatedUserType);
  } catch (error) {
    console.error(error);
    res.status(400);
    next(new Error("Failed to update user type. " + error));
  }
};

// if a User has a UserType which has been deleted,
// it will fallback to a default type = "Generic"
const updateClientUserModel = async (UserModel, typeId, defaultType) => {
  const ClientUsers = await UserModel.find();
  if (ClientUsers && ClientUsers.length > 1) {
    for await (let user of ClientUsers) {
      if (user.userType && user.userType.equals(typeId)) {
        user.userType = defaultType._id;
        await user.save();
      }
    }
  }
};

// only for admin and superAdmin
// deletion is not recommended as this will cause Ripple Effect to other models
const deleteUserType = async (req, res, next) => {
  try {
    const userTypeId = req.params.id;
    const UserType = await UserTypeModel.findById(userTypeId);
    if (!UserType) {
      throw "UserType not found.";
    }
    if (UserType.nonDeletable) {
      throw "This User Type cannot be deleted.";
    }
    await UserType.remove();
    const defaultType = await UserTypeModel.find({ name: "generic" });
    await updateClientUserModel(
      req.app.get("clientUserModel"),
      userTypeId,
      defaultType
    );
    const UserTypes = await UserTypeModel.find().populate("allowedActions");
    return res.status(200).json(UserTypes);
  } catch (error) {
    console.error(error);
    res.status(400);
    next(new Error("Failed to delete user type. " + error));
  }
};

// only for admin and superAdmin
// deletion is not recommended as this will cause Ripple Effect to other models
const deleteManyUserTypes = async (req, res, next) => {
  try {
    const { typeIds } = req.body;
    if (typeIds && typeIds.length > 0) {
      const defaultType = await UserTypeModel.find({ name: "generic" });
      for await (let typeId of typeIds) {
        const Type = await UserTypeModel.findById(typeId);
        if (Type && !Type.nonDeletable) {
          await Type.remove();
          await updateClientUserModel(
            req.app.get("clientUserModel"),
            typeId,
            defaultType
          );
        }
      }
    }
    const UserTypes = await UserTypeModel.find().populate("allowedActions");
    return res.status(200).json(UserTypes);
  } catch (error) {
    console.error(error);
    res.status(400);
    next(new Error("Failed to delete user type. " + error));
  }
};

module.exports = {
  getUserTypes,
  createUserType,
  getSingleUserType,
  updateUserType,
  deleteUserType,
  deleteManyUserTypes,
};
