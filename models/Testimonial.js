const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  avatar: { type: String, default: '' },
  avatarPublicId: { type: String, default: '' },
  text: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
  },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  location: { type: String, default: '' },
  isPublished: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
