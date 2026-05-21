import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../services/api';
import StatCard from '../components/dashboard/StatCard';
import RankBadge from '../components/dashboard/RankBadge';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/user/dashboard')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" />
    </div>
  );

  const { team, wallet, pairs, currentRank, totalIncome, rewardsCount, nextInstallment, recentTransactions } = data || {};

  const installmentDue = nextInstallment?.status === 'pending';
  const daysUntilDue = nextInstallment
    ? Math.ceil((new Date(nextInstallment.due_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const urgent = daysUntilDue !== null && daysUntilDue <= 3;

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's your network overview.</p>
        </div>
        <RankBadge rank={currentRank} size="lg" />
      </div>

      {/* ── Installment Alert ── */}
      {installmentDue && daysUntilDue <= 10 && (
        <div className={`flex flex-wrap items-center gap-4 rounded-2xl p-4 border ${
          urgent
            ? 'bg-red-50 border-red-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
            urgent ? 'bg-red-100' : 'bg-amber-100'
          }`}>
            {urgent ? '🚨' : '⚠️'}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm ${urgent ? 'text-red-800' : 'text-amber-800'}`}>
              Installment Month {nextInstallment.month_number} due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
            </p>
            <p className={`text-xs mt-0.5 ${urgent ? 'text-red-600' : 'text-amber-600'}`}>
              Due: {format(new Date(nextInstallment.due_date), 'dd MMM yyyy')} &nbsp;·&nbsp; Amount: ₹{nextInstallment.amount}
            </p>
          </div>
          <Link to="/installments" className="btn-primary flex-shrink-0">Pay Now</Link>
        </div>
      )}

      {/* ── Primary Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Wallet Balance"
          value={`₹${(wallet?.balance || 0).toLocaleString('en-IN')}`}
          icon="💰"
          color="green"
          subtitle="Available to withdraw"
        />
        <StatCard
          title="Total Income"
          value={`₹${(totalIncome || 0).toLocaleString('en-IN')}`}
          icon="📈"
          color="blue"
          subtitle="All-time earnings"
        />
        <StatCard
          title="Total Pairs"
          value={(pairs?.total_pairs || 0).toLocaleString()}
          icon="🤝"
          color="purple"
          subtitle={`Active legs: ${pairs?.active_leg_count || 0}`}
        />
        <StatCard
          title="Team Size"
          value={(team?.total || 0).toLocaleString()}
          icon="👥"
          color="yellow"
          subtitle={`Direct: ${team?.directChildren || 0}  ·  Active legs: ${team?.activeLegs || 0}`}
        />
      </div>

      {/* ── Secondary Stats ── */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Direct Referrals" value={(team?.directChildren || 0).toLocaleString()} icon="🔗" color="red" />
        <StatCard title="Active Legs" value={(team?.activeLegs || 0).toLocaleString()} icon="🦵" color="red" subtitle="Legs with team volume" />
        <StatCard title="Rewards Earned" value={rewardsCount || 0} icon="🏆" color="yellow" subtitle="Tap to claim" />
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 card-flat">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="font-bold text-slate-800" style={{ fontFamily: 'var(--font-heading)' }}>Recent Transactions</h2>
            <Link to="/wallet" className="text-red-700 text-xs font-semibold hover:underline">View all →</Link>
          </div>

          {!recentTransactions?.length ? (
            <div className="empty-state">
              <div className="icon">💳</div>
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentTransactions.map(tx => (
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

        {/* Quick Actions */}
        <div className="card">
          <h2 className="font-bold text-slate-800 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/tree', bg: 'bg-green-50', icon: '🌳', label: 'View Tree' },
              { to: '/income', bg: 'bg-blue-50', icon: '📊', label: 'Income' },
              { to: '/installments', bg: 'bg-amber-50', icon: '📅', label: 'Installments' },
              { to: '/rewards', bg: 'bg-purple-50', icon: '🏆', label: 'Rewards' },
            ].map(({ to, bg, icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`${bg} rounded-xl p-3 flex flex-col items-center gap-2 hover:shadow-sm transition-shadow text-center group`}
              >
                <span className="text-2xl">{icon}</span>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
