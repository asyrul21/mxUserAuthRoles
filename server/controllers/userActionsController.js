const UserActionModel = require("../models/UserAction");
const UserTypeModel = require("../models/UserType");

// to get user actions dont need to me an admin
// just need to be signed in
const getUserActions = async (req, res, next) => {
  try {
    const userActions = await UserActionModel.find();
    return res.status(200).json(userActions);
  } catch (error) {
    console.error(error);
    res.status(400);
    next(new Error("Failed to retrieve user actions."));
  }
};

// only for superAdmins
const createUserAction = async (req, res, next) => {
  try {
    const { name, description, nonDeletable } = req.body;
    let newActionObject = {
      name,
      description,
    };
    if (nonDeletable !== null && nonDeletable !== undefined) {
      newActionObject = {
        ...newActionObject,
        nonDeletable,
      };
    }
    const newAction = new UserActionModel({ ...newActionObject });
    await newAction.save();

    const userActions = await UserActionModel.find();
    return res.status(200).json(userActions);
  } catch (error) {
    console.error(error);
    res.status(400);
    next(new Error("Failed to create user action. " + error));
  }
};

// only for superAdmins
const updateUserAction = async (req, res, next) => {
  try {
    const { name, description, nonDeletable } = req.body;

    const Action = await UserActionModel.findById(req.params.id);
    if (!Action) {
      throw "Action not found.";
    }
    Action.name = name || Action.name;
    Action.description = description || Action.description;
    Action.nonDeletable =
      nonDeletable !== null && nonDeletable !== undefined
        ? nonDeletable
        : Action.nonDeletable;

    const updatedAction = await Action.save();
    return res.status(200).json(updatedAction);
  } catch (error) {
    console.error(error);
    res.status(400);
    next(new Error("Failed to update user actions. " + error));
  }
};

const removeActionInUserTypes = async (actionId) => {
  const UserTypes = await UserTypeModel.find();
  for await (let UserType of UserTypes) {
    UserType.allowedActions.filter((action) => !action._id.equals(actionId));
    await UserType.save();
  }
};

// only for superAdmins
const deleteUserAction = async (req, res, next) => {
  try {
    const Action = await UserActionModel.findById(req.params.id);
    if (!Action) {
      throw "Action not found.";
    }
    if (Action.nonDeletable) {
      throw "This action cannot be deleted.";
    }
    await Action.remove();
    await removeActionInUserTypes(req.params.id);
    const UserActions = await UserActionModel.find();
    return res.status(200).json(UserActions);
  } catch (error) {
    console.error(error);
    res.status(400);
    next(new Error("Failed to delete user action. " + error));
  }
};

const deleteManyUserActions = async (req, res, next) => {
  try {
    const { actionIds } = req.body;
    if (actionIds && actionIds.length > 1) {
      for await (let actionId of actionIds) {
        const Action = await UserActionModel.findById(actionId);
        if (Action && !Action.nonDeletable) {
          await Action.remove();
          await removeActionInUserTypes(actionId);
        }
      }
    }
    const UserActions = await UserActionModel.find();
    return res.status(200).json(UserActions);
  } catch (error) {
    console.error(error);
    res.status(400);
    next(new Error("Failed to delete user action. " + error));
  }
};

module.exports = {
  getUserActions,
  createUserAction,
  updateUserAction,
  deleteUserAction,
  deleteManyUserActions,
};
