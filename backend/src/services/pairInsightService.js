const supabase = require('../config/supabase');
const { countTeam } = require('./treeService');

const calculatePairsFromActiveLegs = (activeLegsList) => {
  let total = 0;
  for (let i = 0; i + 1 < activeLegsList.length; i += 2) {
    total += Math.min(activeLegsList[i].count, activeLegsList[i + 1].count);
  }
  return total;
};

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, info: 3 };

/**
 * Motivational pair notifications — computed live from tree leg volumes.
 */
const getPairInsights = async (userId) => {
  const { legCounts: rawLegs, directChildren, activeLegs } = await countTeam(userId);

  const legCounts = (rawLegs || []).map((l, i) => ({
    ...l,
    legLabel: `Leg ${i + 1}`,
    isActive: l.count > 1,
  }));

  const activeLegsList = legCounts.filter((l) => l.isActive);
  const totalPairs = calculatePairsFromActiveLegs(activeLegsList);

  const { data: ranks } = await supabase
    .from('ranks')
    .select('name, pairs_required, reward_name, rank_order')
    .order('pairs_required', { ascending: true });

  const nextRank = ranks?.find((r) => r.pairs_required > totalPairs) || null;
  const pairsToNextRank = nextRank ? nextRank.pairs_required - totalPairs : 0;

  const notifications = [];

  notifications.push({
    type: 'pair_status',
    priority: 'info',
    title: `${totalPairs} pair${totalPairs === 1 ? '' : 's'} right now`,
    message:
      activeLegsList.length >= 2
        ? `${activeLegsList.length} active legs · sizes ${activeLegsList.map((l) => l.count).join(' & ')} — each matched pair adds the smaller leg size.`
        : activeLegsList.length === 1
          ? `Leg 1 has ${activeLegsList[0].count} members. You need a 2nd active leg (direct + their team) before pairs count.`
          : directChildren === 0
            ? 'No directs yet — share your referral code to start building legs.'
            : `${directChildren} direct(s) — help them sponsor members so legs become active (2+ in each subtree).`,
  });

  if (nextRank && pairsToNextRank > 0 && pairsToNextRank <= 15) {
    notifications.push({
      type: 'rank_close',
      priority: pairsToNextRank <= 3 ? 'urgent' : 'high',
      title: `${pairsToNextRank} pair${pairsToNextRank === 1 ? '' : 's'} to ${nextRank.name}`,
      message: `You have ${totalPairs} pairs — reach ${nextRank.pairs_required} for ${nextRank.reward_name}.`,
      meta: {
        rankName: nextRank.name,
        pairsRequired: nextRank.pairs_required,
        pairsRemaining: pairsToNextRank,
      },
    });
  }

  if (activeLegsList.length >= 2) {
    const weakerIdx = activeLegsList[0].count <= activeLegsList[1].count ? 0 : 1;
    const stronger = activeLegsList[weakerIdx === 0 ? 1 : 0];
    const weaker = activeLegsList[weakerIdx];

    const boosted = activeLegsList.map((leg, i) =>
      i === weakerIdx ? { ...leg, count: leg.count + 1 } : leg
    );
    const projectedOneJoin = calculatePairsFromActiveLegs(boosted);

    if (projectedOneJoin > totalPairs) {
      const gain = projectedOneJoin - totalPairs;
      const hitsRank =
        nextRank && projectedOneJoin >= nextRank.pairs_required
          ? ` — ${nextRank.name} rank unlocked!`
          : '';
      notifications.push({
        type: 'one_more_join',
        priority: 'urgent',
        title: `+${gain} pair${gain === 1 ? '' : 's'} if 1 more joins`,
        message: `One new member under ${weaker.legLabel} (${weaker.count} → ${weaker.count + 1}) takes you from ${totalPairs} to ${projectedOneJoin} pairs${hitsRank}`,
        meta: {
          currentPairs: totalPairs,
          projectedPairs: projectedOneJoin,
          gain,
          legLabel: weaker.legLabel,
        },
      });
    }

    if (weaker.count < stronger.count) {
      const balanced = activeLegsList.map((leg, i) =>
        i === weakerIdx ? { ...leg, count: stronger.count } : leg
      );
      const projectedBalanced = calculatePairsFromActiveLegs(balanced);
      const gain = projectedBalanced - totalPairs;
      if (gain > 0) {
        notifications.push({
          type: 'grow_leg',
          priority: 'high',
          title: `Up to +${gain} pairs on ${weaker.legLabel}`,
          message: `${weaker.legLabel}: ${weaker.count} members · ${stronger.legLabel}: ${stronger.count}. Balance the legs → ${projectedBalanced} pairs total.`,
          meta: {
            currentPairs: totalPairs,
            projectedPairs: projectedBalanced,
            gain,
            weakerLeg: weaker.legLabel,
            strongerLeg: stronger.legLabel,
          },
        });
      }
    }
  }

  if (activeLegsList.length === 1) {
    const withSecondLeg = [...legCounts, { childId: 'new', count: 2, legLabel: 'New leg', isActive: true }];
    const projected = calculatePairsFromActiveLegs(withSecondLeg.filter((l) => l.isActive));
    notifications.push({
      type: 'need_second_leg',
      priority: 'high',
      title: 'Sponsor 1 more direct with a team',
      message: `Your only active leg has ${activeLegsList[0].count} members. A 2nd direct who builds depth can start pairing — e.g. two legs of 3 each = 3 pairs.`,
      meta: { projectedPairs: projected, currentPairs: totalPairs },
    });
  }

  if (activeLegsList.length >= 3 && activeLegsList.length % 2 === 1) {
    const extra = [...activeLegsList, { count: 2, legLabel: `Leg ${activeLegsList.length + 1}` }];
    const projected = calculatePairsFromActiveLegs(extra);
    notifications.push({
      type: 'unlock_next_pair',
      priority: 'medium',
      title: 'Unlock your next leg match',
      message: `${activeLegsList.length} active legs — the ${activeLegsList.length}th has no pair yet. One more active direct could add up to ${projected - totalPairs} more pairs.`,
      meta: { projectedPairs: projected },
    });
  }

  const inactiveCount = legCounts.filter((l) => l.count === 1).length;
  if (inactiveCount > 0 && activeLegsList.length < 2) {
    notifications.push({
      type: 'activate_legs',
      priority: 'medium',
      title: `${inactiveCount} direct${inactiveCount === 1 ? '' : 's'} need depth`,
      message:
        'Each direct needs at least 1 person under them (2+ in subtree) to become an active leg and count toward pairs.',
    });
  }

  notifications.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  return {
    totalPairs,
    activeLegCount: activeLegsList.length,
    directChildren,
    legCounts,
    nextRank: nextRank
      ? {
          name: nextRank.name,
          pairsRequired: nextRank.pairs_required,
          rewardName: nextRank.reward_name,
          pairsRemaining: pairsToNextRank,
        }
      : null,
    notifications,
  };
};

module.exports = { getPairInsights, calculatePairsFromActiveLegs };
