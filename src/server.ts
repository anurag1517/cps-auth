import express from 'express';
import connectDB from './config/db';
import authRouter from './api/auth';

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB().catch(err => {
  console.error("❌ Database connection failed", err);
  process.exit(1);
});

// Routes
app.use('/api', authRouter);

// Start server only in local development
// if (process.env.NODE_ENV !== 'production') {
//   app.listen(port, () => {
//     console.log(`🚀 Auth service running at http://localhost:${port}`);
//   });
// }

export default app;