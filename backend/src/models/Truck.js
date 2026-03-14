const mongoose = require('mongoose');

const truckSchema = new mongoose.Schema(
  {
    truckNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    availabilityWindow: {
      type: String,
      default: '',
    },
    owner: {
      type: String,
      default: '',
    },
    driver: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Available', 'In-Transit', 'Loading', 'Maintenance', 'Idle'],
      default: 'Available',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Truck', truckSchema);
