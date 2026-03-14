const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
        },
        licenseNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        licenseExpiry: {
            type: String,
            default: '',
        },
        assignedTruck: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['Active', 'On Leave', 'Suspended', 'Inactive'],
            default: 'Active',
        },
        address: {
            type: String,
            default: '',
        },
        emergencyContact: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Driver', driverSchema);
