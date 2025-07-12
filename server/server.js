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
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  phone: String,
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

// Swap Request Schema
const swapRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestedItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  offeredItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'courier_selected', 'items_shipped', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  message: String,
  courierService: {
    name: String,
    cost: Number,
    estimatedDelivery: String,
    trackingId: String
  },
  shippingDetails: {
    requesterAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    ownerAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SwapRequest = mongoose.model('SwapRequest', swapRequestSchema);

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

// Courier services data
const courierServices = [
  { name: 'BlueDart', baseCost: 50, costPerKm: 2, estimatedDays: '2-3' },
  { name: 'DTDC', baseCost: 40, costPerKm: 1.5, estimatedDays: '3-4' },
  { name: 'FedEx', baseCost: 80, costPerKm: 3, estimatedDays: '1-2' },
  { name: 'India Post', baseCost: 25, costPerKm: 1, estimatedDays: '5-7' },
  { name: 'Delhivery', baseCost: 45, costPerKm: 1.8, estimatedDays: '2-4' }
];

// Helper function to calculate distance (mock implementation)
const calculateDistance = (addr1, addr2) => {
  // In real implementation, you would use Google Maps API or similar
  return Math.floor(Math.random() * 50) + 10; // Random distance between 10-60 km
};

// Helper function to calculate courier costs
const calculateCourierCosts = (distance) => {
  return courierServices.map(service => ({
    ...service,
    totalCost: service.baseCost + (distance * service.costPerKm),
    distance: distance
  }));
};

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
    const { title, description, size, category, gender, ageCategory, tags } = req.body;
    const images = req.files.map(file => file.filename);
    
    const item = new Item({
      title,
      description,
      size,
      category,
      gender,
      ageCategory,
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

// Swap Request routes
app.post('/api/swaps/request', authenticateToken, async (req, res) => {
  try {
    const { requestedItemId, offeredItemId, message } = req.body;
    
    // Validate items exist and are available
    const requestedItem = await Item.findById(requestedItemId);
    const offeredItem = await Item.findById(offeredItemId);
    
    if (!requestedItem || !offeredItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (requestedItem.status !== 'approved' || offeredItem.status !== 'approved') {
      return res.status(400).json({ message: 'Items must be approved for swapping' });
    }
    
    if (offeredItem.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only offer your own items' });
    }
    
    // Check if swap request already exists
    const existingRequest = await SwapRequest.findOne({
      requester: req.user.userId,
      requestedItem: requestedItemId,
      offeredItem: offeredItemId,
      status: { $in: ['pending', 'accepted', 'courier_selected', 'items_shipped'] }
    });
    
    if (existingRequest) {
      return res.status(400).json({ message: 'Swap request already exists' });
    }
    
    const swapRequest = new SwapRequest({
      requester: req.user.userId,
      requestedItem: requestedItemId,
      offeredItem: offeredItemId,
      message
    });
    
    await swapRequest.save();
    
    const populatedRequest = await SwapRequest.findById(swapRequest._id)
      .populate('requester', 'name email')
      .populate('requestedItem', 'title images')
      .populate('offeredItem', 'title images');
    
    res.json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/swaps/received', authenticateToken, async (req, res) => {
  try {
    const userItems = await Item.find({ owner: req.user.userId });
    const itemIds = userItems.map(item => item._id);
    
    const swapRequests = await SwapRequest.find({
      requestedItem: { $in: itemIds }
    })
    .populate('requester', 'name email')
    .populate('requestedItem', 'title images')
    .populate('offeredItem', 'title images')
    .sort('-createdAt');
    
    res.json(swapRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/swaps/sent', authenticateToken, async (req, res) => {
  try {
    const swapRequests = await SwapRequest.find({ requester: req.user.userId })
      .populate('requestedItem', 'title images owner')
      .populate('offeredItem', 'title images')
      .sort('-createdAt');
    
    res.json(swapRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch('/api/swaps/:id/respond', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const swapRequest = await SwapRequest.findById(req.params.id)
      .populate('requestedItem')
      .populate('offeredItem');
    
    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }
    
    // Only item owner can respond
    if (swapRequest.requestedItem.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    swapRequest.status = status;
    swapRequest.updatedAt = new Date();
    await swapRequest.save();
    
    res.json(swapRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/swaps/:id/courier-options', authenticateToken, async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id)
      .populate('requester', 'address')
      .populate('requestedItem', 'owner')
      .populate({ path: 'requestedItem', populate: { path: 'owner', select: 'address' } });
    
    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }
    
    // Mock addresses if not provided
    const requesterAddr = swapRequest.requester.address || {
      city: 'Bhubaneswar',
      state: 'Odisha',
      zipCode: '751001'
    };
    
    const ownerAddr = swapRequest.requestedItem.owner.address || {
      city: 'Cuttack',
      state: 'Odisha',
      zipCode: '753001'
    };
    
    const distance = calculateDistance(requesterAddr, ownerAddr);
    const courierOptions = calculateCourierCosts(distance);
    
    res.json({
      distance,
      courierOptions,
      addresses: {
        requester: requesterAddr,
        owner: ownerAddr
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch('/api/swaps/:id/select-courier', authenticateToken, async (req, res) => {
  try {
    const { courierService, shippingDetails } = req.body;
    
    const swapRequest = await SwapRequest.findById(req.params.id);
    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }
    
    swapRequest.courierService = courierService;
    swapRequest.shippingDetails = shippingDetails;
    swapRequest.status = 'courier_selected';
    swapRequest.updatedAt = new Date();
    
    await swapRequest.save();
    
    res.json(swapRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch('/api/swaps/:id/ship', authenticateToken, async (req, res) => {
  try {
    const { trackingId } = req.body;
    
    const swapRequest = await SwapRequest.findById(req.params.id);
    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }
    
    swapRequest.courierService.trackingId = trackingId;
    swapRequest.status = 'items_shipped';
    swapRequest.updatedAt = new Date();
    
    await swapRequest.save();
    
    res.json(swapRequest);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch('/api/swaps/:id/complete', authenticateToken, async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.id);
    if (!swapRequest) {
      return res.status(404).json({ message: 'Swap request not found' });
    }
    
    // Mark items as swapped
    await Item.findByIdAndUpdate(swapRequest.requestedItem, { status: 'swapped' });
    await Item.findByIdAndUpdate(swapRequest.offeredItem, { status: 'swapped' });
    
    swapRequest.status = 'completed';
    swapRequest.updatedAt = new Date();
    await swapRequest.save();
    
    // Award points to both users
    await User.findByIdAndUpdate(swapRequest.requester, { $inc: { points: 10 } });
    await User.findByIdAndUpdate(swapRequest.requestedItem.owner, { $inc: { points: 10 } });
    
    res.json(swapRequest);
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

app.patch('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, phone, address },
      { new: true }
    ).select('-password');
    
    res.json(user);
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

app.get('/api/admin/swaps', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const swapRequests = await SwapRequest.find({})
      .populate('requester', 'name email')
      .populate('requestedItem', 'title owner')
      .populate('offeredItem', 'title')
      .populate({ path: 'requestedItem', populate: { path: 'owner', select: 'name email' } })
      .sort('-createdAt');
    
    res.json(swapRequests);
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