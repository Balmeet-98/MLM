const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const supabase = require('../config/supabase');
const { signToken } = require('../utils/jwt');
const { placeInTree } = require('../services/binaryTreeService');
const { creditDirectIncome, updatePairsAndCredit } = require('../services/incomeService');
const { createInstallmentSchedule } = require('../services/installmentService');

const generateReferralCode = (name) => {
  const prefix = name.replace(/\s+/g, '').substring(0, 3).toUpperCase();
  const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}${suffix}`;
};

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, phone, sponsorCode, position } = req.body;

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

    // Determine group — join sponsor's group or find active group with space
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
      // Find any active group with space
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

    // Create user
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
        is_active: false, // Activated after product purchase
      })
      .select()
      .single();

    if (userErr) throw userErr;

    // Create wallet
    await supabase.from('wallets').insert({ user_id: newUser.id, balance: 0 });

    // Place in binary tree
    if (sponsorId) {
      await placeInTree(newUser.id, sponsorId, position || 'left');
    } else {
      // Root user (no sponsor) — just create tree node
      await supabase.from('binary_tree').insert({ user_id: newUser.id });
    }

    // Create installment schedule if group exists
    if (groupId) {
      await createInstallmentSchedule(newUser.id, groupId);
    }

    const token = signToken({ id: newUser.id, role: newUser.role });

    res.status(201).json({
      message: 'Registration successful. Purchase a product to activate your account.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        referralCode: newUser.referral_code,
        isActive: newUser.is_active,
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
        error: 'Account not activated. Please purchase a product to activate.',
        needsActivation: true,
        userId: user.id,
        token: signToken({ id: user.id, role: user.role }),
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
