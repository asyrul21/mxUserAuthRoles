const mongoose = require("mongoose");
const MockMongoose = require("mock-mongoose").MockMongoose;
const MockMongooseInstance = new MockMongoose(mongoose);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    console.log(`MongoDB Connected at DEV host: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};

const connectMockDB = async () => {
  try {
    MockMongooseInstance.prepareStorage().then(async () => {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      });

      console.log(`MongoDB Connected at MOCK host: ${conn.connection.host}`);
    });
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};

const initializeDatabase = async (env) => {
  console.log("Initializing database...");
  if (env === "test") {
    await connectMockDB();
  } else {
    await connectDB();
  }
};

module.exports = { initializeDatabase };
