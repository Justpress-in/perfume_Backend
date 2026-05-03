const mongoose = require('mongoose');

const orderStatusSchema = new mongoose.Schema({
  value: { type: String, required: true, unique: true, lowercase: true, trim: true },
  label: { type: String, required: true, trim: true },
  color: { type: String, default: '#9e9e9e' }, // hex color for UI dot/chip
  sortOrder: { type: Number, default: 0 },
  isDefault: { type: Boolean, default: false }, // one status is the default for new orders
}, { timestamps: true });

module.exports = mongoose.model('OrderStatus', orderStatusSchema);
