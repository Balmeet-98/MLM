const supabase = require('../config/supabase');
const { runLuckyDraw } = require('../services/rewardService');
const { debitWallet } = require('../services/walletService');

// ── USERS ──────────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select('id, name, email, phone, referral_code, role, is_active, created_at, consecutive_missed_installments, sponsor_id', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (search) query = query.ilike('name', `%${search}%`);
    if (status === 'active') query = query.eq('is_active', true);
    if (status === 'inactive') query = query.eq('is_active', false);

    const { data: users, count } = await query;
    res.json({ users: users || [], total: count, page: parseInt(page) });
  } catch (err) { next(err); }
};

const blockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    await supabase.from('users').update({ is_active: false }).eq('id', id);
    res.json({ message: 'User blocked successfully' });
  } catch (err) { next(err); }
};

const unblockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await supabase.from('users').update({ is_active: true, consecutive_missed_installments: 0 }).eq('id', id);
    res.json({ message: 'User unblocked successfully' });
  } catch (err) { next(err); }
};

// ── PRODUCTS ───────────────────────────────────────────────
const createProduct = async (req, res, next) => {
  try {
    const { name, price, tier, category, imageUrl } = req.body;
    const { data: product, error } = await supabase
      .from('products')
      .insert({ name, price: parseFloat(price), tier, category, image_url: imageUrl })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ product });
  } catch (err) { next(err); }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, tier, category, isActive } = req.body;
    const { data: product } = await supabase
      .from('products')
      .update({ name, price: parseFloat(price), tier, category, is_active: isActive })
      .eq('id', id)
      .select()
      .single();
    res.json({ product });
  } catch (err) { next(err); }
};

const getAllProducts = async (req, res, next) => {
  try {
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .order('tier', { ascending: true });
    res.json({ products: products || [] });
  } catch (err) { next(err); }
};

// ── GROUPS ─────────────────────────────────────────────────
const createGroup = async (req, res, next) => {
  try {
    const { name } = req.body;
    const { data: group, error } = await supabase
      .from('groups')
      .insert({ name })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ group });
  } catch (err) { next(err); }
};

const getGroups = async (req, res, next) => {
  try {
    const { data: groups } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false });

    // Count members per group
    const groupsWithCount = await Promise.all((groups || []).map(async (g) => {
      const { count } = await supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('group_id', g.id);
      return { ...g, memberCount: count || 0 };
    }));

    res.json({ groups: groupsWithCount });
  } catch (err) { next(err); }
};

// ── WITHDRAWALS ────────────────────────────────────────────
const getPendingWithdrawals = async (req, res, next) => {
  try {
    const { data: withdrawals } = await supabase
      .from('withdrawals')
      .select('*, users(name, email, phone)')
      .eq('status', 'pending')
      .order('requested_at', { ascending: true });
    res.json({ withdrawals: withdrawals || [] });
  } catch (err) { next(err); }
};

const approveWithdrawal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: withdrawal } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('id', id)
      .single();

    if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });
    if (withdrawal.status !== 'pending') return res.status(400).json({ error: 'Already processed' });

    await debitWallet(withdrawal.user_id, withdrawal.amount, 'Withdrawal approved', id);
    await supabase
      .from('withdrawals')
      .update({ status: 'approved', processed_at: new Date().toISOString() })
      .eq('id', id);

    res.json({ message: 'Withdrawal approved and wallet debited' });
  } catch (err) { next(err); }
};

const rejectWithdrawal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;
    await supabase
      .from('withdrawals')
      .update({ status: 'rejected', admin_note: adminNote, processed_at: new Date().toISOString() })
      .eq('id', id);
    res.json({ message: 'Withdrawal rejected' });
  } catch (err) { next(err); }
};

// ── LUCKY DRAW ─────────────────────────────────────────────
const triggerLuckyDraw = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { monthNumber } = req.body;
    if (!monthNumber) return res.status(400).json({ error: 'monthNumber is required' });

    const result = await runLuckyDraw(groupId, parseInt(monthNumber));
    res.json({ message: 'Lucky draw completed', ...result });
  } catch (err) { next(err); }
};

const getLuckyDrawHistory = async (req, res, next) => {
  try {
    const { data: draws } = await supabase
      .from('lucky_draws')
      .select('*, users:winner_user_id(name, referral_code), reward_catalog(*)')
      .order('drawn_at', { ascending: false });
    res.json({ draws: draws || [] });
  } catch (err) { next(err); }
};

// ── REWARDS COLLECTION ─────────────────────────────────────
const markRewardCollected = async (req, res, next) => {
  try {
    const { id } = req.params;
    await supabase
      .from('user_rewards')
      .update({ status: 'collected', id_proof_verified: true, collected_at: new Date().toISOString() })
      .eq('id', id);
    res.json({ message: 'Reward marked as collected' });
  } catch (err) { next(err); }
};

const getPendingRewards = async (req, res, next) => {
  try {
    const { data: rewards } = await supabase
      .from('user_rewards')
      .select('*, users(name, phone, email, referral_code)')
      .eq('status', 'pending_collection')
      .order('achieved_at', { ascending: true });
    res.json({ rewards: rewards || [] });
  } catch (err) { next(err); }
};

// ── INCOME MONITOR ─────────────────────────────────────────
const getIncomeLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 30, type } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('income_logs')
      .select('*, users:user_id(name, referral_code), from_user:from_user_id(name, referral_code)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (type) query = query.eq('income_type', type);
    const { data: logs, count } = await query;
    res.json({ logs: logs || [], total: count });
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    const { count: totalUsers } = await supabase.from('users').select('id', { count: 'exact' }).eq('role', 'user');
    const { count: activeUsers } = await supabase.from('users').select('id', { count: 'exact' }).eq('is_active', true).eq('role', 'user');
    const { count: pendingWithdrawals } = await supabase.from('withdrawals').select('id', { count: 'exact' }).eq('status', 'pending');
    const { count: pendingRewards } = await supabase.from('user_rewards').select('id', { count: 'exact' }).eq('status', 'pending_collection');
    const { data: totalIncomeData } = await supabase.from('income_logs').select('amount');
    const totalIncomePaid = totalIncomeData?.reduce((sum, i) => sum + parseFloat(i.amount), 0) || 0;

    res.json({ totalUsers: totalUsers || 0, activeUsers: activeUsers || 0, pendingWithdrawals: pendingWithdrawals || 0, pendingRewards: pendingRewards || 0, totalIncomePaid });
  } catch (err) { next(err); }
};

module.exports = {
  getAllUsers, blockUser, unblockUser,
  createProduct, updateProduct, getAllProducts,
  createGroup, getGroups,
  getPendingWithdrawals, approveWithdrawal, rejectWithdrawal,
  triggerLuckyDraw, getLuckyDrawHistory,
  markRewardCollected, getPendingRewards,
  getIncomeLogs, getStats,
};
