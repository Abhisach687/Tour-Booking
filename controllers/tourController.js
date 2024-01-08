const { Tour } = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.findAll();

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
