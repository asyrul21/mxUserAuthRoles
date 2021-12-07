const mongoose = require("mongoose");

const UserType = mongoose.Schema({
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
      ref: "Action",
    },
  ],
});

const UserType = mongoose.model("UserType", UserTypeSchema);
module.exports = UserType;
