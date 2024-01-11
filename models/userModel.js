const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { sequelize, Sequelize } = require('../db');

const User = sequelize.define(
  'User',
  {
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
      defaultValue: 'user',
      validate: {
        isIn: [['user', 'admin', 'guide', 'lead-guide']]
      }
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
  },
  {
    defaultScope: {
      attributes: { exclude: ['password', 'passwordConfirm'] }
    }
  }
);

User.prototype.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.beforeCreate(async user => {
  if (!user.changed('password')) return;
  user.password = await bcrypt.hash(user.password, 12);
  user.passwordConfirm = undefined;

  // Set passwordChangedAt to the current date and time if it's not set
  if (!user.passwordChangedAt) {
    user.passwordChangedAt = new Date();
  }
});

User.prototype.changePassword = async function(newPassword) {
  // Hash the new password and save it
  this.password = await bcrypt.hash(newPassword, 12);

  // Set passwordChangedAt to the current date and time
  this.passwordChangedAt = new Date();

  // Save the user
  await this.save();
};

User.prototype.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed
  return false;
};

User.prototype.createPasswordResetToken = function() {
  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash the token and save it
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set the expiration date to 10 minutes from now
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // Return the unhashed token
  return resetToken;
};

module.exports = User;
