const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ----------------- REGISTER -----------------
const registerUser = async (req, res) => {
  const { name, email, password, phone } = req.body; // include phone if needed
  console.log({ name, email, password });

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ success: false, message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword, phone });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ----------------- LOGIN -----------------
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ----------------- GET USER PROFILE -----------------
const getUserProfile = async (req, res) => {
  try {
    // req.user.id comes from the JWT middleware
    const user = await User.findById(req.user.id).select('-password'); // exclude password
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { registerUser, loginUser, getUserProfile };
