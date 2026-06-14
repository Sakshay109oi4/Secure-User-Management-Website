require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { ROLES } = require('../config/constants');

const seedAdmin = async () => {
  const uri = process.env.MONGODB_URI;
  const email = process.env.ADMIN_EMAIL || 'admin@secureapp.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@Secure123!';
  const name = process.env.ADMIN_NAME || 'System Administrator';

  if (!uri) {
    console.error('MONGODB_URI is required. Set it in your .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB for admin seeding...');

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log(`Admin user already exists: ${email}`);
      process.exit(0);
    }

    await User.create({
      name,
      email,
      password,
      role: ROLES.ADMIN,
    });

    console.log('Admin user created successfully!');
    console.log(`Email: ${email}`);
    console.log('Password: (value from ADMIN_PASSWORD in .env)');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
