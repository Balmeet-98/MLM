const supabase = require('../config/supabase');

const creditWallet = async (userId, amount, description, refId = null) => {
  const { data: wallet, error: fetchErr } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', userId)
    .single();

  if (fetchErr) throw new Error('Wallet not found for user ' + userId);

  const newBalance = parseFloat(wallet.balance) + parseFloat(amount);

  const { error: updateErr } = await supabase
    .from('wallets')
    .update({ balance: newBalance })
    .eq('user_id', userId);

  if (updateErr) throw new Error('Failed to credit wallet');

  await supabase.from('transactions').insert({
    user_id: userId,
    type: 'credit',
    amount: parseFloat(amount),
    description,
    ref_id: refId,
  });

  return newBalance;
};

const debitWallet = async (userId, amount, description, refId = null) => {
  const { data: wallet, error: fetchErr } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', userId)
    .single();

  if (fetchErr) throw new Error('Wallet not found');
  if (parseFloat(wallet.balance) < parseFloat(amount)) {
    throw new Error('Insufficient balance');
  }

  const newBalance = parseFloat(wallet.balance) - parseFloat(amount);

  const { error: updateErr } = await supabase
    .from('wallets')
    .update({ balance: newBalance })
    .eq('user_id', userId);

  if (updateErr) throw new Error('Failed to debit wallet');

  await supabase.from('transactions').insert({
    user_id: userId,
    type: 'debit',
    amount: parseFloat(amount),
    description,
    ref_id: refId,
  });

  return newBalance;
};

const getWalletBalance = async (userId) => {
  const { data, error } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', userId)
    .single();
  if (error) throw new Error('Wallet not found');
  return parseFloat(data.balance);
};

module.exports = { creditWallet, debitWallet, getWalletBalance };
