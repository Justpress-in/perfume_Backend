const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  section: {
    type: String,
    enum: ['hero', 'promo', 'brand', 'homepage', 'shop', 'about', 'custom'],
    required: true,
  },
  title: { en: { type: String, default: '' }, ar: { type: String, default: '' } },
  subtitle: { en: { type: String, default: '' }, ar: { type: String, default: '' } },
  description: { en: { type: String, default: '' }, ar: { type: String, default: '' } },
  image: { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
  mobileImage: { type: String, default: '' },
  mobileImagePublicId: { type: String, default: '' },
  video: { type: String, default: '' },
  ctaText: { en: { type: String, default: '' }, ar: { type: String, default: '' } },
  ctaLink: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  startDate: Date,
  endDate: Date,
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
