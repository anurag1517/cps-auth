// // import mongoose from "mongoose";

// // const connectDB = async () => {
// //   const uri = process.env.MONGO_URI;

// //   if (!uri) {
// //     console.error("❌ MONGO_URI not found in .env");
// //     process.exit(1);
// //   }

// //   try {
// //     await mongoose.connect(uri, {
// //       useNewUrlParser: true,
// //       useUnifiedTopology: true,
// //     } as mongoose.ConnectOptions);

// //     console.log("✅ Connected to MongoDB Atlas");
// //   } catch (err) {
// //     console.error("❌ MongoDB connection error:", err);
// //     process.exit(1);
// //   }
// // };

// // export default connectDB;

// // import mongoose from "mongoose";

// // const uri = process.env.MONGO_URI;

// // if (!uri) {
// //   throw new Error("❌ MONGO_URI environment variable not defined");
// // }

// // // Serverless connection caching
// // declare global {
// //   var mongooseCache: {
// //     conn: typeof mongoose | null;
// //     promise: Promise<typeof mongoose> | null;
// //   };
// // }

// // const mongooseCache = global.mongooseCache || { conn: null, promise: null };

// // const connectDB = async () => {
// //   // Return cached connection if available
// //   if (mongooseCache.conn) {
// //     return mongooseCache.conn;
// //   }

// //   // Create new connection promise if none exists
// //   if (!mongooseCache.promise) {
// //     mongooseCache.promise = mongoose.connect(uri, {
// //       bufferCommands: false, // Disable Mongoose buffering
// //       serverSelectionTimeoutMS: 5000, // Faster failure in serverless
// //       socketTimeoutMS: 45000, // Close sockets after 45s inactivity
// //       maxIdleTimeMS: 30000, // Close connections after 30s inactivity
// //     } as mongoose.ConnectOptions).then(mongoose => {
// //       console.log("✅ Connected to MongoDB Atlas");
// //       return mongoose;
// //     });
// //   }

// //   try {
// //     // Cache connection after successful resolution
// //     mongooseCache.conn = await mongooseCache.promise;
// //   } catch (err) {
// //     // Reset promise on failure to allow retries
// //     mongooseCache.promise = null;
// //     console.error("❌ MongoDB connection error:", err);
// //     throw new Error("Database connection failed");
// //   }

// //   // Cache in global object for serverless reuse
// //   if (process.env.NODE_ENV !== "production") {
// //     global.mongooseCache = mongooseCache;
// //   }

// //   return mongooseCache.conn;
// // };

// // export default connectDB;

// import mongoose from "mongoose";

// import dotenv from "dotenv";

// dotenv.config(); // ✅ load .env file
// // Serverless connection caching
// declare global {
//   var mongooseCache: {
//     conn: typeof mongoose | null;
//     promise: Promise<typeof mongoose> | null;
//   };
// }

// const mongooseCache = global.mongooseCache || { conn: null, promise: null };

// const connectDB = async () => {
//   // Move environment variable check inside function
//   const uri = "mongodb+srv://akssrf2025:Aks1234@cluster0.vg4zbcx.mongodb.net/LearnFlowDB?retryWrites=true&w=majority&appName=Cluster0";
//   if (!uri) {
//     throw new Error("❌ MONGO_URI environment variable not defined");
//   }

//   // Return cached connection if available
//   if (mongooseCache.conn) {
//     return mongooseCache.conn;
//   }

//   // Create new connection promise if none exists
//   if (!mongooseCache.promise) {
//     mongooseCache.promise = mongoose.connect(uri, {
//       bufferCommands: false,
//       serverSelectionTimeoutMS: 5000,
//       socketTimeoutMS: 45000,
//       maxIdleTimeMS: 30000,
//     } as mongoose.ConnectOptions).then(mongoose => {
//       console.log("✅ Connected to MongoDB Atlas");
//       return mongoose;
//     }).catch(err => {
//       console.error("❌ MongoDB connection error:", err);
//       mongooseCache.promise = null; // Reset on failure
//       throw err;
//     });
//   }

//   try {
//     // Cache connection after successful resolution
//     mongooseCache.conn = await mongooseCache.promise;
//   } catch (err) {
//     // This catch block might be redundant now
//     mongooseCache.promise = null;
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
declare global {
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// Initialize
global.mongooseCache = global.mongooseCache || { conn: null, promise: null };

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  
  if (!uri) {
    throw new Error("❌ MONGO_URI environment variable not defined");
  }

  // Check connection health before returning
  if (global.mongooseCache.conn && global.mongooseCache.conn.connection.readyState === 1) {
    return global.mongooseCache.conn;
  }

  // Create new connection if none exists or previous failed
  if (!global.mongooseCache.promise) {
    global.mongooseCache.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 3000,  // Reduced from 5s
      socketTimeoutMS: 30000,         // Reduced from 45s
      maxIdleTimeMS: 10000,           // Reduced from 30s
      waitQueueTimeoutMS: 3000,       
      heartbeatFrequencyMS: 5000,      
    } as mongoose.ConnectOptions)
    .then(mongoose => {
      console.log("✅ Connected to MongoDB Atlas");
      return mongoose;
    })
    .catch(err => {
      console.error("❌ MongoDB connection error:", err);
      global.mongooseCache.promise = null;
      throw err;
    });
  }

  try {
    global.mongooseCache.conn = await global.mongooseCache.promise;
  } catch (err) {
    global.mongooseCache.promise = null;
    throw new Error("Database connection failed");
  }

  return global.mongooseCache.conn;
};

//connection event listeners
mongoose.connection.on('connected', () => 
  console.log(`Mongoose connected to ${mongoose.connection.db?.databaseName}`)
);

mongoose.connection.on('disconnected', () => 
  console.warn('Mongoose disconnected!')
);

mongoose.connection.on('error', (err) => 
  console.error('Mongoose connection error:', err)
);

export default connectDB;