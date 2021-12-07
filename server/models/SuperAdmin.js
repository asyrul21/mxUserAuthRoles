const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

const SuperAdminSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// authentication to match password
SuperAdminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(String(enteredPassword), this.password);
};

// password encryption
SuperAdminSchema.pre("save", async function (req, res, next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    console.log(error);
    res.status(500);
    throw new Error("Error while updating user password.");
  }
});

const SuperAdminModel = mongoose.model("SuperAdmin", SuperAdminSchema);
module.exports = SuperAdminModel;
