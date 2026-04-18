const Admin = require('../models/Admin');

// GET /api/admins
const list = async (req, res, next) => {
  try {
    const admins = await Admin.find().sort({ createdAt: -1 });
    res.json({ success: true, data: admins });
  } catch (err) { next(err); }
};

// GET /api/admins/:id
const getOne = async (req, res, next) => {
  try {
    const a = await Admin.findById(req.params.id);
    if (!a) return res.status(404).json({ success: false, message: 'Admin not found' });
    res.json({ success: true, data: a });
  } catch (err) { next(err); }
};

// POST /api/admins
const create = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email and password are required' });
    }
    const a = await Admin.create({ name, email, password, role: role || 'editor' });
    res.status(201).json({ success: true, data: { id: a._id, name: a.name, email: a.email, role: a.role } });
  } catch (err) { next(err); }
};

// PUT /api/admins/:id
const update = async (req, res, next) => {
  try {
    const { name, role, isActive } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (role !== undefined) update.role = role;
    if (isActive !== undefined) update.isActive = isActive;
    const a = await Admin.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!a) return res.status(404).json({ success: false, message: 'Admin not found' });
    res.json({ success: true, data: a });
  } catch (err) { next(err); }
};

// PUT /api/admins/:id/password
const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }
    const a = await Admin.findById(req.params.id);
    if (!a) return res.status(404).json({ success: false, message: 'Admin not found' });
    a.password = password;
    await a.save();
    res.json({ success: true, message: 'Password reset' });
  } catch (err) { next(err); }
};

// DELETE /api/admins/:id
const remove = async (req, res, next) => {
  try {
    if (req.params.id === req.admin._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }
    const a = await Admin.findByIdAndDelete(req.params.id);
    if (!a) return res.status(404).json({ success: false, message: 'Admin not found' });
    res.json({ success: true, message: 'Admin deleted' });
  } catch (err) { next(err); }
};

module.exports = { list, getOne, create, update, resetPassword, remove };
