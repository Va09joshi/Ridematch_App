const express = require('express');
const router = express.Router();
const auth = require('../middleware/authmiddleware');

const {
  createRide,
  getRides,
  getNearbyRides,
  getUserRides,
  requestRide,
  respondToRequest,
  getUserRequests,
} = require('../controllers/rideController');

// ✅ Create a new ride (Driver)
router.post('/', auth, createRide);

// ✅ Get all rides
router.get('/', getRides);

// ✅ Get nearby rides
router.get('/nearby', getNearbyRides);

// ✅ Get rides created by a specific user
router.get('/user/:userId', getUserRides);

// ✅ Request a ride (User wants to join)
router.post('/:rideId/request', auth, requestRide);

// ✅ Accept or Reject a ride request (Driver)
router.patch('/:rideId/respond', auth, respondToRequest);

// ✅ Get all ride requests made by a user
router.get('/requests/:userId', auth, getUserRequests);

module.exports = router;
