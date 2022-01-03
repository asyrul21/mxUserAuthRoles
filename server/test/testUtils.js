const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
chai.use(chaiHttp);

require("dotenv").config();

const server = require("../serverTest");

const loginAsJohn = async function () {
  const login = await chai.request(server).post("/api/users/login").send({
    email: "john@mail.com",
    password: 123123,
  });
  const loginData = { ...login.body };
  return loginData;
};

const loginAsJane = async function () {
  const login = await chai.request(server).post("/api/users/login").send({
    email: "jane@mail.com",
    password: 123123,
  });
  const loginData = { ...login.body };
  return loginData;
};

const loginAsAdmin = async () => {
  const login = await chai.request(server).post("/api/users/login").send({
    email: "admin@mail.com",
    password: 123123,
  });
  const loginData = { ...login.body };
  return loginData;
};

const loginAsSuperAdmin = async () => {
  const login = await chai.request(server).post("/api/users/login").send({
    email: process.env.SUPER_ADMIN_ID,
    password: process.env.SUPER_ADMIN_PASSWORD,
  });
  const loginData = { ...login.body };
  return loginData;
};

const isUserType = (item) => {
  item.should.have.property("name");
  item.should.have.property("allowedActions");
  item.should.have.property("nonDeletable");
};

const shouldBeAnErrorObject = (item) => {
  console.log("ERROR MESSAGE:", item.message);
  item.should.have.property("message");
  item.should.have.property("stack");
};

const isErrorResponse = (res) => {
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
  if (res.status === 404 || res.status === 500) {
    return true;
  } else if (res.status === 201 && res.body.message) {
    console.log(res.body);
    return true;
  } else if (res.status === 200 && res.body.message) {
    return true;
  } else {
    return false;
  }
};

const assertInternalError = (response) => {
  if (isErrorResponse(response)) {
    console.log("INTERNAL ERROR STATUS:", response.status);
    console.log("INTERNAL ERROR MESSAGE:", response.body.message);
    console.log("INTERNAL ERROR STACK:", response.body.stack);
  }
  isErrorResponse(response).should.equal(false);
};

const isAnUserAction = (item) => {
  item.should.have.property("name");
  item.should.have.property("nonDeletable");
};

const isAUserType = (item) => {
  item.should.have.property("name");
  item.should.have.property("allowedActions");
  item.should.have.property("nonDeletable");
};

module.exports = {
  shouldBeAnErrorObject,
  assertInternalError,
  isUserType,
  loginAsJane,
  loginAsJohn,
  loginAsAdmin,
  loginAsSuperAdmin,
  isAnUserAction,
  isAUserType,
};
