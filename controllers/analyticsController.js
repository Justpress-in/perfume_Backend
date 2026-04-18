const Order = require('../models/Order');
const Product = require('../models/Product');

// GET /api/analytics/summary
const getSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalOrders, thisMonthOrders, lastMonthOrders,
      totalRevenue, thisMonthRevenue, lastMonthRevenue,
      totalProducts, activeProducts,
      ordersByStatus,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: startOfThisMonth } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    const revenue = totalRevenue[0]?.total || 0;
    const revenueThisMonth = thisMonthRevenue[0]?.total || 0;
    const revenueLastMonth = lastMonthRevenue[0]?.total || 0;
    const revenueDelta = revenueLastMonth > 0
      ? (((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100).toFixed(1)
      : 100;

    res.json({
      success: true,
      data: {
        orders: { total: totalOrders, thisMonth: thisMonthOrders, lastMonth: lastMonthOrders },
        revenue: { total: revenue, thisMonth: revenueThisMonth, lastMonth: revenueLastMonth, deltaPercent: parseFloat(revenueDelta) },
        products: { total: totalProducts, active: activeProducts },
        ordersByStatus: ordersByStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/products — top sellers
const getTopProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true })
      .sort({ salesCount: -1 })
      .limit(10)
      .select('name price category salesCount image');
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/orders/timeline — orders per day (last 30 days)
const getOrderTimeline = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const timeline = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        orders: { $sum: 1 },
        revenue: { $sum: '$total' },
      }},
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: timeline });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/channels — revenue by sales channel
const getChannelBreakdown = async (req, res, next) => {
  try {
    const breakdown = await Order.aggregate([
      { $group: {
        _id: '$channel',
        orders: { $sum: 1 },
        revenue: { $sum: '$total' },
      }},
      { $sort: { revenue: -1 } },
    ]);
    res.json({ success: true, data: breakdown });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary, getTopProducts, getOrderTimeline, getChannelBreakdown };
