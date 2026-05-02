import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

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
        toast('Account registered! Please select a product to activate.', { icon: 'ℹ️' });
        navigate('/products/select');
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
        style={{ background: 'linear-gradient(155deg, #991B1B 0%, #B91C1C 45%, #DC2626 100%)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center font-black text-red-800 text-lg">S</div>
          <div>
            <p className="font-bold text-white text-sm" style={{ fontFamily: 'var(--font-heading)' }}>Samriddhi</p>
            <p className="text-yellow-300 text-xs">Network</p>
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-black text-white leading-tight mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Build Your<br />Network.<br />Earn Rewards.
          </h2>
          <p className="text-red-200 text-sm leading-relaxed">
            Join thousands of distributors who are building their future with Samriddhi Network's
            proven binary system.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { label: 'Members', value: '2,500+' },
              { label: 'Income Paid', value: '₹50L+' },
              { label: 'Rewards Given', value: '1,000+' },
            ].map(s => (
              <div key={s.label} className="bg-red-700/40 rounded-xl p-3 text-center">
                <p className="text-xl font-black text-yellow-300" style={{ fontFamily: 'var(--font-heading)' }}>{s.value}</p>
                <p className="text-xs text-red-200 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-red-300 text-xs">
          Opp. General Bus Stand, B.C. Road, Jammu &nbsp;·&nbsp; 9419185768
        </p>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50">
        {/* Mobile logo */}
        <div className="lg:hidden text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-700 rounded-2xl mb-3 shadow-lg">
            <span className="text-yellow-400 font-black text-2xl">S</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>Samriddhi Network</h1>
          <p className="text-slate-500 text-sm mt-1">Sales Promotion with Exciting Rewards</p>
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

          <p className="text-center text-sm text-slate-500 mt-6">
            New member?{' '}
            <Link to="/register" className="text-red-700 font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
