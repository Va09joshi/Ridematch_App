const express = require('express');
const router = express.Router();
const { bookRide } = require('../controllers/bookingcontroller');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, bookRide);

module.exports = router;
