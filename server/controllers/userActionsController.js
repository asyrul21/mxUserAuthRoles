const UserActionModel = require("../models/UserAction");
const UserTypeModel = require("../models/UserType");
const { buildKeywordQuery } = require("../utils/queryUtils");

// to get user actions dont need to me an admin
// just need to be signed in
const getUserActions = async (req, res, next) => {
  const { keyword } = req.query;
  try {
    const keywordQuery = buildKeywordQuery(["name", "description"], keyword);
    const userActions = await UserActionModel.find({ ...keywordQuery });
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

// verified using console.log
const updateUserTypes = async (oldName, newName) => {
  const UserTypes = await UserTypeModel.find();
  for await (let UserType of UserTypes) {
    const indexOfOldActionName = UserType.allowedActions.indexOf(oldName);
    if (indexOfOldActionName >= 0) {
      UserType.allowedActions[indexOfOldActionName] = newName;
      await UserType.save();
    }
  }
};

// only for superAdmins
const updateUserAction = async (req, res, next) => {
  try {
    const { name, description, nonDeletable } = req.body;

    const Action = await UserActionModel.findById(req.params.id);
    const initialName = Action.name;
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
    // inform UserTypes using this action
    await updateUserTypes(initialName, updatedAction.name);
    return res.status(200).json(updatedAction);
  } catch (error) {
    console.error(error);
    res.status(400);
    next(new Error("Failed to update user actions. " + error));
  }
};

const removeActionInUserTypes = async (actionName) => {
  const UserTypes = await UserTypeModel.find();
  for await (let UserType of UserTypes) {
    UserType.allowedActions = UserType.allowedActions.filter(
      (action) => action !== actionName
    );
    await UserType.save();
  }
};

// only for superAdmins
const deleteUserAction = async (req, res, next) => {
  try {
    const Action = await UserActionModel.findById(req.params.id);
    const actionName = Action.name;
    if (!Action) {
      throw "Action not found.";
    }
    if (Action.nonDeletable) {
      throw "This action cannot be deleted.";
    }
    await Action.remove();
    await removeActionInUserTypes(actionName);
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
    if (actionIds && actionIds.length > 0) {
      for await (let actionId of actionIds) {
        const Action = await UserActionModel.findById(actionId);
        const actionName = Action.name;
        if (Action && !Action.nonDeletable) {
          await Action.remove();
          await removeActionInUserTypes(actionName);
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
