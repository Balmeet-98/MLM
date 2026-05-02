const supabase = require('../config/supabase');
const { getWalletBalance } = require('../services/walletService');

const getWallet = async (req, res, next) => {
  try {
    const balance = await getWalletBalance(req.user.id);

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    res.json({ balance, transactions: transactions || [] });
  } catch (err) {
    next(err);
  }
};

const requestWithdrawal = async (req, res, next) => {
  try {
    const { amount, bankName, accountNumber, ifscCode, accountHolder } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Minimum withdrawal amount is Rs.100' });
    }

    const balance = await getWalletBalance(req.user.id);
    if (balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const { data: withdrawal, error } = await supabase
      .from('withdrawals')
      .insert({
        user_id: req.user.id,
        amount: parseFloat(amount),
        bank_name: bankName,
        account_number: accountNumber,
        ifsc_code: ifscCode,
        account_holder: accountHolder,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Withdrawal request submitted', withdrawal });
  } catch (err) {
    next(err);
  }
};

const getWithdrawals = async (req, res, next) => {
  try {
    const { data: withdrawals } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', req.user.id)
      .order('requested_at', { ascending: false });

    res.json({ withdrawals: withdrawals || [] });
  } catch (err) {
    next(err);
  }
};

const getIncomeLogs = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('income_logs')
      .select('*, from_user:from_user_id(name, referral_code)', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) query = query.eq('income_type', type);

    const { data: logs, count } = await query;

    res.json({ logs: logs || [], total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
};

module.exports = { getWallet, requestWithdrawal, getWithdrawals, getIncomeLogs };
