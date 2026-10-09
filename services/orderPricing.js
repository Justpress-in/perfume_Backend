// Server-side order pricing. The client's prices are never trusted: unit prices,
// wholesale discount and coupon discount are all recomputed from the database.
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

const WHOLESALE_MULTIPLIER = 0.8; // must match the storefront's displayed wholesale price

const round2 = (n) => Math.round(n * 100) / 100;

const httpError = (statusCode, message) => Object.assign(new Error(message), { statusCode });

// Returns { discount, code } or throws a 400 with the reason the coupon can't be used
const resolveCoupon = async (code, subtotal) => {
  const coupon = await Coupon.findOne({ code: String(code).toUpperCase(), isActive: true });
  if (!coupon) throw httpError(400, 'Invalid coupon code');

  const now = new Date();
  if (coupon.startDate && coupon.startDate > now) throw httpError(400, 'Coupon not yet active');
  if (coupon.endDate && coupon.endDate < now) throw httpError(400, 'Coupon expired');
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw httpError(400, 'Coupon usage limit reached');
  }
  if (subtotal < coupon.minOrderAmount) {
    throw httpError(400, `Minimum order amount is ${coupon.minOrderAmount}`);
  }

  let discount = coupon.discountType === 'percentage'
    ? (subtotal * coupon.discountValue) / 100
    : coupon.discountValue;
  if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
  return { code: coupon.code, discount: round2(Math.min(discount, subtotal)) };
};

// items: [{ productId, quantity, variant? }]
const priceOrder = async ({ items, isWholesale, couponCode }) => {
  if (!Array.isArray(items) || items.length === 0) throw httpError(400, 'Order has no items');

  const orderItems = [];
  let subtotal = 0;
  for (const item of items) {
    const quantity = Math.floor(Number(item.quantity));
    if (!Number.isFinite(quantity) || quantity < 1) throw httpError(400, 'Invalid item quantity');

    const product = await Product.findById(item.productId);
    if (!product || product.isActive === false) {
      throw httpError(404, `Product ${item.productId} not found`);
    }

    let basePrice = product.price;
    let variantLabel = '';
    if (item.variant) {
      const variant = (product.sizeVariants || []).find((v) => v.label === item.variant);
      if (!variant) throw httpError(400, `Size "${item.variant}" is not available for ${product.name.en}`);
      basePrice = variant.price;
      variantLabel = variant.label;
    }

    const price = round2(isWholesale ? basePrice * WHOLESALE_MULTIPLIER : basePrice);
    orderItems.push({
      product: product._id,
      productSnapshot: {
        name: product.name,
        image: product.image,
        category: product.category,
        variant: variantLabel,
      },
      price,
      quantity,
    });
    subtotal += price * quantity;
  }
  subtotal = round2(subtotal);

  let discount = 0;
  let appliedCoupon = '';
  if (couponCode) {
    const coupon = await resolveCoupon(couponCode, subtotal);
    discount = coupon.discount;
    appliedCoupon = coupon.code;
  }

  return {
    items: orderItems,
    subtotal,
    discount,
    couponCode: appliedCoupon,
    total: round2(subtotal - discount),
  };
};

module.exports = { priceOrder, resolveCoupon, round2 };
