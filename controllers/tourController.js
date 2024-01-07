const { Tour } = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.findAll();

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: { tours }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
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
    console.error(err); // Log the error
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!'
    });
  }
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { tour: '<Updated tour here...>' }
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null
  });
};
