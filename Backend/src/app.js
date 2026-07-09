const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

// Import routes
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const brandRoutes = require('./routes/brand.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const enquiryRoutes = require('./routes/enquiry.routes');
const userRoutes = require('./routes/user.routes');
const uploadRoutes = require('./routes/upload.routes');
const newsRoutes = require('./routes/news.routes');
const blogRoutes = require('./routes/blog.routes');

// Initialize app
const app = express();

// Set security HTTP headers (disabled crossOriginResourcePolicy to allow frontend/admin image loading)
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

// Enable CORS with credential support (no wildcard origins allowed when credentials: true)
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',') 
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow internal/server-to-server requests (like Postman or mobile requests with no origin)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsers & Compression
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set static folders
app.use('/uploads', express.static(uploadsDir));

// Mount routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/blogs', blogRoutes);

// Fallback for API route not found (404)
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Global error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Format errors array if message is the only info
  const errors = process.env.NODE_ENV === 'development' 
    ? [err.message, err.stack] 
    : [err.message];

  res.status(statusCode).json({
    success: false,
    message: err.message || 'An internal server error occurred',
    data: null,
    errors: errors
  });
});

module.exports = app;
