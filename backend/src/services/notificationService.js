const supabase = require('../config/supabase');

const BATCH_SIZE = 100;

const formatDrawDate = (dateStr) => {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatShortDate = (dateStr) => {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const insertNotificationsBatch = async (rows) => {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const chunk = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('notifications').insert(chunk);
    if (error) throw error;
  }
};

/**
 * Notify all active members about an upcoming lucky draw date.
 */
const notifyLuckyDrawScheduled = async ({
  groupId,
  groupName,
  monthNumber,
  drawDate,
  scheduleId,
}) => {
  const { data: members } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'user')
    .eq('is_active', true);

  if (!members?.length) return { notifiedCount: 0 };

  const dateLabel = formatDrawDate(drawDate);
  const title = `Lucky draw on ${formatShortDate(drawDate)}`;
  const message = `Group "${groupName}" — Month ${monthNumber} lucky draw is scheduled on ${dateLabel}. Stay compliant with installments to remain eligible.`;

  const rows = members.map((m) => ({
    user_id: m.id,
    type: 'lucky_draw_scheduled',
    title,
    message,
    meta: {
      scheduleId,
      groupId,
      groupName,
      monthNumber,
      drawDate,
    },
  }));

  await insertNotificationsBatch(rows);
  return { notifiedCount: rows.length };
};

const getUserNotifications = async (userId, { limit = 20, unreadOnly = false } = {}) => {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (unreadOnly) query = query.is('read_at', null);

  const { data: notifications } = await query;

  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null);

  return { notifications: notifications || [], unreadCount: unreadCount || 0 };
};

const markNotificationRead = async (userId, notificationId) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

const markAllNotificationsRead = async (userId) => {
  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);
};

module.exports = {
  notifyLuckyDrawScheduled,
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
