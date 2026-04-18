const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
  },
  address: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
  },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  hours: { en: { type: String, default: '' }, ar: { type: String, default: '' } },
  mapEmbed: { type: String, default: '' },
  navLink: { type: String, default: '' },
  latitude: { type: Number },
  longitude: { type: Number },
  image: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);
