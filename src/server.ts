import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import authRouter from './api/auth';

const app = express();
const port = 5000;

// ✅ CORS configuration
const allowedOrigins = ["https://cps2-rust.vercel.app", "http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // ✅ required if frontend uses withCredentials
  })
);

// ✅ Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to MongoDB
connectDB().catch(err => {
  console.error("❌ Database connection failed", err);
  process.exit(1);
});

// ✅ Mount your auth routes
app.use('/api', authRouter);

// ✅ Start only in local
// if (process.env.NODE_ENV !== 'production') {
//   app.listen(port, () => {
//     console.log(`🚀 Auth service running at http://localhost:${port}`);
//   });
// }

export default app;
