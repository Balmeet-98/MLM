const supabase = require('../config/supabase');

/**
 * Place a new user in the binary tree under their sponsor.
 * If the chosen position (left/right) is taken, BFS to find the next available slot.
 */
const placeInTree = async (newUserId, sponsorId, preferredPosition) => {
  // Get sponsor's tree node
  const { data: sponsorNode } = await supabase
    .from('binary_tree')
    .select('*')
    .eq('user_id', sponsorId)
    .single();

  if (!sponsorNode) {
    // Sponsor has no tree node yet (shouldn't happen, but create one)
    await supabase.from('binary_tree').insert({ user_id: sponsorId });
  }

  // Try to place at preferred position under sponsor first
  const placedParentId = await bfsPlace(sponsorId, preferredPosition, newUserId);
  return placedParentId;
};

/**
 * BFS from sponsorId, find next available slot at preferred side.
 * Falls back to any available slot.
 */
const bfsPlace = async (startUserId, preferredSide, newUserId) => {
  const queue = [startUserId];

  while (queue.length > 0) {
    const currentId = queue.shift();

    const { data: node } = await supabase
      .from('binary_tree')
      .select('*')
      .eq('user_id', currentId)
      .single();

    if (!node) continue;

    // Try preferred side first on the first node (sponsor)
    if (currentId === startUserId) {
      if (preferredSide === 'left' && !node.left_child_id) {
        await attachChild(currentId, newUserId, 'left');
        return currentId;
      }
      if (preferredSide === 'right' && !node.right_child_id) {
        await attachChild(currentId, newUserId, 'right');
        return currentId;
      }
    }

    // For deeper nodes, fill left first then right (standard BFS)
    if (!node.left_child_id) {
      await attachChild(currentId, newUserId, 'left');
      return currentId;
    }
    if (!node.right_child_id) {
      await attachChild(currentId, newUserId, 'right');
      return currentId;
    }

    // Both slots taken, add children to queue
    if (node.left_child_id) queue.push(node.left_child_id);
    if (node.right_child_id) queue.push(node.right_child_id);
  }

  throw new Error('No available position found in tree');
};

const attachChild = async (parentId, childId, side) => {
  // Update parent node
  const updateField = side === 'left' ? 'left_child_id' : 'right_child_id';
  await supabase
    .from('binary_tree')
    .update({ [updateField]: childId })
    .eq('user_id', parentId);

  // Create child node
  await supabase.from('binary_tree').insert({
    user_id: childId,
    parent_id: parentId,
  });
};

/**
 * Get full subtree rooted at userId (for visualization).
 * Returns a nested object suitable for react-d3-tree.
 */
const getSubtree = async (rootUserId) => {
  // Fetch all tree nodes in one query for efficiency
  const { data: allNodes } = await supabase
    .from('binary_tree')
    .select('user_id, parent_id, left_child_id, right_child_id');

  const { data: allUsers } = await supabase
    .from('users')
    .select('id, name, referral_code, is_active, role')
    .select('id, name, referral_code, is_active');

  const userMap = {};
  if (allUsers) allUsers.forEach(u => { userMap[u.id] = u; });

  const nodeMap = {};
  if (allNodes) allNodes.forEach(n => { nodeMap[n.user_id] = n; });

  const buildNode = (userId) => {
    if (!userId) return null;
    const node = nodeMap[userId];
    const user = userMap[userId];
    if (!node) return null;

    return {
      name: user ? user.name : 'Unknown',
      attributes: {
        id: userId,
        referralCode: user ? user.referral_code : '',
        active: user ? user.is_active : false,
      },
      children: [
        node.left_child_id ? buildNode(node.left_child_id) : { name: 'Empty', attributes: { empty: true, side: 'L' }, children: [] },
        node.right_child_id ? buildNode(node.right_child_id) : { name: 'Empty', attributes: { empty: true, side: 'R' }, children: [] },
      ].filter(Boolean),
    };
  };

  return buildNode(rootUserId);
};

/**
 * Count total left and right team members under a user.
 */
const countTeam = async (userId) => {
  const { data: node } = await supabase
    .from('binary_tree')
    .select('left_child_id, right_child_id')
    .eq('user_id', userId)
    .single();

  if (!node) return { leftCount: 0, rightCount: 0, total: 0 };

  const leftCount = node.left_child_id ? await countDescendants(node.left_child_id) : 0;
  const rightCount = node.right_child_id ? await countDescendants(node.right_child_id) : 0;

  return { leftCount, rightCount, total: leftCount + rightCount };
};

const countDescendants = async (rootId) => {
  let count = 0;
  const queue = [rootId];
  while (queue.length > 0) {
    const id = queue.shift();
    count++;
    const { data: node } = await supabase
      .from('binary_tree')
      .select('left_child_id, right_child_id')
      .eq('user_id', id)
      .single();
    if (node) {
      if (node.left_child_id) queue.push(node.left_child_id);
      if (node.right_child_id) queue.push(node.right_child_id);
    }
  }
  return count;
};

/**
 * Get all ancestor user IDs up to maxLevels above a given user.
 */
const getAncestors = async (userId, maxLevels = 3) => {
  const ancestors = [];
  let currentId = userId;

  for (let i = 0; i < maxLevels; i++) {
    const { data: node } = await supabase
      .from('binary_tree')
      .select('parent_id')
      .eq('user_id', currentId)
      .single();

    if (!node || !node.parent_id) break;
    ancestors.push({ userId: node.parent_id, level: i + 1 });
    currentId = node.parent_id;
  }

  return ancestors;
};

module.exports = { placeInTree, getSubtree, countTeam, getAncestors };
