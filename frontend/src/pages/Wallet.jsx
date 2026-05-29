import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import api from '../services/api';
import toast from 'react-hot-toast';

const statusBadge = {
  approved: 'badge badge-green',
  rejected: 'badge badge-red',
  pending:  'badge badge-yellow',
};

export default function Wallet() {
  const [walletData, setWalletData]   = useState({ balance: 0, transactions: [] });
  const [loading, setLoading]         = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [submitting, setSubmitting]   = useState(false);
  const [form, setForm] = useState({
    amount: '', bankName: '', accountNumber: '', ifscCode: '', accountHolder: '',
  });

  const reload = () =>
    Promise.all([api.get('/wallet'), api.get('/wallet/withdrawals')])
      .then(([w, wd]) => { setWalletData(w.data); setWithdrawals(wd.data.withdrawals); })
      .catch(() => toast.error('Failed to load wallet'))
      .finally(() => setLoading(false));

  useEffect(() => { reload(); }, []);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/wallet/withdraw', form);
      toast.success('Withdrawal request submitted!');
      setShowWithdraw(false);
      setForm({ amount: '', bankName: '', accountNumber: '', ifscCode: '', accountHolder: '' });
      reload();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Wallet</h1>
        <p className="page-subtitle">Manage your earnings and withdrawals</p>
      </div>

      {/* Balance hero card */}
      <div className="relative overflow-hidden rounded-2xl p-6 text-white shadow-xl"
        style={{ background: 'var(--brand-gradient)' }}>
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5" />
        <p className="text-orange-200 text-xs font-semibold uppercase tracking-wider">Available Balance</p>
        <p className="text-5xl font-black mt-1 mb-5" style={{ fontFamily: 'var(--font-heading)' }}>
          ₹{parseFloat(walletData.balance).toLocaleString('en-IN')}
        </p>
        <button
          onClick={() => setShowWithdraw(v => !v)}
          className="btn-secondary"
        >
          {showWithdraw ? '✕ Close Form' : '↑ Request Withdrawal'}
        </button>
      </div>

      {/* Withdrawal form */}
      {showWithdraw && (
        <div className="card border border-amber-100 bg-amber-50/60">
          <h2 className="font-bold text-slate-800 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Bank Transfer Details</h2>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Amount (₹) *</label>
                <input className="input" type="number" min="100" value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })} required placeholder="Minimum ₹100" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bank Name *</label>
                <input className="input" value={form.bankName}
                  onChange={e => setForm({ ...form, bankName: e.target.value })} required placeholder="e.g. SBI, HDFC" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Number *</label>
                <input className="input font-mono" value={form.accountNumber}
                  onChange={e => setForm({ ...form, accountNumber: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">IFSC Code *</label>
                <input className="input font-mono uppercase" value={form.ifscCode}
                  onChange={e => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })} required />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Holder Name *</label>
                <input className="input" value={form.accountHolder}
                  onChange={e => setForm({ ...form, accountHolder: e.target.value })} required />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Submitting…' : 'Submit Request'}
              </button>
              <button type="button" onClick={() => setShowWithdraw(false)} className="btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Transaction History */}
      <div className="card-flat">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="font-bold text-slate-800" style={{ fontFamily: 'var(--font-heading)' }}>Transaction History</h2>
          <span className="badge badge-gray">{walletData.transactions.length} records</span>
        </div>

        {walletData.transactions.length === 0 ? (
          <div className="empty-state">
            <div className="icon">💳</div>
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {walletData.transactions.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  tx.type === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                }`}>
                  {tx.type === 'credit' ? '↑' : '↓'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{tx.description}</p>
                  <p className="text-xs text-slate-400">{format(new Date(tx.created_at), 'dd MMM yyyy, hh:mm a')}</p>
                </div>
                <span className={`text-sm font-bold flex-shrink-0 ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {tx.type === 'credit' ? '+' : '-'}₹{parseFloat(tx.amount).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdrawal History */}
      {withdrawals.length > 0 && (
        <div className="card-flat">
          <div className="px-5 pt-5 pb-3">
            <h2 className="font-bold text-slate-800" style={{ fontFamily: 'var(--font-heading)' }}>Withdrawal Requests</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Bank</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map(w => (
                  <tr key={w.id}>
                    <td>{format(new Date(w.requested_at), 'dd MMM yyyy')}</td>
                    <td className="font-semibold">₹{parseFloat(w.amount).toLocaleString('en-IN')}</td>
                    <td>{w.bank_name}</td>
                    <td><span className={statusBadge[w.status] || 'badge badge-gray'}>{w.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
