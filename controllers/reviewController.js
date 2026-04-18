const Review = require('../models/Review');

// Public list by product
const listByProduct = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .sort({ createdAt: -1 })
      .populate('user', 'name avatar');
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    res.json({ success: true, data: reviews, average: Number(avg.toFixed(2)), count: reviews.length });
  } catch (err) { next(err); }
};

// Public create (user may be logged in)
const create = async (req, res, next) => {
  try {
    const { product, rating, comment, name, email, title, images } = req.body;
    if (!product || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'product, rating and comment are required' });
    }
    const review = await Review.create({
      product, rating, comment, title, images,
      name: name || (req.user && req.user.name),
      email: email || (req.user && req.user.email),
      user: req.user ? req.user._id : undefined,
    });
    res.status(201).json({ success: true, message: 'Review submitted and pending approval', data: review });
  } catch (err) { next(err); }
};

// Admin list
const adminList = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isApproved, productId } = req.query;
    const filter = {};
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';
    if (productId) filter.product = productId;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))
        .populate('product', 'name').populate('user', 'name email'),
      Review.countDocuments(filter),
    ]);
    res.json({ success: true, data, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const r = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!r) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, data: r });
  } catch (err) { next(err); }
};

const approve = async (req, res, next) => {
  try {
    const r = await Review.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!r) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, data: r });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const r = await Review.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

module.exports = { listByProduct, create, adminList, update, approve, remove };
