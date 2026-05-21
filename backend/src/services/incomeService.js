const supabase = require('../config/supabase');
const { creditWallet } = require('./walletService');
const { getAncestors, getDirectChildren, countSubtreeSize } = require('./treeService');

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
 * Update pair counts: floor(activeLegs / 2) where each direct child is a leg.
 */
const updatePairsAndCredit = async (parentUserId) => {
  const legs = await getDirectChildren(parentUserId);
  if (legs.length === 0) return 0;

  const legCounts = await Promise.all(
    legs.map(async (childId) => ({
      childId,
      count: await countSubtreeSize(childId),
    }))
  );

  const activeLegCount = legCounts.filter((l) => l.count > 0).length;
  const newPairs = Math.floor(activeLegCount / 2);

  const { data: existing } = await supabase
    .from('pairs')
    .select('total_pairs')
    .eq('user_id', parentUserId)
    .single();

  const previousPairs = existing ? existing.total_pairs : 0;
  const newlyFormedPairs = newPairs - previousPairs;

  const pairsPayload = {
    user_id: parentUserId,
    active_leg_count: activeLegCount,
    leg_counts: legCounts,
    total_pairs: newPairs,
    left_count: 0,
    right_count: 0,
    updated_at: new Date().toISOString(),
  };

  if (newlyFormedPairs > 0) {
    await supabase.from('pairs').upsert(pairsPayload, { onConflict: 'user_id' });

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
    await supabase.from('pairs').upsert(pairsPayload, { onConflict: 'user_id' });
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

module.exports = {
  creditDirectIncome,
  updatePairsAndCredit,
  creditInstallmentIncome,
  creditMonthlyRankIncome,
};
