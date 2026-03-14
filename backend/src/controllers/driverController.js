const asyncHandler = require('../middleware/asyncHandler');
const Driver = require('../models/Driver');

// @desc   Get all drivers
// @route  GET /api/drivers
exports.getAll = asyncHandler(async (_req, res) => {
    const drivers = await Driver.find().sort({ name: 1 }).lean();
    res.json({ success: true, count: drivers.length, data: drivers });
});

// @desc   Get single driver
// @route  GET /api/drivers/:licenseNumber
exports.getOne = asyncHandler(async (req, res) => {
    const driver = await Driver.findOne({ licenseNumber: req.params.licenseNumber }).lean();
    if (!driver) {
        const err = new Error('Driver not found');
        err.statusCode = 404;
        throw err;
    }
    res.json({ success: true, data: driver });
});

// @desc   Create driver
// @route  POST /api/drivers
exports.create = asyncHandler(async (req, res) => {
    const driver = await Driver.create(req.body);
    res.status(201).json({ success: true, data: driver });
});

// @desc   Update driver
// @route  PUT /api/drivers/:licenseNumber
exports.update = asyncHandler(async (req, res) => {
    const driver = await Driver.findOneAndUpdate(
        { licenseNumber: req.params.licenseNumber },
        req.body,
        { new: true, runValidators: true }
    );
    if (!driver) {
        const err = new Error('Driver not found');
        err.statusCode = 404;
        throw err;
    }
    res.json({ success: true, data: driver });
});

// @desc   Delete driver
// @route  DELETE /api/drivers/:licenseNumber
exports.remove = asyncHandler(async (req, res) => {
    const driver = await Driver.findOneAndDelete({ licenseNumber: req.params.licenseNumber });
    if (!driver) {
        const err = new Error('Driver not found');
        err.statusCode = 404;
        throw err;
    }
    // Also remove driver's documents
    const Document = require('../models/Document');
    await Document.deleteMany({ ownerType: 'Driver', ownerId: req.params.licenseNumber });
    res.json({ success: true, data: {} });
});
