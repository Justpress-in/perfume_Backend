const OrderStatus = require('../models/OrderStatus');

const SEED_STATUSES = [
  { value: 'pending',    label: 'Pending',    color: '#9e9e9e', sortOrder: 0, isDefault: true },
  { value: 'processing', label: 'Processing', color: '#2196f3', sortOrder: 1 },
  { value: 'shipped',    label: 'Shipped',    color: '#ff9800', sortOrder: 2 },
  { value: 'delivered',  label: 'Delivered',  color: '#4caf50', sortOrder: 3 },
  { value: 'cancelled',  label: 'Cancelled',  color: '#f44336', sortOrder: 4 },
];

const list = async (req, res, next) => {
  try {
    let statuses = await OrderStatus.find().sort({ sortOrder: 1, createdAt: 1 });
    // Auto-seed defaults if collection is empty
    if (statuses.length === 0) {
      statuses = await OrderStatus.insertMany(SEED_STATUSES);
    }
    res.json({ success: true, data: statuses });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { value, label, color, sortOrder, isDefault } = req.body;
    if (isDefault) {
      await OrderStatus.updateMany({}, { isDefault: false });
    }
    const s = await OrderStatus.create({ value, label, color, sortOrder, isDefault });
    res.status(201).json({ success: true, data: s });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const { value, label, color, sortOrder, isDefault } = req.body;
    if (isDefault) {
      await OrderStatus.updateMany({ _id: { $ne: req.params.id } }, { isDefault: false });
    }
    const s = await OrderStatus.findByIdAndUpdate(
      req.params.id,
      { value, label, color, sortOrder, isDefault },
      { new: true, runValidators: true }
    );
    if (!s) return res.status(404).json({ success: false, message: 'Status not found' });
    res.json({ success: true, data: s });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const s = await OrderStatus.findByIdAndDelete(req.params.id);
    if (!s) return res.status(404).json({ success: false, message: 'Status not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

module.exports = { list, create, update, remove };
