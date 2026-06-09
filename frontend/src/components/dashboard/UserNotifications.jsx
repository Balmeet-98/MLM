import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TYPE_STYLES = {
  installment_paid: {
    icon: '✅',
    border: 'border-emerald-300',
    bg: 'bg-emerald-50',
    badge: 'bg-emerald-600 text-white',
    label: 'Payment',
  },
  installment_missed: {
    icon: '⚠️',
    border: 'border-orange-300',
    bg: 'bg-orange-50',
    badge: 'bg-orange-600 text-white',
    label: 'Missed',
  },
  referral_installment_missed: {
    icon: '👤',
    border: 'border-amber-300',
    bg: 'bg-amber-50',
    badge: 'bg-amber-600 text-white',
    label: 'Referral',
  },
  installment_admin_alert: {
    icon: '📋',
    border: 'border-red-300',
    bg: 'bg-red-50',
    badge: 'bg-red-600 text-white',
    label: 'Alert',
  },
  installment_id_cancelled: {
    icon: '🚫',
    border: 'border-red-400',
    bg: 'bg-red-100',
    badge: 'bg-red-700 text-white',
    label: 'Cancelled',
  },
  withdrawal_approved: {
    icon: '💸',
    border: 'border-emerald-300',
    bg: 'bg-emerald-50',
    badge: 'bg-emerald-600 text-white',
    label: 'Withdrawal',
  },
};

const DEFAULT_STYLE = {
  icon: '🔔',
  border: 'border-slate-300',
  bg: 'bg-slate-50',
  badge: 'bg-slate-600 text-white',
  label: 'Notice',
};

export default function UserNotifications({ notifications = [], unreadCount = 0, onRefresh }) {
  if (!notifications?.length) return null;

  const markRead = async (id) => {
    try {
      await api.patch(`/user/notifications/${id}/read`);
      onRefresh?.();
    } catch {
      toast.error('Could not update notification');
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/user/notifications/read-all');
      onRefresh?.();
    } catch {
      toast.error('Could not update notifications');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold text-slate-800" style={{ fontFamily: 'var(--font-heading)' }}>
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-xs font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button type="button" onClick={markAllRead} className="text-xs font-semibold text-brand-600 hover:underline">
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map((n) => {
          const style = TYPE_STYLES[n.type] || DEFAULT_STYLE;
          const unread = !n.read_at;
          return (
            <div
              key={n.id}
              className={`rounded-2xl border p-4 ${style.border} ${style.bg} ${unread ? 'ring-2 ring-purple-200' : 'opacity-90'}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{style.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${style.badge}`}>
                      {style.label}
                    </span>
                    {unread && (
                      <span className="text-[10px] font-bold text-purple-700">NEW</span>
                    )}
                  </div>
                  <p className="font-bold text-sm text-slate-900">{n.title}</p>
                  <p className="text-sm text-slate-700 mt-1 leading-snug">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {format(new Date(n.created_at), 'dd MMM yyyy, hh:mm a')}
                  </p>
                </div>
                {unread && (
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    className="text-xs font-semibold text-purple-800 hover:underline flex-shrink-0"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
