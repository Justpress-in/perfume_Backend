const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const paypal = require('../services/paypal');
const { priceOrder } = require('../services/orderPricing');

const notConfigured = (res) =>
  res.status(503).json({ success: false, message: 'Online payment is not available right now' });

// Public view of an order returned to the storefront after payment
const publicOrder = (order) => ({
  _id: order._id,
  orderId: order.orderId,
  total: order.total,
  payment: { status: order.payment.status, method: order.payment.method },
});

// Side effects that should only happen once an order is actually paid
const onOrderPaid = async (order) => {
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { salesCount: item.quantity } });
  }
  if (order.couponCode) {
    await Coupon.updateOne({ code: order.couponCode }, { $inc: { usedCount: 1 } });
  }
};

// Applies a PayPal capture to our order. Idempotent: the capture endpoint and the
// webhook can both report the same payment, and only the first one counts.
const applyCapture = async (order, capture, payer) => {
  if (!capture) return order;

  const amountMatches = capture.amount?.value === order.payment.amount
    && capture.amount?.currency_code === order.payment.currency;

  let status;
  if (capture.status === 'COMPLETED' && amountMatches) status = 'paid';
  else if (capture.status === 'COMPLETED') status = 'failed'; // paid amount doesn't match — needs manual review
  else if (capture.status === 'PENDING') status = 'pending';
  else if (capture.status === 'REFUNDED' || capture.status === 'PARTIALLY_REFUNDED') status = 'refunded';
  else status = 'failed';

  const update = {
    'payment.status': status,
    'payment.provider.captureId': capture.id,
    ...(payer?.payer_id && { 'payment.provider.payerId': payer.payer_id }),
    ...(payer?.email_address && { 'payment.provider.payerEmail': payer.email_address }),
  };
  if (status === 'paid') update['payment.paidAt'] = new Date();

  // Only transition to paid once, so sales counts / coupon usage aren't double-counted,
  // and never let a late PENDING event downgrade a paid order
  const filter = status === 'paid' || status === 'pending'
    ? { _id: order._id, 'payment.status': { $ne: 'paid' } }
    : { _id: order._id };
  const updated = await Order.findOneAndUpdate(filter, { $set: update }, { new: true });
  if (!updated) return Order.findById(order._id); // already marked paid

  if (status === 'paid') await onOrderPaid(updated);
  if (status === 'failed' && capture.status === 'COMPLETED') {
    console.error(`PayPal amount mismatch on order ${order.orderId}: captured ${capture.amount?.value} ${capture.amount?.currency_code}, expected ${order.payment.amount} ${order.payment.currency}`);
  }
  return updated;
};

// GET /api/payments/paypal/config
const getConfig = (_req, res) => {
  const { clientId, currency, mode, exchangeRate } = paypal.getConfig();
  res.json({
    success: true,
    data: { enabled: paypal.isConfigured(), clientId, currency, mode, exchangeRate },
  });
};

// POST /api/payments/paypal/create-order
// Body: { customer, items: [{ productId, quantity, variant? }], isWholesale, couponCode, notes }
const createOrder = async (req, res, next) => {
  try {
    if (!paypal.isConfigured()) return notConfigured(res);

    const { customer = {}, items, isWholesale, couponCode, notes } = req.body;
    if (!customer.name || !customer.email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const priced = await priceOrder({ items, isWholesale: !!isWholesale, couponCode });
    if (priced.total <= 0) {
      return res.status(400).json({ success: false, message: 'Order total must be greater than zero' });
    }

    const { currency } = paypal.getConfig();
    const amount = paypal.toChargeAmount(priced.total);

    const order = await Order.create({
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        address: customer.address || '',
      },
      items: priced.items,
      channel: 'website',
      isWholesale: !!isWholesale,
      subtotal: priced.subtotal,
      discount: priced.discount,
      couponCode: priced.couponCode,
      total: priced.total,
      notes: notes || '',
      payment: { method: 'paypal', status: 'pending', amount, currency },
    });

    let ppOrder;
    try {
      ppOrder = await paypal.createOrder({
        orderId: order.orderId,
        amount,
        currency,
        description: `Oud Al-Anood order ${order.orderId}`,
        requestId: `create-${order._id}`,
      });
    } catch (err) {
      await Order.updateOne({ _id: order._id }, { $set: { 'payment.status': 'failed' } });
      throw err;
    }

    order.payment.provider.orderId = ppOrder.id;
    await order.save();

    res.status(201).json({ success: true, data: { paypalOrderId: ppOrder.id, orderId: order.orderId } });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/paypal/capture
// Body: { paypalOrderId }
const captureOrder = async (req, res, next) => {
  try {
    if (!paypal.isConfigured()) return notConfigured(res);

    const { paypalOrderId } = req.body;
    if (!paypalOrderId || typeof paypalOrderId !== 'string') {
      return res.status(400).json({ success: false, message: 'paypalOrderId is required' });
    }

    const order = await Order.findOne({ 'payment.provider.orderId': paypalOrderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.payment.status === 'paid') return res.json({ success: true, data: publicOrder(order) });

    let result;
    try {
      result = await paypal.captureOrder(paypalOrderId);
    } catch (err) {
      // Already captured (e.g. by the webhook or a retried request): read the order instead
      if (err.details?.details?.[0]?.issue === 'ORDER_ALREADY_CAPTURED') {
        result = await paypal.getOrder(paypalOrderId);
      } else if (err.details?.details?.[0]?.issue === 'INSTRUMENT_DECLINED') {
        // The buyer can pick another funding source in the PayPal popup and retry
        return res.status(402).json({ success: false, code: 'INSTRUMENT_DECLINED', message: 'Payment method was declined' });
      } else {
        throw err;
      }
    }

    const capture = result.purchase_units?.[0]?.payments?.captures?.[0];
    const updated = await applyCapture(order, capture, result.payer);

    if (updated.payment.status === 'paid' || updated.payment.status === 'pending') {
      return res.json({ success: true, data: publicOrder(updated) });
    }
    res.status(402).json({ success: false, message: 'Payment could not be completed', data: publicOrder(updated) });
  } catch (err) {
    next(err);
  }
};

// POST /api/payments/paypal/webhook
// Configure in the PayPal developer dashboard and set PAYPAL_WEBHOOK_ID.
const webhook = async (req, res) => {
  const event = req.body;
  try {
    const verified = await paypal.verifyWebhook(req.headers, event);
    if (!verified) return res.status(400).json({ success: false, message: 'Invalid webhook signature' });

    const resource = event.resource || {};
    switch (event.event_type) {
      case 'CHECKOUT.ORDER.APPROVED': {
        // Buyer approved but the browser never called /capture (closed tab, network loss)
        const order = await Order.findOne({ 'payment.provider.orderId': resource.id });
        if (order && order.payment.status === 'pending' && !order.payment.provider.captureId) {
          try {
            const result = await paypal.captureOrder(resource.id);
            await applyCapture(order, result.purchase_units?.[0]?.payments?.captures?.[0], result.payer);
          } catch (err) {
            if (err.details?.details?.[0]?.issue !== 'ORDER_ALREADY_CAPTURED') throw err;
          }
        }
        break;
      }
      case 'PAYMENT.CAPTURE.COMPLETED':
      case 'PAYMENT.CAPTURE.PENDING':
      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED':
      case 'PAYMENT.CAPTURE.REFUNDED':
      case 'PAYMENT.CAPTURE.REVERSED': {
        const paypalOrderId = resource.supplementary_data?.related_ids?.order_id;
        const order = paypalOrderId
          ? await Order.findOne({ 'payment.provider.orderId': paypalOrderId })
          : await Order.findOne({ 'payment.provider.captureId': resource.id });
        if (!order) break;

        if (event.event_type === 'PAYMENT.CAPTURE.REFUNDED' || event.event_type === 'PAYMENT.CAPTURE.REVERSED') {
          await Order.updateOne({ _id: order._id }, { $set: { 'payment.status': 'refunded' } });
        } else {
          await applyCapture(order, resource);
        }
        break;
      }
      default:
        break;
    }
    res.json({ success: true });
  } catch (err) {
    console.error('PayPal webhook error:', err.message);
    // Non-2xx makes PayPal retry the delivery later
    res.status(500).json({ success: false });
  }
};

module.exports = { getConfig, createOrder, captureOrder, webhook };
