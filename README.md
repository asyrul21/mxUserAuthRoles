# MX User Auth Roles

[Buy me a Coffee Link]

A Modular Library to Manage User Roles and their responsibilities. It is meant to be used as a modular plugin to your existing MongoDB-Mongoose-Express application. It provides:

1. Endpoints to manage (view, create, update, delete) User Types (Roles) and User Actions. User Types (such as Admin, Tester, Maintainer, etc) has a list of `allowedActions` that specify whether or not they are allowed to perform. Client's User Model can then implement the UserType as a property on their app.

2. Middlewares that client can use to protect their app's Routes. These middlewares include:

- _setupRequireLoginMiddleware_:

  this to connect Client's User Model and JWT Secret to the Library. Example:

  ```javascript
  const requireLogin = setupRequireLoginMiddleware(
    UserModel,
    process.env.JWT_SECRET
  );
  router.route("/").get(requireLogin, mustBeAdmin, getUsers);
  ```

- _mustBeAdmin_ & _mustBeSuperAdmin_:

  Endpoints exposed only to admin and superAdmin. These must be used after `requireLogin`

- _isProfileOwner_:

  Used if there is an update user profile endpoint, to check if the request sender is either the Owner of the profile, or an admin/superAdmin

- _isAllowedToPerformAction_:

  Check the user's `allowedActions` to see if the current endpoint's action is allowed for the user to perform.

SEE _Sample Usage with Middlewares to Protect Routes_ below

# Pre-Requisites

Your app MUST have the following modules installed:

1. Mongoose
2. Express
3. jsonwebtoken
4. bcryptjs

```bash
npm install mongoose express jsonwebtoken mongoose bcryptjs
```

Your app also needs to support the following infrastructure:

1. JWT Authorization

   Requests need to have a _header_ with key-value of {"authorization" : "Brearer <JWT token>"}

2. Your app should also have a mechanism to create a token. In this method, take note on the _identifier (ID) property_. For example:

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

   In this case, the identifier prop is _id_. It will be used when setting up _connectRoutesAndUserModel_ below, as it takes an optional parameter _jwtIDKey_

</br>

# Setup

Import `initialiseUserAuthRoles` and `connectRoutesAndUserModel` in your `server.js`.

## initialiseUserAuthRoles

`initialiseUserAuthRoles` must accept FOUR mandatory parameters and ONE optional:

1. Super Admin user properties. This needs to follow your UserModel's requirements. We recommend putting the credentials in `.env` file. Example:

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

2. Your app's mongoose _UserModel_.

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

3. The list of all default userActions. These can be modified later by superAdmin. One suggestion is to put them in a _.json_ file which is later referenced in _serves.js_

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

4. A callback function that usually runs the Connect to Database code chunk.

5. An Optional EventEmitter object, that is used to inform top-level application that initialisation is ready. If you do decide to pass an event parameter, you may listen to the event `initializationDone`

   ```javascript
   const events = require("events");
   const EM = new events.EventEmitter();

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
         EM.on("initializationDone", () => {
           server.listen(PORT, () => {
             console.log(
               `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
             );
           });
         });
   ```

## `connectRoutesAndUserModel`

`connectRoutesAndUserModel` takes three mandatory parameters:

1. Client's Express App instance (app)

2. Client's app's `UserModel`

3. Client's `JWT Secret`

Optional parameters:

1. routeHandle

   Your API route handle for the userRole controllers. Default: "/api/userRoles"

2. jwtIDKey

   Your ID Prop used in your JWT's `createToken`. Default: "id",

3. userPasswordProp

   The property for User Password fo your User Model. Default = "password"

  <br/>

## Sample initialisation code (server.js):

```javascript
// import
const {
  initialiseUserAuthRoles,
  connectRoutesAndUserModel,
} = require("./config");
const UserModel = require("./models/User");
const defaultUserActions = require("./defaultUserActions.json");

// event emitter
const events = require("events");
const EM = new events.EventEmitter();

// express
const app = express();

const superAdminObject = {
  email: process.env.SUPER_ADMIN_ID, // make sure the primary key/prop of your user model is defined FIRST
  email: process.env.SUPER_ADMIN_PASSWORD,
  password: process.env.SUPER_ADMIN_NAME,
};
initialiseUserAuthRoles(
  superAdminObject,
  UserModel,
  defaultUserActions,
  () => {
    initializeDatabase(process.env.NODE_ENV);
  },
  EM
);
connectRoutesAndUserModel(app, UserModel, process.env.JWT_SECRET);
```

# Sample Usage with Middlewares to Protect Routes

1. Setup the requiredLogin method.

   ```javascript
   // setupRequireLogin
   const requireLogin = setupRequireLoginMiddleware(
     UserModel,
     process.env.JWT_SECRET
   );
   ```

2. These middlewares can be used in your routes:

- the set up `requiredLogin` in (1)
- `mustBeAdmin`
- `mustBeSuperAdmin`
- `isAllowedToPerformAction`
- `isProfileOwner`

## Example Usage with Client's User Routes

```javascript
const {
  mustBeAdmin,
  mustBeSuperAdmin,
  isAllowedToPerformAction,
  setupRequireLoginMiddleware,
} = require("../middlewares");

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
    isProfileOwner,
    updateUserProfile
  )
  .delete(requireLogin, isAllowedToPerformAction("deleteUser"), deleteUser);
router.post("/login", signIn);

module.exports = router;
```

<br/>

# API Routes

This library gives the Client API's out of the box to manage User Types(Roles), and User Actions. It also gives an endpoint for UI to check if a user is allowed perform a list of actions.

For this reason, IT IS CRUCIAL to HAVE A SINGLE POINT OF REFERENCE of ALL THE AVAILABLE ACTIONS of the APP.

Depending on your API Route handle configured above, we will use the default `api/userRoles` for these examples.

## Retrieving All Actions For Reference for Developers

1. Use Postman and Sign In as a SuperAdmin.

2. Grab the token.

3. Execute endpoint to Retrieve all actions below.

4. The `defaultActions.json` will only be used once, when the app first initialises. To manage actions and types after that, you need to use the endpoints.

## User Actions (only for superAdmins)

1. GET to retrive all Actions:

   GET `api/userRoles/actions`

   OR

   GET `api/userRoles/actions?keyword=[somekeyword]`

2. POST to create new Action:

   POST `api/userRoles/actions`

   Pass in the Request Body a UserAction object. Schema:

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

   Example request body:

   ```javascript
   {
      name: "newAction",
      description: "Some new action",
   }
   ```

3. PUT to edit Action:

   PUT `api/userRoles/actions/:id`

   Pass in the Request Body a UserAction object, the props to be updated. Example:

   ```javascript
   {
     name: "updatedActionName";
   }
   ```

4. DELETE to remove an Action:

   DELETE `api/userRoles/actions/:id`

5. DELETE MANY to remove Actions:

   DELETE `api/userRoles/actions/deleteMany`

   Pass in the Request Body a list/array of `actionIds`:

   ```javascript
   {
     actionIds: ["123", "234", "456"],
   }
   ```

## User Types (only for superAdmins and admins)

1. GET to retrive all Types:

   GET `api/userRoles/types`

   OR

   GET `api/userRoles/types?keyword=[somekeyword]`

2. POST to create new Types:

   POST `api/userRoles/types`

   Pass in the Request Body a UserAction object. To add _allowedActions_ during creation of User Type, you need to pass a list/array of Action Object IDs. Schema:

   ```javascript
   name: {
    type: String,
    required: true,
   },
   description: {
    type: String,
   },
   allowedActions: [
    {
      type: String, // must be valid Mongoose ID's. Endpoint will get the name of the Action and push in this array.
    },
   ],
   nonDeletable: {
    type: Boolean,
    default: false,
   }
   ```

   Example request body:

   ```javascript
   {
      name: "newTypeName",
      description: "Some new type",
      allowedActions: ["123", "234", "456"],
   }
   ```

3. PUT to edit Types:

   PUT `api/userRoles/types/:id`

   Pass in the Request Body a UserType object, the props to be updated. To update allowedActions, you need to pass in the id's of Actions. Example:

   ```javascript
   {
     name: "updatedTypeName",
     allowedActions: ["123", "234", "456"]
   }
   ```

4. DELETE to remove an Types:

   DELETE `api/userRoles/types/:id`

5. DELETE MANY to remove Actions:

   DELETE `api/userRoles/types/deleteMany`

   Pass in the Request Body a list/array of `typeIds`:

   ```javascript
   {
     typeIds: ["123", "234", "456"],
   }
   ```

## Verify User is Allowed to Perform Action

This endpoint can be used by Client UI / Front End to obtain user authorisation based specific UI components.

GET `api/userRoles/verify`

Pass in the Request Body a list/array of `actions` String. Example:

```javascript
{
  actions: [
      "deleteProduct",
      "updateProduct",
      "viewProduct",
      "updateUserProfile",
      "deleteUser",
    ],
}
```

You will expect to receive the following response:

```javascript
{
  deleteProduct: true,
  updateProduct: true,
  viewProduct: false,
  updateUserProfile: false,
  deleteUser: false
}
```

This will depend on UserType of the User making the request.

<br/>

# Caveats

Be sure that the Action String names are the same (same spelling, casing, etc) for both server and front end.

# Error Handling

The middlewares will execute _next(error)_ when there is an error or when authentication/authorization fails. You need to _use_ Express error handlers to properly catch these errors and return them as response.

## Example:

In server.js:

```javascript
app.use(notFound);
app.use(errorHandler);
```

Error Handlers:

```javascript
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const errorCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(errorCode);
  const errorResponse = {
    code: errorCode,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  };
  res.json(errorResponse);
};

module.exports = { notFound, errorHandler };
```
