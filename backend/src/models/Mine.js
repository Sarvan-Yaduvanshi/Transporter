const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    activeTrucks: { type: Number, default: 0 },
    permitNumber: { type: String, default: '' },
  },
  { _id: true }
);

const mineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    routes: [routeSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Mine', mineSchema);
