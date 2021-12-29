process.env.NODE_ENV = "test";

const dotenv = require("dotenv");
dotenv.config();

const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
chai.use(chaiHttp);

const server = require("../serverTest");
const {
  shouldBeAnErrorObject,
  assertInternalError,
  loginAsAdmin,
  isAUserType,
  loginAsJohn,
  loginAsSuperAdmin,
} = require("./testUtils");

// import model
const UserTypeModel = require("../models/UserType");
const UserModel = require("../models/User");
const UserActionModel = require("../models/UserAction");

// import data
const users = require("./data/users");

describe("User Types Routes", () => {
  before(function () {
    //
  });

  describe("GET /api/userRoles/types", async () => {
    let createdUsers;
    beforeEach(async function () {
      // delete all user types except default
      await UserTypeModel.deleteMany({
        nonDeletable: {
          $ne: true,
        },
      });
      // delete all user actions except default
      await UserActionModel.deleteMany();
      const defaultUserTypes = await UserTypeModel.find();
      // the first index is superAdmin
      const adminType = defaultUserTypes[1];
      const genericType = defaultUserTypes[2];
      const sampleUsers = users.map((user, index) => {
        if (index === 0) {
          user.userType = adminType._id;
        } else {
          user.userType = genericType._id;
        }
        return user;
      });
      // delete all users except super admin
      await UserModel.deleteMany({
        email: {
          $ne: process.env.SUPER_ADMIN_ID,
        },
      });
      createdUsers = await UserModel.insertMany(sampleUsers);
      //   console.log("Created Users:");
      //   console.log(createdUsers);
    });

    it("should return error when not logged in", async () => {
      // get all user types
      const result = await chai.request(server).get("/api/userRoles/types");
      assertInternalError(result);
      result.should.have.status(401);
      result.should.be.json;
      const data = { ...result.body };
      shouldBeAnErrorObject(data);
    });

    it("should return error when logged in as generic user", async () => {
      // login
      const loginData = await loginAsJohn();
      //   console.log("Login data:");
      //   console.log(loginData);
      var token = loginData.token;

      // get all user types
      const result = await chai
        .request(server)
        .get("/api/userRoles/types")
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(401);
      result.should.be.json;
      const data = { ...result.body };
      shouldBeAnErrorObject(data);
    });

    it("should be successful when logged in as admin", async () => {
      // login
      const loginData = await loginAsAdmin();
      //   console.log("Login data:");
      //   console.log(loginData);
      var token = loginData.token;

      // get all user types
      const result = await chai
        .request(server)
        .get("/api/userRoles/types")
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(200);
      result.should.be.json;
      const data = [...result.body];
      data.map((item) => {
        isAUserType(item);
      });
    });

    it("should be successful when logged in as superAdmin", async () => {
      // login
      const loginData = await loginAsSuperAdmin();
      //   console.log("Login data:");
      //   console.log(loginData);
      var token = loginData.token;

      // get all user types
      const result = await chai
        .request(server)
        .get("/api/userRoles/types")
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(200);
      result.should.be.json;
      const data = [...result.body];
      data.map((item) => {
        isAUserType(item);
      });
    });
  });

  describe("POST /api/userRoles/types >> Create a new user type", async () => {
    let createdUsers;
    let sampleActions;
    let sampleAction1;
    let sampleAction2;
    let sampleAction3;
    beforeEach(async function () {
      await UserTypeModel.deleteMany({
        nonDeletable: {
          $ne: true,
        },
      });
      // delete all user actions except default
      await UserActionModel.deleteMany();
      const defaultUserTypes = await UserTypeModel.find();
      // the first index is superAdmin
      const adminType = defaultUserTypes[1];
      const genericType = defaultUserTypes[2];
      const sampleUsers = users.map((user, index) => {
        if (index === 0) {
          user.userType = adminType._id;
        } else {
          user.userType = genericType._id;
        }
        return user;
      });
      // delete all users except super admin
      await UserModel.deleteMany({
        email: {
          $ne: process.env.SUPER_ADMIN_ID,
        },
      });
      createdUsers = await UserModel.insertMany(sampleUsers);

      // create sample actions
      const action1 = {
        name: "deleteProduct",
      };
      const action2 = {
        name: "updateProduct",
        description: "To update an existing product",
      };
      const action3 = {
        name: "viewProduct",
      };
      sampleActions = await UserActionModel.insertMany([
        action1,
        action2,
        action3,
      ]);
      sampleAction1 = sampleActions[0];
      sampleAction2 = sampleActions[1];
      sampleAction3 = sampleActions[2];
    });

    it("should return error when not logged in", async () => {
      const newUserType = {
        name: "Tester",
        description: "Any tester that uses the app",
        allowedActions: [sampleAction1._id, sampleAction2._id],
      };
      // get all user types
      const result = await chai
        .request(server)
        .post("/api/userRoles/types")
        .send(newUserType);
      assertInternalError(result);
      result.should.have.status(401);
      result.should.be.json;
      const data = { ...result.body };
      shouldBeAnErrorObject(data);
    });

    it("should be successful when logged in as admin", async () => {
      // login
      const loginData = await loginAsAdmin();
      var token = loginData.token;

      const newUserType = {
        name: "Tester",
        description: "Any tester that uses the app",
        allowedActions: [sampleAction1._id, sampleAction2._id],
      };
      // get all user types
      const result = await chai
        .request(server)
        .post("/api/userRoles/types")
        .send(newUserType)
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(200);
      result.should.be.json;
      const data = [...result.body];
      data.map((item) => {
        isAUserType(item);
      });
    });

    it("should be successful when logged in as superAdmin", async () => {
      // login
      const loginData = await loginAsSuperAdmin();
      var token = loginData.token;

      const newUserType = {
        name: "Tester",
        description: "Any tester that uses the app",
        allowedActions: [sampleAction1._id, sampleAction2._id],
      };
      // get all user types
      const result = await chai
        .request(server)
        .post("/api/userRoles/types")
        .send(newUserType)
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(200);
      result.should.be.json;
      const data = [...result.body];
      data.map((item) => {
        isAUserType(item);
      });
    });
  });

  describe("GET /api/userRoles/types/:id >> Get a single user type", async () => {
    let createdUsers;
    let sampleUserTypes;
    let sampleUserType;
    let sampleActions;
    let sampleAction1;
    let sampleAction2;
    let sampleAction3;
    beforeEach(async function () {
      await UserTypeModel.deleteMany({
        nonDeletable: {
          $ne: true,
        },
      });
      // delete all user actions except default
      await UserActionModel.deleteMany();
      const defaultUserTypes = await UserTypeModel.find();
      // the first index is superAdmin
      const adminType = defaultUserTypes[1];
      const genericType = defaultUserTypes[2];
      const sampleUsers = users.map((user, index) => {
        if (index === 0) {
          user.userType = adminType._id;
        } else {
          user.userType = genericType._id;
        }
        return user;
      });
      // delete all users except super admin
      await UserModel.deleteMany({
        email: {
          $ne: process.env.SUPER_ADMIN_ID,
        },
      });
      createdUsers = await UserModel.insertMany(sampleUsers);

      // create sample actions
      const action1 = {
        name: "deleteProduct",
      };
      const action2 = {
        name: "updateProduct",
        description: "To update an existing product",
      };
      const action3 = {
        name: "viewProduct",
      };
      sampleActions = await UserActionModel.insertMany([
        action1,
        action2,
        action3,
      ]);
      sampleAction1 = sampleActions[0];
      sampleAction2 = sampleActions[1];
      sampleAction3 = sampleActions[2];

      // create sample user type
      const newUserType = {
        name: "Tester",
        description: "Any tester that uses the app",
        allowedActions: [sampleAction1._id, sampleAction2._id],
      };
      await UserTypeModel.create(newUserType);
      sampleUserTypes = await UserTypeModel.find();
      sampleUserType = sampleUserTypes[sampleUserTypes.length - 1];
    });

    it("should return error when not logged in", async () => {
      // get all user types
      const result = await chai
        .request(server)
        .get(`/api/userRoles/types/${sampleUserType._id}`);

      assertInternalError(result);
      result.should.have.status(401);
      result.should.be.json;
      const data = { ...result.body };
      shouldBeAnErrorObject(data);
    });

    it("should be successful when logged in as admin", async () => {
      // login
      const loginData = await loginAsAdmin();
      var token = loginData.token;

      // get all user types
      const result = await chai
        .request(server)
        .get(`/api/userRoles/types/${sampleUserType._id}`)
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(200);
      result.should.be.json;
      const data = { ...result.body };
      isAUserType(data);
    });
  });

  describe("PUT /api/userRoles/types/:id >> Update a single user type", async () => {
    let createdUsers;
    let sampleUserTypes;
    let sampleUserType;
    let sampleActions;
    let sampleAction1;
    let sampleAction2;
    let sampleAction3;
    beforeEach(async function () {
      await UserTypeModel.deleteMany({
        nonDeletable: {
          $ne: true,
        },
      });
      // delete all user actions except default
      await UserActionModel.deleteMany();
      const defaultUserTypes = await UserTypeModel.find();
      // the first index is superAdmin
      const adminType = defaultUserTypes[1];
      const genericType = defaultUserTypes[2];
      const sampleUsers = users.map((user, index) => {
        if (index === 0) {
          user.userType = adminType._id;
        } else {
          user.userType = genericType._id;
        }
        return user;
      });
      // delete all users except super admin
      await UserModel.deleteMany({
        email: {
          $ne: process.env.SUPER_ADMIN_ID,
        },
      });
      createdUsers = await UserModel.insertMany(sampleUsers);

      // create sample actions
      const action1 = {
        name: "deleteProduct",
      };
      const action2 = {
        name: "updateProduct",
        description: "To update an existing product",
      };
      const action3 = {
        name: "viewProduct",
      };
      sampleActions = await UserActionModel.insertMany([
        action1,
        action2,
        action3,
      ]);
      sampleAction1 = sampleActions[0];
      sampleAction2 = sampleActions[1];
      sampleAction3 = sampleActions[2];

      // create sample user type
      const newUserType = {
        name: "Tester",
        description: "Any tester that uses the app",
        allowedActions: [sampleAction1._id, sampleAction2._id],
      };
      await UserTypeModel.create(newUserType);
      sampleUserTypes = await UserTypeModel.find().populate("allowedActions");
      sampleUserType = sampleUserTypes[sampleUserTypes.length - 1];
    });

    it("should return error when not logged in", async () => {
      const newName = "testUser";
      // get all user types
      const result = await chai
        .request(server)
        .put(`/api/userRoles/types/${sampleUserType._id}`)
        .send({ name: newName });

      assertInternalError(result);
      result.should.have.status(401);
      result.should.be.json;
      const data = { ...result.body };
      shouldBeAnErrorObject(data);
    });

    it("should be successful when logged in as admin, update Type name", async () => {
      // login
      const loginData = await loginAsAdmin();
      var token = loginData.token;

      const newName = "testUser";
      // get all user types
      const result = await chai
        .request(server)
        .put(`/api/userRoles/types/${sampleUserType._id}`)
        .send({ name: newName })
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(200);
      result.should.be.json;
      const data = { ...result.body };
      isAUserType(data);
      data.name.should.equal(newName);
      data.description.should.equal(sampleUserType.description);
      data.allowedActions.map((action, index) => {
        sampleUserType.allowedActions[index]._id
          .equals(action._id)
          .should.equal(true);
      });
      data.nonDeletable.should.equal(sampleUserType.nonDeletable);
    });

    it("should be successful when logged in as admin, update Type description", async () => {
      // login
      const loginData = await loginAsAdmin();
      var token = loginData.token;

      const updatedDescription = "updated description abcd";
      // get all user types
      const result = await chai
        .request(server)
        .put(`/api/userRoles/types/${sampleUserType._id}`)
        .send({ description: updatedDescription })
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(200);
      result.should.be.json;
      const data = { ...result.body };
      isAUserType(data);
      data.name.should.equal(sampleUserType.name);
      data.description.should.equal(updatedDescription);
      data.allowedActions.map((action, index) => {
        sampleUserType.allowedActions[index]._id
          .equals(action._id)
          .should.equal(true);
      });
      data.nonDeletable.should.equal(sampleUserType.nonDeletable);
    });

    it("should be successful when logged in as admin, update Type allowedActions", async () => {
      // login
      const loginData = await loginAsAdmin();
      var token = loginData.token;

      const updatedAllowedActions = [sampleAction2._id, sampleAction3._id];
      // get all user types
      const result = await chai
        .request(server)
        .put(`/api/userRoles/types/${sampleUserType._id}`)
        .send({ allowedActions: updatedAllowedActions })
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(200);
      result.should.be.json;
      const data = { ...result.body };
      isAUserType(data);
      data.name.should.equal(sampleUserType.name);
      data.description.should.equal(sampleUserType.description);
      data.nonDeletable.should.equal(sampleUserType.nonDeletable);

      const updatedAllowedAction1 = data.allowedActions[0];
      const updatedAllowedAction2 = data.allowedActions[1];

      updatedAllowedAction1.name.should.equal(sampleAction2.name);
      updatedAllowedAction1._id.should.equal(sampleAction2._id.toString());

      updatedAllowedAction2.name.should.equal(sampleAction3.name);
      updatedAllowedAction2._id.should.equal(sampleAction3._id.toString());
    });
  });

  describe("DELETE /api/userRoles/types/:id >> Delete a single user type", async () => {
    let createdUsers;
    let sampleUserTypes;
    let sampleUserType;
    let sampleUserType2;
    let sampleActions;
    let sampleAction1;
    let sampleAction2;
    let sampleAction3;
    beforeEach(async function () {
      await UserTypeModel.deleteMany({
        nonDeletable: {
          $ne: true,
        },
      });
      // delete all user actions except default
      await UserActionModel.deleteMany();
      const defaultUserTypes = await UserTypeModel.find();
      // the first index is superAdmin
      const adminType = defaultUserTypes[1];
      const genericType = defaultUserTypes[2];
      const sampleUsers = users.map((user, index) => {
        if (index === 0) {
          user.userType = adminType._id;
        } else {
          user.userType = genericType._id;
        }
        return user;
      });
      // delete all users except super admin
      await UserModel.deleteMany({
        email: {
          $ne: process.env.SUPER_ADMIN_ID,
        },
      });
      createdUsers = await UserModel.insertMany(sampleUsers);

      // create sample actions
      const action1 = {
        name: "deleteProduct",
      };
      const action2 = {
        name: "updateProduct",
        description: "To update an existing product",
      };
      const action3 = {
        name: "viewProduct",
      };
      sampleActions = await UserActionModel.insertMany([
        action1,
        action2,
        action3,
      ]);
      sampleAction1 = sampleActions[0];
      sampleAction2 = sampleActions[1];
      sampleAction3 = sampleActions[2];

      // create sample user type
      const newUserType1 = {
        name: "Tester",
        description: "Any tester that uses the app",
        allowedActions: [sampleAction1._id, sampleAction2._id],
      };
      const newUserType2 = {
        name: "Maintainer",
        description: "Any developer that mantains the app",
        allowedActions: [sampleAction3._id],
      };
      await UserTypeModel.insertMany([newUserType1, newUserType2]);
      sampleUserTypes = await UserTypeModel.find().populate("allowedActions");
      sampleUserType = sampleUserTypes[sampleUserTypes.length - 2];
      sampleUserType2 = sampleUserTypes[sampleUserTypes.length - 1];
    });

    it("should return error when not logged in", async () => {
      const result = await chai
        .request(server)
        .delete(`/api/userRoles/types/${sampleUserType._id}`);

      assertInternalError(result);
      result.should.have.status(401);
      result.should.be.json;
      const data = { ...result.body };
      shouldBeAnErrorObject(data);
    });

    it("should be successful when logged in as admin", async () => {
      // login
      const loginData = await loginAsAdmin();
      var token = loginData.token;

      const result = await chai
        .request(server)
        .delete(`/api/userRoles/types/${sampleUserType._id}`)
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(200);
      result.should.be.json;
      const data = [...result.body];
      data.length.should.equal(4); // 3 (default) + 2 (created) - 1 = 4
      data.map((type) => {
        isAUserType(type);
      });
    });

    it("should be successful when logged in as admin, delete many", async () => {
      // login
      const loginData = await loginAsAdmin();
      var token = loginData.token;

      const updatedAllowedActions = [sampleAction2._id, sampleAction3._id];
      // get all user types
      const result = await chai
        .request(server)
        .delete(`/api/userRoles/types/deleteMany`)
        .send({ typeIds: [sampleUserType._id, sampleUserType2._id] })
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(200);
      result.should.be.json;
      const data = [...result.body];
      data.length.should.equal(3); // 3 (default) + 2 (created) - 2 = 4
      data.map((type) => isAUserType(type));
    });
  });

  describe("INTEGRATION >> Deleted Actions must reflect on UserTypes containing that action", async () => {
    let createdUsers;
    let sampleUserTypes;
    let sampleUserType;
    let sampleUserType2;
    let sampleActions;
    let sampleAction1;
    let sampleAction2;
    let sampleAction3;
    beforeEach(async function () {
      await UserTypeModel.deleteMany({
        nonDeletable: {
          $ne: true,
        },
      });
      // delete all user actions except default
      await UserActionModel.deleteMany();
      const defaultUserTypes = await UserTypeModel.find();
      // the first index is superAdmin
      const adminType = defaultUserTypes[1];
      const genericType = defaultUserTypes[2];
      const sampleUsers = users.map((user, index) => {
        if (index === 0) {
          user.userType = adminType._id;
        } else {
          user.userType = genericType._id;
        }
        return user;
      });
      // delete all users except super admin
      await UserModel.deleteMany({
        email: {
          $ne: process.env.SUPER_ADMIN_ID,
        },
      });
      createdUsers = await UserModel.insertMany(sampleUsers);

      // create sample actions
      const action1 = {
        name: "deleteProduct",
      };
      const action2 = {
        name: "updateProduct",
        description: "To update an existing product",
      };
      const action3 = {
        name: "viewProduct",
      };
      sampleActions = await UserActionModel.insertMany([
        action1,
        action2,
        action3,
      ]);
      sampleAction1 = sampleActions[0];
      sampleAction2 = sampleActions[1];
      sampleAction3 = sampleActions[2];

      // create sample user type
      const newUserType1 = {
        name: "Tester",
        description: "Any tester that uses the app",
        allowedActions: [sampleAction1._id, sampleAction2._id],
      };
      const newUserType2 = {
        name: "Maintainer",
        description: "Any developer that mantains the app",
        allowedActions: [sampleAction3._id],
      };
      await UserTypeModel.insertMany([newUserType1, newUserType2]);
      sampleUserTypes = await UserTypeModel.find().populate("allowedActions");
      sampleUserType = sampleUserTypes[sampleUserTypes.length - 2];
      sampleUserType2 = sampleUserTypes[sampleUserTypes.length - 1];
    });

    it("should be successful when logged in as admin, delete many", async () => {
      // login
      const loginData1 = await loginAsSuperAdmin();
      var superToken = loginData1.token;

      const loginData = await loginAsAdmin();
      var token = loginData.token;

      // delete sampleAction 2 // updateProduct
      const result = await chai
        .request(server)
        .delete(`/api/userRoles/actions/${sampleAction2._id}`)
        .set("Authorization", "Bearer " + superToken);

      result.body.length.should.equal(2); // 3 (created) - 1 = 2

      // grab the affected user type
      const getUserTypeReq = await chai
        .request(server)
        .get(`/api/userRoles/types/${sampleUserType._id}`)
        .set("Authorization", "Bearer " + token);

      const allowedActions = getUserTypeReq.body.allowedActions;

      allowedActions.length.should.equal(1);
      allowedActions[0].name.should.equal("deleteProduct");
    });
  });
});
