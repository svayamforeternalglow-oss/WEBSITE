import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import startCronJobs from './utils/cronJobs.js';

// Load env vars
dotenv.config();

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
const missingRequiredEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingRequiredEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingRequiredEnvVars.join(', ')}`);
}

if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
  console.warn('[Startup] RAZORPAY_WEBHOOK_SECRET is missing. Razorpay webhook events will be rejected.');
}

// Connect to database
connectDB();

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // API doesn't need CSP, and it can interfere with some gateways
}));

const corsBaseOptions = {
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Idempotency-Key'],
};

const normalizeOrigin = (value) => value.replace(/\/$/, '').toLowerCase();

const parseOriginCsv = (value) => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map(normalizeOrigin);
};

// Temporary diagnostics toggle: set CORS_OPEN=true to allow all origins.
const isCorsOpenMode = process.env.CORS_OPEN === 'true';

if (isCorsOpenMode) {
  console.warn('[CORS] OPEN mode enabled. All origins are temporarily allowed.');
  app.use(cors({
    ...corsBaseOptions,
    origin: true,
  }));
} else {
  // Dynamic CORS configuration
  const staticAllowedOrigins = [
    process.env.FRONTEND_URL,
    'https://www.svayamnatural.com',
    'https://svayamnatural.com',
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  const configuredOrigins = parseOriginCsv(process.env.FRONTEND_ORIGINS);

  const allowedOrigins = [
    ...configuredOrigins,
    ...staticAllowedOrigins.filter(Boolean).map(normalizeOrigin),
  ].filter((origin, index, all) => all.indexOf(origin) === index);

  console.log('[CORS] Allowed origins:', allowedOrigins);

  app.use(cors({
    ...corsBaseOptions,
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const normalizedOrigin = normalizeOrigin(origin);

      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
      } else {
        console.log('[CORS] Blocked origin:', {
          origin,
          normalizedOrigin,
        });
        callback(new Error('Not allowed by CORS'));
      }
    },
  }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  skip: (req) => req.method === 'OPTIONS',
});
app.use('/api', limiter);

// Body parser (with rawBody support for Razorpay webhooks)
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import shippingRoutes from './routes/shippingRoutes.js';
import taxonomyRoutes from './routes/taxonomyRoutes.js';
import siteConfigRoutes from './routes/siteConfigRoutes.js';

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/shipping', shippingRoutes);
app.use('/api/v1/taxonomy', taxonomyRoutes);
app.use('/api/v1/site-config', siteConfigRoutes);

app.get('/', (req, res) => {
  res.send('Svayam-Natural API is running...');
});

const PORT = process.env.PORT || 5000;

// Start background cron jobs
startCronJobs();

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
