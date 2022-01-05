# User Role Management Service

A Modular Library to Manage User Roles and their responsibilities. Can be implmented both as an independent service, or together with your app.

# Pre-Requisites

Your app MUST have the following modules installed:

1. Mongoose
2. Express
3. jsonwebtoken
4. bcryptjs

```bash
npm install mongoose express jsonwebtoken express-async-handler  mongoose bcryptjs
```

# Setup

Import `initialiseUserRolls` and `connectRoutesAndUserModel` in your `server.js`.

## initialiseUserRoles

`initialiseUserRolls` must accept FOUR parameters:

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
  const UserSchema = mongoose.Schema({
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
  });
  ```

- The list of all default userActions. These can be modified later by superAdmin. One suggestion is to put them in a _.json_ file which is later referenced in _serves.js_

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

- A callback function that usually runs the Connect to Database code chunk.

## `connectRoutesAndUserModel`

Simply pass in your `app`, `UserModel`, and you `JWT Secret` as mandatory parameters.

Optional parameters:

- routeHandle: Your API route handle for the userRole controllers. Default: "/api/userRoles"
- jwtIDKey: Your ID Prop used in your JWT's `createToken`. Default: "id",
- userPasswordProp: The property for User Password fo your User Model. Default = "password"

Sample initialisation code (server.js):

```javascript
const { initialiseUserRolls } = require("./config");
const UserModel = require("./models/User");
const defaultUserActions = require("./defaultUserActions.json");

const superAdminObject = {
  email: process.env.SUPER_ADMIN_ID, // make sure the primary key/prop of your user model is defined FIRST
  email: process.env.SUPER_ADMIN_PASSWORD,
  password: process.env.SUPER_ADMIN_NAME,
};
initialiseUserRolls(
  superAdminObject,
  UserModel,
  defaultUserActions.actions,
  () => {
    // connect to your db here
    initializeDatabase(process.env.NODE_ENV, EM);
  }
);
connectRoutesAndUserModel(app, UserModel, process.env.JWT_SECRET);
```

  <br/>

# Usage using Middlewares

_IMPORTANT NOTE_: For this library to work, your app needs to support the following infrastructure:

- JWT Authorization

  Requests need to have a _header_ with key-value of {"authorization" : "Brearer <JWT token>"}

- Your app should also have a mechanism to create a token. In this method, take note on the _identifier (ID) property_. For example:

  ```javascript
  const createToken = (id, name, email) => {
    return jwt.sign(
      {
        id,
        name,
        email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );
  };
  ```

  In this case, the identifier prop is _id_

1. Setup the requiredLogin method.

2. Use the `mustBeAdmin`, `mustBeSuperAdmin` and, `isAllowedToPerformAction` middlewares in your Routes.

## Example Usage with Client's User Routes

```javascript
const {
  mustBeAdmin,
  mustBeSuperAdmin,
  isAllowedToPerformAction,
  setupRequireLoginMiddleware,
} = require("../middlewares");

// setupRequireLogin
const requireLogin = setupRequireLoginMiddleware(
  UserModel,
  process.env.JWT_SECRET
);

router.route("/").get(requireLogin, mustBeAdmin, getUsers);
router
  .route("/:id")
  .put(
    requireLogin,
    isAllowedToPerformAction("updateUserProfile"),
    updateUserProfile
  )
  .delete(requireLogin, isAllowedToPerformAction("deleteUser"), deleteUser);
router.post("/login", signIn);

module.exports = router;
```

# API Routes

Depending on your API Route handle configured above, we will use the default `api/userRoles` for these examples.

## User Actions (only for superAdmins)

1. GET to retrive all Actions:

`api/userRoles/actions`

OR

`api/userRoles?keyword=[somekeyword]`

2. POST to create new Action:

Pass in the body a UserAction object. Schema:

```javascript
 {
   name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  nonDeletable: {
    type: Boolean,
    default: false,
  }
 }
```

`api/userRoles/`

3. PUT to edit Action:

4. DELETE to remove an Action:

5. DELETE MANY to remove Actions:

## User Types

1. GET to retrive all Types:

2. POST to create new Types:

3. PUT to edit Types:

4. DELETE to remove an Types:

5. DELETE MANY to remove Actions:

## Verify User is Allowed to Perform Action

1. GET to retrieve if a LoggedIn user is allowed to perform a list of task:
