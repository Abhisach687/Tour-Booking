const { sequelize, Sequelize } = require('../db');

const Tour = sequelize.define('Tour', {
  name: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  rating: {
    type: Sequelize.DataTypes.FLOAT,
    defaultValue: 4.5
  },
  price: {
    type: Sequelize.DataTypes.FLOAT,
    allowNull: false
  }
});

module.exports = { Tour };
