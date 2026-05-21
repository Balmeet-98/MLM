const { getSubtree } = require('../services/treeService');
const supabase = require('../config/supabase');

const getMyTree = async (req, res, next) => {
  try {
    const tree = await getSubtree(req.user.id);
    res.json({ tree });
  } catch (err) {
    next(err);
  }
};

const getUserTree = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const tree = await getSubtree(userId);
    res.json({ tree });
  } catch (err) {
    next(err);
  }
};

const getDirectReferrals = async (req, res, next) => {
  try {
    const { data: referrals } = await supabase
      .from('users')
      .select('id, name, email, referral_code, is_active, created_at')
      .eq('sponsor_id', req.user.id)
      .order('created_at', { ascending: false });

    res.json({ referrals: referrals || [] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyTree, getUserTree, getDirectReferrals };
