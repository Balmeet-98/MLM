const supabase = require('../config/supabase');
const { creditDirectIncome, updatePairsAndCredit } = require('../services/incomeService');
const { checkAndAssignRanks } = require('../services/rewardService');

const getProducts = async (req, res, next) => {
  try {
    const { tier } = req.query;
    let query = supabase.from('products').select('*').eq('is_active', true);
    if (tier) query = query.eq('tier', tier);
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

    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Check if already has a booking product (for activation)
    const { data: existingBooking } = await supabase
      .from('user_products')
      .select('id')
      .eq('user_id', userId)
      .eq('selection_stage', 'booking')
      .single();

    const isFirstPurchase = !existingBooking;

    // Record purchase
    await supabase.from('user_products').insert({
      user_id: userId,
      product_id: productId,
      selection_stage: product.tier === 'booking' ? 'booking' : product.tier,
      status: 'confirmed',
    });

    // Activate account on first booking product purchase
    if (isFirstPurchase && product.tier === 'booking') {
      await supabase
        .from('users')
        .update({ is_active: true })
        .eq('id', userId);

      // Credit direct income to upline (L1, L2, L3)
      await creditDirectIncome(userId);

      // Update pair counts for parent and ancestors
      const { data: treeNode } = await supabase
        .from('binary_tree')
        .select('parent_id')
        .eq('user_id', userId)
        .single();

      if (treeNode?.parent_id) {
        let currentParent = treeNode.parent_id;
        // Update pairs going up the tree (at least 3 levels)
        for (let i = 0; i < 10 && currentParent; i++) {
          await updatePairsAndCredit(currentParent);
          await checkAndAssignRanks(currentParent);

          const { data: parentNode } = await supabase
            .from('binary_tree')
            .select('parent_id')
            .eq('user_id', currentParent)
            .single();
          currentParent = parentNode?.parent_id;
        }
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
