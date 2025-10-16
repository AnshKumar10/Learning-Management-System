import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
// import mongoSanitize from 'express-mongo-sanitize';
import { errorHandler } from '@middlewares/error.middleware';
import userRoute from '@routes/user.route';
import mediaRoute from '@routes/media.route';
import courseRoute from '@routes/course.route';
import purchaseRoute from '@routes/coursePurchase.route';
import courseProgressRoute from '@routes/courseProgress.route';
import razorpayRoute from '@routes/razorpay.routes';
import healthRoute from '@routes/health.routes';
import connectDB from '@configs/database.config';
import { env } from '@configs/env.config';

// Connect to database
await connectDB();

const app = express();
const PORT = env.PORT || 8000;

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Security Middleware
app.use(helmet()); // Set security HTTP headers
// app.use(mongoSanitize()); // Data sanitization against NoSQL query injection
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use('/api', limiter); // Apply rate limiting to all routes

// Logging Middleware
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body Parser Middleware
app.use(express.json({ limit: '10kb' })); // Body limit is 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// CORS Configuration
app.use(
  cors({
    origin: env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'device-remember-token',
      'Access-Control-Allow-Origin',
      'Origin',
      'Accept'
    ]
  })
);

// API Routes
app.use('/api/v1/media', mediaRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/course', courseRoute);
app.use('/api/v1/purchase', purchaseRoute);
app.use('/api/v1/progress', courseProgressRoute);
app.use('/api/v1/razorpay', razorpayRoute);
app.use('/health', healthRoute);

// Global Error Handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${env.NODE_ENV} mode`);
});
