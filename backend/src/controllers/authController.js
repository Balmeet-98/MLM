const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const supabase = require('../config/supabase');
const { signToken } = require('../utils/jwt');
const { createMember } = require('../services/memberService');
const {
  verifyRazorpaySignature,
  assertRazorpayConfigured,
  getRazorpay,
} = require('../utils/razorpay');

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const {
      name, email, password, phone, sponsorCode,
      razorpay_payment_id, razorpay_order_id, razorpay_signature,
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Payment details are required to register' });
    }
    try {
      assertRazorpayConfigured();
    } catch (e) {
      return res.status(e.status || 503).json({ error: e.message });
    }
    const isValidPayment = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValidPayment) {
      return res.status(400).json({ error: 'Payment verification failed. Please try again.' });
    }

    const order = await getRazorpay().orders.fetch(razorpay_order_id);
    if (order.notes?.purpose !== 'activation') {
      return res.status(400).json({ error: 'Invalid payment order for registration' });
    }

    let sponsorId = null;
    if (sponsorCode) {
      const { data: sponsor } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', sponsorCode.toUpperCase())
        .single();
      if (!sponsor) return res.status(404).json({ error: 'Invalid sponsor referral code' });
      sponsorId = sponsor.id;
    }

    const newUser = await createMember({
      name,
      email,
      password,
      phone,
      sponsorId,
      parentUserId: sponsorId,
      paymentMode: 'razorpay',
      razorpay: {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      },
      markActivationPaid: true,
    });

    const token = signToken({ id: newUser.id, role: newUser.role });

    res.status(201).json({
      message: 'Registration successful. Welcome to Samriddhi Network!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        referralCode: newUser.referral_code,
        isActive: true,
        role: newUser.role,
      },
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.is_active && user.role !== 'admin') {
      return res.status(403).json({
        error: 'Account not activated. Please contact support.',
        needsActivation: true,
        userId: user.id,
      });
    }

    const token = signToken({ id: user.id, role: user.role });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        referralCode: user.referral_code,
        isActive: user.is_active,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('id, name, email, phone, referral_code, role, is_active, created_at')
      .eq('id', req.user.id)
      .single();

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
