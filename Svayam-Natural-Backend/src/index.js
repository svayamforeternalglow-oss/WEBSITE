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

// Dynamic CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL?.replace('https://', 'https://www.'),
  process.env.FRONTEND_URL?.replace('https://www.', 'https://'),
  'http://localhost:3000',
  'http://localhost:3001',
  'https://checkout.razorpay.com'
].filter(Boolean).map(url => url.replace(/\/$/, ''));

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.indexOf(origin + '/') !== -1) {
      callback(null, true);
    } else {
      callback(null, new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
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
