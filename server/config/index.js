const UserTypeModel = require("../models/UserType");
const UserActionModel = require("../models/UserAction");
const defaultUserTypes = require("../constants");
const { setupRequireLoginMiddleware } = require("../middlewares");

const initialiseSwissRolls = async (
  superAdminObj,
  UserMongooseModel,
  defaultUserActions,
  initialiseDbCb = async () => {}
) => {
  await initialiseDbCb();
  console.log("Initialising User Swiss Rolls...");
  const superAdminActions = await createDefaultUserActions(defaultUserActions);
  const superAdminType = await createDefaultUserTypes(superAdminActions);
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

  const requireLoginMiddleware = setupRequireLoginMiddleware(
    UserModel,
    jwtSecret,
    jwtIDKey,
    userPasswordProp
  );

  app.use(`${routeHandle}/types`, UserTypeRoutes(requireLoginMiddleware));
  app.use(`${routeHandle}/actions`, UserActionRoutes(requireLoginMiddleware));
  app.set("clientUserModel", UserModel);
};

const createDefaultUserActions = async (defaultActions) => {
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
    const superAdminAction = savedActions[0];
    return superAdminAction;
  }
  console.log("userActions already exist.");
  return null;
};

const createDefaultUserTypes = async (superAdminAction) => {
  const userTypes = await UserTypeModel.find();
  if (!userTypes || userTypes.length === 0) {
    console.log("No userTypes found. Creating default types...");
    const newUserTypes = await UserTypeModel.insertMany([
      {
        name: "superAdmin",
        description: "Application Super or Root Administrator",
        nonDeletable: true,
      },
      ...defaultUserTypes,
    ]);
    const superAdminType = newUserTypes[0];
    await superAdminType.allowedActions.push(superAdminAction);
    await superAdminType.save();
    return superAdminType;
  }
  console.log("userTypes already exist.");
  return null;
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
  initialiseSwissRolls,
  connectRoutesAndUserModel,
};
