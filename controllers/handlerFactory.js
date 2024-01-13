const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = model =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await model.findByPk(id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    await doc.destroy();

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne = model =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await model.findByPk(id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    await doc.update(req.body, { validator: true });

    res.status(200).json({
      status: 'success',
      data: { doc }
    });
  });

exports.createOne = model =>
  catchAsync(async (req, res, next) => {
    const doc = await model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { doc }
    });
  });

exports.getOne = (model, options) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await model.findByPk(id, options);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { doc }
    });
  });

exports.getAll = model =>
  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(model, req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const doc = await features.execute();
    // Send response
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: { doc }
    });
  });
