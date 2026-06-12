import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Logo from '../../components/brand/Logo';
import ContactInfo from '../../components/brand/ContactInfo';

const PLANS = {
  standard: { label: 'Standard', monthly: 1200, desc: 'Standard product rewards (booking, mid, deluxe)' },
  double_id: { label: 'Double ID', monthly: 2400, desc: 'Double ID product rewards only — pay ₹2,400/month' },
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    sponsorCode: searchParams.get('ref') || '',
    membershipType: 'standard',
  });
  const [showPwd, setShowPwd] = useState(false);

  const plan = PLANS[form.membershipType] || PLANS.standard;
  const monthlyAmount = plan.monthly;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!form.sponsorCode.trim()) {
      toast.error('Sponsor referral code is required');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setStep(2);
  };

  const handlePay = async () => {
    setLoading(true);
    try {
      const { data: order } = await api.post('/payments/create-order', {
        membershipType: form.membershipType,
      });

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Samriddhi Network',
        description: `${plan.label} — Month 1 of 16`,
        order_id: order.orderId,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: '#EA580C' },
        handler: async (paymentResponse) => {
          try {
            const data = await register({
              name: form.name,
              email: form.email,
              password: form.password,
              phone: form.phone,
              sponsorCode: form.sponsorCode.toUpperCase(),
              membershipType: form.membershipType,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });
            setRegisteredUser(data?.user || null);
            setStep(3);
            setLoading(false);
            toast.success('Payment successful! Your account is active.');
          } catch (err) {
            setLoading(false);
            toast.error(err.response?.data?.error || 'Registration failed after payment. Contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast('Payment cancelled. Your account was not created.', { icon: 'ℹ️' });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setLoading(false);
        toast.error('Payment failed: ' + (response.error?.description || 'Unknown error'));
      });
      rzp.open();
    } catch (err) {
      setLoading(false);
      toast.error(err.response?.data?.error || 'Could not initiate payment. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="mb-8">
        <Logo size="lg" subtitle="Join the TEAMWORK family" />
      </div>

      {step < 3 && (
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                s < step ? 'bg-emerald-500 text-white' :
                s === step ? 'bg-brand-600 text-white' :
                'bg-slate-200 text-slate-400'
              }`}>
                {s < step ? '✓' : s}
              </div>
              {s < 2 && <div className={`w-10 h-0.5 ${step > s ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>
      )}

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-slate-100 p-8">

        {step === 1 && (
          <>
            <h2 className="text-2xl font-black text-slate-900 mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              Your Details
            </h2>
            <p className="text-slate-500 text-sm mb-7">Fill in your information to get started</p>

            <form onSubmit={handleStep1} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Choose your plan <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(PLANS).map(([key, p]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, membershipType: key })}
                      className={`text-left rounded-xl border-2 p-4 transition-all ${
                        form.membershipType === key
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-bold text-slate-900 text-sm">{p.label}</p>
                      <p className="text-brand-600 font-black text-lg mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
                        ₹{p.monthly.toLocaleString('en-IN')}/mo
                      </p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    className="input"
                    placeholder="Rajesh Kumar"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="phone"
                    className="input"
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  className="input"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPwd ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    {showPwd ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Sponsor Referral Code <span className="text-red-500">*</span>
                </label>
                <input
                  name="sponsorCode"
                  className="input font-mono uppercase tracking-wider"
                  placeholder="e.g. RAJ1234"
                  value={form.sponsorCode}
                  onChange={(e) => setForm({ ...form, sponsorCode: e.target.value.toUpperCase() })}
                  required
                />
                <p className="text-xs text-slate-400 mt-1">Ask your sponsor for their referral code</p>
              </div>

              <button
                type="submit"
                className="btn-primary w-full justify-center py-3 text-sm"
                style={{ borderRadius: '10px' }}
              >
                Continue to Payment →
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-2xl font-black text-slate-900 mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              Activate Your Account
            </h2>
            <p className="text-slate-500 text-sm mb-7">Pay Month 1 installment to complete registration</p>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-5 mb-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Plan</span>
                <span className="font-semibold text-slate-800">{plan.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Name</span>
                <span className="font-semibold text-slate-800">{form.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Email</span>
                <span className="font-semibold text-slate-800">{form.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Sponsor Code</span>
                <span className="font-mono font-semibold text-slate-800">{form.sponsorCode}</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                <span className="text-slate-600 font-semibold">Month 1 of 16</span>
                <span className="text-2xl font-black text-brand-600" style={{ fontFamily: 'var(--font-heading)' }}>
                  ₹{monthlyAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 mb-6 text-xs text-amber-700">
              After paying ₹{monthlyAmount.toLocaleString('en-IN')} today, you will need to pay
              ₹{monthlyAmount.toLocaleString('en-IN')}/month for the remaining 15 months.
              Payments are due by the 10th of each month.
            </div>

            <button
              onClick={handlePay}
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-sm"
              style={{ borderRadius: '10px' }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Opening payment...
                </>
              ) : `Pay ₹${monthlyAmount.toLocaleString('en-IN')} & Create Account`}
            </button>

            <button
              onClick={() => setStep(1)}
              disabled={loading}
              className="w-full mt-3 py-2.5 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
            >
              ← Back to details
            </button>
          </>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-3xl mx-auto mb-4">
              ✓
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              Payment successful
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Welcome{registeredUser?.name ? `, ${registeredUser.name}` : ''}! Your account is active and Month 1 is paid.
            </p>
            {registeredUser?.referralCode && (
              <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 mb-6 text-left">
                <p className="text-xs font-semibold text-brand-800 uppercase tracking-wider mb-1">Your referral code</p>
                <p className="font-mono text-lg font-bold text-brand-900">{registeredUser.referralCode}</p>
                <p className="text-xs text-brand-700 mt-1">Share this code when you sponsor new members.</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                if (registeredUser?.role === 'admin') {
                  navigate('/admin/dashboard');
                } else {
                  navigate('/dashboard');
                }
              }}
              className="btn-primary w-full justify-center py-3 text-sm"
              style={{ borderRadius: '10px' }}
            >
              Go to Dashboard
            </button>
          </div>
        )}

        <ContactInfo variant="inline" className="justify-center mt-8 mb-2" />
        <p className="text-center text-sm text-slate-500 mt-4">
          <Link to="/" className="text-slate-400 hover:text-slate-600">← Back to home</Link>
        </p>
        <p className="text-center text-sm text-slate-500 mt-4">
          Already a member?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
