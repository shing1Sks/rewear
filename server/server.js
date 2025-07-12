import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rewear', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  points: { type: Number, default: 0 },
  badges: [String],
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Item Schema
const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  size: { type: String, required: true },
  category: { type: String, required: true },
  gender: { type: String, enum: ['men', 'women', 'kids'], required: true },
  ageCategory: { type: String, enum: ['adult', 'teen', 'child'], required: true },
  tags: [String],
  images: [String],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'swapped', 'redeemed'], default: 'pending' },
  pointValue: { type: Number, default: 10 },
  createdAt: { type: Date, default: Date.now }
});

const Item = mongoose.model('Item', itemSchema);

// Donation Schema
const donationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  condition: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  ngo: { type: String, required: true },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Donation = mongoose.model('Donation', donationSchema);

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback-secret');
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, points: user.points } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback-secret');
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, points: user.points, isAdmin: user.isAdmin } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Item routes
app.get('/api/items', async (req, res) => {
  try {
    const { category, size } = req.query;
    let filter = { status: 'approved' };
    
    if (category) filter.category = category;
    if (size) filter.size = size;
    
    const items = await Item.find(filter).populate('owner', 'name').sort('-createdAt');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('owner', 'name avatar');
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/items', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, size, category, condition, tags } = req.body;
    const images = req.files.map(file => file.filename);
    
    const item = new Item({
      title,
      description,
      size,
      category,
      condition,
      tags: tags ? tags.split(',') : [],
      images,
      owner: req.user.userId
    });
    
    await item.save();
    
    // Award points for uploading item
    await User.findByIdAndUpdate(req.user.userId, { $inc: { points: 5 } });
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User routes
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    const userItems = await Item.find({ owner: req.user.userId });
    const userDonations = await Donation.find({ donor: req.user.userId });
    
    res.json({ user, items: userItems, donations: userDonations });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Donation routes
app.post('/api/donations', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, condition, category, ngo } = req.body;
    const image = req.file.filename;
    
    const donation = new Donation({
      title,
      condition,
      category,
      ngo,
      image,
      donor: req.user.userId
    });
    
    await donation.save();
    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes
app.get('/api/admin/items', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const pendingItems = await Item.find({ status: 'pending' }).populate('owner', 'name');
    res.json(pendingItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch('/api/admin/items/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { status } = req.body;
    await Item.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: 'Item status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/donations', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const pendingDonations = await Donation.find({ status: 'pending' }).populate('donor', 'name');
    res.json(pendingDonations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch('/api/admin/donations/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { status } = req.body;
    const donation = await Donation.findByIdAndUpdate(req.params.id, { status });
    
    // Award points for approved donation
    if (status === 'approved') {
      await User.findByIdAndUpdate(donation.donor, { $inc: { points: 15 } });
    }
    
    res.json({ message: 'Donation status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create uploads directory
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});