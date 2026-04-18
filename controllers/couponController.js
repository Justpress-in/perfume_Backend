const Coupon = require('../models/Coupon');

const list = async (req, res, next) => {
  try {
    const { isActive, search } = req.query;
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) filter.code = new RegExp(search, 'i');
    const data = await Coupon.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const c = await Coupon.findById(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, data: c });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const c = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: c });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const c = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!c) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, data: c });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const c = await Coupon.findByIdAndDelete(req.params.id);
    if (!c) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

// POST /api/coupons/validate (public — used at checkout)
const validate = async (req, res, next) => {
  try {
    const { code, subtotal = 0 } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Code required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });

    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) return res.status(400).json({ success: false, message: 'Coupon not yet active' });
    if (coupon.endDate && coupon.endDate < now) return res.status(400).json({ success: false, message: 'Coupon expired' });
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }
    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({ success: false, message: `Minimum order amount is ${coupon.minOrderAmount}` });
    }

    let discount = coupon.discountType === 'percentage'
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;
    if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) discount = coupon.maxDiscount;

    res.json({ success: true, data: { code: coupon.code, discount, discountType: coupon.discountType, discountValue: coupon.discountValue } });
  } catch (err) { next(err); }
};

module.exports = { list, getOne, create, update, remove, validate };
