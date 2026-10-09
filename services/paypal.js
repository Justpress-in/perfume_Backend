// Thin client for the PayPal REST API (Orders v2).
// Configure with PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET and PAYPAL_MODE (sandbox | live).

const BASE_URLS = {
  sandbox: 'https://api-m.sandbox.paypal.com',
  live: 'https://api-m.paypal.com',
};

const getConfig = () => {
  const mode = process.env.PAYPAL_MODE === 'live' ? 'live' : 'sandbox';
  return {
    mode,
    baseUrl: BASE_URLS[mode],
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    webhookId: process.env.PAYPAL_WEBHOOK_ID || '',
    // Currency charged on PayPal. Store prices are in MYR; if the PayPal account
    // can't receive MYR, set PAYPAL_CURRENCY (e.g. USD) and PAYPAL_EXCHANGE_RATE
    // (units of PAYPAL_CURRENCY per 1 MYR).
    currency: (process.env.PAYPAL_CURRENCY || 'MYR').toUpperCase(),
    exchangeRate: Number(process.env.PAYPAL_EXCHANGE_RATE) || 1,
  };
};

const isConfigured = () => {
  const { clientId, clientSecret } = getConfig();
  return Boolean(clientId && clientSecret);
};

class PayPalError extends Error {
  constructor(message, statusCode, details) {
    super(message);
    this.name = 'PayPalError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

let cachedToken = null; // { value, expiresAt }

const getAccessToken = async () => {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const { baseUrl, clientId, clientSecret } = getConfig();
  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new PayPalError(`PayPal auth failed: ${data.error_description || res.status}`, 502, data);
  }
  // Refresh a minute before PayPal's expiry
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return cachedToken.value;
};

const request = async (path, { method = 'GET', body, requestId } = {}) => {
  const { baseUrl } = getConfig();
  const token = await getAccessToken();
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(requestId && { 'PayPal-Request-Id': requestId }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const issue = data.details?.[0]?.issue;
    // 422 = business validation (e.g. declined card); anything else is an upstream failure
    throw new PayPalError(issue || data.message || `PayPal request failed (${res.status})`, res.status === 422 ? 422 : 502, data);
  }
  return data;
};

// Convert a MYR amount to the PayPal charge currency, as a 2-decimal string
const toChargeAmount = (amountMyr) => {
  const { exchangeRate } = getConfig();
  return (Math.round(amountMyr * exchangeRate * 100) / 100).toFixed(2);
};

const createOrder = ({ orderId, amount, currency, description, requestId }) =>
  request('/v2/checkout/orders', {
    method: 'POST',
    requestId,
    body: {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: orderId,
        invoice_id: orderId,
        custom_id: orderId,
        description: description?.slice(0, 127),
        amount: { currency_code: currency, value: amount },
      }],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: 'Oud Al-Anood',
            shipping_preference: 'NO_SHIPPING', // address is collected on our checkout form
            user_action: 'PAY_NOW',
          },
        },
      },
    },
  });

const captureOrder = (paypalOrderId) =>
  request(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
    method: 'POST',
    requestId: `capture-${paypalOrderId}`,
  });

const getOrder = (paypalOrderId) =>
  request(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`);

// https://developer.paypal.com/api/rest/webhooks/rest/#link-verifywebhooksignature
const verifyWebhook = async (headers, event) => {
  const { webhookId } = getConfig();
  if (!webhookId) return false;
  const data = await request('/v1/notifications/verify-webhook-signature', {
    method: 'POST',
    body: {
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: event,
    },
  });
  return data.verification_status === 'SUCCESS';
};

module.exports = {
  getConfig,
  isConfigured,
  toChargeAmount,
  createOrder,
  captureOrder,
  getOrder,
  verifyWebhook,
  PayPalError,
};
