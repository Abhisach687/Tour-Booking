const multer = require('multer');
const sharp = require('sharp');
const { Op } = require('sequelize');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../db');
const { Tour, TourGuide } = require('../models/tourModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  // Test if uploaded file is an image
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Images
  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);

exports.getTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tour = await Tour.findByPk(id, {
    include: [
      {
        model: User,
        as: 'guides',
        through: TourGuide,
        attributes: {
          exclude: [
            'password',
            'passwordChangedAt',
            'passwordConfirm',
            'passwordResetToken',
            'passwordResetExpires'
          ]
        }
      }
    ]
  });

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Tour not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: { tour }
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const newTour = await Tour.create(
      {
        ...req.body,
        secretTour: false
      },
      {
        transaction,
        returning: true
      }
    );

    const guidePromises = req.body.guides.map(guideId =>
      TourGuide.create(
        {
          UserId: guideId,
          TourId: newTour.id
        },
        { transaction }
      )
    );

    const newTourGuides = await Promise.all(guidePromises);

    await transaction.commit();

    res.status(201).json({
      status: 'success',
      data: { tour: newTour, tourGuides: newTourGuides }
    });
  } catch (error) {
    await transaction.rollback();

    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
});

exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.findAll({
    attributes: [
      [sequelize.literal('UPPER(difficulty)'), 'difficulty'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'numTours'],
      [sequelize.fn('SUM', sequelize.col('ratingsQuantity')), 'numRatings'],
      [sequelize.fn('AVG', sequelize.col('ratingsAverage')), 'avgRating'],
      [sequelize.fn('AVG', sequelize.col('price')), 'avgPrice'],
      [sequelize.fn('MIN', sequelize.col('price')), 'minPrice'],
      [sequelize.fn('MAX', sequelize.col('price')), 'maxPrice']
    ],
    where: {
      ratingsAverage: { [Op.gte]: 4.5 },
      secretTour: false
    },
    group: [sequelize.literal('UPPER(difficulty)')],
    order: [[sequelize.col('avgPrice'), 'ASC']]
  });

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const plan = await sequelize.query(
    `
    SELECT EXTRACT(MONTH FROM "startDates") AS "month", COUNT("id") AS "numTourStarts", SUM("price") AS "totalRevenue", ARRAY_AGG("name") AS "tourNames"
    FROM (
      SELECT unnest("startDates") AS "startDates", "id", "price", "name"
      FROM "Tours"
      WHERE "secretTour" = false
    ) AS "unnestedTours"
    WHERE EXTRACT(YEAR FROM "startDates") = :year
    GROUP BY "month"
    ORDER BY "month" ASC
    `,
    {
      replacements: { year: req.params.year },
      type: QueryTypes.SELECT
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});
