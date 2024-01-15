const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const Tour = require('./tourModel');
const User = require('./userModel');

const Booking = sequelize.define(
  'Booking',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tourId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Tour, // reference to the model
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User, // reference to the model
        key: 'id'
      }
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    paid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    tableName: 'bookings',
    timestamps: false
  }
);

// Use sequelize.models.modelName to reference the models
Booking.belongsTo(sequelize.models.Tour, { foreignKey: 'tourId' });
Booking.belongsTo(sequelize.models.User, { foreignKey: 'userId' });

module.exports = Booking;
