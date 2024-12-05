const express = require('express');
require('dotenv').config();
const mongoose = require("mongoose");
const session = require('express-session');
const cors = require('cors');
const path = require('path');

// Import routes
const profileRoute = require("./Routes/Profile");
const interRoute = require('./Routes/Interview');
const questRoute = require('./Routes/Question');
const logRouter = require('./Routes/logRoute');

// Middleware imports
const { sessionConfig } = require('./middlewares/session');

const app = express();
 
// Middleware setup
app.use(session(sessionConfig));
app.use(cors({
  origin: ['http://127.0.0.1:3000', 'http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware (optional, for development)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Route setup
app.use("/api/user", profileRoute);
app.use("/api/OGoogle", logRouter);
app.use("/api/inter", interRoute);
app.use("/api/questions", questRoute);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Database and server connection
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/Bprep";

async function main() {
  try {
    // MongoDB connection
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");

    // Server startup
    const PORT = process.env.PORT || 3003;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

// Handle unhandled Promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Start the server
main();