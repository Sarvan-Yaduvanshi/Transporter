const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema(
  {
    permitNumber: {
      type: String,
      required: true,
      index: true,
    },
    truckNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Tagged', 'Expired', 'Cancelled'],
      default: 'Tagged',
    },
  },
  { timestamps: true }
);

tagSchema.index({ permitNumber: 1, truckNumber: 1 });

module.exports = mongoose.model('Tag', tagSchema);
