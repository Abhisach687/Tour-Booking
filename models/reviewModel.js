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
    timestamps: false
  }
);

User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

Tour.hasMany(Review, { foreignKey: 'tourId' });
Review.belongsTo(Tour, { foreignKey: 'tourId' });

Review.sync();

module.exports = Review;
