const fs = require('fs');
const { Sequelize } = require('sequelize');

require('dotenv').config({ path: './config.env' });
const { Tour } = require('./../../models/tourModel'); // Import the Tour model
const Review = require('./../../models/reviewModel'); // Import the Review model
const User = require('./../../models/userModel'); // Import the User model

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres'
  }
);

sequelize
  .sync({ alter: true })
  .then(() => console.log('Database & tables created!'));

module.exports = { sequelize, Sequelize };

// Read JSON file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
// Import data into database
const importData = async () => {
  try {
    await Tour.bulkCreate(tours); // Insert data into the Tour table
    await User.bulkCreate(users, { validate: false }); // Insert data into the User table
    await Review.bulkCreate(reviews); // Insert data into the Review table
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Delete all data from database
const deleteData = async () => {
  try {
    await Tour.destroy({ truncate: { cascade: true } }); // Delete all data from the Tour table
    await User.destroy({ truncate: { cascade: true } }); // Delete all data from the User table
    await Review.destroy({ truncate: { cascade: true } }); // Delete all data from the Review table
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
