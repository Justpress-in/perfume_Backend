require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// ── Routes ────────────────────────────────────────────────────
const authRoutes         = require('./routes/auth');
const userRoutes         = require('./routes/users');
const adminRoutes        = require('./routes/admins');
const productRoutes      = require('./routes/products');
const orderRoutes        = require('./routes/orders');
const blogRoutes         = require('./routes/blog');
const analyticsRoutes    = require('./routes/analytics');
const storeRoutes        = require('./routes/stores');
const testimonialRoutes  = require('./routes/testimonials');
const categoryRoutes     = require('./routes/categories');
const offerRoutes        = require('./routes/offers');
const bannerRoutes       = require('./routes/banners');
const contactRoutes      = require('./routes/contact');
const newsletterRoutes   = require('./routes/newsletter');
const wholesaleRoutes    = require('./routes/wholesale');
const couponRoutes       = require('./routes/coupons');
const reviewRoutes       = require('./routes/reviews');
const settingsRoutes     = require('./routes/settings');
const uploadRoutes       = require('./routes/uploads');

const app = express();

// ── Security & Middleware ─────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000', // Admin panel
    'http://localhost:5173',
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Rate Limiting ─────────────────────────────────────────────
const globalLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts.' },
});
app.use('/api', globalLimit);
app.use('/api/auth/login', authLimit);
app.use('/api/users/login', authLimit);

// ── Static Uploads (legacy local files, if any) ───────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);        // Admin auth
app.use('/api/users',        userRoutes);        // Website user auth & profile
app.use('/api/admins',       adminRoutes);       // Admin management (superadmin)
app.use('/api/products',     productRoutes);
app.use('/api/orders',       orderRoutes);
app.use('/api/blog',         blogRoutes);
app.use('/api/analytics',    analyticsRoutes);
app.use('/api/stores',       storeRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/categories',   categoryRoutes);
app.use('/api/offers',       offerRoutes);
app.use('/api/banners',      bannerRoutes);
app.use('/api/contact',      contactRoutes);
app.use('/api/newsletter',   newsletterRoutes);
app.use('/api/wholesale',    wholesaleRoutes);
app.use('/api/coupons',      couponRoutes);
app.use('/api/reviews',      reviewRoutes);
app.use('/api/settings',     settingsRoutes);
app.use('/api/uploads',      uploadRoutes);

// ── Health Check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Oud Al-Anood API is running',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── 404 Handler ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ──────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
  });
};

start();
