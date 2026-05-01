const mongoose = require('mongoose');

const purchaseLinksSchema = new mongoose.Schema({
  shopee:    { type: String, default: '' },
  lojada:    { type: String, default: '' },
  tiktok:    { type: String, default: '' },
}, { _id: false });

const productImageSchema = new mongoose.Schema({
  url:      { type: String, required: true },
  publicId: { type: String, default: '' },
}, { _id: false });

const sizeVariantSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true }, // e.g. "100 ml" or "Small"
  price: { type: Number, required: true, min: 0 },
}, { _id: false });

const dimensionsSchema = new mongoose.Schema({
  length: { type: Number, default: null },
  width:  { type: Number, default: null },
  height: { type: Number, default: null },
  unit:   { type: String, default: 'cm', trim: true },
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true, trim: true },
    ar: { type: String, required: true, trim: true },
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
  category: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  subcategory: {
    type: String,
    trim: true,
    lowercase: true,
    default: '',
  },
  // Primary image kept for backwards-compat
  image: {
    type: String,
    default: '',
  },
  imagePublicId: {
    type: String,
    default: '',
  },
  // Multi-photo support
  images: {
    type: [productImageSchema],
    default: [],
  },
  description: {
    en: { type: String, default: '' },
    ar: { type: String, default: '' },
  },
  features: [{ type: String }],
  purchaseLinks: {
    type: purchaseLinksSchema,
    default: () => ({}),
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  // Physical attributes
  weight: {
    value: { type: Number, default: null },
    unit:  { type: String, default: 'g', trim: true },
  },
  dimensions: {
    type: dimensionsSchema,
    default: () => ({}),
  },
  // Size variants (Option A: 100ml - $50, Option B: 200ml - $90)
  sizeVariants: {
    type: [sizeVariantSchema],
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  salesCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

productSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
