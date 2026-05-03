const Store = require('../models/Store');
const cloudinary = require('../config/cloudinary');

const list = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    const stores = await Store.find(filter).sort({ sortOrder: 1, createdAt: 1 });
    res.json({ success: true, data: stores });
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const store = await Store.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }] });
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });
    res.json({ success: true, data: store });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const store = await Store.create(req.body);
    res.status(201).json({ success: true, data: store });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });
    res.json({ success: true, data: store });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });
    res.json({ success: true, message: 'Store deleted' });
  } catch (err) { next(err); }
};

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image file provided' });
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ success: false, message: 'Store not found' });

    if (store.imagePublicId) {
      try { await cloudinary.uploader.destroy(store.imagePublicId); } catch (_) {}
    }

    store.image = req.file.path;
    store.imagePublicId = req.file.filename;
    await store.save();
    res.json({ success: true, imageUrl: store.image, data: store });
  } catch (err) { next(err); }
};

module.exports = { list, getOne, create, update, uploadImage, remove };
