const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productSnapshot: { // Store at time of order - product may change later
    name: { en: String, ar: String },
    image: String,
    category: String,
  },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
  },
  customer: {
    name:    { type: String, required: true },
    email:   { type: String, required: true },
    phone:   { type: String, default: '' },
    address: { type: String, default: '' },
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  channel: {
    type: String,
    enum: ['website', 'shopee', 'grab', 'walk-in', 'wholesale'],
    default: 'website',
  },
  subtotal:  { type: Number, required: true },
  discount:  { type: Number, default: 0 },
  total:     { type: Number, required: true },
  isWholesale: { type: Boolean, default: false },
  notes:     { type: String, default: '' },
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  }],
}, { timestamps: true });

// Auto-generate orderId like ORD-20240415-001
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await mongoose.model('Order').countDocuments();
    this.orderId = `ORD-${date}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
