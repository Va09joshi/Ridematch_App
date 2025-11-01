const Ride = require('../models/Ride');

// 🟢 Create ride
const createRide = async (req, res) => {
  try {
    const { from, to, seats, duration, amount, latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Location required' });
    }

    const ride = new Ride({
      user: req.user.id,
      from,
      to,
      seats,
      duration,
      amount,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    });

    await ride.save();
    res.status(201).json({ success: true, message: 'Ride published', ride });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 🟢 Get all rides
const getRides = async (req, res) => {
  try {
    const rides = await Ride.find().sort({ createdAt: -1 });
    res.json({ success: true, rides });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 🟢 Get nearby rides
const getNearbyRides = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude required' });
    }

    const distance = radius ? parseFloat(radius) : 10; // default 10 km

    const rides = await Ride.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: distance * 1000,
        },
      },
    }).populate('user');

    res.json({ success: true, count: rides.length, rides });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 🟢 Export all three
module.exports = { createRide, getRides, getNearbyRides };
