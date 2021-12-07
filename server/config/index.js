const { connectDB, connectMockDB } = require("./database");

const initializeApplication = async (env, eventEmitter) => {
  console.log("Initializing application...");
  if (env === "test") {
    await connectMockDB();
  } else {
    await connectDB();
  }
  eventEmitter.emit("DatabaseReady");
};

module.exports = { initializeApplication };
