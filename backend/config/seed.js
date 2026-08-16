import dotenv from 'dotenv';
import connectDB from './db.js';
import User from '../models/user.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@pramyan.com' });
    if (adminExists) {
      console.log('Admin account already seeded!');
      process.exit(0);
    }

    // Create admin user
    await User.create({
      email: 'admin@pramyan.com',
      password: 'PramyanHRAdmin#2026' // Changed from admin123 to prevent browser warnings
    });

    console.log('Default admin seeded successfully! (admin@pramyan.com / PramyanHRAdmin#2026)');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
