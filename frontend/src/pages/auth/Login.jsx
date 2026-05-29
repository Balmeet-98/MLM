import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Logo from '../../components/brand/Logo';
import ContactInfo from '../../components/brand/ContactInfo';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(form.email, form.password);
      if (data.needsActivation) {
        toast.error('Account not activated. Please contact support.');
        return;
      } else if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel — hidden on mobile */}
      <div
        className="hidden lg:flex lg:flex-col lg:justify-between lg:w-2/5 xl:w-1/2 p-12"
        style={{ background: 'var(--brand-gradient)' }}
      >
        <Logo size="md" light />

        <div>
          <h2 className="text-4xl font-black text-white leading-tight mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Build Your<br />Network.<br />Earn Rewards.
          </h2>
          <p className="text-orange-100 text-sm leading-relaxed">
            Join thousands of distributors who are building their future with Samriddhi Network's
            unlimited-width referral system.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { label: 'Members', value: '2,500+' },
              { label: 'Income Paid', value: '₹50L+' },
              { label: 'Rewards Given', value: '1,000+' },
            ].map(s => (
              <div key={s.label} className="bg-brand-700/40 rounded-xl p-3 text-center">
                <p className="text-xl font-black text-amber-300" style={{ fontFamily: 'var(--font-heading)' }}>{s.value}</p>
                <p className="text-xs text-orange-100 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <ContactInfo variant="compact" light />
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 flex justify-center">
          <Logo size="lg" subtitle="Sales Promotion with Exciting Rewards" />
        </div>

        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Welcome back</h2>
          <p className="text-slate-500 text-sm mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  tabIndex={-1}
                >
                  {showPwd ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-sm mt-2"
              style={{ borderRadius: '10px' }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-4">
            <Link to="/" className="text-slate-400 hover:text-slate-600">← Back to home</Link>
          </p>
          <p className="text-center text-sm text-slate-500 mt-4">
            New member?{' '}
            <Link to="/register" className="text-brand-600 font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
