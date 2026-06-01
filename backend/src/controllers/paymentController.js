const supabase = require('../config/supabase');
const {
  INSTALLMENT_AMOUNT,
  getRazorpay,
  assertRazorpayConfigured,
} = require('../utils/razorpay');

/**
 * Create a Razorpay order for registration (Month 1). Public — no auth.
 */
const createOrder = async (req, res, next) => {
  try {
    assertRazorpayConfigured();
    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount: INSTALLMENT_AMOUNT * 100,
      currency: 'INR',
      notes: {
        purpose: 'activation',
        installment_month: '1',
      },
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

/**
 * Create a Razorpay order for a monthly installment (months 1–16). Auth required.
 */
const createInstallmentOrder = async (req, res, next) => {
  try {
    assertRazorpayConfigured();
    const razorpay = getRazorpay();

    const monthNumber = parseInt(req.body.monthNumber, 10);
    if (!monthNumber || monthNumber < 1 || monthNumber > 16) {
      return res.status(400).json({ error: 'monthNumber must be between 1 and 16' });
    }

    const { data: installment } = await supabase
      .from('installments')
      .select('id, status, amount')
      .eq('user_id', req.user.id)
      .eq('month_number', monthNumber)
      .single();

    if (!installment) {
      return res.status(404).json({ error: 'Installment not found' });
    }
    if (installment.status === 'paid') {
      return res.status(400).json({ error: 'This installment is already paid' });
    }

    const amountInr = Number(installment.amount) || INSTALLMENT_AMOUNT;

    const order = await razorpay.orders.create({
      amount: Math.round(amountInr * 100),
      currency: 'INR',
      notes: {
        purpose: 'installment',
        user_id: req.user.id,
        month_number: String(monthNumber),
      },
    });

    const { error: pendingErr } = await supabase.from('payments').insert({
      user_id: req.user.id,
      razorpay_order_id: order.id,
      razorpay_payment_id: null,
      razorpay_signature: null,
      amount: amountInr,
      payment_purpose: 'installment',
      installment_month: monthNumber,
      status: 'pending',
    });

    if (pendingErr && pendingErr.code !== '23505') {
      console.error('Pending payment insert error:', pendingErr.message);
    }

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      monthNumber,
      amountInr,
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

module.exports = { createOrder, createInstallmentOrder };
