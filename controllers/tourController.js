const { Op } = require('sequelize');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../db');
const { Tour } = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    const features = new APIFeatures(Tour, req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.execute();
    // Send response
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: { tours }
    });
  } catch (err) {
    res.status(404).json({
      status: 'error',
      message: err.message
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findByPk(id);

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
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { tour: newTour }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findByPk(id);

    if (!tour) {
      return res.status(404).json({
        status: 'fail',
        message: 'Tour not found'
      });
    }

    await tour.update(req.body, { validator: true }); // Set validator to true

    res.status(200).json({
      status: 'success',
      data: { tour }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!'
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await Tour.findByPk(id);

    if (!tour) {
      return res.status(404).json({
        status: 'fail',
        message: 'Tour not found'
      });
    }

    await tour.destroy();

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

exports.getTourStats = async (req, res, next) => {
  try {
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
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};
