const { Op } = require('sequelize');
const { Tour } = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const Booking = require('./../models/bookingModel');
const AppError = require('./../utils/appError');
const Review = require('./../models/reviewModel');
const User = require('./../models/userModel');

exports.getOverview = catchAsync(async (req, res) => {
  // 1) Get tour data from collection
  const tours = await Tour.findAll();
  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({
    where: { slug: req.params.slug },
    include: [
      {
        model: Review,
        include: [{ model: User, attributes: ['name', 'photo'] }]
      },
      { model: User, as: 'guides' }
    ]
  });

  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  res.status(200).render('tour', {
    title: 'The Forest Hiker Tour',
    tour
  });
});

exports.getSingupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'create your account!'
  });
};

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.getMyTours = catchAsync(async (req, res) => {
  //Find all bookings
  const bookings = await Booking.findAll({
    where: { userId: req.user.id },
    include: [{ model: Tour, as: 'Tour' }] // assuming 'Tour' is the alias you used in your associations
  });
  //Find tours with the returned IDs
  const tourIDs = bookings.map(el => el.Tour.id);
  if (!Array.isArray(tourIDs)) {
    throw new Error('tourIDs is not an array');
  }

  const tours = await Tour.findAll({
    where: {
      id: {
        [Op.in]: tourIDs
      }
    }
  });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
});
