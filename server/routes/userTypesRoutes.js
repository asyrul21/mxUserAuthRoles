const express = require("express");
const router = express.Router();
const { getUserTypes } = require("../controllers/userTypesController");

router.route("/").get(
  (req, res, next) => {
    console.log("Route-level middleware 1");
    console.log("REQ Shirt:");
    console.log(req.shirt);
    req.shirt = "RED";
    next();
  },
  (req, res, next) => {
    console.log("Route-level middleware 2");
    console.log("REQ Shirt:");
    console.log(req.shirt);
    next();
  },
  getUserTypes
);

module.exports = router;
