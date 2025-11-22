const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/authcontroller');
const auth = require('../middleware/authmiddleware');
const User = require('../models/user'); // ✅ Make sure this is added

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', auth, getUserProfile);

// ✅ Get all users (for chat receiver list)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '_id name email phone');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
