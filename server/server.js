// server/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const commentRoutes = require('./routes/commentRoutes');
const adminRoutes = require('./routes/adminRoutes');
// Load env vars
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Initialize app
const app = express();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Serve static files with proper CORS headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filepath, stat) => {
    // Allow all origins for images (safe for public assets)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}));

// ✅ ADD CORS HERE - BEFORE ROUTES
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://blog-platform-umber-two.vercel.app', // ← Add this
    'https://blog-platform-m7icbwww3-covenant-muriwos-projects.vercel.app' // ← And this
  ],
  credentials: true
}));

// Health check endpoint (for waking up Render)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is awake' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
// Handle nested comment routes under posts
app.use('/api/posts', require('./routes/postRoutes')); // must come first
app.use('/api', require('./routes/likeRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));



// Health check route for Render
app.get('/', (req, res) => {
  res.json({ 
    message: 'Blog Platform API is running',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
});        