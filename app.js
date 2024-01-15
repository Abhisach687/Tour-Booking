const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [
        "'self'",
        'data:',
        'https://www.google-analytics.com',
        'http://127.0.0.1:3000',
        'https://cdnjs.cloudflare.com'
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://www.google-analytics.com',
        'https://cdnjs.cloudflare.com',
        'https://js.stripe.com/v3/'
      ],
      scriptSrcElem: [
        "'self'",
        "'unsafe-inline'",
        'https://www.google-analytics.com',
        'https://cdnjs.cloudflare.com',
        'https://js.stripe.com/v3/'
      ],
      frameSrc: ["'self'", 'https://js.stripe.com']
      // other directives...
    }
  })
);

app.use(
  cors({
    origin: 'http://localhost:3000', // replace with your client's origin
    credentials: true
  })
);
// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  // 100 requests from the same IP in 1 hour
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against XSS
// Clean user input from malicious HTML code
app.use(xss());

// Prevent parameter pollution
// Remove duplicate query parameters
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use((req, res, next) => {
  // middleware
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
