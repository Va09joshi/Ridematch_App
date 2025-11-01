const express = require('express');
const router = express.Router();
const { createRide, getRides, getNearbyRides } = require('../controllers/rideController');
const auth = require('../middleware/authmiddleware');

//  Create new ride
router.post('/', auth, createRide);

//  Get all rides
router.get('/', getRides);

//  Get nearby rides
router.get('/nearby', getNearbyRides);

module.exports = router;
