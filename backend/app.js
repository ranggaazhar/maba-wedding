require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDatabase = require('./config/db');
const apiRoutes = require('./routes/api');
const path = require('path');

const app = express();

// ⚠️ PENTING: Helmet harus dikonfigurasi dengan benar untuk uploads
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // ✅ Tambahkan ini
  contentSecurityPolicy: false // Atau konfigurasi sesuai kebutuhan
}));

const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',') 
  : ['http://localhost:5173', 'http://localhost:3000'];

// ✅ FIX: Pindahkan /uploads SEBELUM middleware CORS dan helmet yang lain
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filepath) => {
    // Set CORS headers langsung di sini
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Set cache headers untuk performa
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    if (Object.keys(req.body || {}).length > 0) {
      console.log('Body:', req.body);
    }
    next();
  });
}

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Wedding Decoration API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      uploads: '/uploads',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile (protected)',
        updateProfile: 'PUT /api/auth/profile (protected)',
        changePassword: 'POST /api/auth/change-password (protected)',
        logout: 'POST /api/auth/logout (protected)',
        verify: 'GET /api/auth/verify (protected)'
      }
    }
  });
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts, please try again after 15 minutes.'
    });
  }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.'
    });
  }
});

app.use('/api/auth/login', loginLimiter);
app.use('/api', generalLimiter);
app.use('/api', apiRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method,
    hint: 'Check available endpoints at GET /'
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy: Origin not allowed'
    });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors
    });
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack
    })
  });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDatabase();
    const server = app.listen(PORT, () => {
      console.log('='.repeat(60));
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Allowed Origins: ${allowedOrigins.join(', ')}`);
      console.log(`📝 API Base: http://localhost:${PORT}/api`);
      console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
      console.log(`📚 Docs: http://localhost:${PORT}/`);
      console.log(`❤️  Health: http://localhost:${PORT}/health`);
      console.log('='.repeat(60));
      if (process.env.NODE_ENV === 'development') {
        console.log('\n📋 Available Auth Routes:');
        console.log('  POST   /api/auth/register');
        console.log('  POST   /api/auth/login');
        console.log('  GET    /api/auth/profile (🔒)');
        console.log('  PUT    /api/auth/profile (🔒)');
        console.log('  POST   /api/auth/change-password (🔒)');
        console.log('  POST   /api/auth/logout (🔒)');
        console.log('  GET    /api/auth/verify (🔒)');
        console.log('\n🔒 = Requires authentication\n');
      }
    });
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received, shutting down gracefully...`);
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });

      setTimeout(() => {
        console.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;