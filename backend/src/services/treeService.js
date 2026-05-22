const supabase = require('../config/supabase');

/**
 * Place a new user directly under their sponsor (unlimited width).
 */
const placeInTree = async (newUserId, sponsorId) => {
  const { data: sponsorNode } = await supabase
    .from('tree_nodes')
    .select('user_id')
    .eq('user_id', sponsorId)
    .single();

  if (!sponsorNode) {
    await supabase.from('tree_nodes').insert({ user_id: sponsorId });
  }

  await supabase.from('tree_edges').insert({
    parent_user_id: sponsorId,
    child_user_id: newUserId,
  });

  await supabase.from('tree_nodes').insert({
    user_id: newUserId,
    parent_id: sponsorId,
  });

  return sponsorId;
};

/**
 * Create a root tree node (no parent, no edge).
 */
const createRootNode = async (userId) => {
  await supabase.from('tree_nodes').insert({ user_id: userId });
};

const getDirectChildren = async (userId) => {
  const { data: edges } = await supabase
    .from('tree_edges')
    .select('child_user_id')
    .eq('parent_user_id', userId)
    .order('created_at', { ascending: true });

  return (edges || []).map((e) => e.child_user_id);
};

const buildChildrenMap = (edges) => {
  const map = {};
  if (edges) {
    edges.forEach((e) => {
      if (!map[e.parent_user_id]) map[e.parent_user_id] = [];
      map[e.parent_user_id].push(e.child_user_id);
    });
  }
  return map;
};

/**
 * Count all members in a subtree (including root).
 */
const countSubtreeSize = async (rootId, childrenMap = null) => {
  if (!childrenMap) {
    const { data: allEdges } = await supabase
      .from('tree_edges')
      .select('parent_user_id, child_user_id');
    childrenMap = buildChildrenMap(allEdges);
  }

  let count = 0;
  const queue = [rootId];
  while (queue.length > 0) {
    const id = queue.shift();
    count++;
    const children = childrenMap[id] || [];
    queue.push(...children);
  }
  return count;
};

/**
 * Get full subtree rooted at userId (for visualization).
 */
const getSubtree = async (rootUserId) => {
  const { data: allEdges } = await supabase
    .from('tree_edges')
    .select('parent_user_id, child_user_id, created_at')
    .order('created_at', { ascending: true });

  const { data: allUsers } = await supabase
    .from('users')
    .select('id, name, referral_code, is_active');

  const userMap = {};
  if (allUsers) allUsers.forEach((u) => { userMap[u.id] = u; });

  const childrenMap = buildChildrenMap(allEdges);

  const buildNode = (userId) => {
    if (!userId) return null;
    const user = userMap[userId];
    if (!user) return null;

    const childIds = childrenMap[userId] || [];
    const children = childIds
      .map((id) => buildNode(id))
      .filter(Boolean);

    return {
      name: user.name,
      attributes: {
        id: userId,
        referralCode: user.referral_code,
        active: user.is_active,
      },
      children,
    };
  };

  return buildNode(rootUserId);
};

/**
 * Team stats for dashboard.
 */
const countTeam = async (userId) => {
  const { data: allEdges } = await supabase
    .from('tree_edges')
    .select('parent_user_id, child_user_id');

  const childrenMap = buildChildrenMap(allEdges);
  const directChildren = childrenMap[userId] || [];

  let total = 0;
  for (const childId of directChildren) {
    total += await countSubtreeSize(childId, childrenMap);
  }

  const legCounts = await Promise.all(
    directChildren.map(async (childId) => ({
      childId,
      count: await countSubtreeSize(childId, childrenMap),
    }))
  );
  const activeLegs = legCounts.filter((l) => l.count > 1).length;
  const leftCount = legCounts[0]?.count || 0;
  const rightCount = legCounts[1]?.count || 0;

  return {
    total,
    directChildren: directChildren.length,
    activeLegs,
    leftCount,
    rightCount,
    legCounts,
  };
};

/**
 * Get ancestor user IDs up to maxLevels above a given user.
 */
const getAncestors = async (userId, maxLevels = 3) => {
  const ancestors = [];
  let currentId = userId;

  for (let i = 0; i < maxLevels; i++) {
    const { data: node } = await supabase
      .from('tree_nodes')
      .select('parent_id')
      .eq('user_id', currentId)
      .single();

    if (!node || !node.parent_id) break;
    ancestors.push({ userId: node.parent_id, level: i + 1 });
    currentId = node.parent_id;
  }

  return ancestors;
};

/**
 * Walk parent chain for pair/rank updates (up to maxLevels).
 */
const walkParentChain = async (userId, maxLevels = 10) => {
  const chain = [];
  let currentId = userId;

  for (let i = 0; i < maxLevels; i++) {
    const { data: node } = await supabase
      .from('tree_nodes')
      .select('parent_id')
      .eq('user_id', currentId)
      .single();

    if (!node?.parent_id) break;
    chain.push(node.parent_id);
    currentId = node.parent_id;
  }

  return chain;
};

module.exports = {
  placeInTree,
  createRootNode,
  getDirectChildren,
  getSubtree,
  countTeam,
  countSubtreeSize,
  getAncestors,
  walkParentChain,
  buildChildrenMap,
};
