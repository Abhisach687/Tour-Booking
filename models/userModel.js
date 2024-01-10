const bcrypt = require('bcryptjs');
const { sequelize, Sequelize } = require('../db');

const User = sequelize.define('User', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  photo: {
    type: Sequelize.STRING,
    defaultValue: 'default.jpg'
  },
  role: {
    type: Sequelize.STRING,
    defaultValue: 'user'
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: [8, 100]
    }
  },
  passwordConfirm: {
    type: Sequelize.STRING,
    allowNull: true,
    validate: {
      len: [8, 100],
      isSameAsPassword(value) {
        if (value !== this.password) {
          throw new Error('Password confirmation must match password');
        }
      }
    }
  },
  passwordChangedAt: Sequelize.DATE,
  passwordResetToken: Sequelize.STRING,
  passwordResetExpires: Sequelize.DATE,
  active: {
    type: Sequelize.BOOLEAN,
    defaultValue: true
  }
});

User.beforeCreate(async user => {
  if (!user.changed('password')) return;
  user.password = await bcrypt.hash(user.password, 12);
  user.passwordConfirm = undefined;
});

module.exports = User;
