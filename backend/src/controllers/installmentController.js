const supabase = require('../config/supabase');
const { creditInstallmentIncome } = require('../services/incomeService');

const getMyInstallments = async (req, res, next) => {
  try {
    const { data: installments } = await supabase
      .from('installments')
      .select('*')
      .eq('user_id', req.user.id)
      .order('month_number', { ascending: true });

    const { data: user } = await supabase
      .from('users')
      .select('consecutive_missed_installments, group_id')
      .eq('id', req.user.id)
      .single();

    res.json({
      installments: installments || [],
      consecutiveMissed: user?.consecutive_missed_installments || 0,
    });
  } catch (err) {
    next(err);
  }
};

const payInstallment = async (req, res, next) => {
  try {
    const { monthNumber } = req.body;

    // Find the installment
    const { data: installment } = await supabase
      .from('installments')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('month_number', monthNumber)
      .single();

    if (!installment) return res.status(404).json({ error: 'Installment not found' });
    if (installment.status === 'paid') return res.status(400).json({ error: 'Already paid' });

    // Mark as paid
    await supabase
      .from('installments')
      .update({ status: 'paid', paid_date: new Date().toISOString() })
      .eq('id', installment.id);

    // Reset consecutive missed count
    await supabase
      .from('users')
      .update({ consecutive_missed_installments: 0 })
      .eq('id', req.user.id);

    // Credit installment income to direct sponsor
    await creditInstallmentIncome(req.user.id);

    res.json({ message: `Installment month ${monthNumber} paid successfully` });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyInstallments, payInstallment };
