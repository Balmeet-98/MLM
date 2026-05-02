const supabase = require('../config/supabase');

/**
 * Check all users for missed installments. Called by cron on 21st of each month.
 * Marks unpaid installments as missed, increments counter, cancels ID at 4 consecutive.
 */
const checkMissedInstallments = async () => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Find all pending installments whose due date has passed
  const { data: overdueInstallments } = await supabase
    .from('installments')
    .select('id, user_id, month_number, group_id')
    .eq('status', 'pending')
    .lt('due_date', now.toISOString());

  if (!overdueInstallments || overdueInstallments.length === 0) {
    console.log('[CRON] No overdue installments found');
    return;
  }

  for (const inst of overdueInstallments) {
    // Mark as missed
    await supabase
      .from('installments')
      .update({ status: 'missed' })
      .eq('id', inst.id);

    // Increment consecutive missed count
    const { data: user } = await supabase
      .from('users')
      .select('consecutive_missed_installments')
      .eq('id', inst.user_id)
      .single();

    if (!user) continue;

    const newMissedCount = (user.consecutive_missed_installments || 0) + 1;

    if (newMissedCount >= 4) {
      // Cancel the member's ID
      await supabase
        .from('users')
        .update({
          is_active: false,
          consecutive_missed_installments: newMissedCount,
        })
        .eq('id', inst.user_id);

      console.log(`[CRON] Cancelled ID for user ${inst.user_id} (4 consecutive missed)`);
    } else {
      await supabase
        .from('users')
        .update({ consecutive_missed_installments: newMissedCount })
        .eq('id', inst.user_id);
    }
  }

  console.log(`[CRON] Processed ${overdueInstallments.length} overdue installments`);
};

/**
 * Create installment records for a new member joining a group (months 1-16).
 */
const createInstallmentSchedule = async (userId, groupId) => {
  const now = new Date();
  const installments = [];

  for (let month = 1; month <= 16; month++) {
    const dueDate = new Date(now.getFullYear(), now.getMonth() + month - 1, 20);
    installments.push({
      user_id: userId,
      group_id: groupId,
      month_number: month,
      amount: 1200,
      due_date: dueDate.toISOString(),
      status: 'pending',
    });
  }

  const { error } = await supabase.from('installments').insert(installments);
  if (error) throw new Error('Failed to create installment schedule: ' + error.message);
};

module.exports = { checkMissedInstallments, createInstallmentSchedule };
