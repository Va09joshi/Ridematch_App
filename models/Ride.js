const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    seats: { type: String, required: true },
    duration: { type: String, required: true },
    amount: { type: String, required: true },

    // 🗺️ Add this:
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    }
  },
  { timestamps: true }
);

// Index for Geo Queries
rideSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Ride', rideSchema);
