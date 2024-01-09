const { sequelize, Sequelize } = require('../db');
const slugify = require('slugify');

const Tour = sequelize.define(
  'Tour',
  {
    name: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true,
      trim: true
    },
    slug: {
      type: Sequelize.DataTypes.STRING
    },
    ratingsAverage: {
      type: Sequelize.DataTypes.FLOAT,
      defaultValue: 4.5
    },
    ratingsQuantity: {
      type: Sequelize.DataTypes.FLOAT,
      defaultValue: 0
    },
    price: {
      type: Sequelize.DataTypes.FLOAT,
      allowNull: false
    },
    duration: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    },
    maxGroupSize: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    },
    difficulty: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    },
    priceDiscount: {
      type: Sequelize.DataTypes.FLOAT,
      defaultValue: 0
    },
    summary: {
      type: Sequelize.DataTypes.STRING,
      trim: true
    },
    description: {
      type: Sequelize.DataTypes.TEXT, // Changed data type to TEXT
      trim: true
    },
    imageCover: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    },
    images: {
      type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.STRING)
    },
    createdAt: {
      type: Sequelize.DataTypes.DATE,
      defaultValue: Sequelize.DataTypes.NOW
    },
    startDates: {
      type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.DATE)
    },
    durationWeeks: {
      type: Sequelize.VIRTUAL,
      get() {
        return this.getDataValue('duration') / 7;
      }
    }
  },

  {
    tableName: 'Tours'
  }
);

Tour.beforeCreate(tour => {
  tour.slug = slugify(tour.name, { lower: true });
});

module.exports = { Tour };
