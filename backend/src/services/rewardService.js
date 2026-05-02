const supabase = require('../config/supabase');

/**
 * Check if a user has crossed any new rank thresholds after a new pair is formed.
 * Auto-assigns rank and reward record.
 */
const checkAndAssignRanks = async (userId) => {
  // Get current pairs count
  const { data: pairsData } = await supabase
    .from('pairs')
    .select('total_pairs')
    .eq('user_id', userId)
    .single();

  if (!pairsData) return;
  const totalPairs = pairsData.total_pairs;

  // Verify user has at least 1 direct on left AND right (prerequisite for all ranks)
  const { data: treeNode } = await supabase
    .from('binary_tree')
    .select('left_child_id, right_child_id')
    .eq('user_id', userId)
    .single();

  if (!treeNode?.left_child_id || !treeNode?.right_child_id) return;

  // Check if left and right are DIRECT children (sponsored by this user)
  const { data: leftUser } = await supabase
    .from('users')
    .select('id, sponsor_id')
    .eq('id', treeNode.left_child_id)
    .single();

  const { data: rightUser } = await supabase
    .from('users')
    .select('id, sponsor_id')
    .eq('id', treeNode.right_child_id)
    .single();

  const hasDirectLeft = leftUser?.sponsor_id === userId;
  const hasDirectRight = rightUser?.sponsor_id === userId;

  if (!hasDirectLeft || !hasDirectRight) return;

  // Get all ranks the user hasn't achieved yet
  const { data: achievedRanks } = await supabase
    .from('user_ranks')
    .select('rank_id')
    .eq('user_id', userId);

  const achievedIds = new Set((achievedRanks || []).map(r => r.rank_id));

  // Get all ranks below or equal to current pairs
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

    // Create user_rank record
    await supabase.from('user_ranks').insert({
      user_id: userId,
      rank_id: rank.id,
      achieved_at: now.toISOString(),
      monthly_income_start: rank.monthly_income ? now.toISOString() : null,
      monthly_income_end: incomeEnd ? incomeEnd.toISOString() : null,
      status: rank.monthly_income ? 'active' : 'completed',
    });

    // Create reward record
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

/**
 * Run lucky draw for a group at a specific month.
 * Returns the winner(s) and their assigned rewards.
 */
const runLuckyDraw = async (groupId, monthNumber) => {
  // Get all fully compliant members in this group (100% installments paid)
  const { data: members } = await supabase
    .from('users')
    .select('id, name')
    .eq('group_id', groupId)
    .eq('is_active', true);

  if (!members || members.length === 0) {
    throw new Error('No active members in this group');
  }

  // Filter: all installments up to this month must be paid
  const eligibleMembers = [];
  for (const member of members) {
    const { data: installments } = await supabase
      .from('installments')
      .select('status')
      .eq('user_id', member.id)
      .eq('group_id', groupId)
      .lte('month_number', monthNumber);

    const allPaid = installments && installments.length >= monthNumber &&
      installments.every(i => i.status === 'paid');

    if (allPaid) eligibleMembers.push(member);
  }

  if (eligibleMembers.length === 0) {
    throw new Error('No fully compliant members eligible for draw');
  }

  // Get reward catalog for this month range
  const { data: rewards } = await supabase
    .from('reward_catalog')
    .select('*')
    .lte('month_range_start', monthNumber)
    .gte('month_range_end', monthNumber);

  if (!rewards || rewards.length === 0) {
    throw new Error('No rewards configured for month ' + monthNumber);
  }

  const winners = [];
  const now = new Date().toISOString();

  for (const reward of rewards) {
    const qty = reward.quantity_per_draw || 1;
    const pool = [...eligibleMembers];

    for (let i = 0; i < qty && pool.length > 0; i++) {
      // Random selection
      const idx = Math.floor(Math.random() * pool.length);
      const winner = pool.splice(idx, 1)[0];

      await supabase.from('lucky_draws').insert({
        group_id: groupId,
        month_number: monthNumber,
        winner_user_id: winner.id,
        reward_catalog_id: reward.id,
        drawn_at: now,
        status: 'drawn',
      });

      await supabase.from('user_rewards').insert({
        user_id: winner.id,
        reward_name: reward.reward_name,
        reward_type: 'lucky_draw',
        rank_id: null,
        status: 'pending_collection',
        achieved_at: now,
      });

      winners.push({ winner, reward: reward.reward_name });
    }
  }

  return { winners, eligibleCount: eligibleMembers.length };
};

module.exports = { checkAndAssignRanks, runLuckyDraw };
