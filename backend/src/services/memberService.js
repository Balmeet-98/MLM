const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { placeInTree, createRootNode, walkParentChain } = require('./treeService');
const { creditDirectIncome, updatePairsAndCredit } = require('./incomeService');
const { createInstallmentSchedule } = require('./installmentService');
const { checkAndAssignRanks } = require('./rewardService');

const ACTIVATION_AMOUNT = 1200;

const generateReferralCode = (name) => {
  const prefix = name.replace(/\s+/g, '').substring(0, 3).toUpperCase();
  const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}${suffix}`;
};

const resolveGroupId = async (sponsorId) => {
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
  return groupId;
};

const runPostPlacementEffects = async (newUserId) => {
  await creditDirectIncome(newUserId);
  const parentChain = await walkParentChain(newUserId);
  for (const parentId of parentChain) {
    await updatePairsAndCredit(parentId);
    await checkAndAssignRanks(parentId);
  }
};

/**
 * Create an active member with wallet, tree, installments, and income effects.
 */
const createMember = async ({
  name,
  email,
  password,
  phone,
  sponsorId = null,
  parentUserId = null,
  paymentMode = 'manual',
  razorpay = null,
  markActivationPaid = true,
}) => {
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  if (paymentMode === 'razorpay') {
    if (!razorpay?.razorpay_payment_id || !razorpay?.razorpay_order_id) {
      const err = new Error('Razorpay payment details are required');
      err.status = 400;
      throw err;
    }
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('razorpay_payment_id', razorpay.razorpay_payment_id)
      .single();
    if (existingPayment) {
      const err = new Error('This payment has already been used for registration.');
      err.status = 409;
      throw err;
    }
  }

  const treeParentId = parentUserId || sponsorId;
  const groupId = await resolveGroupId(sponsorId);
  const passwordHash = await bcrypt.hash(password, 12);
  const referralCode = generateReferralCode(name);

  const { data: newUser, error: userErr } = await supabase
    .from('users')
    .insert({
      name,
      email,
      password_hash: passwordHash,
      phone: phone || null,
      referral_code: referralCode,
      sponsor_id: sponsorId,
      group_id: groupId,
      is_active: true,
    })
    .select()
    .single();

  if (userErr) throw userErr;

  if (paymentMode === 'razorpay') {
    await supabase.from('payments').insert({
      user_id: newUser.id,
      razorpay_order_id: razorpay.razorpay_order_id,
      razorpay_payment_id: razorpay.razorpay_payment_id,
      razorpay_signature: razorpay.razorpay_signature || null,
      amount: ACTIVATION_AMOUNT,
      status: 'captured',
    });
  } else {
    await supabase.from('payments').insert({
      user_id: newUser.id,
      razorpay_order_id: `admin-manual-${crypto.randomUUID()}`,
      razorpay_payment_id: null,
      razorpay_signature: null,
      amount: ACTIVATION_AMOUNT,
      status: 'captured',
    });
  }

  await supabase.from('wallets').insert({ user_id: newUser.id, balance: 0 });

  if (treeParentId) {
    await placeInTree(newUser.id, treeParentId);
  } else {
    await createRootNode(newUser.id);
  }

  if (groupId) {
    await createInstallmentSchedule(newUser.id, groupId);
    if (markActivationPaid) {
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
  }

  await runPostPlacementEffects(newUser.id);

  return newUser;
};

module.exports = {
  ACTIVATION_AMOUNT,
  generateReferralCode,
  resolveGroupId,
  createMember,
  runPostPlacementEffects,
};
