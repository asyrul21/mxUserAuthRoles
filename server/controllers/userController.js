const UserModel = require("../models/User");

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

//@description  Authenticate user and get token (for test purposes only)
//@route        POST /api/users/login
//@access       Public
const signIn = async (req, res, next) => {
  try {
    const { email: requestEmail, password } = req.body;
    const User = await UserModel.findOne({ email: requestEmail }).populate(
      "userType"
    );

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
    res.status(401);
    next(new Error("Invalid email or password. " + error));
  }
};

module.exports = { signIn };
