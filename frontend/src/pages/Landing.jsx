import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/brand/Logo';
import ContactInfo, { CONTACT } from '../components/brand/ContactInfo';

const INCOME_TYPES = [
  { icon: '💵', title: 'Direct Income', desc: 'Earn ₹400 (L1), ₹200 (L2), and ₹100 (L3) when members in your upline activate.' },
  { icon: '🤝', title: 'Pair Rewards', desc: 'Pairs unlock lifetime rank rewards (P.P. Set, bikes, cars, villa) — no per-pair cash.' },
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
  { name: 'Black Diamond Director', pairs: 200000, reward: 'Grand Villa' },
];

const FEATURES = [
  { icon: '🌳', title: 'Unlimited-width tree', desc: 'No left/right limit — sponsor as many direct members as you want.' },
  { icon: '💳', title: 'Digital wallet', desc: 'All earnings credited to your wallet. Request withdrawals anytime.' },
  { icon: '🎁', title: 'Product rewards', desc: 'Choose appliances, electronics & more through our product catalog tiers.' },
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
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-left">
            <Logo size="sm" to={null} />
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button type="button" onClick={() => scrollTo('about')} className="hover:text-brand-600 transition-colors">About us</button>
            <button type="button" onClick={() => scrollTo('how')} className="hover:text-brand-600 transition-colors">How it works</button>
            <button type="button" onClick={() => scrollTo('income')} className="hover:text-brand-600 transition-colors">Income</button>
            <button type="button" onClick={() => scrollTo('ranks')} className="hover:text-brand-600 transition-colors">Ranks</button>
            <button type="button" onClick={() => scrollTo('contact')} className="hover:text-brand-600 transition-colors">Contact</button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors">
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
        style={{ background: 'var(--brand-gradient)' }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-yellow-300 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-brand-900 blur-3xl" />
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
            <span className="text-amber-300">Work your plan.</span>
          </h1>
          <p className="mt-6 text-lg text-orange-100 max-w-xl leading-relaxed">
            Build a real referral business with Samriddhi Network — unlimited direct team,
            transparent income, rank rewards from dinner sets to grand villas, and a 16-month savings plan.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3 rounded-[10px] text-base font-bold bg-amber-400 text-brand-900 hover:bg-amber-300 shadow-lg transition-colors"
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
                <p className="text-2xl font-black text-amber-300" style={{ fontFamily: 'var(--font-heading)' }}>{s.value}</p>
                <p className="text-xs text-orange-100 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About us */}
      <section id="about" className="py-20 px-4 sm:px-6 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mb-12">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-2">About us</p>
            <h2 className="text-3xl font-black text-slate-900 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Built to create opportunity for everyone
            </h2>
            <p className="text-slate-600 text-base leading-relaxed mb-4">
              Samriddhi Network was founded by <strong className="text-slate-800">Balbir Singh</strong> and{' '}
              <strong className="text-slate-800">Pavneet Kaur</strong> with a clear mission: to provide employment
              and earning opportunities for people from all walks of life.
            </p>
            <p className="text-slate-600 text-base leading-relaxed">
              Through a transparent referral model, structured rewards, and a supportive community based in Jammu,
              we help members build sustainable income while working toward meaningful life goals.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                label: 'Founded by',
                value: 'Balbir Singh & Pavneet Kaur',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                label: 'Our mission',
                value: 'Employment & earning for all',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
              {
                label: 'Location',
                value: CONTACT.address,
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl bg-slate-50 border border-slate-200 p-6 shadow-sm flex flex-col h-full"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-amber-200 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{item.label}</p>
                <p className="font-bold text-slate-900 text-base leading-snug mt-auto" style={{ fontFamily: 'var(--font-heading)' }}>
                  {item.value}
                </p>
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
                <span className="text-4xl font-black text-brand-200 absolute top-4 right-4" style={{ fontFamily: 'var(--font-heading)' }}>{s.step}</span>
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
              <div key={f.title} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:border-brand-300 transition-colors">
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
              <div key={item.title} className="flex gap-4 rounded-2xl bg-brand-50 border border-brand-100 p-5">
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
            <span className="text-amber-900/90">Unlimited direct children. Match active legs in pairs (1st+2nd, 3rd+4th…).
            Each match adds min(leg size, leg size) toward rank rewards — e.g. leg A=3, leg B=3 → 3 pairs (Executive at 3).</span>
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
                  <span className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-xs font-bold text-amber-200">{i + 1}</span>
                  <div>
                    <p className="font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>{r.name}</p>
                    <p className="text-sm text-slate-500">{r.pairs.toLocaleString()} pairs required</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-brand-800">{r.reward}</p>
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
            <h2 className="text-3xl font-black text-slate-900 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>16-month installment plan</h2>
            <ul className="space-y-3 text-slate-700 text-base">
              <li className="flex gap-3"><span className="text-brand-600 font-bold">✓</span> ₹1,200 activation includes Month 1 installment</li>
              <li className="flex gap-3"><span className="text-brand-600 font-bold">✓</span> Pay monthly installments on time to keep your ID active</li>
              <li className="flex gap-3"><span className="text-brand-600 font-bold">✓</span> Select booking, mid, deluxe & double-ID product tiers as you progress</li>
              <li className="flex gap-3"><span className="text-brand-600 font-bold">✓</span> Real-time tree view, wallet, income logs & reward collection in one app</li>
            </ul>
          </div>
          <div
            className="rounded-3xl p-8 text-white shadow-xl"
            style={{ background: 'var(--brand-gradient)' }}
          >
            <p className="text-orange-100 text-sm font-semibold uppercase tracking-wider mb-2">Ready to start?</p>
            <p className="text-2xl font-black text-white mb-6 leading-snug" style={{ fontFamily: 'var(--font-heading)' }}>
              You need a sponsor referral code to register.
            </p>
            <Link to="/register" className="btn-primary w-full justify-center py-3 text-base bg-amber-400 !text-brand-900 hover:!bg-amber-300">
              Create your account →
            </Link>
            <p className="text-center text-orange-100 text-sm mt-4">
              Already a member? <Link to="/login" className="text-amber-300 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 px-4 sm:px-6 bg-slate-100 border-t border-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <h2 className="text-xl font-black text-slate-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Samriddhi Network</h2>
            <p className="text-slate-600 text-base mb-4">{CONTACT.address}</p>
            <ContactInfo />
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
