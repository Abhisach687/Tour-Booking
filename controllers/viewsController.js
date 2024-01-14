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

exports.getTour = async (req, res) => {
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

  console.log(tour); // Add this line

  res.status(200).render('tour', {
    title: 'The Forest Hiker Tour',
    tour
  });
};
