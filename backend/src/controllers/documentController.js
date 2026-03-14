const asyncHandler = require('../middleware/asyncHandler');
const Document = require('../models/Document');

// @desc   Get documents (optionally filter by ownerType and ownerId)
// @route  GET /api/documents?ownerType=Driver&ownerId=DL12345678
exports.getAll = asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.ownerType) filter.ownerType = req.query.ownerType;
    if (req.query.ownerId) filter.ownerId = req.query.ownerId;
    const docs = await Document.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: docs.length, data: docs });
});

// @desc   Get single document
// @route  GET /api/documents/:id
exports.getOne = asyncHandler(async (req, res) => {
    const doc = await Document.findById(req.params.id).lean();
    if (!doc) {
        const err = new Error('Document not found');
        err.statusCode = 404;
        throw err;
    }
    res.json({ success: true, data: doc });
});

// @desc   Create document
// @route  POST /api/documents
exports.create = asyncHandler(async (req, res) => {
    const doc = await Document.create(req.body);
    res.status(201).json({ success: true, data: doc });
});

// @desc   Update document
// @route  PUT /api/documents/:id
exports.update = asyncHandler(async (req, res) => {
    const doc = await Document.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!doc) {
        const err = new Error('Document not found');
        err.statusCode = 404;
        throw err;
    }
    res.json({ success: true, data: doc });
});

// @desc   Delete document
// @route  DELETE /api/documents/:id
exports.remove = asyncHandler(async (req, res) => {
    const doc = await Document.findByIdAndDelete(req.params.id);
    if (!doc) {
        const err = new Error('Document not found');
        err.statusCode = 404;
        throw err;
    }
    res.json({ success: true, data: {} });
});
