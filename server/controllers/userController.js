const UserModel = require("../models/User");
const dotenv = require("dotenv");
dotenv.config();

const jwt = require("jsonwebtoken");
const createToken = (id, email) => {
  return jwt.sign(
    {
      id,
      email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

// only for admin/superAdmin
const getUsers = async (req, res) => {
  try {
    const users = await UserModel.find({
      email: {
        $ne: process.env.SUPER_ADMIN_ID,
      },
    })
      .populate("userType")
      .select("-password");
    return res.json(users);
  } catch (error) {
    console.error(error);
    res.status(400);
    next(new Error("Get all users failed."));
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { email: requestEmail, oldPassword, newPassword } = req.body;
    const User = await UserModel.findById(req.params.id)
      .select("-password")
      .populate("userType");
    if (User) {
      User.email = requestEmail || User.email;
      // check if there is password update, check old password matches
      let passwordMatch = false;
      if (oldPassword && newPassword) {
        passwordMatch = await User.matchPassword(oldPassword);
        if (!passwordMatch) {
          throw "Old password does not match.";
        } else {
          User.password = newPassword;
        }
      }
      await User.save();
      return res.status(200).json(User);
    } else {
      throw "Invalid profile update data.";
    }
  } catch (error) {
    console.error(error);
    res.status(400);
    next(new Error("User profile update fail. " + error));
  }
};

// only for Admin and superAdmin
const deleteUser = async (req, res) => {
  try {
    const User = await UserModel.findById(req.params.id).select(
      "-password -orders -cart -address"
    );
    if (User) {
      if (User.email === process.env.SUPER_ADMIN_ID) {
        throw "This user cannot be deleted.";
      }
      await User.remove();
      const result = await UserModel.find({
        email: {
          $ne: process.env.SUPER_ADMIN_ID,
        },
      });
      return res.status(200).json(result);
    } else {
      res.status(404);
      throw "User not found.";
    }
  } catch (error) {
    console.error(error);
    res.status(400);
    next(new Error("Delete user failed. " + error));
  }
};

//@description  Authenticate user and get token (for test purposes only)
//@route        POST /api/users/login
//@access       Public
const signIn = async (req, res, next) => {
  try {
    const { email: requestEmail, password } = req.body;
    const User = await UserModel.findOne({ email: requestEmail }).populate(
      "userType"
    );
    console.log(User);
    if (!User) {
      throw "User not found.";
    }
    const passwordMatch = await User.matchPassword(password);
    const { _id, email, userType } = User;

    if (passwordMatch) {
      const token = createToken(_id, email);
      return res.status(200).json({
        _id,
        email,
        userType,
        token,
      });
    } else {
      throw "";
    }
  } catch (error) {
    console.error(error);
    res.status(401);
    next(new Error("Invalid email or password. " + error));
  }
};

module.exports = { signIn, getUsers, updateUserProfile, deleteUser };
