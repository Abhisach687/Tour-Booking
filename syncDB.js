const { Tour, TourGuide } = require('./models/tourModel');
const User = require('./models/userModel');
const Booking = require('./models/bookingModel');
// Import other models

async function syncModels() {
  await Tour.sync();
  await User.sync();
  // Sync other models that do not have dependencies
  await Booking.sync(); // Booking depends on Tour and User
  // Sync other models that depend on Tour and User
  console.log('Database & tables created!');
}

syncModels().catch(error =>
  console.error('Error creating database tables', error)
);
