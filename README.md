# User Role Management Service

A Modular Library to Manage User Roles and their responsibilities. Can be implmented both as an independent service, or together with your app.

# Setup

1. Define the following properties in .env:

- MONGO_URI

2. Import `initializeSwissRolls` in your `server.js`.

   `InitializeSwissRolls` must accept FOUR parameters:

- Super Admin user properties. This needs to follow your UserModel's requirements. We recommend putting the credentials in `.env` file. Example:

  ```env
  SUPER_ADMIN_ID=root-user-1
  SUPER_ADMIN_NAME=Application Super Admin
  SUPER_ADMIN_PASSWORD=root-user-1
  ```

  _IMPORTANT_: make sure the primary key/prop of your user model is defined FIRST

  Sample definition:

  ```javascript
  const superAdminObject = {
    email: process.env.SUPER_ADMIN_ID, // make sure the primary key/prop of your user model is defined FIRST
    name: process.env.SUPER_ADMIN_NAME,
    password: process.env.SUPER_ADMIN_PASSWORD,
  };
  ```

- Your app's mongoose _UserModel_.

  NOTE: You user model must have a _userType_ property, which is a Mongoose ID Reference.

  Sample Client User Model:

  ```javascript
  const UserSchema = mongoose.Schema(
    {
      email: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      // IMPORTANT: Your User Model MUST HAVE THIS PROPERTY!
      userType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserType",
      },
    },
    {
      timestamps: true,
    }
  );
  ```

- the other parameter is the list of all default userActions. These can be modified later by superAdmin. One suggestion is to put them in a _.json_ file which is later referenced in _serves.js_

  Sample json:

  ```json
  {
    "actions": [
      {
        "name": "createProduct",
        "description": "Create a new product"
      },
      {
        "name": "placeOrder",
        "description": "Place an order and buy items"
      }
    ]
  }
  ```

- Finally, it takes a callback function that usually runs the Connect to Database code chunk.

  Sample initialisation code (server.js):

  ```javascript
  const { initialiseSwissRolls } = require("./config");
  const UserModel = require("./models/User");
  const defaultUserActions = require("./defaultUserActions.json");

  const superAdminObject = {
    email: process.env.SUPER_ADMIN_ID, // make sure the primary key/prop of your user model is defined FIRST
    email: process.env.SUPER_ADMIN_PASSWORD,
    password: process.env.SUPER_ADMIN_NAME,
  };
  initialiseSwissRolls(
    superAdminObject,
    UserModel,
    defaultUserActions.actions,
    () => {
      initializeDatabase(process.env.NODE_ENV, EM);
    }
  );
  ```

  <br/>

# Usage using Middlewares

1. Your app must have an Auth Middleware that eventually sets `req.user = verifiedUser` before calling `next()`. You also MUST call mongoose's `.populate("userType")` before assigning. Example:

```javascript
const requireLogin = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const currentUser = await User.findById(decoded.id)
        .select("-password")
        .populate("userType"); // IMPORTANT
      req.user = currentUser; // IMPORTANT
      return next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed. " + error);
    }
  }
  if (!token) {
    res.status(401);
    throw new Error("Not authorized.");
  }
});
```

2. Use the `mustBeAdmin`, `mustBeSuperAdmin` and, `isAllowedToPerformAction` middlewares in your Routes.
