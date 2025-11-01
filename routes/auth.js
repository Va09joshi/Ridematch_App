const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
const auth = require('../middleware/authmiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

// NEW: Get logged-in user profile
router.get('/me', auth, getUserProfile);

module.exports = router;
