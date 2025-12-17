import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '@/models/User';

dotenv.config({ path: '.env.local' });

const seedUsers = [
  {
    email: 'admin@example.com',
    role: 'admin',
    status: 'active',
    auth0Id: 'mock_admin_id',
  },
  {
    email: 'lead@example.com',
    role: 'lead',
    status: 'active',
    auth0Id: 'mock_lead_id',
  },
  {
    email: 'volunteer@example.com',
    role: 'volunteer',
    status: 'pending',
    auth0Id: 'mock_volunteer_id',
  },
];

const seedDB = async () => {
  try {
    // 1. Connect to MongoDB
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is missing in .env');
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🌱 MongoDB Connected for Seeding');

    // 2. Clear existing users (Optional: Remove this line if you want to keep old data)
    await User.deleteMany({});
    console.log('🧹 Old users removed');

    // 3. Insert new users
    await User.insertMany(seedUsers);
    console.log('✅ 3 Test Users Inserted');

    // 4. Disconnect
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();