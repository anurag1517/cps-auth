// src/app.ts
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import connectDB from "./config/db";

dotenv.config();

const app = express();

app.use(cors({
  origin: "https://cps2-rust.vercel.app",
  credentials: true,
}));

app.use(bodyParser.json());

app.use("/api", authRoutes);

connectDB();

export default app;
