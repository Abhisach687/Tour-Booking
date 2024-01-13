const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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
