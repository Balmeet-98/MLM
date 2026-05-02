const supabase = require('../config/supabase');

const getMyRewards = async (req, res, next) => {
  try {
    const { data: rewards } = await supabase
      .from('user_rewards')
      .select('*, ranks(name, pairs_required)')
      .eq('user_id', req.user.id)
      .order('achieved_at', { ascending: false });

    const { data: pairsData } = await supabase
      .from('pairs')
      .select('total_pairs')
      .eq('user_id', req.user.id)
      .single();

    const { data: allRanks } = await supabase
      .from('ranks')
      .select('*')
      .order('rank_order', { ascending: true });

    const { data: myRanks } = await supabase
      .from('user_ranks')
      .select('rank_id, achieved_at, monthly_income_start, monthly_income_end, status')
      .eq('user_id', req.user.id);

    const achievedRankIds = new Set((myRanks || []).map(r => r.rank_id));

    const ranksProgress = (allRanks || []).map(rank => ({
      ...rank,
      achieved: achievedRankIds.has(rank.id),
      achievedAt: myRanks?.find(r => r.rank_id === rank.id)?.achieved_at,
    }));

    res.json({
      rewards: rewards || [],
      totalPairs: pairsData?.total_pairs || 0,
      ranksProgress,
    });
  } catch (err) {
    next(err);
  }
};

const getMyRanks = async (req, res, next) => {
  try {
    const { data: userRanks } = await supabase
      .from('user_ranks')
      .select('*, ranks(*)')
      .eq('user_id', req.user.id)
      .order('achieved_at', { ascending: false });

    res.json({ ranks: userRanks || [] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyRewards, getMyRanks };
