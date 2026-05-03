const Razorpay = require('razorpay');

const ACTIVATION_AMOUNT = 1200; // Month 1 installment in INR

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order for the activation fee (Month 1 installment).
 * Public route — no auth required (user has no account yet).
 */
const createOrder = async (req, res, next) => {
  try {
    const order = await razorpay.orders.create({
      amount: ACTIVATION_AMOUNT * 100, // Razorpay expects paise
      currency: 'INR',
      notes: {
        purpose: 'Samriddhi Network — Account Activation (Month 1 Installment)',
      },
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder };
