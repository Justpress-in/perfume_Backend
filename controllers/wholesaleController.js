const Wholesale = require('../models/Wholesale');

const create = async (req, res, next) => {
  try {
    const { companyName, contactName, email, phone } = req.body;
    if (!companyName || !contactName || !email || !phone) {
      return res.status(400).json({ success: false, message: 'companyName, contactName, email and phone are required' });
    }
    const inquiry = await Wholesale.create(req.body);
    res.status(201).json({ success: true, message: 'Inquiry submitted', data: inquiry });
  } catch (err) { next(err); }
};

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.$or = [
      { companyName: new RegExp(search, 'i') },
      { contactName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      Wholesale.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).populate('handledBy', 'name'),
      Wholesale.countDocuments(filter),
    ]);
    res.json({ success: true, data, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const i = await Wholesale.findById(req.params.id).populate('handledBy', 'name email');
    if (!i) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: i });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const allowed = ['status', 'notes'];
    const update = { handledBy: req.admin._id };
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    const i = await Wholesale.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!i) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: i });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const i = await Wholesale.findByIdAndDelete(req.params.id);
    if (!i) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

module.exports = { create, list, getOne, update, remove };
