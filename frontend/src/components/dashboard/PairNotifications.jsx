import { Link } from 'react-router-dom';

const TYPE_STYLE = {
  pair_status: { icon: '🤝', border: 'border-slate-200', bg: 'bg-slate-50', badge: 'bg-slate-200 text-slate-700' },
  one_more_join: { icon: '🚀', border: 'border-red-300', bg: 'bg-red-50', badge: 'bg-red-600 text-white' },
  rank_close: { icon: '🏆', border: 'border-amber-300', bg: 'bg-amber-50', badge: 'bg-amber-500 text-white' },
  grow_leg: { icon: '📈', border: 'border-emerald-300', bg: 'bg-emerald-50', badge: 'bg-emerald-600 text-white' },
  need_second_leg: { icon: '👥', border: 'border-blue-300', bg: 'bg-blue-50', badge: 'bg-blue-600 text-white' },
  unlock_next_pair: { icon: '🔓', border: 'border-purple-300', bg: 'bg-purple-50', badge: 'bg-purple-600 text-white' },
  activate_legs: { icon: '💡', border: 'border-amber-200', bg: 'bg-amber-50/80', badge: 'bg-amber-400 text-amber-950' },
};

const PRIORITY_LABEL = {
  urgent: 'Hot',
  high: 'Important',
  medium: 'Tip',
  info: 'Status',
};

export default function PairNotifications({ pairInsights, compact = false }) {
  if (!pairInsights?.notifications?.length) return null;

  const { notifications, legCounts, nextRank, totalPairs } = pairInsights;
  const alerts = notifications.filter((n) => n.type !== 'pair_status');
  const status = notifications.find((n) => n.type === 'pair_status');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-bold text-slate-800" style={{ fontFamily: 'var(--font-heading)' }}>
          Pair progress
        </h2>
        {nextRank && (
          <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
            Next: {nextRank.name} · {nextRank.pairsRemaining} pair{nextRank.pairsRemaining === 1 ? '' : 's'} left
          </span>
        )}
      </div>

      {!compact && legCounts?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {legCounts.map((leg) => (
            <span
              key={leg.childId}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                leg.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {leg.legLabel}: {leg.count} {leg.isActive ? '✓ active' : '· needs team'}
            </span>
          ))}
        </div>
      )}

      {status && (
        <p className="text-sm text-slate-600 bg-white border border-slate-100 rounded-xl px-4 py-3">
          <span className="font-bold text-slate-800">{totalPairs} pairs</span>
          {' — '}
          {status.message}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {(alerts.length ? alerts : notifications).slice(0, compact ? 2 : 4).map((n, i) => {
          const style = TYPE_STYLE[n.type] || TYPE_STYLE.pair_status;
          return (
            <div
              key={`${n.type}-${i}`}
              className={`rounded-2xl border p-4 ${style.border} ${style.bg}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{style.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${style.badge}`}>
                      {PRIORITY_LABEL[n.priority] || n.type}
                    </span>
                    <p className="font-bold text-sm text-slate-900 leading-tight">{n.title}</p>
                  </div>
                  <p className="text-sm text-slate-700 leading-snug">{n.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!compact && (
        <p className="text-xs text-slate-500">
          Share your referral code from{' '}
          <Link to="/tree" className="text-red-700 font-semibold hover:underline">My Tree</Link>
          {' '}— every new active member can grow your pairs toward rank rewards.
        </p>
      )}
    </div>
  );
}
