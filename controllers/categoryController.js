const Category = require('../models/Category');
const cloudinary = require('../config/cloudinary');

const list = async (req, res, next) => {
  try {
    const { isActive, parent, nested } = req.query;
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (parent === 'null') filter.parent = null;
    else if (parent) filter.parent = parent;

    const data = await Category.find(filter).populate('parent', 'name slug').sort({ sortOrder: 1, 'name.en': 1 });

    // When nested=true, return top-level categories with subcategories embedded
    if (nested === 'true') {
      const topLevel = data.filter((c) => !c.parent);
      const result = topLevel.map((cat) => ({
        ...cat.toObject(),
        children: data.filter((c) => c.parent && String(c.parent._id || c.parent) === String(cat._id)),
      }));
      return res.json({ success: true, data: result });
    }

    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const cat = await Category.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }] }).populate('parent', 'name slug');
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: cat });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json({ success: true, data: cat });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: cat });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image file provided' });
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });

    // Delete old image from Cloudinary if it has a public ID stored
    if (cat.imagePublicId) {
      try { await cloudinary.uploader.destroy(cat.imagePublicId); } catch (_) {}
    }

    cat.image = req.file.path;
    cat.imagePublicId = req.file.filename;
    await cat.save();
    res.json({ success: true, imageUrl: cat.image, data: cat });
  } catch (err) { next(err); }
};

module.exports = { list, getOne, create, update, remove, uploadImage };
