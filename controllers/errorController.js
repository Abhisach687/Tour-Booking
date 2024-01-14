const AppError = require('../utils/appError');

const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack // Error stack trace
    });
  }
  // RENDERED WEBSITE
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};

const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  const handleJwtError = () =>
    new AppError('Invalid token. Please log in again!', 401);

  const handleJwtExpiredError = () =>
    new AppError('Your token has expired! Please log in again.', 401);

  if (process.env.NODE_ENV === 'development') {
    // This is the default value
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'SequelizeValidationError') {
      err.message = err.errors.map(el => el.message).join('. ');
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
      err.message = err.errors.map(el => el.message).join('. ');
    }
    if (err.name === 'JsonWebTokenError') {
      err = handleJwtError();
    }
    if (err.name === 'TokenExpiredError') {
      err = handleJwtExpiredError();
    }
    sendErrorProd(err, req, res);
  }
};
