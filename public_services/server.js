import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import listingsRouter, { seedListings } from './routes/listings.js';

// Load env variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for demo
    methods: ['GET', 'POST', 'PUT']
  }
});

// Pass socketio reference to express app
app.set('socketio', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded crop images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api', listingsRouter);

// Socket.io Events
io.on('connection', (socket) => {
  console.log('Client connected to real-time feed:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://agri:krishi@cluster0.qkki81l.mongodb.net/farmshield_marketplace?retryWrites=true&w=majority';
const PORT = process.env.PORT || 5050;

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected successfully for FarmShield Marketplace');
    
    // Seed sample crop listings
    await seedListings();

    // Start server
    server.listen(PORT, () => {
      console.log(`FarmShield Marketplace Server running on port ${PORT}`);
      console.log(`Real-time feed ready via Socket.io`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Serve frontend build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
  });
}
