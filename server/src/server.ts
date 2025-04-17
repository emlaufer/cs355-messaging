import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import messageRoutes from './routes/messages';
import userRoutes from './routes/users';
import User from './models/User';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || '';

console.log(`Connecting to mongoDB at ${MONGO_URI}`);

// Middleware
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  }),
);
app.use(express.json());

// Routes
app.use(messageRoutes);
app.use(userRoutes);

// Database connection
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as mongoose.ConnectOptions)
  .then(async () => {
    console.log('MongoDB connected successfully');

    // Seed initial users if no users exist
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await seedInitialUsers();
    }
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Function to seed initial users
async function seedInitialUsers() {
  const initialUsers = [
    { name: 'Sarah Johnson', avatar: 'https://i.pravatar.cc/150?img=1', role: 'Designer' },
    { name: 'Michael Chen', avatar: 'https://i.pravatar.cc/150?img=8', role: 'Developer' },
    { name: 'Alex Rivera', avatar: 'https://i.pravatar.cc/150?img=3', role: 'Product Manager' },
    { name: 'Emily Wilson', avatar: 'https://i.pravatar.cc/150?img=5', role: 'Marketing' },
    { name: 'David Kim', avatar: 'https://i.pravatar.cc/150?img=12', role: 'Support' },
    { name: 'Jessica Taylor', avatar: 'https://i.pravatar.cc/150?img=9', role: 'UX Researcher' },
  ];

  try {
    await User.insertMany(initialUsers);
    console.log('Initial users seeded successfully');
  } catch (error) {
    console.error('Error seeding initial users:', error);
  }
}
