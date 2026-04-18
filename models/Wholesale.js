const mongoose = require('mongoose');

const wholesaleSchema = new mongoose.Schema({
  companyName: { type: String, required: true, trim: true },
  contactName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  country: { type: String, default: '' },
  city: { type: String, default: '' },
  businessType: { type: String, default: '' },
  volume: { type: String, default: '' },
  message: { type: String, default: '' },
  status: { type: String, enum: ['new', 'contacted', 'approved', 'rejected', 'closed'], default: 'new' },
  notes: { type: String, default: '' },
  handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

module.exports = mongoose.model('Wholesale', wholesaleSchema);
