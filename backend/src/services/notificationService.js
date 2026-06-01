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

module.exports = {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
