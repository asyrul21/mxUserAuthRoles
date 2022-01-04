const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const morgan = require("morgan");
const { initializeDatabase } = require("./config/database");
const UserModel = require("./models/User");
const defaultUserActions = require("./defaultUserActions.json");
const http = require("http");
// // event emitter
const events = require("events");
const EM = new events.EventEmitter();
// User Roles
const { initialiseUserRolls, connectRoutesAndUserModel } = require("./config");

// // middlewares
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

console.log("NODE ENVIRONMENT: " + process.env.NODE_ENV);
const app = express();

// morgan
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// body parser
app.use(express.json());

// CLIENT's user routes setup
const UserRoutes = require("./routes/userRoutes");
app.get("/api/", (req, res) => {
  res.send("User Role Service API is running");
});
app.use("/api/users", UserRoutes);

// initialise User Rolls
const superAdminObject = {
  email: process.env.SUPER_ADMIN_ID, // make sure the primary key/prop of your user model is defined FIRST
  name: process.env.SUPER_ADMIN_NAME,
  password: process.env.SUPER_ADMIN_PASSWORD,
};
initialiseUserRolls(
  superAdminObject,
  UserModel,
  defaultUserActions.actions,
  () => {
    initializeDatabase(process.env.NODE_ENV, EM);
  }
);
connectRoutesAndUserModel(app, UserModel, process.env.JWT_SECRET);

// error middlewares
app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
module.exports =
  process.env.NODE_ENV === "test"
    ? server.listen(
        PORT,
        console.log(
          `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
        )
      )
    : // wait for the database is loaded before starting listening
      EM.on("databaseReady", () => {
        server.listen(PORT, () => {
          console.log(
            `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
          );
        });
      });
