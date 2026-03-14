const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
    {
        // Links to either a driver (via licenseNumber) or a truck (via truckNumber)
        ownerType: {
            type: String,
            enum: ['Driver', 'Truck'],
            required: true,
        },
        ownerId: {
            type: String,
            required: true,
            index: true,
        },
        docType: {
            type: String,
            required: true,
            trim: true,
        },
        docNumber: {
            type: String,
            default: '',
            trim: true,
        },
        issueDate: {
            type: String,
            default: '',
        },
        expiryDate: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['Valid', 'Expired', 'Pending', 'Rejected'],
            default: 'Valid',
        },
        notes: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

documentSchema.index({ ownerType: 1, ownerId: 1 });

module.exports = mongoose.model('Document', documentSchema);
