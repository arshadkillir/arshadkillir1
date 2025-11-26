require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authMiddleware = require('./middleware/authMiddleware');
const prisma = require('../../prismaClient');

// Import route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const menuRoutes = require('./routes/menuRoutes');
const outletRoutes = require('./routes/outletRoutes');
const tableRoutes = require('./routes/tableRoutes');
const floorRoutes = require('./routes/floorRoutes');

const app = express();

// 1. Core Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// 2. Authentication and Context Middleware
app.use(authMiddleware());

// 3. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/outlets', outletRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/floors', floorRoutes);

// 4. Global Error Handler (must be the last app.use)
app.use((err, req, res, next) => {
  console.error("Global Error Handler Caught:", err.message);
  res.status(500).json({ error: err.message || "An internal server error occurred." });
});

// 5. Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
});

module.exports = app; // Export for potential testing