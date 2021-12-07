const mongoose = require("mongoose");

const ActionSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
});

const Action = mongoose.model("Action", ActionSchema);
module.exports = Action;
