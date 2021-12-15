process.env.NODE_ENV = "test";

const dotenv = require("dotenv");
dotenv.config();

const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
chai.use(chaiHttp);

const server = require("../serverTest");
const { shouldBeAnErrorObject, assertInternalError } = require("./testUtils");

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
      await UserActionModel.deleteMany({
        nonDeletable: {
          $ne: true,
        },
      });

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
  });
});
