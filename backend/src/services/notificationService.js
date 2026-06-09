const supabase = require('../config/supabase');

const getUserNotifications = async (userId, { limit = 20, unreadOnly = false } = {}) => {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .neq('type', 'lucky_draw_scheduled')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (unreadOnly) query = query.is('read_at', null);

  const { data: notifications } = await query;

  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .neq('type', 'lucky_draw_scheduled')
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
    .neq('type', 'lucky_draw_scheduled')
    .is('read_at', null);
};

/**
 * Create a notification if one with the same type + dedupe key does not exist.
 */
const createNotification = async ({ userId, type, title, message, meta = {} }) => {
  if (meta.installmentId) {
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('type', type)
      .contains('meta', { installmentId: meta.installmentId })
      .limit(1)
      .maybeSingle();

    if (existing) return existing;
  }

  if (meta.withdrawalId) {
    const { data: existingWd } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('type', type)
      .contains('meta', { withdrawalId: meta.withdrawalId })
      .limit(1)
      .maybeSingle();

    if (existingWd) return existingWd;
  }

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      meta,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

const createNotificationsForUsers = async (userIds, payload) => {
  const results = [];
  for (const userId of userIds) {
    if (!userId) continue;
    try {
      const row = await createNotification({ ...payload, userId });
      results.push(row);
    } catch (err) {
      console.error(`[NOTIF] Failed for user ${userId}:`, err.message);
    }
  }
  return results;
};

const getAdminUserIds = async () => {
  const { data: admins } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin');
  return (admins || []).map((a) => a.id);
};

module.exports = {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification,
  createNotificationsForUsers,
  getAdminUserIds,
};
