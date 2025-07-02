// import mongoose from "mongoose";

// const connectDB = async () => {
//   const uri = process.env.MONGO_URI;

//   if (!uri) {
//     console.error("❌ MONGO_URI not found in .env");
//     process.exit(1);
//   }

//   try {
//     await mongoose.connect(uri, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     } as mongoose.ConnectOptions);

//     console.log("✅ Connected to MongoDB Atlas");
//   } catch (err) {
//     console.error("❌ MongoDB connection error:", err);
//     process.exit(1);
//   }
// };

// export default connectDB;

// import mongoose from "mongoose";

// const uri = process.env.MONGO_URI;

// if (!uri) {
//   throw new Error("❌ MONGO_URI environment variable not defined");
// }

// // Serverless connection caching
// declare global {
//   var mongooseCache: {
//     conn: typeof mongoose | null;
//     promise: Promise<typeof mongoose> | null;
//   };
// }

// const mongooseCache = global.mongooseCache || { conn: null, promise: null };

// const connectDB = async () => {
//   // Return cached connection if available
//   if (mongooseCache.conn) {
//     return mongooseCache.conn;
//   }

//   // Create new connection promise if none exists
//   if (!mongooseCache.promise) {
//     mongooseCache.promise = mongoose.connect(uri, {
//       bufferCommands: false, // Disable Mongoose buffering
//       serverSelectionTimeoutMS: 5000, // Faster failure in serverless
//       socketTimeoutMS: 45000, // Close sockets after 45s inactivity
//       maxIdleTimeMS: 30000, // Close connections after 30s inactivity
//     } as mongoose.ConnectOptions).then(mongoose => {
//       console.log("✅ Connected to MongoDB Atlas");
//       return mongoose;
//     });
//   }

//   try {
//     // Cache connection after successful resolution
//     mongooseCache.conn = await mongooseCache.promise;
//   } catch (err) {
//     // Reset promise on failure to allow retries
//     mongooseCache.promise = null;
//     console.error("❌ MongoDB connection error:", err);
//     throw new Error("Database connection failed");
//   }

//   // Cache in global object for serverless reuse
//   if (process.env.NODE_ENV !== "production") {
//     global.mongooseCache = mongooseCache;
//   }

//   return mongooseCache.conn;
// };

// export default connectDB;

import mongoose from "mongoose";

// Serverless connection caching
declare global {
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const mongooseCache = global.mongooseCache || { conn: null, promise: null };

const connectDB = async () => {
  // Move environment variable check inside function
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("❌ MONGO_URI environment variable not defined");
  }

  // Return cached connection if available
  if (mongooseCache.conn) {
    return mongooseCache.conn;
  }

  // Create new connection promise if none exists
  if (!mongooseCache.promise) {
    mongooseCache.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxIdleTimeMS: 30000,
    } as mongoose.ConnectOptions).then(mongoose => {
      console.log("✅ Connected to MongoDB Atlas");
      return mongoose;
    }).catch(err => {
      console.error("❌ MongoDB connection error:", err);
      mongooseCache.promise = null; // Reset on failure
      throw err;
    });
  }

  try {
    // Cache connection after successful resolution
    mongooseCache.conn = await mongooseCache.promise;
  } catch (err) {
    // This catch block might be redundant now
    mongooseCache.promise = null;
    throw new Error("Database connection failed");
  }

  // Cache in global object for serverless reuse
  if (process.env.NODE_ENV !== "production") {
    global.mongooseCache = mongooseCache;
  }

  return mongooseCache.conn;
};

export default connectDB;