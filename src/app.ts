// src/app.ts
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import connectDB from "./config/db";

dotenv.config();

const app = express();

// ✅ CORS middleware — MUST be before routes
app.use(cors({
  origin: "https://cps2-rust.vercel.app",
  credentials: true,
}));

app.use(bodyParser.json());

// ✅ Your routes
app.use("/api", authRoutes);

connectDB();

export default app;
