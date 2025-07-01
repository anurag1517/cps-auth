// src/app.ts

import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import connectDB from "./config/db";
import cors from 'cors';
import authRoutes from './routes/auth';
import path from "path";

//dotenv.config({ path: path.join(__dirname, "../../.env") });
dotenv.config();

const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: [
      "https://cps2-rust.vercel.app", // your deployed frontend
    ],
    credentials: true,
  })
);

app.use(bodyParser.json());


app.use('/api', authRoutes);

connectDB(); // before app.listen
app.listen(PORT, () => {
  console.log(`Server running`);
});

export default app;
