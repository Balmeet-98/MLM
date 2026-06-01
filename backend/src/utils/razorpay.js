const crypto = require('crypto');
const Razorpay = require('razorpay');

const INSTALLMENT_AMOUNT = 1200;

let razorpayInstance = null;

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

const assertRazorpayConfigured = () => {
  if (!getRazorpay()) {
    const err = new Error('Payment gateway is not configured. Contact support.');
    err.status = 503;
    throw err;
  }
};

/**
 * HMAC-SHA256(orderId + "|" + paymentId, KEY_SECRET) must equal signature.
 */
const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const body = orderId + '|' + paymentId;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expected === signature;
};

module.exports = {
  INSTALLMENT_AMOUNT,
  getRazorpay,
  assertRazorpayConfigured,
  verifyRazorpaySignature,
};
