const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const supabase = require('../config/supabase');
const { signToken } = require('../utils/jwt');
const { placeInTree } = require('../services/binaryTreeService');
const { creditDirectIncome, updatePairsAndCredit } = require('../services/incomeService');
const { createInstallmentSchedule } = require('../services/installmentService');
const { checkAndAssignRanks } = require('../services/rewardService');

const ACTIVATION_AMOUNT = 1200;

const generateReferralCode = (name) => {
  const prefix = name.replace(/\s+/g, '').substring(0, 3).toUpperCase();
  const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}${suffix}`;
};

/**
 * Verify Razorpay payment signature.
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

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const {
      name, email, password, phone, sponsorCode, position,
      razorpay_payment_id, razorpay_order_id, razorpay_signature,
    } = req.body;

    // Verify Razorpay payment
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Payment details are required to register' });
    }
    const isValidPayment = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValidPayment) {
      return res.status(400).json({ error: 'Payment verification failed. Please try again.' });
    }

    // Prevent duplicate payment use
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('razorpay_payment_id', razorpay_payment_id)
      .single();
    if (existingPayment) {
      return res.status(409).json({ error: 'This payment has already been used for registration.' });
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    // Find sponsor
    let sponsorId = null;
    if (sponsorCode) {
      const { data: sponsor } = await supabase
        .from('users')
        .select('id, group_id')
        .eq('referral_code', sponsorCode.toUpperCase())
        .single();
      if (!sponsor) return res.status(404).json({ error: 'Invalid sponsor referral code' });
      sponsorId = sponsor.id;
    }

    // Determine group
    let groupId = null;
    if (sponsorId) {
      const { data: sponsor } = await supabase
        .from('users')
        .select('group_id')
        .eq('id', sponsorId)
        .single();
      groupId = sponsor?.group_id;
    }
    if (!groupId) {
      const { data: activeGroup } = await supabase
        .from('groups')
        .select('id')
        .eq('status', 'active')
        .limit(1)
        .single();
      groupId = activeGroup?.id;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const referralCode = generateReferralCode(name);

    // Create user — already active since payment is verified
    const { data: newUser, error: userErr } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password_hash: passwordHash,
        phone,
        referral_code: referralCode,
        sponsor_id: sponsorId,
        position: position || 'left',
        group_id: groupId,
        is_active: true,
      })
      .select()
      .single();

    if (userErr) throw userErr;

    // Record payment
    await supabase.from('payments').insert({
      user_id: newUser.id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount: ACTIVATION_AMOUNT,
      status: 'captured',
    });

    // Create wallet
    await supabase.from('wallets').insert({ user_id: newUser.id, balance: 0 });

    // Place in binary tree
    if (sponsorId) {
      await placeInTree(newUser.id, sponsorId, position || 'left');
    } else {
      await supabase.from('binary_tree').insert({ user_id: newUser.id });
    }

    // Create 16-month installment schedule and mark Month 1 as paid
    if (groupId) {
      await createInstallmentSchedule(newUser.id, groupId);

      await supabase
        .from('installments')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString(),
        })
        .eq('user_id', newUser.id)
        .eq('group_id', groupId)
        .eq('month_number', 1);
    }

    // Credit direct income to upline (L1=₹400, L2=₹200, L3=₹100)
    await creditDirectIncome(newUser.id);

    // Update pair counts up the tree
    if (sponsorId) {
      const { data: treeNode } = await supabase
        .from('binary_tree')
        .select('parent_id')
        .eq('user_id', newUser.id)
        .single();

      if (treeNode?.parent_id) {
        let currentParent = treeNode.parent_id;
        for (let i = 0; i < 10 && currentParent; i++) {
          await updatePairsAndCredit(currentParent);
          await checkAndAssignRanks(currentParent);
          const { data: parentNode } = await supabase
            .from('binary_tree')
            .select('parent_id')
            .eq('user_id', currentParent)
            .single();
          currentParent = parentNode?.parent_id;
        }
      }
    }

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
