const asyncHandler = require('../middleware/asyncHandler');
const { Tag, Truck, Permit } = require('../models');

const TONNAGE_PER_TRUCK = 25;

// @desc   Get tags for a permit
// @route  GET /api/tags?permitNumber=P-2024-001
exports.getAll = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.permitNumber) filter.permitNumber = req.query.permitNumber;
  const tags = await Tag.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ success: true, count: tags.length, data: tags });
});

// @desc   Create tag (tag a truck to a permit)
// @route  POST /api/tags
exports.create = asyncHandler(async (req, res) => {
  const tag = await Tag.create(req.body);
  // Mark the truck as In-Transit so it drops from the available list
  if (req.body.truckNumber) {
    await Truck.findOneAndUpdate(
      { truckNumber: req.body.truckNumber },
      { status: 'In-Transit' }
    );
  }
  // Reduce remaining tonnage on the permit
  if (req.body.permitNumber) {
    await Permit.findOneAndUpdate(
      { permitNumber: req.body.permitNumber, remainingTonnage: { $gte: TONNAGE_PER_TRUCK } },
      { $inc: { remainingTonnage: -TONNAGE_PER_TRUCK } }
    );
  }
  res.status(201).json({ success: true, data: tag });
});

// @desc   Update tag status
// @route  PUT /api/tags/:id
exports.update = asyncHandler(async (req, res) => {
  const tag = await Tag.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tag) {
    const err = new Error('Tag not found');
    err.statusCode = 404;
    throw err;
  }
  // If tag was cancelled, make the truck available again
  if (req.body.status === 'Cancelled' && tag.truckNumber) {
    // Only restore if no other active tag exists for this truck
    const otherActive = await Tag.findOne({
      truckNumber: tag.truckNumber,
      _id: { $ne: tag._id },
      status: 'Tagged',
    });
    if (!otherActive) {
      await Truck.findOneAndUpdate(
        { truckNumber: tag.truckNumber },
        { status: 'Available' }
      );
    }
    // Restore tonnage on the permit
    if (tag.permitNumber) {
      await Permit.findOneAndUpdate(
        { permitNumber: tag.permitNumber },
        { $inc: { remainingTonnage: TONNAGE_PER_TRUCK } }
      );
    }
  }
  res.json({ success: true, data: tag });
});

// @desc   Delete tag
// @route  DELETE /api/tags/:id
exports.remove = asyncHandler(async (req, res) => {
  const tag = await Tag.findByIdAndDelete(req.params.id);
  if (!tag) {
    const err = new Error('Tag not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, data: {} });
});
