const supabase = require('../config/supabase');
const { creditInstallmentIncome } = require('./incomeService');
const {
  createNotification,
  createNotificationsForUsers,
  getAdminUserIds,
} = require('./notificationService');

/**
 * Check all users for missed installments. Called by cron on 11th of each month.
 * Marks unpaid installments as missed, increments counter, cancels ID at 4 consecutive.
 */
const notifyMissedInstallment = async (inst, member, newMissedCount, cancelled) => {
  const memberName = member.name || 'Member';
  const meta = {
    installmentId: inst.id,
    memberId: inst.user_id,
    memberName,
    monthNumber: inst.month_number,
    consecutiveMissed: newMissedCount,
  };

  if (cancelled) {
    await createNotification({
      userId: inst.user_id,
      type: 'installment_id_cancelled',
      title: 'Account deactivated',
      message: `Your ID has been cancelled after 4 consecutive missed installments (latest: Month ${inst.month_number}). Contact support if you need help.`,
      meta,
    });

    if (member.sponsor_id) {
      await createNotification({
        userId: member.sponsor_id,
        type: 'installment_id_cancelled',
        title: 'Referral ID cancelled',
        message: `Your referral ${memberName} had their ID cancelled after 4 consecutive missed installments.`,
        meta,
      });
    }

    const adminIds = await getAdminUserIds();
    await createNotificationsForUsers(adminIds, {
      type: 'installment_id_cancelled',
      title: 'Member ID cancelled',
      message: `${memberName} had their ID cancelled after 4 consecutive missed installments (Month ${inst.month_number}).`,
      meta,
    });
    return;
  }

  await createNotification({
    userId: inst.user_id,
    type: 'installment_missed',
    title: 'Installment missed',
    message: `Month ${inst.month_number} installment was not paid by the 10th. ${newMissedCount} consecutive miss${newMissedCount > 1 ? 'es' : ''} — 4 misses result in ID cancellation.`,
    meta,
  });

  if (member.sponsor_id) {
    await createNotification({
      userId: member.sponsor_id,
      type: 'referral_installment_missed',
      title: 'Referral missed installment',
      message: `Your referral ${memberName} missed their Month ${inst.month_number} installment (${newMissedCount} consecutive miss${newMissedCount > 1 ? 'es' : ''}).`,
      meta,
    });
  }

  const adminIds = await getAdminUserIds();
  await createNotificationsForUsers(adminIds, {
    type: 'installment_admin_alert',
    title: 'Member missed installment',
    message: `${memberName} missed Month ${inst.month_number} installment — ${newMissedCount} consecutive miss${newMissedCount > 1 ? 'es' : ''}.`,
    meta,
  });
};

const checkMissedInstallments = async () => {
  const now = new Date();

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
    await supabase
      .from('installments')
      .update({ status: 'missed' })
      .eq('id', inst.id);

    const { data: user } = await supabase
      .from('users')
      .select('consecutive_missed_installments, name, sponsor_id')
      .eq('id', inst.user_id)
      .single();

    if (!user) continue;

    const newMissedCount = (user.consecutive_missed_installments || 0) + 1;
    const cancelled = newMissedCount >= 4;

    if (cancelled) {
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

    try {
      await notifyMissedInstallment(inst, user, newMissedCount, cancelled);
    } catch (err) {
      console.error(`[CRON] Notification failed for installment ${inst.id}:`, err.message);
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
    const dueDate = new Date(now.getFullYear(), now.getMonth() + month - 1, 10);
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

/**
 * Mark an installment paid and credit sponsor income (after Razorpay verification).
 */
const completeInstallmentPayment = async (userId, monthNumber) => {
  const month = parseInt(monthNumber, 10);
  if (!month || month < 1 || month > 16) {
    const err = new Error('Invalid month number');
    err.status = 400;
    throw err;
  }

  const { data: installment } = await supabase
    .from('installments')
    .select('*')
    .eq('user_id', userId)
    .eq('month_number', month)
    .single();

  if (!installment) {
    const err = new Error('Installment not found');
    err.status = 404;
    throw err;
  }
  if (installment.status === 'paid') {
    const err = new Error('This installment is already paid');
    err.status = 400;
    throw err;
  }

  const { error: updateErr } = await supabase
    .from('installments')
    .update({ status: 'paid', paid_date: new Date().toISOString() })
    .eq('id', installment.id);

  if (updateErr) throw updateErr;

  await supabase
    .from('users')
    .update({ consecutive_missed_installments: 0 })
    .eq('id', userId);

  await creditInstallmentIncome(userId);

  return installment;
};

module.exports = {
  checkMissedInstallments,
  createInstallmentSchedule,
  completeInstallmentPayment,
};
