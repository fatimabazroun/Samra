// server.js
require('dotenv').config();
const multer = require('multer');
const express = require('express');
const mongoose = require('mongoose');
const Story = require('./models/Story');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());



// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Multer — upload images into public/images so the frontend can reference them
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'public', 'images')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({ storage });

app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: '❌ No image uploaded.' });
  res.status(200).json({ message: '✅ Image uploaded!', imageUrl: `/images/${req.file.filename}` });
});

// SPA fallback — serve index.html for any unknown route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch((error) => console.error('❌ MongoDB connection error:', error));

// User Schema (Creator and Admin)
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['creator', 'admin'], default: 'creator' } // default 'creator'
});

const User = mongoose.model('User', userSchema);

// Signup API (CREATOR only)
app.post('/signup', async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: '❌ Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'creator' // 🌟 Always "creator" when signing up
    });

    await newUser.save();
    res.status(201).json({ message: '✅ Account created successfully!' });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: '❌ Server error during signup.' });
  }
});

// Login API (BOTH Creator and Admin)
// API: Login (for both Creator and Admin)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    // ❌ If no user OR password is wrong -> same message
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: '❌ Invalid email or password.' });
    }

    // ✅ Success
    const verificationCode = '1234';

    res.status(200).json({
      message: '✅ Login successful! Enter verification code.',
      fullName: user.fullName,
      role: user.role,
      verificationCode: verificationCode
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: '❌ Server error during login.' });
  }
});

// Check if email exists and belongs to a creator
app.post('/forgot-password/check-email', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: '❌ Email not found.' });
    }

    if (user.role !== 'creator') {
      return res.status(403).json({ message: '❌ Only creators can reset password.' });
    }

    res.status(200).json({ message: '✅ Email found!' });
  } catch (error) {
    console.error('Check Email Error:', error);
    res.status(500).json({ message: '❌ Server error.' });
  }
});


// Reset password
app.post('/forgot-password/reset', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: '❌ Email not found.' });
    }

    if (user.role !== 'creator') {
      return res.status(403).json({ message: '❌ Admins are not allowed to reset password here.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne(
      { email: email.toLowerCase() },
      { $set: { password: hashedPassword } }
    );

    res.status(200).json({ message: '✅ Password reset successfully!' });

  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: '❌ Server error.' });
  }
});

// Create a new story
app.post('/stories', async (req, res) => {
  try {
    const newStory = new Story(req.body);
    await newStory.save();
    res.status(201).json(newStory);
  } catch (err) {
    res.status(500).json({ message: '❌ Failed to create story.' });
  }
});

// Get all stories
app.get('/stories', async (req, res) => {
  try {
    const stories = await Story.find();
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: '❌ Failed to fetch stories.' });
  }
});


const storyRoutes = require('./routes/stories');
app.use('/stories', storyRoutes);

// Story Schema
const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  featuredImage: { type: String },
  author: { 
    name: { type: String, required: true },
    title: { type: String },
    avatar: { type: String }
  },
  publisher: { name: { type: String } },
  genre: { type: String },
  region: { type: String },
  wordCount: { type: Number },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

//const Story = mongoose.model('Story', storySchema);

// Comment Schema
const commentSchema = new mongoose.Schema({
  storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', commentSchema);

// Follow Schema
const followSchema = new mongoose.Schema({
  followerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const Follow = mongoose.model('Follow', followSchema);

// Get Story API
app.get('/api/stories/:id', async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    // Increment view count
    story.views += 1;
    await story.save();
    
    res.status(200).json(story);
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Comments API
app.get('/api/comments/:storyId', async (req, res) => {
  try {
    const comments = await Comment.find({ storyId: req.params.storyId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add Comment API
app.post('/api/comments', async (req, res) => {
  try {
    const { storyId, content, userName } = req.body;
    
    if (!storyId || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const newComment = new Comment({
      storyId,
      content,
      userName: userName || 'Anonymous'
    });
    
    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle Like API
app.post('/api/likes/toggle', async (req, res) => {
  try {
    const { storyId, userId } = req.body;
    
    if (!storyId) {
      return res.status(400).json({ message: 'Missing storyId' });
    }
    
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    // Check if user already liked
    const userIndex = story.likedBy.indexOf(userId);
    if (userIndex === -1) {
      // Add like
      story.likes += 1;
      story.likedBy.push(userId);
    } else {
      // Remove like
      story.likes -= 1;
      story.likedBy.splice(userIndex, 1);
    }
    
    await story.save();
    res.status(200).json({ newCount: story.likes });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle Follow API
app.post('/api/follow/toggle', async (req, res) => {
  try {
    const { followerId, authorId } = req.body;
    
    if (!followerId || !authorId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if follow relationship exists
    const existingFollow = await Follow.findOne({ followerId, authorId });
    
    if (existingFollow) {
      // Unfollow
      await Follow.deleteOne({ _id: existingFollow._id });
      res.status(200).json({ isFollowing: false });
    } else {
      // Follow
      const newFollow = new Follow({ followerId, authorId });
      await newFollow.save();
      res.status(200).json({ isFollowing: true });
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check Follow Status API
app.get('/api/follow/status', async (req, res) => {
  try {
    const { followerId, authorId } = req.query;
    
    if (!followerId || !authorId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const existingFollow = await Follow.findOne({ followerId, authorId });
    res.status(200).json({ isFollowing: !!existingFollow });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Creator Profile Schema
const creatorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fullName: { type: String, required: true },
  bio: { type: String },
  region: { type: String },
  specialty: { type: String },
  interests: [String],
  profileImage: { type: String },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followerCount: { type: Number, default: 0 }
});

const Creator = mongoose.model('Creator', creatorSchema);

// Activity Log Schema
const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // "like", "comment", "follow"
  targetType: { type: String }, // "story", "creator"
  targetId: { type: mongoose.Schema.Types.ObjectId }, // ID of story/creator
  createdAt: { type: Date, default: Date.now }
});

const Activity = mongoose.model('Activity', activitySchema);

// Get Creator Profile
app.get('/api/creators/:id', async (req, res) => {
  try {
    const creator = await Creator.findOne({ userId: req.params.id })
      .populate('userId', 'email role');

    if (!creator) {
      return res.status(404).json({ message: 'Creator not found' });
    }

    // Get creator's stories
    const stories = await Story.find({ 'author.id': creator.userId });

    // Get recent activity
    const activities = await Activity.find({ userId: creator.userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      profile: creator,
      stories,
      activities
    });

  } catch (error) {
    console.error('Error fetching creator profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Creator Profile
app.put('/api/creators/:id', async (req, res) => {
  try {
    const { bio, interests, specialty } = req.body;

    const updatedCreator = await Creator.findOneAndUpdate(
      { userId: req.params.id },
      { $set: { bio, interests, specialty } },
      { new: true }
    );

    res.status(200).json(updatedCreator);
  } catch (error) {
    console.error('Error updating creator profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Creator's Stories
app.get('/api/creators/:id/stories', async (req, res) => {
  try {
    const stories = await Story.find({ 'author.id': req.params.id });
    res.status(200).json(stories);
  } catch (error) {
    console.error('Error fetching creator stories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow/Unfollow Creator
app.post('/api/creators/:id/follow', async (req, res) => {
  try {
    const creator = await Creator.findOne({ userId: req.params.id });
    if (!creator) {
      return res.status(404).json({ message: 'Creator not found' });
    }

    const { followerId } = req.body;
    const isFollowing = creator.followers.includes(followerId);

    if (isFollowing) {
      // Unfollow
      await Creator.updateOne(
        { userId: req.params.id },
        { 
          $pull: { followers: followerId },
          $inc: { followerCount: -1 } 
        }
      );
    } else {
      // Follow
      await Creator.updateOne(
        { userId: req.params.id },
        { 
          $addToSet: { followers: followerId },
          $inc: { followerCount: 1 } 
        }
      );

      // Log activity
      const activity = new Activity({
        userId: followerId,
        action: 'follow',
        targetType: 'creator',
        targetId: req.params.id
      });
      await activity.save();
    }

    res.status(200).json({ 
      isFollowing: !isFollowing,
      followerCount: isFollowing ? creator.followerCount - 1 : creator.followerCount + 1
    });

  } catch (error) {
    console.error('Error toggling follow:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check Follow Status
app.get('/api/creators/:id/follow-status', async (req, res) => {
  try {
    const { followerId } = req.query;
    const creator = await Creator.findOne({ 
      userId: req.params.id,
      followers: followerId 
    });

    res.status(200).json({ isFollowing: !!creator });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
