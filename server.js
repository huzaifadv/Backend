// backend/server.js
// Main Express server for Todo API

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const todoRoutes = require('./routes/todoRoutes');

const app = express();

// CORS Configuration - Allow frontend from any origin in production
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Environment Variables with validation
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validate MongoDB URI in production
if (NODE_ENV === 'production' && !MONGO_URI) {
  console.error('❌ ERROR: MONGODB_URI is required in production!');
  process.exit(1);
}

// MongoDB Connection with better error handling
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI || 'mongodb://localhost:27017/todo-app', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected (${NODE_ENV})`);
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    if (NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

connectDB();

// Routes
app.use('/api/todos', todoRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: 'Todo API is running!',
    status: 'active',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
