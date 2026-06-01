const supabase = require('../config/supabase');
const { getDirectChildren } = require('./treeService');

/**
 * Check if a user has crossed any new rank thresholds after a new pair is formed.
 * Auto-assigns rank and reward record.
 */
const checkAndAssignRanks = async (userId) => {
  const { data: pairsData } = await supabase
    .from('pairs')
    .select('total_pairs')
    .eq('user_id', userId)
    .single();

  if (!pairsData) return;
  const totalPairs = pairsData.total_pairs;

  // Require at least 2 direct sponsored children in the tree
  const directChildIds = await getDirectChildren(userId);
  if (directChildIds.length < 2) return;

  const { data: directUsers } = await supabase
    .from('users')
    .select('id, sponsor_id')
    .in('id', directChildIds);

  const directSponsoredCount = (directUsers || []).filter(
    (u) => u.sponsor_id === userId
  ).length;

  if (directSponsoredCount < 2) return;

  const { data: achievedRanks } = await supabase
    .from('user_ranks')
    .select('rank_id')
    .eq('user_id', userId);

  const achievedIds = new Set((achievedRanks || []).map((r) => r.rank_id));

  const { data: eligibleRanks } = await supabase
    .from('ranks')
    .select('*')
    .lte('pairs_required', totalPairs)
    .order('rank_order', { ascending: true });

  if (!eligibleRanks) return;

  for (const rank of eligibleRanks) {
    if (achievedIds.has(rank.id)) continue;

    const now = new Date();
    let incomeEnd = null;
    if (rank.monthly_income && rank.income_duration_months) {
      incomeEnd = new Date(now);
      incomeEnd.setMonth(incomeEnd.getMonth() + rank.income_duration_months);
    }

    await supabase.from('user_ranks').insert({
      user_id: userId,
      rank_id: rank.id,
      achieved_at: now.toISOString(),
      monthly_income_start: rank.monthly_income ? now.toISOString() : null,
      monthly_income_end: incomeEnd ? incomeEnd.toISOString() : null,
      status: rank.monthly_income ? 'active' : 'completed',
    });

    await supabase.from('user_rewards').insert({
      user_id: userId,
      reward_name: rank.reward_name,
      reward_type: 'rank_milestone',
      rank_id: rank.id,
      status: 'pending_collection',
      achieved_at: now.toISOString(),
    });

    console.log(`[RANK] User ${userId} achieved rank: ${rank.name}`);
  }
};

module.exports = { checkAndAssignRanks };
