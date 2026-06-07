require('dotenv').config();
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not defined.');
  process.exit(1);
}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

// Import routes
const apiRoutes = require('./routes/api');

const app = express();
app.set('trust proxy', 1); // Essential for rate limiting behind reverse proxies (Render/Heroku)
const PORT = process.env.PORT || 5000;

// Enhanced Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// Prevent parameter pollution
app.use((req, res, next) => {
  if (req.query && Object.keys(req.query).length > 50) {
    return res.status(400).json({ error: 'Bad Request', message: 'Too many query parameters' });
  }
  next();
});

const allowedOrigins = [
  'http://localhost:5173',
  'https://extensio-ai.netlify.app',
  'https://extensio-ai.vercel.app'
];

if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL.split(',').forEach(url => {
    const trimmed = url.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Check if origin is in the allowed list or if any allowed origin is wildcard '*'
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    } else {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again in a minute.' }
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'operational',
    service: 'Extensio.ai Launch Engine',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use('/api', apiRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found', message: 'The requested endpoint does not exist.' });
});

app.use((err, _req, res, _next) => {
  console.error('[System Error]:', err.stack || err.message);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal Server Error' : 'Request Error',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred.'
      : err.message
  });
});

const MONGO_URI = process.env.MONGO_URI;

// Global Temp Workspace Path (Uses OS temp for Vercel/Render compatibility)
const tempPath = path.join(os.tmpdir(), 'extensio_workspaces');
fs.ensureDirSync(tempPath);
console.log(`✓ Temporary workspace path prepared at: ${tempPath}`);

async function startServer() {
  try {
    if (!MONGO_URI) {
      console.error('FATAL ERROR: MONGO_URI environment variable is not defined.');
      process.exit(1);
    }
    await mongoose.connect(MONGO_URI);

    await fs.emptyDir(tempPath); // Clean only on full server restart
    console.log('✓ Temporary workspaces initialized and cleaned');

    console.log('✓ Connected to MongoDB');
  } catch (err) {
    console.error('FATAL ERROR: MongoDB connection failed.');
    console.error(`Reason: ${err.message}`);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`✓ Extensio.ai API listening on port ${PORT}`);
  });
}

// Start the server if run directly
if (require.main === module) {
  startServer();
} else {
  // If imported as a serverless function, ensure mongoose connects
  if (MONGO_URI) {
    mongoose.connect(MONGO_URI).catch(err => {
      console.error('⚠ Serverless MongoDB connection failed:', err.message);
    });
  }
}

module.exports = app;
