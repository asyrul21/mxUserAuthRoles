const mongoose = require("mongoose");

const UserActionSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
});

const UserAction = mongoose.model("UserAction", UserActionSchema);
module.exports = UserAction;
