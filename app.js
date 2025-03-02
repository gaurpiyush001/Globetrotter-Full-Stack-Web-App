import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });
import path from 'path'; // Built-in core module, used to manipulate path names
import { fileURLToPath } from 'url'; // Needed to replace __dirname in ES modules
import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit'; // Prevents DOS and Brute-force attacks
import helmet from 'helmet'; // Security HTTP headers
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
// import hpp from 'hpp';
import cookieParser from 'cookie-parser';

import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';
import userRouter from './routes/userRoutes.js';
import userResponseRouter from './routes/userResponseRoutes.js';
import questionRouter from './routes/questionRoutes.js';
import gameRouter from './routes/gameRoutes.js';
import destinationRouter from './routes/destinationRoutes.js';

// Replace __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); // Express instance

// 1) GLOBAL MIDDLEWARES


import cors from "cors";

app.use(cors({
  origin: process.env.FRONTEND_URL, // Allow frontend origin
  credentials: true, // Allow cookies/session storage
}));

// Serving Static Files
app.use(express.static(path.join(__dirname, 'public'))); // Serve static assets

// Setting Security HTTP Headers
app.use(helmet()); // Returns a middleware function

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Request Rate Limiting
const limiter = rateLimit({
  max: 100, // 100 requests per IP
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour'
});
app.use('/api', limiter);

// Body Parser: Read data from request body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser()); // Parse cookies

// Data Sanitization
app.use(mongoSanitize()); // Prevent NoSQL query injection
app.use(xss()); // Prevent XSS attacks

// Custom Middleware to Add Request Time
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/users', userRouter);
app.use('/api/v1/questions', questionRouter);
app.use('/api/v1/user-responses', userResponseRouter);
app.use('/api/v1/game', gameRouter);
app.use('/api/v1/destination', destinationRouter);

// Handle Unmatched Routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
