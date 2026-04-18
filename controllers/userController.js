const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Order = require('../models/Order');

const signTokens = (id) => ({
  accessToken: jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }),
  refreshToken: jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }),
});

// POST /api/users/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, language } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    const user = await User.create({ name, email, password, phone, language });
    const { accessToken, refreshToken } = signTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();
    res.status(201).json({
      success: true, accessToken, refreshToken,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, language: user.language, isWholesale: user.isWholesale },
    });
  } catch (err) { next(err); }
};

// POST /api/users/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase(), isActive: true }).select('+password +refreshToken');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const { accessToken, refreshToken } = signTokens(user._id);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();
    res.json({
      success: true, accessToken, refreshToken,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, language: user.language, isWholesale: user.isWholesale },
    });
  } catch (err) { next(err); }
};

// POST /api/users/refresh
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
    const tokens = signTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();
    res.json({ success: true, ...tokens });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Refresh token expired' });
    }
    next(err);
  }
};

// POST /api/users/logout
const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.json({ success: true, message: 'Logged out' });
  } catch (err) { next(err); }
};

// GET /api/users/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// PUT /api/users/me
const updateMe = async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'avatar', 'language'];
    const update = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// PUT /api/users/me/password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password required' });
    }
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) { next(err); }
};

// ── Addresses ─────────────────────────────────────────────────
const listAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user.addresses });
  } catch (err) { next(err); }
};

const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.isDefault) user.addresses.forEach(a => { a.isDefault = false; });
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json({ success: true, data: user.addresses });
  } catch (err) { next(err); }
};

const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addrId);
    if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });
    if (req.body.isDefault) user.addresses.forEach(a => { a.isDefault = false; });
    Object.assign(addr, req.body);
    await user.save();
    res.json({ success: true, data: user.addresses });
  } catch (err) { next(err); }
};

const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.addrId);
    if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });
    addr.deleteOne();
    await user.save();
    res.json({ success: true, data: user.addresses });
  } catch (err) { next(err); }
};

// ── Wishlist ──────────────────────────────────────────────────
const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({ success: true, data: user.wishlist });
  } catch (err) { next(err); }
};

const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'productId required' });
    const user = await User.findById(req.user._id);
    const idx = user.wishlist.findIndex(id => id.toString() === productId);
    if (idx >= 0) user.wishlist.splice(idx, 1);
    else user.wishlist.push(productId);
    await user.save();
    res.json({ success: true, data: user.wishlist });
  } catch (err) { next(err); }
};

const removeWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
    await user.save();
    res.json({ success: true, data: user.wishlist });
  } catch (err) { next(err); }
};

// ── My orders ─────────────────────────────────────────────────
const myOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ 'customer.email': req.user.email }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) { next(err); }
};

// ── Admin: list/ban users ─────────────────────────────────────
const adminListUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;
    const filter = {};
    if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data: users, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { next(err); }
};

const adminGetUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('wishlist');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

const adminUpdateUser = async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'isActive', 'isWholesale', 'language'];
    const update = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

const adminDeleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deactivated' });
  } catch (err) { next(err); }
};

module.exports = {
  register, login, refresh, logout, getMe, updateMe, changePassword,
  listAddresses, addAddress, updateAddress, deleteAddress,
  getWishlist, toggleWishlist, removeWishlist, myOrders,
  adminListUsers, adminGetUser, adminUpdateUser, adminDeleteUser,
};
