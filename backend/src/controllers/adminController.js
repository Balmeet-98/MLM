const supabase = require('../config/supabase');
const { createMember } = require('../services/memberService');
const { validateTreeParent } = require('../services/treeService');
const { debitWallet } = require('../services/walletService');
const { createNotification } = require('../services/notificationService');
const { getPairInsights } = require('../services/pairInsightService');

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

const getUserOptions = async (req, res, next) => {
  try {
    const { data: users } = await supabase
      .from('users')
      .select('id, name, email, referral_code, is_active, role')
      .eq('role', 'user')
      .order('name', { ascending: true });

    res.json({
      users: (users || []).map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        referral_code: u.referral_code,
        is_active: u.is_active,
      })),
    });
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      sponsorId,
      parentUserId,
      markActivationPaid = true,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }
    if (!sponsorId) {
      return res.status(400).json({ error: 'sponsorId is required' });
    }

    const { data: sponsor } = await supabase
      .from('users')
      .select('id, is_active, role')
      .eq('id', sponsorId)
      .single();

    if (!sponsor) return res.status(404).json({ error: 'Sponsor not found' });
    if (!sponsor.is_active && sponsor.role !== 'admin') {
      return res.status(400).json({ error: 'Sponsor must be an active member' });
    }

    const treeParentId = parentUserId || sponsorId;

    const { data: parent } = await supabase
      .from('users')
      .select('id, is_active, role')
      .eq('id', treeParentId)
      .single();

    if (!parent) return res.status(404).json({ error: 'Tree parent not found' });
    if (!parent.is_active && parent.role !== 'admin') {
      return res.status(400).json({ error: 'Tree parent must be an active member' });
    }

    try {
      await validateTreeParent(null, treeParentId);
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    const newUser = await createMember({
      name,
      email,
      password,
      phone,
      sponsorId,
      parentUserId: treeParentId,
      paymentMode: 'manual',
      markActivationPaid: markActivationPaid !== false,
    });

    res.status(201).json({
      message: 'Member created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        referralCode: newUser.referral_code,
        sponsorId: newUser.sponsor_id,
        isActive: newUser.is_active,
      },
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
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

// ── WITHDRAWALS ────────────────────────────────────────────
const getPendingWithdrawals = async (req, res, next) => {
  try {
    const status = req.query.status || 'pending';
    let query = supabase
      .from('withdrawals')
      .select('*, users(name, email, phone)');

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (status === 'pending') {
      query = query.order('requested_at', { ascending: true });
    } else {
      query = query.order('processed_at', { ascending: false, nullsFirst: false });
    }

    const { data: withdrawals } = await query;
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

    try {
      await createNotification({
        userId: withdrawal.user_id,
        type: 'withdrawal_approved',
        title: 'Withdrawal approved',
        message: `Your withdrawal of ₹${Number(withdrawal.amount).toLocaleString('en-IN')} has been approved and processed.`,
        meta: { withdrawalId: id, amount: withdrawal.amount },
      });
    } catch (notifErr) {
      console.error('Withdrawal notification error:', notifErr.message);
    }

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

const getPairsOverview = async (req, res, next) => {
  try {
    const { search, limit = 50 } = req.query;

    let userQuery = supabase
      .from('users')
      .select('id, name, email, referral_code, is_active')
      .eq('role', 'user')
      .order('created_at', { ascending: false })
      .limit(Math.min(parseInt(limit, 10) || 50, 100));

    if (search) userQuery = userQuery.ilike('name', `%${search}%`);

    const { data: users } = await userQuery;
    if (!users?.length) return res.json({ members: [] });

    const userIds = users.map((u) => u.id);
    const { data: pairsRows } = await supabase
      .from('pairs')
      .select('user_id, total_pairs, active_leg_count, left_count, right_count, leg_counts, updated_at')
      .in('user_id', userIds);

    const pairsByUser = Object.fromEntries((pairsRows || []).map((p) => [p.user_id, p]));

    const members = await Promise.all(
      users.map(async (u) => {
        const pairRow = pairsByUser[u.id];
        const insights = await getPairInsights(u.id);
        const topAlert = insights.notifications.find((n) => n.priority !== 'info') || insights.notifications[0];
        return {
          userId: u.id,
          name: u.name,
          email: u.email,
          referralCode: u.referral_code,
          isActive: u.is_active,
          totalPairs: pairRow?.total_pairs ?? insights.totalPairs,
          activeLegCount: pairRow?.active_leg_count ?? insights.activeLegCount,
          leftCount: pairRow?.left_count ?? 0,
          rightCount: pairRow?.right_count ?? 0,
          legCounts: pairRow?.leg_counts ?? insights.legCounts,
          updatedAt: pairRow?.updated_at,
          nextRank: insights.nextRank,
          topAlert,
          notifications: insights.notifications.slice(0, 4),
        };
      })
    );

    members.sort((a, b) => b.totalPairs - a.totalPairs);
    res.json({ members });
  } catch (err) {
    next(err);
  }
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
  getAllUsers, blockUser, unblockUser, getUserOptions, createUser,
  createProduct, updateProduct, getAllProducts,
  getPendingWithdrawals, approveWithdrawal, rejectWithdrawal,
  markRewardCollected, getPendingRewards,
  getIncomeLogs, getStats, getPairsOverview,
};
