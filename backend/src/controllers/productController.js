const supabase = require('../config/supabase');
const { creditDirectIncome, updatePairsAndCredit } = require('../services/incomeService');
const { checkAndAssignRanks } = require('../services/rewardService');
const { walkParentChain } = require('../services/treeService');

const STANDARD_TIERS = ['booking', 'mid', 'deluxe'];
const DOUBLE_ID_TIERS = ['double_id'];

const getAllowedTiers = (membershipType) =>
  membershipType === 'double_id' ? DOUBLE_ID_TIERS : STANDARD_TIERS;

const getProducts = async (req, res, next) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('membership_type')
      .eq('id', req.user.id)
      .single();

    const allowedTiers = getAllowedTiers(user?.membership_type);
    const { tier } = req.query;

    let query = supabase.from('products').select('*').eq('is_active', true);
    if (tier) {
      if (!allowedTiers.includes(tier)) {
        return res.json({ products: [] });
      }
      query = query.eq('tier', tier);
    } else {
      query = query.in('tier', allowedTiers);
    }
    query = query.order('price', { ascending: true });

    const { data: products } = await query;
    res.json({ products: products || [] });
  } catch (err) {
    next(err);
  }
};

const purchaseProduct = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const { data: user } = await supabase
      .from('users')
      .select('membership_type')
      .eq('id', userId)
      .single();

    const allowedTiers = getAllowedTiers(user?.membership_type);

    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (!allowedTiers.includes(product.tier)) {
      return res.status(403).json({ error: 'This product is not available for your membership plan' });
    }

    const { data: existingBooking } = await supabase
      .from('user_products')
      .select('id')
      .eq('user_id', userId)
      .eq('selection_stage', 'booking')
      .single();

    const isFirstPurchase = !existingBooking;

    await supabase.from('user_products').insert({
      user_id: userId,
      product_id: productId,
      selection_stage: product.tier === 'booking' ? 'booking' : product.tier,
      status: 'confirmed',
    });

    if (isFirstPurchase && product.tier === 'booking') {
      await supabase
        .from('users')
        .update({ is_active: true })
        .eq('id', userId);

      await creditDirectIncome(userId);

      const parentChain = await walkParentChain(userId);
      for (const parentId of parentChain) {
        await updatePairsAndCredit(parentId);
        await checkAndAssignRanks(parentId);
      }
    }

    res.json({
      message: isFirstPurchase && product.tier === 'booking'
        ? 'Account activated successfully!'
        : 'Product selected successfully',
      activated: isFirstPurchase && product.tier === 'booking',
    });
  } catch (err) {
    next(err);
  }
};

const getMyProducts = async (req, res, next) => {
  try {
    const { data: userProducts } = await supabase
      .from('user_products')
      .select('*, products(*)')
      .eq('user_id', req.user.id)
      .order('purchased_at', { ascending: false });

    res.json({ products: userProducts || [] });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, purchaseProduct, getMyProducts };
