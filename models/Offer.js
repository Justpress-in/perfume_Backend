const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
  },
  description: {
    en: { type: String, default: '' },
    ar: { type: String, default: '' },
  },
  image: { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
  discountType: { type: String, enum: ['percentage', 'fixed', 'bogo', 'bundle'], default: 'percentage' },
  discountValue: { type: Number, default: 0 },
  link: { type: String, default: '' },
  badge: { type: String, default: '' },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  category: { type: String, default: '' },
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
