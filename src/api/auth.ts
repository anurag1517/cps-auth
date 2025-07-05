// import express, { Request, Response } from 'express';
// const router = express.Router();
// import User from "../models/users";

// // POST /api/login
// router.post("/login", async (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     res.status(400).json({ error: "Username and password are required." });
//     return;
//   }

//   try {
//     const user = await User.findOne({ username });

//     if (!user) {
//       res.status(404).json({ error: "User not found." });
//       return;
//     }

//     if (user.password !== password) {
//       res.status(401).json({ error: "Invalid credentials." });
//       return;
//     }

//     // Send user profile (omit password)
//     const { name, email, progress, mastery, recommendations } = user;

//     res.status(200).json({
//       message: "Login successful",
//       user: {
//         username,
//         name,
//         email,
//         progress,
//         mastery,
//         recommendations,
//       },
//     });
//     return;
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ error: "Internal server error." });
//     return;
//   }
// });


// // POST /api/register
// router.post("/register", async (req, res) => {
//   const { name, username, password, email, progress } = req.body;

//   if (!name || !username || !password) {
//     res.status(400).json({ error: "Missing required fields." });
//     return;
//   }

//   try {
//     const existingUser = await User.findOne({ username });
//     if (existingUser) {
//       res.status(409).json({ error: "Username already exists." });
//       return;
//     }

//     const newUser = new User({
//       name,
//       username,
//       password,
//       email,
//       progress,
//       mastery: {},
//       recommendations: [],
//     });

//     await newUser.save();

//     res.status(201).json({ message: "User registered.", user: newUser });
//     return;
//   } catch (err) {
//     console.error("Registration error:", err);
//     res.status(500).json({ error: "Internal server error." });
//     return;
//   }
// });
// router.get("/test", (req, res) => {
//   res.json({ message: "CORS test working!" });
// });

// export default router;
import express, { Request, Response } from 'express';
const router = express.Router();
import bcrypt from 'bcryptjs';
import User from "../models/users";
import mongoose from 'mongoose';
import connectDB from '../config/db';
import EducatorID from "../models/EducatorId"; // import EID model


// router.use((req, res, next) => {
//   const allowedOrigins = [
//     'https://cps2-rust.vercel.app',
//     'https://localhost:5173'
//   ];
  
//   const origin = req.headers.origin || '';
//   if (allowedOrigins.includes(origin)) {
//     res.setHeader('Access-Control-Allow-Origin', origin);
//   }
  
//   res.setHeader('Access-Control-Allow-Credentials', 'true');
//   res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
//   if (req.method === 'OPTIONS') {
//     res.sendStatus(200);
//     return;
//   }
  
//   next();
// });
router.use(async (req, res, next) => {
  try {
    // Establish DB connection
    const db = await connectDB();
    
    // Verify connection state
    if (db.connection.readyState !== 1) {
      console.error('DB connection not ready. State:', db.connection.readyState);
      res.status(503).json({ error: "Database is initializing" });
      return;
    }
    
    next();
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ error: "Database connection failed" });
  }
});
// POST /api/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    console.log("LOGIN attempt - body:", req.body);

    const { username, password } = req.body;

    if (!username || !password) {
      console.warn("Missing username or password");
      res.status(400).json({ error: "Username and password are required." });
      return;
    }
    if (mongoose.connection.readyState !== 1) {
      console.warn('DB connection not ready during login. State:', mongoose.connection.readyState);
      res.status(503).json({ error: "Database is initializing. Please retry." });
      return;
    }
    const user = await User.findOne({ username }).select('+password').lean();
    if (!user) {
      console.warn("User not found:", username);
      res.status(404).json({ error: "User not found." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn("Invalid password for:", username);
      res.status(401).json({ error: "Invalid credentials." });
      return;
    }

    const { password: _, ...userData } = user;
    console.log("Login successful for:", username);

    res.status(200).json({
      message: "Login successful",
      user: userData
    });
    return;
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error." });
    return;
  }
});


// POST /api/register
router.post("/register", async (req: Request, res: Response) => {
  const { name, username,role, password, email, progress, eid } = req.body;

  if (!name || !username || !password) {
    res.status(400).json({ error: "Missing required fields." });
    return;
  }

 

  if (role === "educator") {
    if (!eid || !/^\d{16}$/.test(eid)) {
      res.status(400).json({ error: "Invalid Educator ID." });
      return;
    }

    // Check if EID exists and is unused
    const validEid = await EducatorID.findOne({ eid, used: false });
    if (!validEid) {
      res.status(403).json({ error: "Educator ID is invalid or already used." });
      return;
    }
  }

   if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ error: "Database is initializing. Please retry." });
    return;
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(409).json({ error: "Username already exists." });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      username,
      password: hashedPassword,
      email: email || undefined,
      role,
      progress: progress || {},
      mastery: {},
      recommendations: [],
    });

    await newUser.save();

     if (role === "educator") {
      await EducatorID.updateOne({ eid }, { $set: { used: true } });
    }

    const { password: _, ...userData } = newUser.toObject();
    

    res.status(201).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully.`,
      user: userData,
    });
    return;
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
  return;
});


export default router;
