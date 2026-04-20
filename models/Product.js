const mongoose = require('mongoose');

const purchaseLinksSchema = new mongoose.Schema({
  shopee: { type: String, default: '' },
  grab:   { type: String, default: '' },
  lalamove: { type: String, default: '' },
  jnt:    { type: String, default: '' },
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
  image: {
    type: String,
    default: '',
  },
  imagePublicId: {
    type: String,
    default: '',
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
