const gradients = {
  red:    'from-red-600 to-red-700',
  green:  'from-emerald-500 to-emerald-600',
  blue:   'from-blue-500 to-blue-700',
  purple: 'from-violet-500 to-purple-700',
  yellow: 'from-amber-400 to-orange-500',
};

const iconBgs = {
  red:    'bg-red-500/30',
  green:  'bg-emerald-400/30',
  blue:   'bg-blue-400/30',
  purple: 'bg-violet-400/30',
  yellow: 'bg-amber-300/30',
};

export default function StatCard({ title, value, subtitle, icon, color = 'red', trend }) {
  const grad = gradients[color] || gradients.red;
  const ibg  = iconBgs[color]   || iconBgs.red;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${grad} p-5 text-white shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1 truncate">{title}</p>
          <p className="text-2xl font-extrabold leading-none" style={{ fontFamily: 'var(--font-heading)' }}>{value}</p>
          {subtitle && <p className="text-xs text-white/65 mt-1.5 truncate">{subtitle}</p>}
          {trend !== undefined && (
            <p className={`text-xs mt-1.5 font-semibold ${trend > 0 ? 'text-emerald-300' : 'text-red-300'}`}>
              {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        {icon && (
          <div className={`${ibg} rounded-xl p-2.5 flex-shrink-0 text-xl`}>
            {icon}
          </div>
        )}
      </div>
      {/* Decorative circle */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/5" />
    </div>
  );
}
