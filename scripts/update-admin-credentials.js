const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');

// Load env vars
dotenv.config();

const updateAdminCredentials = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    let admin = await User.findOne({ role: 'ADMIN' });

    if (admin) {
      admin.email = 'akhandps0@gmail.com';
      admin.password = '123456';
      admin.requiresPasswordChange = false;
      await admin.save();
      console.log('Admin credentials successfully updated!');
      console.log(`Email: ${admin.email}`);
    } else {
      admin = new User({
        name: 'Akhand',
        email: 'akhandps0@gmail.com',
        password: '123456',
        role: 'ADMIN',
        permissions: ['CREATE_POST', 'READ_POST', 'UPDATE_POST', 'DELETE_POST', 'PUBLISH_POST', 'MANAGE_USERS'],
        requiresPasswordChange: false
      });
      await admin.save();
      console.log('Admin user created successfully!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error updating admin:', error);
    process.exit(1);
  }
};

updateAdminCredentials();
