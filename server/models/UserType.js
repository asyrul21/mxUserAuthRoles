const mongoose = require("mongoose");

const UserTypeSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  allowedActions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAction",
    },
  ],
});

const UserType = mongoose.model("UserType", UserTypeSchema);
module.exports = UserType;
