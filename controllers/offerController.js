const Offer = require('../models/Offer');

const list = async (req, res, next) => {
  try {
    const { isActive, current } = req.query;
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (current === 'true') {
      const now = new Date();
      filter.$and = [
        { $or: [{ startDate: { $lte: now } }, { startDate: null }] },
        { $or: [{ endDate: { $gte: now } }, { endDate: null }] },
      ];
      filter.isActive = true;
    }
    const data = await Offer.find(filter).populate('products', 'name price image').sort({ sortOrder: 1, createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const o = await Offer.findById(req.params.id).populate('products');
    if (!o) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.json({ success: true, data: o });
  } catch (err) { next(err); }
};

const normalizeBody = (body) => {
  const b = { ...body };
  if (b.discountType === 'percent') b.discountType = 'percentage';
  return b;
};

const create = async (req, res, next) => {
  try {
    const o = await Offer.create(normalizeBody(req.body));
    res.status(201).json({ success: true, data: o });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const o = await Offer.findByIdAndUpdate(req.params.id, normalizeBody(req.body), { new: true, runValidators: true });
    if (!o) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.json({ success: true, data: o });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const o = await Offer.findByIdAndDelete(req.params.id);
    if (!o) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

module.exports = { list, getOne, create, update, remove };
