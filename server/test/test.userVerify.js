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
  loginAsJane,
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

  describe("GET User Verify", async () => {
    let createdUsers;
    let sampleUserTypes;
    let sampleGenericUserType;
    let sampleAdminUserType;
    let sampleActions;
    let sampleAction1;
    let sampleAction2;
    let sampleAction3;
    let sampleAction4;
    let sampleAction5;
    beforeEach(async function () {
      await UserTypeModel.deleteMany({
        nonDeletable: {
          $ne: true,
        },
      });

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
      const action4 = {
        name: "updateUserProfile",
      };
      const action5 = {
        name: "deleteUser",
      };

      sampleActions = await UserActionModel.insertMany([
        action1,
        action2,
        action3,
        action4,
        action5,
      ]);
      sampleAction1 = sampleActions[0];
      sampleAction2 = sampleActions[1];
      sampleAction3 = sampleActions[2];
      sampleAction4 = sampleActions[3]; // for generic
      sampleAction5 = sampleActions[4]; // for admin/superadmin only

      // create sample user type
      const newUserType1 = {
        name: "Tester",
        description: "Any tester that uses the app",
        allowedActions: [sampleAction1.name, sampleAction2.name],
      };
      const newUserType2 = {
        name: "Maintainer",
        description: "Any developer that mantains the app",
        allowedActions: [sampleAction3.name],
      };
      const newUserType3 = {
        name: "generic",
        description: "The generic userType for testing purposes",
        allowedActions: [sampleAction4.name],
      };
      const newUserType4 = {
        name: "admin",
        description: "The Admin userType for testing purposes",
        allowedActions: [
          sampleAction1.name,
          sampleAction2.name,
          sampleAction3.name,
          sampleAction4.name,
          sampleAction5.name,
        ],
      };

      await UserTypeModel.insertMany([
        newUserType1,
        newUserType2,
        newUserType3, // generic for test
        newUserType4, // admin for test
      ]);
      sampleUserTypes = await UserTypeModel.find().populate("allowedActions");
      sampleGenericUserType = sampleUserTypes[sampleUserTypes.length - 2];
      sampleAdminUserType = sampleUserTypes[sampleUserTypes.length - 1];
      //   console.log("sample user types");
      //   console.log(sampleUserTypes);

      await UserActionModel.deleteMany();
      const sampleUsers = users.map((user, index) => {
        if (index === 0) {
          // admin
          user.userType = sampleAdminUserType._id;
        } else if (index === 1) {
          // john
          user.userType = sampleGenericUserType._id;
        } else if (index === 2) {
          // jane
          user.userType = sampleUserTypes[sampleUserTypes.length - 4]; // maintainer
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

    it("should return error when trying to verify nothing", async () => {
      // login
      const loginData = await loginAsJane(); // tester
      var token = loginData.token;

      const expectedResult = {
        deleteProduct: true,
        updateProduct: true,
        viewProduct: false,
        updateUserProfile: false,
        deleteUser: false,
      };

      const result = await chai
        .request(server)
        .get(`/api/userRoles/verify`)
        .set("Authorization", "Bearer " + token);

      assertInternalError(result);
      result.should.have.status(400);
      result.should.be.json;
      const data = { ...result.body };
      shouldBeAnErrorObject(data);
    });

    it("should be successful when trying to verify actions as Tester", async () => {
      // login
      const loginData = await loginAsJane(); // tester
      var token = loginData.token;

      const expectedResult = {
        deleteProduct: true,
        updateProduct: true,
        viewProduct: false,
        updateUserProfile: false,
        deleteUser: false,
      };

      const result = await chai
        .request(server)
        .get(`/api/userRoles/verify`)
        .set("Authorization", "Bearer " + token)
        .send({
          actions: [
            "deleteProduct",
            "updateProduct",
            "viewProduct",
            "updateUserProfile",
            "deleteUser",
          ],
        });

      assertInternalError(result);
      result.should.have.status(200);
      result.should.be.json;
      const data = { ...result.body };
      data.should.deep.equal(expectedResult);
    });

    it("should be successful when trying to verify actions as Generic", async () => {
      // login
      const loginData = await loginAsJohn();
      var token = loginData.token;

      const expectedResult = {
        deleteProduct: false,
        updateProduct: false,
        viewProduct: false,
        updateUserProfile: true,
        deleteUser: false,
      };

      const result = await chai
        .request(server)
        .get(`/api/userRoles/verify`)
        .set("Authorization", "Bearer " + token)
        .send({
          actions: [
            "deleteProduct",
            "updateProduct",
            "viewProduct",
            "updateUserProfile",
            "deleteUser",
          ],
        });

      assertInternalError(result);
      result.should.have.status(200);
      result.should.be.json;
      const data = { ...result.body };
      data.should.deep.equal(expectedResult);
    });

    it("should be successful when trying to verify actions as Admin", async () => {
      // login
      const loginData = await loginAsAdmin();
      var token = loginData.token;

      const expectedResult = {
        deleteProduct: true,
        updateProduct: true,
        viewProduct: true,
        updateUserProfile: true,
        deleteUser: true,
      };

      const result = await chai
        .request(server)
        .get(`/api/userRoles/verify`)
        .set("Authorization", "Bearer " + token)
        .send({
          actions: [
            "deleteProduct",
            "updateProduct",
            "viewProduct",
            "updateUserProfile",
            "deleteUser",
          ],
        });

      assertInternalError(result);
      result.should.have.status(200);
      result.should.be.json;
      const data = { ...result.body };
      data.should.deep.equal(expectedResult);
    });

    it("should be successful when trying to verify actions as SuperAdmin", async () => {
      // login
      const loginData = await loginAsSuperAdmin();
      var token = loginData.token;

      const expectedResult = {
        deleteProduct: true,
        updateProduct: true,
        viewProduct: true,
        updateUserProfile: true,
        deleteUser: true,
      };

      const result = await chai
        .request(server)
        .get(`/api/userRoles/verify`)
        .set("Authorization", "Bearer " + token)
        .send({
          actions: [
            "deleteProduct",
            "updateProduct",
            "viewProduct",
            "updateUserProfile",
            "deleteUser",
          ],
        });

      assertInternalError(result);
      result.should.have.status(200);
      result.should.be.json;
      const data = { ...result.body };
      data.should.deep.equal(expectedResult);
    });
  });
});
