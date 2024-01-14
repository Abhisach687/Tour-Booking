const { Tour } = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
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

  res.status(200).render('tour', {
    title: 'The Forest Hiker Tour',
    tour
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
};
