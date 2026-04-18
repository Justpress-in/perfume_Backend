const Category = require('../models/Category');

const list = async (req, res, next) => {
  try {
    const { isActive, parent } = req.query;
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (parent === 'null') filter.parent = null;
    else if (parent) filter.parent = parent;
    const data = await Category.find(filter).populate('parent', 'name slug').sort({ sortOrder: 1, 'name.en': 1 });
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

module.exports = { list, getOne, create, update, remove };
