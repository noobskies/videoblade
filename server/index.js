// server/index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { clerkMiddleware } from './config/clerk.js';
import { requireAuth } from './middleware/auth.js';
import connectDB from './config/database.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware);

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Protected route example
app.get('/api/protected', requireAuth, (req, res) => {
  res.json({ message: 'This is a protected route', userId: req.auth.userId });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});