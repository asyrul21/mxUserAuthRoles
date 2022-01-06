const UserTypeModel = require("../models/UserType");
const UserActionModel = require("../models/UserAction");
const defaultUserTypes = require("../constants");
const { setupRequireLoginMiddleware } = require("../middlewares");

const initialiseUserAuthRoles = async (
  superAdminObj,
  UserMongooseModel,
  defaultUserActions,
  initialiseDbCb = async () => {}
) => {
  await initialiseDbCb();
  console.log("Initialising User Auth Roles...");
  const createdUserActions = await createOrUpdateUserActions(
    defaultUserActions.actions
  );
  const createdUserTypes = await createDefaultUserTypes(createdUserActions);
  const superAdminType = createdUserTypes[0];
  await createSuperAdminIfNotExist(
    superAdminObj,
    UserMongooseModel,
    superAdminType
  );
};

const connectRoutesAndUserModel = (
  app,
  UserModel,
  jwtSecret,
  routeHandle = "/api/userRoles",
  jwtIDKey = "id",
  userPasswordProp = "password"
) => {
  const UserTypeRoutes = require("../routes/userTypesRoutes");
  const UserActionRoutes = require("../routes/userActionsRoutes");
  const UserVerifyRoutes = require("../routes/userVerifyRoutes");

  const requireLoginMiddleware = setupRequireLoginMiddleware(
    UserModel,
    jwtSecret,
    jwtIDKey,
    userPasswordProp
  );

  app.use(`${routeHandle}/types`, UserTypeRoutes(requireLoginMiddleware));
  app.use(`${routeHandle}/actions`, UserActionRoutes(requireLoginMiddleware));
  app.use(`${routeHandle}/verify`, UserVerifyRoutes(requireLoginMiddleware));
  app.set("clientUserModel", UserModel);
};

const createOrUpdateUserActions = async (defaultActions) => {
  const userActions = await UserActionModel.find();
  if (!userActions || userActions.length === 0) {
    console.log("No userActions found. Creating default actions...");
    const savedActions = await UserActionModel.insertMany([
      {
        name: "superAdminPrivilege",
        description: "Should be able to do everything.",
        nonDeletable: true,
      },
      ...defaultActions,
    ]);
    return savedActions;
  }
  console.log("userActions already exist.");
  return userActions;
};

const createDefaultUserTypes = async (createdUserActions) => {
  const superAdminAction = createdUserActions[0];
  const otherActions = createdUserActions.slice(1);
  const userTypes = await UserTypeModel.find();
  if (!userTypes || userTypes.length === 0) {
    console.log("No userTypes found. Creating default types...");
    const newUserTypes = await UserTypeModel.insertMany([
      {
        name: "superAdmin",
        description: "Application Super or Root Administrator",
        nonDeletable: true,
        allowedActions: [superAdminAction.name],
      },
      {
        ...defaultUserTypes[0], //admin
        // by default admins can perform all actions
        allowedActions: otherActions.map((a) => a.name),
      },
      ...defaultUserTypes.slice(1),
    ]);
    return newUserTypes;
  }
  console.log("userTypes already exist.");
  return userTypes;
};

const createSuperAdminIfNotExist = async (
  superAdminObj,
  UserMongooseModel,
  superAdminType
) => {
  try {
    const userModelPrimaryKey = Object.keys(superAdminObj)[0];
    const superAdminIdentifierValue = superAdminObj[userModelPrimaryKey];
    if (!userModelPrimaryKey || !superAdminIdentifierValue) {
      throw new Error("Super administrator credentials are invalid.");
    }
    const rootUser = await UserMongooseModel.find({
      [userModelPrimaryKey]: superAdminIdentifierValue,
    });
    // if there's no super admin yet, we create one
    if (!rootUser || rootUser.length === 0) {
      const superAdmin = await UserMongooseModel.create({
        ...superAdminObj,
        userType: superAdminType._id,
      });
      console.log("New super admin created.");
      // console.log(superAdmin);
    } else {
      console.log("Super admin already exists.");
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = {
  initialiseUserAuthRoles,
  connectRoutesAndUserModel,
};
