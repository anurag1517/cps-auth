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

// Middleware for CORS and JSON parsing
// router.use((req, res, next) => {
//   // Configure allowed origins properly in production!
//   res.setHeader('Access-Control-Allow-Origin', 'https://cps2-rust.vercel.app');
//   res.setHeader("Access-Control-Allow-Credentials", "true");
//   res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
//   // Handle preflight requests
//   if (req.method === 'OPTIONS') {
//     res.sendStatus(200);
//     return;
//   }
  
//   // Only parse JSON for POST requests
//   if (req.method === 'POST') {
//     express.json()(req, res, next);
//   } else {
//     next();
//   }
// });

// POST /api/login
router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required." });
    return;
  }

  try {
    const user = await User.findOne({ username }).select('+password').lean();

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    // Verify password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials." });
      return;
    }

    // Remove password from response
    const { password: _, ...userData } = user;

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
  const { name, username, password, email, progress } = req.body;

  if (!name || !username || !password) {
    res.status(400).json({ error: "Missing required fields." });
    return;
  }

  try {
    // Check for existing user
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(409).json({ error: "Username already exists." });
      return;
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      username,
      password: hashedPassword,
      email: email || undefined,
      progress: progress || {},
      mastery: {},
      recommendations: []
    });

    await newUser.save();

    // Remove password from response
    const { password: _, ...userData } = newUser.toObject();

    res.status(201).json({ 
      message: "User registered.", 
      user: userData 
    });
    return;
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Internal server error." });
    return;
  }
});

// GET /api/test
router.get("/test", (req: Request, res: Response) => {
  res.json({ message: "CORS test working!" });
  return;
});

export default router;