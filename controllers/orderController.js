const Order = require('../models/Order');
const Product = require('../models/Product');

// GET /api/orders
const getOrders = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 20,
      status, channel, isWholesale,
      startDate, endDate,
      sortBy = 'createdAt', order = 'desc',
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (channel) filter.channel = channel;
    if (isWholesale !== undefined) filter.isWholesale = isWholesale === 'true';
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('statusHistory.changedBy', 'name'),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ $or: [{ _id: req.params.id }, { orderId: req.params.id }] })
      .populate('statusHistory.changedBy', 'name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// POST /api/orders — called by frontend checkout
const createOrder = async (req, res, next) => {
  try {
    const { customer, items, channel, isWholesale, notes } = req.body;

    // Build items with product snapshots
    const orderItems = [];
    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ success: false, message: `Product ${item.productId} not found` });

      const price = isWholesale ? product.price * 0.7 : product.price;
      orderItems.push({
        product: product._id,
        productSnapshot: { name: product.name, image: product.image, category: product.category },
        price,
        quantity: item.quantity,
      });
      subtotal += price * item.quantity;
    }

    const discount = isWholesale ? subtotal * 0 : 0; // Discount already applied per-item
    const order = await Order.create({
      customer, items: orderItems,
      channel: channel || 'website',
      isWholesale: !!isWholesale,
      subtotal, discount,
      total: subtotal - discount,
      notes,
    });

    // Update sales counts
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { salesCount: item.quantity } });
    }

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/orders/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { orderId: req.params.id }] },
      {
        status,
        $push: { statusHistory: { status, changedBy: req.admin._id } },
        ...(notes && { notes }),
      },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/export — CSV export
const exportOrders = async (req, res, next) => {
  try {
    const { startDate, endDate, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    const csvRows = [
      ['Order ID', 'Date', 'Customer', 'Email', 'Phone', 'Status', 'Channel', 'Total', 'Items'].join(','),
      ...orders.map(o => [
        o.orderId, new Date(o.createdAt).toISOString().slice(0, 10),
        `"${o.customer.name}"`, o.customer.email, o.customer.phone || '',
        o.status, o.channel, o.total, o.items.length,
      ].join(',')),
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
    res.send(csvRows.join('\n'));
  } catch (err) {
    next(err);
  }
};

module.exports = { getOrders, getOrder, createOrder, updateStatus, exportOrders };
