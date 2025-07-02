import express, { Request, Response } from 'express';
import cors from 'cors';
import connectDB from './config/db';
import authRouter from './api/auth';

const app = express();

// CORS setup
const allowedOrigins = ['https://cps2-rust.vercel.app', 'http://localhost:5173'];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connect
connectDB().catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Routes
app.use('/api', authRouter);

// Export the Express app for Vercel
export default app;
