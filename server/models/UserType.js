const mongoose = require("mongoose");

// CRUD only by superadmin or admin
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
