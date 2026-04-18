const Contact = require('../models/Contact');

// POST /api/contact (public)
const create = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email and message are required' });
    }
    const msg = await Contact.create({ name, email, phone, subject, message });
    res.status(201).json({ success: true, message: 'Message sent successfully', data: msg });
  } catch (err) { next(err); }
};

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }, { subject: new RegExp(search, 'i') }];
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).populate('repliedBy', 'name'),
      Contact.countDocuments(filter),
    ]);
    res.json({ success: true, data, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const msg = await Contact.findById(req.params.id).populate('repliedBy', 'name email');
    if (!msg) return res.status(404).json({ success: false, message: 'Not found' });
    if (msg.status === 'new') { msg.status = 'read'; await msg.save(); }
    res.json({ success: true, data: msg });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const allowed = ['status', 'reply'];
    const update = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    if (update.reply) { update.repliedAt = new Date(); update.repliedBy = req.admin._id; update.status = 'replied'; }
    const msg = await Contact.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!msg) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: msg });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const msg = await Contact.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

module.exports = { create, list, getOne, update, remove };
