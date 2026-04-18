const Banner = require('../models/Banner');

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

module.exports = { list, getOne, create, update, remove };
