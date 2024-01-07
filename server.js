const dotenv = require('dotenv');
const sequelize = require('./db');

dotenv.config({ path: './config.env' });

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection successful!');
  })
  .catch(error => {
    console.error('Unable to connect to the database:', error);
  });

const app = require('./app');

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
