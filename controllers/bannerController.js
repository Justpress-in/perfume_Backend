const Banner = require('../models/Banner');
const cloudinary = require('../config/cloudinary');

const list = async (req, res, next) => {
  try {
    const { section, isActive } = req.query;
    const filter = {};
    if (section) filter.section = section;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    const data = await Banner.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const b = await Banner.findById(req.params.id);
    if (!b) return res.status(404).json({ success: false, message: 'Banner not found' });
    res.json({ success: true, data: b });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const b = await Banner.create(req.body);
    res.status(201).json({ success: true, data: b });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const b = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!b) return res.status(404).json({ success: false, message: 'Banner not found' });
    res.json({ success: true, data: b });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const b = await Banner.findByIdAndDelete(req.params.id);
    if (!b) return res.status(404).json({ success: false, message: 'Banner not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

// POST /api/banners/:id/image  (field: "image" for desktop, "mobileImage" for mobile)
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image file provided' });
    const { slot } = req.query; // 'desktop' | 'mobile'
    const b = await Banner.findById(req.params.id);
    if (!b) return res.status(404).json({ success: false, message: 'Banner not found' });

    if (slot === 'mobile') {
      if (b.mobileImagePublicId) {
        try { await cloudinary.uploader.destroy(b.mobileImagePublicId); } catch (_) {}
      }
      b.mobileImage = req.file.path;
      b.mobileImagePublicId = req.file.filename;
    } else {
      if (b.imagePublicId) {
        try { await cloudinary.uploader.destroy(b.imagePublicId); } catch (_) {}
      }
      b.image = req.file.path;
      b.imagePublicId = req.file.filename;
    }

    await b.save();
    res.json({ success: true, imageUrl: slot === 'mobile' ? b.mobileImage : b.image, data: b });
  } catch (err) { next(err); }
};

module.exports = { list, getOne, create, update, uploadImage, remove };
