const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, default: '' },
  language: { type: String, enum: ['en', 'ar'], default: 'en' },
  source: { type: String, default: 'website' },
  isSubscribed: { type: Boolean, default: true },
  unsubscribedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Newsletter', newsletterSchema);
