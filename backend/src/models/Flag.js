const mongoose = require('mongoose');

const flagSchema = new mongoose.Schema(
  {
    permitNumber: {
      type: String,
      required: true,
      index: true,
    },
    loadId: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Under Review', 'Resolved', 'Escalated', 'Withdrawn'],
      default: 'Under Review',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Flag', flagSchema);
