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
    <div className="min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-yellow-400 rounded-lg flex items-center justify-center font-black text-red-800 text-sm shadow-sm">S</div>
            <div className="text-left">
              <p className="font-bold text-slate-900 text-sm leading-none" style={{ fontFamily: 'var(--font-heading)' }}>Samriddhi</p>
              <p className="text-red-700 text-[10px] font-semibold">Network</p>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button type="button" onClick={() => scrollTo('how')} className="hover:text-red-700 transition-colors">How it works</button>
            <button type="button" onClick={() => scrollTo('income')} className="hover:text-red-700 transition-colors">Income</button>
            <button type="button" onClick={() => scrollTo('ranks')} className="hover:text-red-700 transition-colors">Ranks</button>
            <button type="button" onClick={() => scrollTo('contact')} className="hover:text-red-700 transition-colors">Contact</button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-red-700 transition-colors">
              Login
            </Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4 sm:px-5">
              Join Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 px-4 sm:px-6 text-white"
        style={{ background: 'linear-gradient(155deg, #7f1d1d 0%, #b91c1c 45%, #dc2626 100%)' }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-yellow-300 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-red-900 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
            Sales Promotion with Exciting Rewards · Jammu
          </p>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] max-w-3xl text-white"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Plan your work.<br />
            <span className="text-yellow-300">Work your plan.</span>
          </h1>
          <p className="mt-6 text-lg text-red-100 max-w-xl leading-relaxed">
            Build a real referral business with Samriddhi Network — unlimited direct team,
            transparent income, rank rewards from dinner sets to grand villas, and a 16-month savings plan.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3 rounded-[10px] text-base font-bold bg-yellow-400 text-red-900 hover:bg-yellow-300 shadow-lg transition-colors"
            >
              Start earning — Join now
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-3 rounded-[10px] text-base font-bold bg-white/15 border-2 border-white text-white hover:bg-white/25 transition-all"
            >
              Member login
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: '2,500+', label: 'Group capacity' },
              { value: '₹1,200', label: 'Monthly installment' },
              { value: '16', label: 'Month cycle' },
              { value: '14', label: 'Rank levels' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/15 border border-white/20 p-4 text-center backdrop-blur-sm">
                <p className="text-2xl font-black text-yellow-300" style={{ fontFamily: 'var(--font-heading)' }}>{s.value}</p>
                <p className="text-xs text-red-100 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-4 sm:px-6 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>How it works</h2>
          <p className="text-slate-600 mb-12 max-w-lg text-base">Three simple steps from registration to recurring income and rank milestones.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div key={s.step} className="relative rounded-2xl bg-slate-50 border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-4xl font-black text-red-200 absolute top-4 right-4" style={{ fontFamily: 'var(--font-heading)' }}>{s.step}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-6 mb-2 relative z-10" style={{ fontFamily: 'var(--font-heading)' }}>{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed relative z-10">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Platform features</h2>
          <p className="text-slate-600 mb-10">Everything you need to manage your network in one place.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:border-red-300 transition-colors">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="font-bold text-slate-900 mt-3 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Income */}
      <section id="income" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Four ways to earn</h2>
          <p className="text-slate-600 mb-12 text-base">Multiple income streams tracked in your dashboard and wallet.</p>
          <div className="grid sm:grid-cols-2 gap-5">
            {INCOME_TYPES.map((item) => (
              <div key={item.title} className="flex gap-4 rounded-2xl bg-red-50 border border-red-100 p-5">
                <span className="text-3xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1.5" style={{ fontFamily: 'var(--font-heading)' }}>{item.title}</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl bg-amber-50 border border-amber-200 p-5 text-sm text-amber-950">
            <strong className="text-amber-900">Pair rule:</strong>{' '}
            <span className="text-amber-900/90">Each direct referral is one leg. When any two legs have team volume,
            you earn one pair (₹50). More active legs → more pairs (e.g. 4 active legs = 2 pairs).</span>
          </div>
        </div>
      </section>

      {/* Ranks */}
      <section id="ranks" className="py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-slate-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Rank & reward ladder</h2>
          <p className="text-slate-600 mb-10 text-base">Achieve pair milestones to unlock physical rewards and monthly rank income.</p>
          <div className="space-y-3">
            {HIGHLIGHT_RANKS.map((r, i) => (
              <div
                key={r.name}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white border border-slate-200 px-5 py-4 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <span className="w-9 h-9 rounded-lg bg-red-700 flex items-center justify-center text-xs font-bold text-yellow-300">{i + 1}</span>
                  <div>
                    <p className="font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>{r.name}</p>
                    <p className="text-sm text-slate-500">{r.pairs.toLocaleString()} pairs required</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-red-800">{r.reward}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-6">Full ladder: 14 ranks from Executive (3 pairs) to Black Diamond Director (2,16,000 pairs).</p>
        </div>
      </section>

      {/* Plan */}
      <section className="py-20 px-4 sm:px-6 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>16-month group plan</h2>
            <ul className="space-y-3 text-slate-700 text-base">
              <li className="flex gap-3"><span className="text-red-600 font-bold">✓</span> ₹1,200 activation includes Month 1 installment</li>
              <li className="flex gap-3"><span className="text-red-600 font-bold">✓</span> Pay monthly installments on time to stay eligible for lucky draws</li>
              <li className="flex gap-3"><span className="text-red-600 font-bold">✓</span> Select booking, mid, deluxe & double-ID product tiers as you progress</li>
              <li className="flex gap-3"><span className="text-red-600 font-bold">✓</span> Real-time tree view, wallet, income logs & reward collection in one app</li>
            </ul>
          </div>
          <div
            className="rounded-3xl p-8 text-white shadow-xl"
            style={{ background: 'linear-gradient(145deg, #991B1B 0%, #DC2626 100%)' }}
          >
            <p className="text-red-100 text-sm font-semibold uppercase tracking-wider mb-2">Ready to start?</p>
            <p className="text-2xl font-black text-white mb-6 leading-snug" style={{ fontFamily: 'var(--font-heading)' }}>
              You need a sponsor referral code to register.
            </p>
            <Link to="/register" className="btn-primary w-full justify-center py-3 text-base bg-yellow-400 !text-red-900 hover:!bg-yellow-300">
              Create your account →
            </Link>
            <p className="text-center text-red-100 text-sm mt-4">
              Already a member? <Link to="/login" className="text-yellow-300 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 px-4 sm:px-6 bg-slate-100 border-t border-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Samriddhi Network</h2>
            <p className="text-slate-600 text-base">Opp. General Bus Stand, B.C. Road, Jammu</p>
            <a href="tel:9419185768" className="text-red-700 font-bold text-lg mt-2 inline-block hover:underline">9419185768</a>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/login" className="btn-secondary text-sm py-2.5 px-6">Login</Link>
            <Link to="/register" className="btn-primary text-sm py-2.5 px-6">Sign up</Link>
          </div>
        </div>
      </section>

      <footer className="py-6 px-4 text-center text-sm text-slate-500 bg-white border-t border-slate-200">
        © {new Date().getFullYear()} Samriddhi Network. All rights reserved.
      </footer>
    </div>
  );
}
