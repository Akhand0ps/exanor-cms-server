const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/exanor-blog');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  await connectDB();

  try {
    const adminExists = await User.findOne({ email: 'admin@cybroxide.com' });

    if (adminExists) {
      console.log('Admin user already exists');
      process.exit();
    }

    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@cybroxide.com',
      password: 'password123',
      role: 'SUPER_ADMIN',
      permissions: ['CREATE_POST', 'READ_POST', 'UPDATE_POST', 'DELETE_POST', 'PUBLISH_POST', 'MANAGE_USERS']
    });

    console.log(`Admin user seeded successfully with email: ${admin.email} and password: password123`);
    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
