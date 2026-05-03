const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  title:       { en: { type: String, default: '' }, ar: { type: String, default: '' } },
  body:        { en: { type: String, default: '' }, ar: { type: String, default: '' } },
  image:       { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
  sortOrder:   { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
}, { _id: true, timestamps: false });

const aboutSchema = new mongoose.Schema({
  pageTitle:   { en: { type: String, default: 'About' }, ar: { type: String, default: 'عن' } },
  sections:    { type: [sectionSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('About', aboutSchema);
