import express from 'express';
import connectDB from './config/db';
import authRouter from './api/auth';
import cors from 'cors';
const app = express();
const port = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:5173",  // for local dev
      "https://cps2-rust.vercel.app", // your deployed frontend
    ],
    credentials: true,
  })
);
// Database connection
connectDB().catch(err => {
  console.error("❌ Database connection failed", err);
  process.exit(1);
});

// Routes
app.use('/api', authRouter);

//Start server only in local development
  app.listen(port, () => {
    console.log(`🚀 Auth service running at http://localhost:${port}`);
  });

export default app;