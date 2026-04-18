const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  siteName: { en: { type: String, default: 'Oud Al-Anood' }, ar: { type: String, default: 'عود العنود' } },
  tagline: { en: { type: String, default: '' }, ar: { type: String, default: '' } },
  logo: { type: String, default: '' },
  favicon: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  address: { en: { type: String, default: '' }, ar: { type: String, default: '' } },
  social: {
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    tiktok: { type: String, default: '' },
    youtube: { type: String, default: '' },
    twitter: { type: String, default: '' },
  },
  currency: { type: String, default: 'MYR' },
  currencySymbol: { type: String, default: 'RM' },
  shipping: {
    freeShippingThreshold: { type: Number, default: 0 },
    flatRate: { type: Number, default: 0 },
  },
  taxRate: { type: Number, default: 0 },
  wholesaleDiscountPercent: { type: Number, default: 30 },
  seo: {
    metaTitle: { en: { type: String, default: '' }, ar: { type: String, default: '' } },
    metaDescription: { en: { type: String, default: '' }, ar: { type: String, default: '' } },
    keywords: [{ type: String }],
  },
  maintenanceMode: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
