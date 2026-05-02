import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    sponsorCode: searchParams.get('ref') || '',
    position: 'left',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sponsorCode) {
      toast.error('Sponsor referral code is required');
      return;
    }
    try {
      await register(form);
      toast.success('Registration successful! Select a product to activate your account.');
      navigate('/products/select');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 bg-red-700 rounded-xl flex items-center justify-center shadow-md">
          <span className="text-yellow-400 font-black text-xl">S</span>
        </div>
        <div>
          <p className="font-black text-slate-900 text-lg leading-none" style={{ fontFamily: 'var(--font-heading)' }}>Samriddhi Network</p>
          <p className="text-slate-400 text-xs">Join the TEAMWORK family</p>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
        <h2 className="text-2xl font-black text-slate-900 mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Create Account</h2>
        <p className="text-slate-500 text-sm mb-7">Fill in your details to join the network</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <input
                className="input"
                placeholder="Rajesh Kumar"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone <span className="text-red-500">*</span></label>
              <input
                className="input"
                placeholder="9876543210"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
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
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password <span className="text-red-500">*</span></label>
            <input
              type="password"
              className="input"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sponsor Referral Code <span className="text-red-500">*</span></label>
            <input
              className="input font-mono uppercase tracking-wider"
              placeholder="e.g. RAJ1234"
              value={form.sponsorCode}
              onChange={e => setForm({ ...form, sponsorCode: e.target.value.toUpperCase() })}
              required
            />
            <p className="text-xs text-slate-400 mt-1">Ask your sponsor for their referral code</p>
          </div>

          {/* Position selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Position <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'left', label: '← Left Side' },
                { value: 'right', label: 'Right Side →' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, position: value })}
                  className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                    form.position === value
                      ? 'border-red-600 bg-red-50 text-red-700 shadow-sm'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1.5">Position under your sponsor (auto-adjusted if taken)</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3 text-sm"
            style={{ borderRadius: '10px' }}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account…
              </>
            ) : 'Create Account →'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already a member?{' '}
          <Link to="/login" className="text-red-700 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
