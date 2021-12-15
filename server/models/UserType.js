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
  nonDeletable: {
    type: Boolean,
    default: false,
  },
});

const UserType = mongoose.model("UserType", UserTypeSchema);
module.exports = UserType;
