const slugify = require('slugify');
const { sequelize, Sequelize } = require('../db');

const Tour = sequelize.define(
  'Tour',
  {
    name: {
      type: Sequelize.DataTypes.STRING(40),
      allowNull: false,
      unique: true,
      trim: true,
      validate: {
        len: {
          args: [10, 40],
          msg: 'Name must be between 10 and 40 characters'
        }
      }
    },
    slug: {
      type: Sequelize.DataTypes.STRING
    },
    ratingsAverage: {
      type: Sequelize.DataTypes.FLOAT,
      defaultValue: 4.5,
      validate: {
        min: 1,
        max: 6,
        msg: 'Ratings average must be between 1 and 5'
      }
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
      allowNull: false,
      validate: {
        isIn: [['easy', 'medium', 'difficult']],
        msg: 'Difficulty should only be easy, medium, or difficult'
      }
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
    },
    secretTour: {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false
    }
  },

  {
    tableName: 'Tours'
  }
);

Tour.beforeCreate(tour => {
  tour.slug = slugify(tour.name, { lower: true });
});

Tour.beforeFind(options => {
  options.where = {
    ...options.where,
    secretTour: {
      [Sequelize.Op.ne]: true
    }
  };
  options.start = Date.now();
});

module.exports = { Tour };
