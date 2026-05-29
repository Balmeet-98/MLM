import { Link } from 'react-router-dom';

export const LOGO_SRC = '/assets/samridhiLogo.jpeg';

const SIZES = {
  sm: { img: 'h-8 w-8', title: 'text-[12px]', sub: 'text-[10px]' },
  md: { img: 'h-10 w-10', title: 'text-sm', sub: 'text-[11px]' },
  lg: { img: 'h-14 w-14', title: 'text-base', sub: 'text-xs' },
  xl: { img: 'h-20 w-20', title: 'text-lg', sub: 'text-sm' },
};

export default function Logo({
  size = 'md',
  showText = true,
  subtitle = 'Network',
  className = '',
  to = '/',
  light = false,
}) {
  const s = SIZES[size] || SIZES.md;

  const content = (
    <div className={`flex items-center gap-2.5 min-w-0 ${className}`}>
      <img
        src={LOGO_SRC}
        alt="Samriddhi"
        className={`${s.img} object-contain rounded-lg flex-shrink-0 bg-white/95 p-0.5 shadow-sm`}
      />
      {showText && (
        <div className="min-w-0 text-left">
          <p
            className={`font-bold leading-tight ${s.title} ${light ? 'text-white' : 'text-slate-900'}`}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Samriddhi
          </p>
          {subtitle && (
            <p className={`${s.sub} leading-tight font-semibold ${light ? 'text-orange-200' : 'text-brand-600'}`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (to == null) return content;

  return (
    <Link to={to} className="hover:opacity-90 transition-opacity inline-flex">
      {content}
    </Link>
  );
}
