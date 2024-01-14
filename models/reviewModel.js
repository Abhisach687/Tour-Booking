const { sequelize, Sequelize } = require('../db');
const { Tour } = require('./tourModel');
const User = require('./userModel');

const Review = sequelize.define(
  'Review',
  {
    review: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    },
    rating: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    createdAt: {
      type: Sequelize.DataTypes.DATE,
      defaultValue: Sequelize.NOW
    },
    tourId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Tour,
        key: 'id'
      }
    },
    userId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id'
      }
    }
  },
  {
    tableName: 'reviews',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'tourId']
      }
    ]
  }
);

User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

Tour.hasMany(Review, { foreignKey: 'tourId' });
Review.belongsTo(Tour, { foreignKey: 'tourId' });

Review.addHook('beforeFind', function(options) {
  options.include = [
    {
      model: User,
      attributes: ['name', 'photo']
    }
  ];
});

Review.addHook('afterCreate', async review => {
  const { tourId } = review;

  const stats = await Review.findAll({
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('Review.id')), 'nRating'],
      [sequelize.fn('AVG', sequelize.col('Review.rating')), 'avgRating']
    ],
    where: {
      tourId: tourId
    },
    raw: true
  });

  if (stats.length > 0) {
    await Tour.update(
      {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating
      },
      {
        where: {
          id: tourId
        }
      }
    );
  } else {
    await Tour.update(
      {
        ratingsQuantity: 0,
        ratingsAverage: 4.5
      },
      {
        where: {
          id: tourId
        }
      }
    );
  }
});

Review.beforeUpdate(async review => {
  review.rev = await Review.findOne({ where: { id: review.id } });
});

Review.afterUpdate(async review => {
  await review.rev.constructor.calcAverageRatings(review.rev.tourId);
});

Review.beforeDestroy(async review => {
  review.rev = await Review.findOne({ where: { id: review.id } });
});

Review.afterDestroy(async review => {
  await review.rev.constructor.calcAverageRatings(review.rev.tourId);
});

Review.sync();

module.exports = Review;
