const UserTypeModel = require("../models/UserType");
const asyncHandler = require("express-async-handler");

// const getUserTypes = asyncHandler(async (req, res) => {
//   try {
//     console.log("GET USER TYPES ENDPOINT");
//     return res.json({
//       result: 1,
//     });
//   } catch (error) {
//     res.status(400);
//     throw new Error("Get categories failed.");
//   }
// });

const getUserTypes = async (req, res, next) => {
  try {
    console.log("GET USER TYPES ENDPOINT");
    console.log("Throwing!");
    throw new Error("just throwing for fun.");
    return res.json({
      result: 1,
    });
  } catch (error) {
    console.log("An EROR has been caught");
    console.log("calling next");
    res.status(400);
    next();
    throw new Error("Get categories failed.");
  }
};

module.exports = {
  getUserTypes,
};
