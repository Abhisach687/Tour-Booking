const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.findAll();

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews }
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.tourId) req.body.tourId = req.params.tourId;
  if (!req.body.userId) req.body.userId = req.user.id;
  const { review, rating } = req.body;

  const newReview = await Review.create({
    review,
    rating,
    tourId: req.body.tourId,
    userId: req.body.userId
  });

  res.status(201).json({
    status: 'success',
    data: { review: newReview }
  });
});
