const { Op } = require('sequelize');
const { Tour } = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    // Build query
    // 1A) Filtering
    let queryObject = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObject[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `\$${match}`);
    queryObject = JSON.parse(queryStr);

    // Sequelize uses symbols for operators

    const operatorsAliases = {
      $gt: Op.gt,
      $gte: Op.gte,
      $lt: Op.lt,
      $lte: Op.lte
    };

    // Replace string operators with Sequelize operator symbols
    Object.keys(queryObject).forEach(key => {
      if (queryObject[key] && typeof queryObject[key] === 'object') {
        Object.keys(queryObject[key]).forEach(operator => {
          if (operatorsAliases[operator]) {
            queryObject[key][operatorsAliases[operator]] =
              queryObject[key][operator];
            delete queryObject[key][operator];
          }
        });
      }
    });

    // 2) Sorting
    let order;
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').map(field => {
        let direction = 'ASC';
        if (field[0] === '-') {
          direction = 'DESC';
          field = field.substring(1);
        }
        return [field, direction];
      });
      order = sortBy;
    } else {
      order = [['createdAt', 'DESC']];
    }

    // 3) Field limiting
    // Get all fields from the model
    const modelAttributes = Object.keys(Tour.tableAttributes);

    // Field limiting
    let attributes;
    if (req.query.fields) {
      const fields = req.query.fields.split(',').map(field => field.trim());
      const includedFields = fields.filter(field => !field.startsWith('-'));
      const excludedFieldsLim = fields
        .filter(field => field.startsWith('-'))
        .map(field => field.substring(1));

      if (includedFields.length) {
        // If there are included fields, only select those
        attributes = includedFields;
      } else {
        // If there are excluded fields, start with all fields and remove the excluded ones
        attributes = modelAttributes.filter(
          field => !excludedFieldsLim.includes(field)
        );
      }
    } else {
      // If no fields parameter is provided, select all fields
      attributes = modelAttributes;
    }

    // 4) Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const offset = (page - 1) * limit;

    if (req.query.page) {
      const numTours = await Tour.count();
      if (offset >= numTours) {
        throw new Error('This page does not exist');
      }
    }

    const query = Tour.findAll({
      where: queryObject,
      order: order,
      attributes: attributes, // Apply field limiting
      limit: limit,
      offset: offset
    });
    // Execute query
    const tours = await query;

    // Send response
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: { tours }
    });
  } catch (err) {
    res.status(404).json({
      status: 'error',
      message: err
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

    await tour.update(req.body);

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
