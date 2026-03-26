import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

import http from 'http';
import { Server } from 'socket.io';

app.use(cors());
app.use(express.json());

import authRoutes from './routes/authRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/ratings', ratingRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running normally' });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('new_food_added', (foodData) => {
    // In a full implementation, you'd calculate distance to each online user
    // Here we'll just broadcast to everyone for the hackathon simplicity,
    // or emit a global 'food_alert' that clients filter by distance locally.
    socket.broadcast.emit('food_alert', foodData);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});
