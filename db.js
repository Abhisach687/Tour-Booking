const { Sequelize } = require('sequelize');
require('dotenv').config({ path: './config.env' });

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

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥');
  console.log(err.name, err.message);
});

module.exports = { sequelize, Sequelize };
