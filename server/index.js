import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
import authRoutes from './routes/authRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';

app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/ratings', ratingRoutes);

// Health route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running normally' });
});

// Create server + socket
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // change in production
    methods: ['GET', 'POST']
  }
});

// 🔥 Attach io to all requests

// 🔥 SOCKET LOGIC (CLEAN)
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // ✅ Store userId + location
  socket.on('join', ({ userId, latitude, longitude }) => {
    socket.join(userId);

    socket.data.userId = userId;
    socket.data.location = {
      latitude,
      longitude
    };

    console.log(`User ${userId} joined with location`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
  });