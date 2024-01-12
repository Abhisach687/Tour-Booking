const slugify = require('slugify');
const { sequelize, Sequelize } = require('../db');
const User = require('./userModel');

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
        },
        is: {
          args: /^[a-zA-Z\s]*$/,
          msg: 'Tour name must only contain characters'
        }
      }
    },
    slug: {
      type: Sequelize.DataTypes.STRING
    },
    ratingsAverage: {
      type: Sequelize.DataTypes.FLOAT,
      validate: {
        min: {
          args: [1],
          msg: 'Rating must be at least 1'
        },
        max: {
          args: [5],
          msg: 'Rating must be no more than 5'
        }
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
      validate: {
        isIn: {
          args: [['easy', 'medium', 'hard']],
          msg: 'Difficulty must be either "easy", "medium", or "hard"'
        }
      }
    },
    priceDiscount: {
      type: Sequelize.DataTypes.FLOAT,
      defaultValue: 0,
      validate: {
        isLowerThanPrice(value) {
          if (value >= this.price) {
            throw new Error('Price discount must be lower than price');
          }
        }
      }
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

const TourGuide = sequelize.define('TourGuide', {}, { timestamps: true });

Tour.belongsToMany(User, { through: TourGuide, as: 'guides' });
User.belongsToMany(Tour, { through: TourGuide, as: 'tours' });

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

module.exports = { Tour, TourGuide };
