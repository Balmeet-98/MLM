import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const INCOME_TYPES = [
  { icon: '💵', title: 'Direct Income', desc: 'Earn ₹400 (L1), ₹200 (L2), and ₹100 (L3) when members in your upline activate.' },
  { icon: '🤝', title: 'Pair Income', desc: '₹50 per pair — every two active direct legs under you count as one pair.' },
  { icon: '📅', title: 'Installment Income', desc: '₹100 to your direct sponsor each time a referral pays their monthly installment.' },
  { icon: '🏆', title: 'Rank Rewards', desc: '14 ranks from Executive to Black Diamond Director — gifts, cars, property & monthly income.' },
];

const STEPS = [
  { step: '01', title: 'Join with sponsor code', desc: 'Register with a one-time ₹1,200 activation (Month 1 installment included) and your sponsor\'s referral code.' },
  { step: '02', title: 'Build your network', desc: 'Refer unlimited members directly under you. Each referral is placed in your network tree instantly.' },
  { step: '03', title: 'Earn & grow ranks', desc: 'Track pairs, income, and rank progress on your dashboard. Claim rewards as you hit milestones.' },
];

const HIGHLIGHT_RANKS = [
  { name: 'Executive', pairs: 3, reward: 'P.P. Set' },
  { name: 'Silver', pairs: 36, reward: 'Thailand Tour / ₹27,000' },
  { name: '5 Star Ruby', pairs: 1050, reward: 'Auto Car' },
  { name: 'Director', pairs: 13500, reward: 'XUV Mahindra' },
  { name: 'Black Diamond Director', pairs: 216000, reward: 'Grand Villa' },
];

const FEATURES = [
  { icon: '🌳', title: 'Unlimited-width tree', desc: 'No left/right limit — sponsor as many direct members as you want.' },
  { icon: '💳', title: 'Digital wallet', desc: 'All earnings credited to your wallet. Request withdrawals anytime.' },
  { icon: '🎁', title: 'Product rewards', desc: 'Choose appliances, electronics & more through our product catalog tiers.' },
  { icon: '🎰', title: 'Lucky draws', desc: '16-month group cycle with monthly lucky draws for compliant members.' },
];

export default function Landing() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(user?.role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0c0a09] text-stone-100 overflow-x-hidden">
      {/* Grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0c0a09]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-yellow-400 rounded-lg flex items-center justify-center font-black text-red-900 text-sm">S</div>
            <div className="text-left">
              <p className="font-bold text-white text-sm leading-none" style={{ fontFamily: 'var(--font-heading)' }}>Samriddhi</p>
              <p className="text-yellow-400/90 text-[10px]">Network</p>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm text-stone-400">
            <button type="button" onClick={() => scrollTo('how')} className="hover:text-white transition-colors">How it works</button>
            <button type="button" onClick={() => scrollTo('income')} className="hover:text-white transition-colors">Income</button>
            <button type="button" onClick={() => scrollTo('ranks')} className="hover:text-white transition-colors">Ranks</button>
            <button type="button" onClick={() => scrollTo('contact')} className="hover:text-white transition-colors">Contact</button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-stone-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4 sm:px-5">
              Join Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 px-4 sm:px-6">
        <div
          className="absolute inset-0 z-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(185,28,28,0.45) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(234,179,8,0.12) 0%, transparent 50%)',
          }}
        />
        <div className="relative z-10 max-w-6xl mx-auto">
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/50 border border-red-700/50 text-red-200 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            Sales Promotion with Exciting Rewards · Jammu
          </p>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] max-w-3xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Plan your work.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">Work your plan.</span>
          </h1>
          <p className="mt-6 text-lg text-stone-400 max-w-xl leading-relaxed">
            Samriddhi Network helps you build a real referral business — unlimited direct team,
            transparent income, rank rewards from dinner sets to grand villas, and a 16-month savings plan.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary text-base py-3 px-8">
              Start earning — Join now
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-3 rounded-[10px] text-base font-bold border-2 border-stone-600 text-stone-200 hover:border-stone-400 hover:text-white transition-all"
            >
              Member login
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: '2,500+', label: 'Group capacity' },
              { value: '₹1,200', label: 'Monthly installment' },
              { value: '16', label: 'Month cycle' },
              { value: '14', label: 'Rank levels' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center">
                <p className="text-2xl font-black text-yellow-400" style={{ fontFamily: 'var(--font-heading)' }}>{s.value}</p>
                <p className="text-xs text-stone-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-4 sm:px-6 bg-stone-950/80 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>How it works</h2>
          <p className="text-stone-500 mb-12 max-w-lg">Three simple steps from registration to recurring income and rank milestones.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div key={s.step} className="relative rounded-2xl bg-gradient-to-b from-stone-800/80 to-stone-900/80 border border-white/10 p-6">
                <span className="text-5xl font-black text-red-900/80 absolute top-4 right-4" style={{ fontFamily: 'var(--font-heading)' }}>{s.step}</span>
                <h3 className="text-lg font-bold text-white mt-8 mb-2 relative z-10" style={{ fontFamily: 'var(--font-heading)' }}>{s.title}</h3>
                <p className="text-sm text-stone-400 leading-relaxed relative z-10">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-white mb-12" style={{ fontFamily: 'var(--font-heading)' }}>Platform features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-red-900/40 bg-red-950/20 p-5 hover:border-red-700/60 transition-colors">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="font-bold text-white mt-3 mb-1" style={{ fontFamily: 'var(--font-heading)' }}>{f.title}</h3>
                <p className="text-sm text-stone-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Income */}
      <section id="income" className="py-20 px-4 sm:px-6 bg-gradient-to-b from-red-950/30 to-transparent">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Four ways to earn</h2>
          <p className="text-stone-500 mb-12">Multiple income streams tracked in your dashboard and wallet.</p>
          <div className="grid sm:grid-cols-2 gap-5">
            {INCOME_TYPES.map((item) => (
              <div key={item.title} className="flex gap-4 rounded-2xl bg-white/5 border border-white/10 p-5">
                <span className="text-3xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-bold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>{item.title}</h3>
                  <p className="text-sm text-stone-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl bg-yellow-400/10 border border-yellow-500/30 p-5 text-sm text-yellow-100/90">
            <strong className="text-yellow-300">Pair rule:</strong> Each direct referral is one leg. When any two legs have team volume,
            you earn one pair (₹50). More active legs → more pairs (e.g. 4 active legs = 2 pairs).
          </div>
        </div>
      </section>

      {/* Ranks */}
      <section id="ranks" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Rank & reward ladder</h2>
          <p className="text-stone-500 mb-10">Achieve pair milestones to unlock physical rewards and monthly rank income.</p>
          <div className="space-y-3">
            {HIGHLIGHT_RANKS.map((r, i) => (
              <div
                key={r.name}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-stone-900/80 border border-white/10 px-5 py-4"
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-lg bg-red-700 flex items-center justify-center text-xs font-bold text-yellow-300">{i + 1}</span>
                  <div>
                    <p className="font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>{r.name}</p>
                    <p className="text-xs text-stone-500">{r.pairs.toLocaleString()} pairs required</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-yellow-400/90">{r.reward}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-stone-600 mt-6">Full ladder: 14 ranks from Executive (3 pairs) to Black Diamond Director (2,16,000 pairs).</p>
        </div>
      </section>

      {/* Plan */}
      <section className="py-20 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-black text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>16-month group plan</h2>
            <ul className="space-y-3 text-stone-400 text-sm">
              <li className="flex gap-2"><span className="text-yellow-400">✓</span> ₹1,200 activation includes Month 1 installment</li>
              <li className="flex gap-2"><span className="text-yellow-400">✓</span> Pay monthly installments on time to stay eligible for lucky draws</li>
              <li className="flex gap-2"><span className="text-yellow-400">✓</span> Select booking, mid, deluxe & double-ID product tiers as you progress</li>
              <li className="flex gap-2"><span className="text-yellow-400">✓</span> Real-time tree view, wallet, income logs & reward collection in one app</li>
            </ul>
          </div>
          <div className="rounded-3xl p-8 border border-red-800/50 bg-gradient-to-br from-red-900/40 to-stone-900">
            <p className="text-red-200 text-sm font-semibold uppercase tracking-wider mb-2">Ready to start?</p>
            <p className="text-2xl font-black text-white mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
              You need a sponsor referral code to register.
            </p>
            <Link to="/register" className="btn-primary w-full justify-center py-3 text-base">
              Create your account →
            </Link>
            <p className="text-center text-stone-500 text-sm mt-4">
              Already a member? <Link to="/login" className="text-yellow-400 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 px-4 sm:px-6 bg-stone-950 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <h2 className="text-xl font-black text-white mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Samriddhi Network</h2>
            <p className="text-stone-500 text-sm">Opp. General Bus Stand, B.C. Road, Jammu</p>
            <a href="tel:9419185768" className="text-yellow-400 font-semibold mt-2 inline-block hover:underline">9419185768</a>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/login" className="btn-secondary text-sm py-2.5 px-6">Login</Link>
            <Link to="/register" className="btn-primary text-sm py-2.5 px-6">Sign up</Link>
          </div>
        </div>
      </section>

      <footer className="py-6 px-4 text-center text-xs text-stone-600 border-t border-white/5">
        © {new Date().getFullYear()} Samriddhi Network. All rights reserved.
      </footer>
    </div>
  );
}
