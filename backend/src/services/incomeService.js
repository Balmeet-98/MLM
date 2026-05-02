const supabase = require('../config/supabase');
const { creditWallet } = require('./walletService');
const { getAncestors } = require('./binaryTreeService');

const DIRECT_INCOME = { 1: 400, 2: 200, 3: 100 };
const PAIR_INCOME = 50; // Rs.50 per pair formed

/**
 * Credit direct income to sponsors (L1, L2, L3) when a new member activates.
 */
const creditDirectIncome = async (newUserId) => {
  const ancestors = await getAncestors(newUserId, 3);

  for (const { userId: sponsorId, level } of ancestors) {
    const amount = DIRECT_INCOME[level];
    if (!amount) continue;

    await creditWallet(
      sponsorId,
      amount,
      `Direct income (Level ${level}) from new member`,
      newUserId
    );

    await supabase.from('income_logs').insert({
      user_id: sponsorId,
      income_type: 'direct',
      amount,
      from_user_id: newUserId,
      level,
    });
  }
};

/**
 * Update pair counts for a user when their left or right side gets a new member.
 * Called after every new member placement.
 */
const updatePairsAndCredit = async (parentUserId) => {
  const { data: treeNode } = await supabase
    .from('binary_tree')
    .select('left_child_id, right_child_id')
    .eq('user_id', parentUserId)
    .single();

  if (!treeNode) return;

  const leftCount = treeNode.left_child_id
    ? await countSubtreeSize(treeNode.left_child_id)
    : 0;
  const rightCount = treeNode.right_child_id
    ? await countSubtreeSize(treeNode.right_child_id)
    : 0;

  const newPairs = Math.min(leftCount, rightCount);

  // Get current pairs record
  const { data: existing } = await supabase
    .from('pairs')
    .select('total_pairs')
    .eq('user_id', parentUserId)
    .single();

  const previousPairs = existing ? existing.total_pairs : 0;
  const newlyFormedPairs = newPairs - previousPairs;

  if (newlyFormedPairs > 0) {
    // Upsert pairs record
    await supabase.from('pairs').upsert({
      user_id: parentUserId,
      left_count: leftCount,
      right_count: rightCount,
      total_pairs: newPairs,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    // Credit pair income
    const pairIncomeAmount = newlyFormedPairs * PAIR_INCOME;
    await creditWallet(
      parentUserId,
      pairIncomeAmount,
      `Pair income: ${newlyFormedPairs} new pair(s)`,
      null
    );

    await supabase.from('income_logs').insert({
      user_id: parentUserId,
      income_type: 'pair',
      amount: pairIncomeAmount,
      from_user_id: null,
      level: null,
    });
  } else {
    // Just update counts even if no new pairs
    await supabase.from('pairs').upsert({
      user_id: parentUserId,
      left_count: leftCount,
      right_count: rightCount,
      total_pairs: newPairs,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  }

  return newPairs;
};

/**
 * Credit installment income (Rs.100) to direct sponsor when member pays installment.
 */
const creditInstallmentIncome = async (memberId) => {
  const { data: member } = await supabase
    .from('users')
    .select('sponsor_id')
    .eq('id', memberId)
    .single();

  if (!member || !member.sponsor_id) return;

  await creditWallet(
    member.sponsor_id,
    100,
    'Installment income from direct referral',
    memberId
  );

  await supabase.from('income_logs').insert({
    user_id: member.sponsor_id,
    income_type: 'installment',
    amount: 100,
    from_user_id: memberId,
    level: 1,
  });
};

/**
 * Credit monthly rank income for all active rank income holders.
 * Called by cron job on 1st of every month.
 */
const creditMonthlyRankIncome = async () => {
  const now = new Date();
  const { data: activeRankIncomes } = await supabase
    .from('user_ranks')
    .select('user_id, rank_id, monthly_income_end, ranks(monthly_income, name)')
    .eq('status', 'active')
    .lte('monthly_income_start', now.toISOString())
    .gte('monthly_income_end', now.toISOString());

  if (!activeRankIncomes) return;

  for (const record of activeRankIncomes) {
    if (!record.ranks?.monthly_income) continue;

    await creditWallet(
      record.user_id,
      record.ranks.monthly_income,
      `Monthly rank income: ${record.ranks.name}`,
      null
    );

    await supabase.from('income_logs').insert({
      user_id: record.user_id,
      income_type: 'rank',
      amount: record.ranks.monthly_income,
      from_user_id: null,
      level: null,
    });

    // Check if income period has ended
    if (new Date(record.monthly_income_end) <= now) {
      await supabase
        .from('user_ranks')
        .update({ status: 'completed' })
        .eq('user_id', record.user_id)
        .eq('rank_id', record.rank_id);
    }
  }

  console.log(`[CRON] Credited monthly rank income to ${activeRankIncomes.length} members`);
};

const countSubtreeSize = async (rootId) => {
  let count = 0;
  const queue = [rootId];
  while (queue.length > 0) {
    const id = queue.shift();
    count++;
    const { data } = await supabase
      .from('binary_tree')
      .select('left_child_id, right_child_id')
      .eq('user_id', id)
      .single();
    if (data) {
      if (data.left_child_id) queue.push(data.left_child_id);
      if (data.right_child_id) queue.push(data.right_child_id);
    }
  }
  return count;
};

module.exports = {
  creditDirectIncome,
  updatePairsAndCredit,
  creditInstallmentIncome,
  creditMonthlyRankIncome,
};
