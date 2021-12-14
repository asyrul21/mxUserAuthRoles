const bcrypt = require("bcryptjs");
const { userTypes } = require("../../constants");

const users = [
  {
    email: "admin@mail.com",
    password: bcrypt.hashSync("123123", 10),
    // userType: null,
  },
  {
    email: "john@mail.com",
    mobile: "60123213211",
    password: bcrypt.hashSync("123123", 10),
    // userType: null,
  },
  {
    email: "jane@mail.com",
    mobile: "601145645650",
    password: bcrypt.hashSync("123123", 10),
  },
];

module.exports = users;
