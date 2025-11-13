const Ride = require('../models/Ride');

// ✅ Create Ride
exports.createRide = async (req, res) => {
  try {
    const {
      driverId,
      from,
      to,
      date,
      time,
      availableSeats,
      amount,
      carDetails,
      location,
    } = req.body;

    const ride = new Ride({
      driverId,
      from,
      to,
      date,
      time,
      availableSeats,
      amount,
      carDetails,
      location,
    });

    await ride.save();
    res.status(201).json({ message: 'Ride created successfully', ride });
  } catch (error) {
    console.error('Error creating ride:', error);
    res.status(500).json({ error: 'Failed to create ride', details: error.message });
  }
};

// ✅ Get All Rides
exports.getRides = async (req, res) => {
  try {
    const rides = await Ride.find().populate('driverId', 'name email');
    res.status(200).json({ success: true, rides });
  } catch (error) {
    console.error('Error fetching rides:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// ✅ Get Nearby Rides (based on coordinates)
exports.getNearbyRides = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({ success: false, message: 'Longitude and latitude are required' });
    }

    const rides = await Ride.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: parseFloat(maxDistance),
        },
      },
    });

    res.status(200).json({ success: true, rides });
  } catch (error) {
    console.error('Error fetching nearby rides:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// ✅ Get Rides Created by a Specific User
exports.getUserRides = async (req, res) => {
  try {
    const { userId } = req.params;

    const rides = await Ride.find({ driverId: userId })
      .sort({ createdAt: -1 })
      .populate('driverId', 'name email');

    res.status(200).json({
      success: true,
      count: rides.length,
      rides,
    });
  } catch (error) {
    console.error("Error fetching user's rides:", error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

exports.requestRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { userId } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    // Check if already requested
    const existing = ride.requests.find(r => r.userId.toString() === userId);
    if (existing) return res.status(400).json({ success: false, message: 'Already requested' });

    ride.requests.push({ userId, status: 'pending' });
    await ride.save();

    res.status(200).json({ success: true, message: 'Ride request sent', ride });
  } catch (error) {
    console.error('Error requesting ride:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// ✅ Respond to Ride Request (Accept/Reject)
exports.respondToRequest = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { userId, status } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ success: false, message: 'Ride not found' });

    const request = ride.requests.find(r => r.userId.toString() === userId);
    if (!request) return res.status(400).json({ success: false, message: 'Request not found' });

    request.status = status;
    await ride.save();

    res.status(200).json({ success: true, message: `Ride ${status} successfully`, ride });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// ✅ Get User's Ride Requests
exports.getUserRequests = async (req, res) => {
  try {
    const { userId } = req.params;
    const rides = await Ride.find({ "requests.userId": userId })
      .populate('driverId', 'name email')
      .populate('requests.userId', 'name email');

    res.status(200).json({ success: true, rides });
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};