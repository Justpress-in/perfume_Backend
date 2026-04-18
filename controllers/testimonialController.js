const Testimonial = require('../models/Testimonial');

const list = async (req, res, next) => {
  try {
    const { isPublished } = req.query;
    const filter = {};
    if (isPublished !== undefined) filter.isPublished = isPublished === 'true';
    const data = await Testimonial.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const t = await Testimonial.findById(req.params.id);
    if (!t) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    res.json({ success: true, data: t });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const t = await Testimonial.create(req.body);
    res.status(201).json({ success: true, data: t });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const t = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!t) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    res.json({ success: true, data: t });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const t = await Testimonial.findByIdAndDelete(req.params.id);
    if (!t) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

module.exports = { list, getOne, create, update, remove };
