const supabase = require('../config/supabase');
const {
  INSTALLMENT_AMOUNT,
  getRazorpay,
  assertRazorpayConfigured,
  verifyRazorpaySignature,
} = require('../utils/razorpay');
const { completeInstallmentPayment } = require('../services/installmentService');
const { createNotification } = require('../services/notificationService');

const getMyInstallments = async (req, res, next) => {
  try {
    const { data: installments } = await supabase
      .from('installments')
      .select('*')
      .eq('user_id', req.user.id)
      .order('month_number', { ascending: true });

    const { data: user } = await supabase
      .from('users')
      .select('consecutive_missed_installments, group_id')
      .eq('id', req.user.id)
      .single();

    res.json({
      installments: installments || [],
      consecutiveMissed: user?.consecutive_missed_installments || 0,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Confirm installment payment after Razorpay checkout (signature + order validation).
 */
const payInstallment = async (req, res, next) => {
  try {
    assertRazorpayConfigured();
    const razorpay = getRazorpay();

    const {
      monthNumber,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body;

    const month = parseInt(monthNumber, 10);
    if (!month || month < 1 || month > 16) {
      return res.status(400).json({ error: 'monthNumber must be between 1 and 16' });
    }
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Payment details are required' });
    }

    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    if (!isValid) {
      return res.status(400).json({ error: 'Payment verification failed. Please try again.' });
    }

    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('razorpay_payment_id', razorpay_payment_id)
      .single();

    if (existingPayment) {
      return res.status(409).json({ error: 'This payment has already been processed.' });
    }

    const order = await razorpay.orders.fetch(razorpay_order_id);
    const notes = order.notes || {};

    if (notes.purpose !== 'installment') {
      return res.status(400).json({ error: 'Invalid payment order type' });
    }
    if (notes.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Payment does not belong to your account' });
    }
    if (String(notes.month_number) !== String(month)) {
      return res.status(400).json({ error: 'Payment does not match the selected month' });
    }

    const { data: installmentRow } = await supabase
      .from('installments')
      .select('status, amount')
      .eq('user_id', req.user.id)
      .eq('month_number', month)
      .single();

    if (!installmentRow) {
      return res.status(404).json({ error: 'Installment not found' });
    }
    if (installmentRow.status === 'paid') {
      return res.status(400).json({ error: 'This installment is already paid' });
    }

    const expectedPaise = Math.round((Number(installmentRow.amount) || INSTALLMENT_AMOUNT) * 100);
    if (Number(order.amount) !== expectedPaise) {
      return res.status(400).json({ error: 'Payment amount does not match installment due' });
    }

    await completeInstallmentPayment(req.user.id, month);

    const amountInr = expectedPaise / 100;

    const { error: payErr } = await supabase.from('payments').upsert(
      {
        user_id: req.user.id,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        amount: amountInr,
        payment_purpose: 'installment',
        installment_month: month,
        status: 'captured',
      },
      { onConflict: 'razorpay_order_id' }
    );

    if (payErr) {
      console.error('Payment record upsert error:', payErr.message);
    }

    const { data: paidInstallment } = await supabase
      .from('installments')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('month_number', month)
      .single();

    try {
      await createNotification({
        userId: req.user.id,
        type: 'installment_paid',
        title: 'Payment received',
        message: `Thank you! Month ${month} installment of ₹${amountInr.toLocaleString('en-IN')} has been received.`,
        meta: { installmentId: paidInstallment?.id, monthNumber: month, amount: amountInr },
      });
    } catch (notifErr) {
      console.error('Payment notification error:', notifErr.message);
    }

    res.json({ message: `Installment month ${month} paid successfully` });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

module.exports = { getMyInstallments, payInstallment };
