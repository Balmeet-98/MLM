import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Installments() {
  const [data, setData]   = useState({ installments: [], consecutiveMissed: 0 });
  const [loading, setLoading] = useState(true);
  const [paying, setPaying]   = useState(null);

  const fetchData = async () => {
    try {
      const res = await api.get('/installments/my');
      setData(res.data);
    } catch { toast.error('Failed to load installments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePay = async (monthNumber) => {
    setPaying(monthNumber);
    try {
      await api.post('/installments/pay', { monthNumber });
      toast.success(`Month ${monthNumber} installment paid!`);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.error || 'Payment failed'); }
    finally { setPaying(null); }
  };

  const paidCount  = data.installments.filter(i => i.status === 'paid').length;
  const missedCount = data.installments.filter(i => i.status === 'missed').length;
  const progress   = Math.round((paidCount / 16) * 100);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Installments</h1>
        <p className="page-subtitle">16-month payment schedule — ₹1,200/month</p>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md">
          <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">Paid</p>
          <p className="text-3xl font-black mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>{paidCount}<span className="text-lg font-semibold text-emerald-200">/16</span></p>
        </div>
        <div className={`rounded-2xl p-4 text-white shadow-md ${data.consecutiveMissed >= 3
          ? 'bg-gradient-to-br from-red-600 to-red-700'
          : 'bg-gradient-to-br from-slate-500 to-slate-600'}`}>
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Consecutive Missed</p>
          <p className="text-3xl font-black mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>{data.consecutiveMissed}</p>
          {data.consecutiveMissed >= 3 && <p className="text-red-200 text-[10px] mt-1">⚠️ 4 misses = ID cancelled</p>}
        </div>
        <div className="rounded-2xl p-4 bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md">
          <p className="text-blue-100 text-xs font-semibold uppercase tracking-wider">Monthly Due</p>
          <p className="text-3xl font-black mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>₹1,200</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700">Overall Progress</span>
          <span className="text-sm font-bold text-slate-800">{progress}%</span>
        </div>
        <div className="progress-wrap h-3">
          <div className="progress-bar bg-gradient-to-r from-red-600 to-red-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-slate-400 mt-2">100% payment required to be eligible for all rewards</p>
      </div>

      {/* Month grid */}
      <div className="card">
        <h2 className="font-bold text-slate-800 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>16-Month Schedule</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {data.installments.map(inst => {
            const isPaid    = inst.status === 'paid';
            const isMissed  = inst.status === 'missed';
            const isPending = inst.status === 'pending';
            const isOverdue = isPending && new Date(inst.due_date) < new Date();

            let borderCls = 'border-slate-200 bg-slate-50';
            if (isPaid)    borderCls = 'border-emerald-300 bg-emerald-50';
            if (isMissed)  borderCls = 'border-red-300 bg-red-50';
            if (isOverdue) borderCls = 'border-orange-300 bg-orange-50';

            return (
              <div key={inst.id} className={`rounded-xl p-3 border-2 text-center ${borderCls} transition-colors`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Month {inst.month_number}</p>
                <p className="text-2xl mb-1">
                  {isPaid ? '✅' : isMissed ? '❌' : isOverdue ? '⚠️' : '⏳'}
                </p>
                <p className={`text-[11px] font-bold ${
                  isPaid ? 'text-emerald-700' : isMissed ? 'text-red-700' : isOverdue ? 'text-orange-700' : 'text-slate-500'
                }`}>
                  {isPaid ? 'Paid' : isMissed ? 'Missed' : isOverdue ? 'Overdue' : format(new Date(inst.due_date), 'dd MMM')}
                </p>
                {isPaid && inst.paid_date && (
                  <p className="text-[10px] text-slate-400 mt-0.5">{format(new Date(inst.paid_date), 'dd MMM yy')}</p>
                )}
                {(isPending || isOverdue) && (
                  <button
                    onClick={() => handlePay(inst.month_number)}
                    disabled={paying === inst.month_number}
                    className="mt-2 w-full bg-red-700 hover:bg-red-800 text-white text-[10px] font-bold py-1.5 rounded-lg transition-colors disabled:opacity-60"
                  >
                    {paying === inst.month_number ? '…' : 'Pay ₹1,200'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Rules */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
        <p className="font-bold text-amber-800 mb-3 flex items-center gap-2">
          <span>📋</span> Important Rules
        </p>
        <ul className="space-y-1.5 text-xs text-amber-700">
          {[
            'Installment payment window: 1st to 20th of each month',
            '100% payment compliance required to qualify for all rewards',
            '4 consecutive missed installments results in ID cancellation',
            'Rewards are released only after your 2nd installment is received',
            'No cash alternatives — rewards are products only',
          ].map((rule, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
