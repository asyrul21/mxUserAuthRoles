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
  isAnUserAction,
  loginAsJohn,
  loginAsSuperAdmin,
} = require("./testUtils");

// import model
const UserTypeModel = require("../models/UserType");
const UserModel = require("../models/User");
const UserActionModel = require("../models/UserAction");

// import data
const users = require("./data/users");

describe("User Action Routes", () => {
  before(function () {
    //
  });

  describe("GET /api/userRoles/actions", async () => {
    let createdUsers;
    beforeEach(async function () {
      // delete all user types except default
      await UserTypeModel.deleteMany({
        nonDeletable: {
          $ne: true,
        },
      });
      // delete all user actions
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
    });

    it("should return error when not logged in", async () => {
      // get all user types
      const result = await chai.request(server).get("/api/userRoles/actions");
      assertInternalError(result);
      result.should.have.status(401);
      result.should.be.json;
      const data = { ...result.body };
      shouldBeAnErrorObject(data);
    });

    it("should be successful when logged in as generic user", async () => {
      // login
      const loginData = await loginAsJohn();
      //   console.log("Login data:");
      //   console.log(loginData);
      var token = loginData.token;

      // get all user types
      const result = await chai
        .request(server)
        .get("/api/userRoles/actions")
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(200);
      result.should.be.json;
      const data = [...result.body];
      data.map((item) => {
        isAnUserAction(item);
      });
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
        .get("/api/userRoles/actions")
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(200);
      result.should.be.json;
      const data = [...result.body];
      data.map((item) => {
        isAnUserAction(item);
      });
    });

    it("should be successful when logged in as superAdmin", async () => {
      // login
      const loginData = await loginAsSuperAdmin();
      var token = loginData.token;

      // get all user types
      const result = await chai
        .request(server)
        .get("/api/userRoles/actions")
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(200);
      result.should.be.json;
      const data = [...result.body];
      data.map((item) => {
        isAnUserAction(item);
      });
    });
  });

  describe("POST /api/userRoles/actions >> Create new user actions", async () => {
    let createdUsers;
    beforeEach(async function () {
      // delete all user types except default
      await UserTypeModel.deleteMany({
        nonDeletable: {
          $ne: true,
        },
      });
      // delete all user actions
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
    });

    it("should return error when not logged in", async () => {
      const newAction = {
        name: "deleteProduct",
        description: "To remove an existing product",
      };
      const result = await chai
        .request(server)
        .post("/api/userRoles/actions")
        .send(newAction);

      assertInternalError(result);
      result.should.have.status(401);
      result.should.be.json;
      const data = { ...result.body };
      shouldBeAnErrorObject(data);
    });

    it("should return error when logged in as generic user", async () => {
      // login
      const loginData = await loginAsJohn();
      var token = loginData.token;

      const newAction = {
        name: "deleteProduct",
        description: "To remove an existing product",
      };
      // get all user types
      const result = await chai
        .request(server)
        .post("/api/userRoles/actions")
        .send(newAction)
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(401);
      result.should.be.json;
      const data = { ...result.body };
      shouldBeAnErrorObject(data);
    });

    it("should return error when logged in as admin", async () => {
      // login
      const loginData = await loginAsAdmin();
      var token = loginData.token;

      const newAction = {
        name: "deleteProduct",
        description: "To remove an existing product",
      };
      const result = await chai
        .request(server)
        .post("/api/userRoles/actions")
        .send(newAction)
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(401);
      result.should.be.json;
      const data = { ...result.body };
      shouldBeAnErrorObject(data);
    });

    it("should be successful when logged in as superAdmin to create deletable action", async () => {
      // login
      const loginData = await loginAsSuperAdmin();
      var token = loginData.token;

      const newAction = {
        name: "deleteProduct",
        description: "To remove an existing product",
      };
      const result = await chai
        .request(server)
        .post("/api/userRoles/actions")
        .send(newAction)
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(200);
      result.should.be.json;
      const data = [...result.body];
      //   console.log(data);
      data.map((item) => {
        isAnUserAction(item);
      });
    });

    it("should be successful when logged in as superAdmin to create non-deletable action", async () => {
      // login
      const loginData = await loginAsSuperAdmin();
      var token = loginData.token;

      const newAction = {
        name: "deleteProduct",
        description: "To remove an existing product",
        nonDeletable: true,
      };
      const result = await chai
        .request(server)
        .post("/api/userRoles/actions")
        .send(newAction)
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(200);
      result.should.be.json;
      const data = [...result.body];
      //   console.log(data);
      data.map((item) => {
        isAnUserAction(item);
      });
    });
  });

  describe("PUT /api/userRoles/actions/:id >> Update user actions", async () => {
    let createdUsers;
    let sampleActions;
    let sampleAction1;
    let sampleAction2;
    beforeEach(async function () {
      // delete all user types except default
      await UserTypeModel.deleteMany({
        nonDeletable: {
          $ne: true,
        },
      });
      // delete all user actions
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

      // create a few sample actions
      const action1 = {
        name: "deleteProduct",
      };
      const action2 = {
        name: "updateProduct",
        description: "To update an existing product",
        nonDeletable: true,
      };
      sampleActions = await UserActionModel.insertMany([action1, action2]);
      sampleAction1 = sampleActions[0];
      sampleAction2 = sampleActions[1];
    });

    it("should return error when not logged in", async () => {
      const updatedName = "deleteSingleProduct";
      const result = await chai
        .request(server)
        .put(`/api/userRoles/actions/${sampleAction1._id}`)
        .send({ name: updatedName });

      assertInternalError(result);
      result.should.have.status(401);
      result.should.be.json;
      const data = { ...result.body };
      shouldBeAnErrorObject(data);
    });

    it("should return error when logged in as admin", async () => {
      // login
      const loginData = await loginAsAdmin();
      var token = loginData.token;

      const updatedName = "deleteSingleProduct";
      const result = await chai
        .request(server)
        .put(`/api/userRoles/actions/${sampleAction1._id}`)
        .send({ name: updatedName })
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(401);
      result.should.be.json;
      const data = { ...result.body };
      shouldBeAnErrorObject(data);
    });

    it("should be successful when logged in as superAdmin to update action 1", async () => {
      // login
      const loginData = await loginAsSuperAdmin();
      var token = loginData.token;

      const updatedName = "deleteSingleProduct";
      const result = await chai
        .request(server)
        .put(`/api/userRoles/actions/${sampleAction1._id}`)
        .send({ name: updatedName })
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(200);
      result.should.be.json;
      const data = { ...result.body };

      isAnUserAction(data);
      data.name = updatedName;
      data.description = sampleAction1.description;
      data.nonDeletable = sampleAction1.nonDeletable;
    });

    it("should be successful when logged in as superAdmin to update action 1 add desc", async () => {
      // login
      const loginData = await loginAsSuperAdmin();
      var token = loginData.token;

      const updatedName = "deleteSingleProduct";
      const addedDescription = "To delete an existing product";
      const result = await chai
        .request(server)
        .put(`/api/userRoles/actions/${sampleAction1._id}`)
        .send({ name: updatedName, description: addedDescription })
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(200);
      result.should.be.json;
      const data = { ...result.body };

      isAnUserAction(data);
      data.name = updatedName;
      data.description = addedDescription;
      data.nonDeletable = sampleAction1.nonDeletable;
    });

    it("should be successful when logged in as superAdmin to update user action 2 update desc", async () => {
      // login
      const loginData = await loginAsSuperAdmin();
      var token = loginData.token;

      const updatedDescription =
        "To update an existing product with new values";
      const result = await chai
        .request(server)
        .put(`/api/userRoles/actions/${sampleAction2._id}`)
        .send({ description: updatedDescription })
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(200);
      result.should.be.json;
      const data = { ...result.body };

      isAnUserAction(data);
      data.name = sampleAction2.name;
      data.description = updatedDescription;
      data.nonDeletable = sampleAction2.nonDeletable;
    });

    it("should be successful when logged in as superAdmin to update user action 2 update nonDeletable", async () => {
      // login
      const loginData = await loginAsSuperAdmin();
      var token = loginData.token;

      const result = await chai
        .request(server)
        .put(`/api/userRoles/actions/${sampleAction2._id}`)
        .send({ nonDeletable: true })
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(200);
      result.should.be.json;
      const data = { ...result.body };

      isAnUserAction(data);
      data.name = sampleAction2.name;
      data.description = sampleAction2.description;
      data.nonDeletable = true;
    });
  });

  describe("DELETE /api/userRoles/actions/:id >> Delete user actions", async () => {
    let createdUsers;
    let sampleActions;
    let sampleAction1;
    let sampleAction2;
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

      // create a few sample actions
      const action1 = {
        name: "deleteProduct",
      };
      const action2 = {
        name: "updateProduct",
        description: "To update an existing product",
        nonDeletable: true,
      };
      sampleActions = await UserActionModel.insertMany([action1, action2]);
      sampleAction1 = sampleActions[0];
      sampleAction2 = sampleActions[1];
    });

    it("should return error when not logged in", async () => {
      const result = await chai
        .request(server)
        .delete(`/api/userRoles/actions/${sampleAction1._id}`);

      assertInternalError(result);
      result.should.have.status(401);
      result.should.be.json;
      const data = { ...result.body };
      shouldBeAnErrorObject(data);
    });

    it("should return error when logged in as admin", async () => {
      // login
      const loginData = await loginAsAdmin();
      var token = loginData.token;

      const result = await chai
        .request(server)
        .delete(`/api/userRoles/actions/${sampleAction1._id}`)
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(401);
      result.should.be.json;
      const data = { ...result.body };
      shouldBeAnErrorObject(data);
    });

    it("should be successful when logged in as superAdmin to delete action 1", async () => {
      // login
      const loginData = await loginAsSuperAdmin();
      var token = loginData.token;

      const result = await chai
        .request(server)
        .delete(`/api/userRoles/actions/${sampleAction1._id}`)
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(200);
      result.should.be.json;
      const data = [...result.body];
      data.length.should.equal(1);

      isAnUserAction(data[0]);
      data[0].name = sampleAction2.name;
      data[0].description = sampleAction2.description;
      data[0].nonDeletable = sampleAction2.nonDeletable;
    });

    it("should be successful when logged in as superAdmin to update action 2 which is nonDeletable", async () => {
      // login
      const loginData = await loginAsSuperAdmin();
      var token = loginData.token;

      const result = await chai
        .request(server)
        .delete(`/api/userRoles/actions/${sampleAction2._id}`)
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(400);
      result.should.be.json;
      const data = { ...result.body };
      shouldBeAnErrorObject(data);
    });
  });
});
