// server.js

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');

// Create Express app
const app = express();
app.use(express.json());
app.use(cors());
// Serve static files (HTML, JS, CSS)
// Correct folder path
app.use(express.static('Project-Final222/Project'));

app.get('*', (req, res) => {
  res.sendFile(__dirname + '/Project-Final222/Project/Homepage.html');
});



// MongoDB connection
mongoose.connect('mongodb+srv://s202177910:Jh8fqzKEmGkA0frd@samra.9k24g4e.mongodb.net/?retryWrites=true&w=majority&appName=Samra', {
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




// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
