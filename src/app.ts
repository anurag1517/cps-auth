// src/app.ts
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import connectDB from "./config/db";

dotenv.config();

const app = express();
const PORT = 5000;
app.use(cors({
  origin:[
    "https://cps2-rust.vercel.app",
    "http://localhost:5173", // for local development
  ],
  credentials: true,
}));

app.use(bodyParser.json());

app.use("/api", authRoutes);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
connectDB();
export default app;
