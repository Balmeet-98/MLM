const supabase = require('../config/supabase');
const { countTeam } = require('../services/treeService');
const { getWalletBalance } = require('../services/walletService');
const { getPairInsights } = require('../services/pairInsightService');
const { getUserNotifications } = require('../services/notificationService');

const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { total, directChildren, activeLegs, leftCount, rightCount } = await countTeam(userId);

    const balance = await getWalletBalance(userId);

    const { data: pairsData } = await supabase
      .from('pairs')
      .select('total_pairs, active_leg_count, left_count, right_count, leg_counts')
      .eq('user_id', userId)
      .single();

    const { data: userRanks } = await supabase
      .from('user_ranks')
      .select('rank_id, achieved_at, ranks(name, rank_order)')
      .eq('user_id', userId)
      .order('ranks(rank_order)', { ascending: false })
      .limit(1);

    const currentRank = userRanks?.[0]?.ranks?.name || 'No Rank';

    const { data: incomeData } = await supabase
      .from('income_logs')
      .select('amount')
      .eq('user_id', userId);
    const totalIncome = incomeData?.reduce((sum, i) => sum + parseFloat(i.amount), 0) || 0;

    const { data: nextInstallment } = await supabase
      .from('installments')
      .select('month_number, due_date, status, amount')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('month_number', { ascending: true })
      .limit(1)
      .single();

    const { count: rewardsCount } = await supabase
      .from('user_rewards')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    const { data: recentTx } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    const pairInsights = await getPairInsights(userId);

    let notifications = [];
    let unreadCount = 0;
    try {
      const notifResult = await getUserNotifications(userId, { limit: 10 });
      notifications = notifResult.notifications;
      unreadCount = notifResult.unreadCount;
    } catch {
      // notifications table may not exist until migration is run
    }

    res.json({
      team: { total, directChildren, activeLegs, leftCount, rightCount },
      wallet: { balance },
      pairs: pairsData || { total_pairs: 0, active_leg_count: 0, left_count: 0, right_count: 0, leg_counts: [] },
      pairInsights,
      notifications,
      unreadNotificationCount: unreadCount,
      currentRank,
      totalIncome,
      rewardsCount: rewardsCount || 0,
      nextInstallment,
      recentTransactions: recentTx || [],
    });
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('id, name, email, phone, referral_code, role, is_active, created_at, group_id, consecutive_missed_installments, sponsor_id')
      .eq('id', req.user.id)
      .single();

    const { data: sponsor } = user?.sponsor_id ? await supabase
      .from('users')
      .select('name, referral_code')
      .eq('id', user.sponsor_id)
      .single() : { data: null };

    res.json({ user: { ...user, sponsor } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard, getProfile };
